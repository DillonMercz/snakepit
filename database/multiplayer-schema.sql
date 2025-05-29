-- =============================================
-- MULTIPLAYER GAME ROOMS SCHEMA
-- =============================================

-- Create game_rooms table for multiplayer lobbies
CREATE TABLE IF NOT EXISTS game_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('classic', 'warfare')),
    max_players INTEGER NOT NULL DEFAULT 8 CHECK (max_players >= 2 AND max_players <= 16),
    current_players INTEGER NOT NULL DEFAULT 0 CHECK (current_players >= 0),
    wager_amount DECIMAL(10,2) NOT NULL DEFAULT 50.00 CHECK (wager_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Create room_players table to track players in each room
CREATE TABLE IF NOT EXISTS room_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    final_score INTEGER DEFAULT 0,
    final_cash DECIMAL(10,2) DEFAULT 0,
    placement INTEGER, -- 1st, 2nd, 3rd place etc.
    UNIQUE(room_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_game_mode ON game_rooms(game_mode);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_at ON game_rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_user_id ON room_players(user_id);
CREATE INDEX IF NOT EXISTS idx_room_players_active ON room_players(is_active);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_rooms
-- Anyone can view waiting rooms
CREATE POLICY "Anyone can view waiting rooms" ON game_rooms
    FOR SELECT USING (status = 'waiting');

-- Users can create rooms
CREATE POLICY "Users can create rooms" ON game_rooms
    FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Host can update their room
CREATE POLICY "Host can update room" ON game_rooms
    FOR UPDATE USING (auth.uid() = host_id);

-- Host can delete their room
CREATE POLICY "Host can delete room" ON game_rooms
    FOR DELETE USING (auth.uid() = host_id);

-- RLS Policies for room_players
-- Players can view room_players for rooms they're in
CREATE POLICY "Players can view room participants" ON room_players
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_players rp 
            WHERE rp.room_id = room_players.room_id 
            AND rp.user_id = auth.uid()
        )
    );

-- Users can join rooms
CREATE POLICY "Users can join rooms" ON room_players
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own room participation
CREATE POLICY "Users can update own participation" ON room_players
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update room player count
CREATE OR REPLACE FUNCTION update_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Player joined
        UPDATE game_rooms 
        SET current_players = current_players + 1,
            updated_at = NOW()
        WHERE id = NEW.room_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Player status changed
        IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
            -- Player left
            UPDATE game_rooms 
            SET current_players = GREATEST(current_players - 1, 0),
                updated_at = NOW()
            WHERE id = NEW.room_id;
        ELSIF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
            -- Player rejoined
            UPDATE game_rooms 
            SET current_players = current_players + 1,
                updated_at = NOW()
            WHERE id = NEW.room_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Player removed
        IF OLD.is_active = TRUE THEN
            UPDATE game_rooms 
            SET current_players = GREATEST(current_players - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.room_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic player count updates
DROP TRIGGER IF EXISTS trigger_update_room_player_count ON room_players;
CREATE TRIGGER trigger_update_room_player_count
    AFTER INSERT OR UPDATE OR DELETE ON room_players
    FOR EACH ROW EXECUTE FUNCTION update_room_player_count();

-- Function to clean up old finished rooms (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete rooms that finished more than 24 hours ago
    DELETE FROM game_rooms 
    WHERE status = 'finished' 
    AND finished_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also delete waiting rooms that are older than 2 hours with no players
    DELETE FROM game_rooms 
    WHERE status = 'waiting' 
    AND current_players = 0
    AND created_at < NOW() - INTERVAL '2 hours';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available rooms with player info
CREATE OR REPLACE FUNCTION get_available_rooms()
RETURNS TABLE (
    room_id UUID,
    room_name VARCHAR(100),
    game_mode VARCHAR(20),
    max_players INTEGER,
    current_players INTEGER,
    wager_amount DECIMAL(10,2),
    host_username VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gr.id,
        gr.name,
        gr.game_mode,
        gr.max_players,
        gr.current_players,
        gr.wager_amount,
        up.username,
        gr.created_at
    FROM game_rooms gr
    JOIN user_profiles up ON gr.host_id = up.id
    WHERE gr.status = 'waiting'
    AND gr.current_players < gr.max_players
    ORDER BY gr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join a room safely
CREATE OR REPLACE FUNCTION join_game_room(room_id_param UUID, user_id_param UUID, username_param VARCHAR(50))
RETURNS JSON AS $$
DECLARE
    room_record game_rooms%ROWTYPE;
    result JSON;
BEGIN
    -- Get room info with row lock
    SELECT * INTO room_record 
    FROM game_rooms 
    WHERE id = room_id_param 
    AND status = 'waiting'
    FOR UPDATE;
    
    -- Check if room exists and has space
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Room not found or not available');
    END IF;
    
    IF room_record.current_players >= room_record.max_players THEN
        RETURN json_build_object('success', false, 'error', 'Room is full');
    END IF;
    
    -- Check if user is already in the room
    IF EXISTS (SELECT 1 FROM room_players WHERE room_id = room_id_param AND user_id = user_id_param AND is_active = TRUE) THEN
        RETURN json_build_object('success', false, 'error', 'Already in this room');
    END IF;
    
    -- Add player to room
    INSERT INTO room_players (room_id, user_id, username, is_active)
    VALUES (room_id_param, user_id_param, username_param, TRUE)
    ON CONFLICT (room_id, user_id) 
    DO UPDATE SET is_active = TRUE, joined_at = NOW();
    
    -- Return success with room info
    SELECT json_build_object(
        'success', true,
        'room', json_build_object(
            'id', id,
            'name', name,
            'game_mode', game_mode,
            'max_players', max_players,
            'current_players', current_players + 1,
            'wager_amount', wager_amount,
            'host_id', host_id
        )
    ) INTO result
    FROM game_rooms 
    WHERE id = room_id_param;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON game_rooms TO authenticated;
GRANT ALL ON room_players TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION join_game_room(UUID, UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rooms() TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO game_rooms (name, game_mode, max_players, wager_amount, host_id) 
-- VALUES 
--     ('Test Classic Room', 'classic', 8, 50.00, '00000000-0000-0000-0000-000000000000'),
--     ('Test Warfare Room', 'warfare', 6, 100.00, '00000000-0000-0000-0000-000000000000');

COMMENT ON TABLE game_rooms IS 'Multiplayer game rooms/lobbies';
COMMENT ON TABLE room_players IS 'Players participating in game rooms';
COMMENT ON FUNCTION update_room_player_count() IS 'Automatically updates room player count when players join/leave';
COMMENT ON FUNCTION cleanup_old_rooms() IS 'Cleans up old finished rooms - should be run periodically';
COMMENT ON FUNCTION get_available_rooms() IS 'Returns list of available rooms with host info';
COMMENT ON FUNCTION join_game_room(UUID, UUID, VARCHAR(50)) IS 'Safely joins a user to a game room with validation';

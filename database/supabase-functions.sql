-- SnakePit Database Functions and Triggers for Supabase
-- Run this AFTER running supabase-schema.sql

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, xrp_balance)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substr(NEW.id::text, 1, 8)),
        1000.00
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats after game session
CREATE OR REPLACE FUNCTION public.update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile stats
    UPDATE user_profiles 
    SET 
        total_games_played = total_games_played + 1,
        total_wins = total_wins + CASE WHEN NEW.cashed_out THEN 1 ELSE 0 END,
        total_earnings = total_earnings + (NEW.final_cash - NEW.wager_amount),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Update leaderboard
    INSERT INTO leaderboards (user_id, username, game_mode, high_score, high_cash)
    SELECT 
        NEW.user_id,
        up.username,
        NEW.game_mode,
        NEW.final_score,
        NEW.final_cash
    FROM user_profiles up
    WHERE up.id = NEW.user_id
    ON CONFLICT (user_id, game_mode) 
    DO UPDATE SET
        high_score = GREATEST(leaderboards.high_score, NEW.final_score),
        high_cash = GREATEST(leaderboards.high_cash, NEW.final_cash),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats after game session
DROP TRIGGER IF EXISTS on_game_session_created ON game_sessions;
CREATE TRIGGER on_game_session_created
    AFTER INSERT ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_after_game();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboards_updated_at ON leaderboards;
CREATE TRIGGER update_leaderboards_updated_at
    BEFORE UPDATE ON leaderboards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

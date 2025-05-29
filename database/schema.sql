-- SnakePit Database Schema
-- Run this in your Supabase SQL Editor
-- Note: JWT secret is managed automatically by Supabase

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    xrp_balance DECIMAL(10,2) DEFAULT 1000.00,
    total_games_played INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    audio_muted BOOLEAN DEFAULT false,
    audio_volume DECIMAL(3,2) DEFAULT 0.60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('classic', 'warfare')),
    wager_amount DECIMAL(10,2) NOT NULL,
    final_score INTEGER NOT NULL,
    final_length INTEGER NOT NULL,
    final_cash DECIMAL(10,2) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    cashed_out BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    username VARCHAR(50) NOT NULL,
    game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('classic', 'warfare')),
    high_score INTEGER NOT NULL,
    high_cash DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_mode)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'wager', 'cashout')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_leaderboards_game_mode_score ON leaderboards(game_mode, high_score DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for game_sessions
CREATE POLICY "Users can view their own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for leaderboards (public read, user can update their own)
CREATE POLICY "Anyone can view leaderboards" ON leaderboards
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own leaderboard entry" ON leaderboards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entry" ON leaderboards
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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

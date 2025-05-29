-- SnakePit Database Schema for Supabase
-- Copy and paste this into your Supabase SQL Editor

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

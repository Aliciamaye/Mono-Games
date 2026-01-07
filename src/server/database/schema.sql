-- Mono Games Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS public.games (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  size_mb DECIMAL(10, 2) DEFAULT 0,
  thumbnail_url TEXT,
  core BOOLEAN DEFAULT FALSE,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores/Leaderboard table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  game_id VARCHAR(50) REFERENCES public.games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  metadata JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_game_score ON public.scores(game_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user_game ON public.scores(user_id, game_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  game_id VARCHAR(50) REFERENCES public.games(id) ON DELETE CASCADE,
  requirement JSONB,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Game saves (cloud storage)
CREATE TABLE IF NOT EXISTS public.game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  game_id VARCHAR(50) REFERENCES public.games(id) ON DELETE CASCADE,
  save_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- User stats (for analytics)
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  total_playtime INTEGER DEFAULT 0, -- in seconds
  games_played INTEGER DEFAULT 0,
  achievements_unlocked INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
  total_playtime INTEGER,
  games_played INTEGER,
  achievements_unlocked INTEGER,
  total_score BIGINT,
  last_played_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(us.total_playtime, 0) as total_playtime,
    COALESCE(us.games_played, 0) as games_played,
    COALESCE(us.achievements_unlocked, 0) as achievements_unlocked,
    COALESCE(us.total_score, 0) as total_score,
    us.last_played_at
  FROM user_stats us
  WHERE us.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Insert core games
INSERT INTO public.games (id, name, description, category, core, size_mb) VALUES
('snake', 'Snake', 'Classic snake game - eat apples and grow!', 'arcade', true, 0.002),
('2048', '2048', 'Slide numbered tiles to reach 2048', 'puzzle', true, 0.05),
('tetris', 'Tetris', 'Stack falling blocks and clear lines', 'arcade', true, 0.1),
('pong', 'Pong', 'Classic paddle tennis game', 'sports', true, 0.03),
('memory-match', 'Memory Match', 'Match pairs of cards', 'puzzle', true, 0.02),
('breakout', 'Breakout', 'Break bricks with a bouncing ball', 'arcade', true, 0.04),
('space-invaders', 'Space Invaders', 'Defend Earth from alien invaders', 'arcade', true, 0.08),
('flappy-bird', 'Flappy Bird', 'Tap to fly through pipes', 'arcade', true, 0.03),
('typing-test', 'Typing Test', 'Test your typing speed and accuracy', 'educational', true, 0.02),
('tic-tac-toe', 'Tic-Tac-Toe', 'Classic X and O game', 'strategy', true, 0.01),
('connect-four', 'Connect Four', 'Drop chips and connect 4 in a row', 'strategy', true, 0.03),
('minesweeper', 'Minesweeper', 'Clear the board without hitting mines', 'puzzle', true, 0.04),
('sudoku', 'Sudoku', '9x9 number placement puzzle', 'puzzle', true, 0.05),
('chess', 'Chess', 'Classic chess game', 'strategy', true, 0.15),
('checkers', 'Checkers', 'Classic checkers game', 'strategy', true, 0.08)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users can read all users
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT USING (true);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Scores are public for reading
CREATE POLICY "Scores are publicly readable" ON public.scores
  FOR SELECT USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert own scores" ON public.scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game saves are private
CREATE POLICY "Users can manage own saves" ON public.game_saves
  FOR ALL USING (auth.uid() = user_id);

-- User achievements are publicly readable
CREATE POLICY "Achievements are publicly readable" ON public.user_achievements
  FOR SELECT USING (true);

-- User stats are publicly readable
CREATE POLICY "Stats are publicly readable" ON public.user_stats
  FOR SELECT USING (true);

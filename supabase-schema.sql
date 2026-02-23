-- ============================================================================
-- MoodMash Supabase Database Schema
-- Run this script in your Supabase SQL Editor to set up the database
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- User Profiles Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Mood Entries Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    mood_id TEXT NOT NULL,
    mood_label TEXT NOT NULL,
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
    note TEXT,
    activities TEXT[],
    tags TEXT[],
    context JSONB DEFAULT '{}',
    is_ai_analyzed BOOLEAN DEFAULT FALSE,
    ai_insights TEXT[],
    location JSONB,
    weather JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    entry_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_entry_date ON mood_entries(entry_date);

-- ============================================================================
-- Wellness Sessions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS wellness_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('meditation', 'yoga', 'breathing', 'stretching', 'mindfulness', 'sleep', 'other')),
    category TEXT,
    name TEXT,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    metrics JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    notes TEXT,
    ai_recommendation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellness_sessions_user_id ON wellness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_sessions_completed_at ON wellness_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_wellness_sessions_type ON wellness_sessions(type);

-- ============================================================================
-- Achievements Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON achievements(unlocked_at);

-- ============================================================================
-- Challenges Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    challenge_id TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    current_progress INTEGER DEFAULT 0,
    target_value INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    bonus_points INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, challenge_id, started_at)
);

CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- ============================================================================
-- Streaks Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    streak_type TEXT NOT NULL CHECK (streak_type IN ('mood', 'meditation', 'wellness', 'journal', 'exercise')),
    current_count INTEGER DEFAULT 0,
    longest_count INTEGER DEFAULT 0,
    last_activity_date DATE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    milestone_7 BOOLEAN DEFAULT FALSE,
    milestone_14 BOOLEAN DEFAULT FALSE,
    milestone_30 BOOLEAN DEFAULT FALSE,
    milestone_60 BOOLEAN DEFAULT FALSE,
    milestone_100 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- ============================================================================
-- Points Transactions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus', 'adjustment', 'referral')),
    source_type TEXT NOT NULL CHECK (source_type IN ('mood', 'wellness', 'achievement', 'challenge', 'streak', 'referral', 'manual', 'bonus')),
    source_id TEXT,
    description TEXT,
    balance_after INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);

-- ============================================================================
-- User Points Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_points (
    user_id UUID PRIMARY KEY UNIQUE,
    total_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    rank INTEGER DEFAULT 0,
    rank_percentage DECIMAL(5,2) DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Journal Entries Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    mood_id TEXT,
    sentiment_score DECIMAL(4,3),
    sentiment_label TEXT CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
    tags TEXT[],
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    ai_suggestions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    entry_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);

-- ============================================================================
-- Notifications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'challenge', 'streak', 'reminder', 'insight', 'social', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    channel TEXT DEFAULT 'app' CHECK (channel IN ('app', 'email', 'push')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- ML Model States Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_model_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    model_type TEXT NOT NULL CHECK (model_type IN ('mood_prediction', 'pattern_detection', 'recommendation', 'sentiment')),
    version TEXT NOT NULL,
    weights_hash TEXT,
    accuracy_score DECIMAL(5,4),
    last_trained_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_model_states_user_id ON ml_model_states(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_model_states_model_type ON ml_model_states(model_type);

-- ============================================================================
-- Mood Predictions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mood_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    predicted_date DATE NOT NULL,
    predicted_emotion TEXT NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    factors TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    actual_emotion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, predicted_date)
);

CREATE INDEX IF NOT EXISTS idx_mood_predictions_user_id ON mood_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_predictions_predicted_date ON mood_predictions(predicted_date);

-- ============================================================================
-- Pattern Insights Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS pattern_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('circadian', 'weekly', 'seasonal', 'trigger', 'correlation', 'response')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    strength DECIMAL(5,4) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    evidence TEXT[],
    actionable BOOLEAN DEFAULT TRUE,
    recommendation TEXT,
    first_detected TIMESTAMPTZ DEFAULT NOW(),
    last_detected TIMESTAMPTZ DEFAULT NOW(),
    occurrence_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pattern_insights_user_id ON pattern_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_pattern_type ON pattern_insights(pattern_type);

-- ============================================================================
-- Daily Analytics Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL UNIQUE,
    mood_summary JSONB NOT NULL DEFAULT '{}',
    wellness_summary JSONB NOT NULL DEFAULT '{}',
    achievements JSONB DEFAULT '[]',
    points_earned INTEGER DEFAULT 0,
    streak_status JSONB DEFAULT '{}',
    insights JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_id ON daily_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);

-- ============================================================================
-- Weekly Reports Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    mood_data JSONB NOT NULL DEFAULT '{}',
    wellness_data JSONB NOT NULL DEFAULT '{}',
    achievements JSONB DEFAULT '[]',
    challenges_completed INTEGER DEFAULT 0,
    insights JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    overall_score DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_id ON weekly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start ON weekly_reports(week_start_date);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for user-owned data
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Mood entries policies
CREATE POLICY "Users can view own mood entries" ON mood_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON mood_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON mood_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" ON mood_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Wellness sessions policies
CREATE POLICY "Users can view own wellness sessions" ON wellness_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness sessions" ON wellness_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness sessions" ON wellness_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness sessions" ON wellness_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Users can view own challenges" ON challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON challenges
    FOR UPDATE USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Points transactions policies
CREATE POLICY "Users can view own points transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points transactions" ON points_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User points policies
CREATE POLICY "Users can view own points" ON user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own points" ON user_points
    FOR UPDATE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ML model states policies
CREATE POLICY "Users can view own ML model states" ON ml_model_states
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ML model states" ON ml_model_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ML model states" ON ml_model_states
    FOR UPDATE USING (auth.uid() = user_id);

-- Mood predictions policies
CREATE POLICY "Users can view own mood predictions" ON mood_predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood predictions" ON mood_predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood predictions" ON mood_predictions
    FOR UPDATE USING (auth.uid() = user_id);

-- Pattern insights policies
CREATE POLICY "Users can view own pattern insights" ON pattern_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pattern insights" ON pattern_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pattern insights" ON pattern_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Daily analytics policies
CREATE POLICY "Users can view own daily analytics" ON daily_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily analytics" ON daily_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily analytics" ON daily_analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Weekly reports policies
CREATE POLICY "Users can view own weekly reports" ON weekly_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reports" ON weekly_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reports" ON weekly_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_entries_updated_at
    BEFORE UPDATE ON mood_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_sessions_updated_at
    BEFORE UPDATE ON wellness_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
    BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
    BEFORE UPDATE ON streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ml_model_states_updated_at
    BEFORE UPDATE ON ml_model_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pattern_insights_updated_at
    BEFORE UPDATE ON pattern_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_analytics_updated_at
    BEFORE UPDATE ON daily_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at
    BEFORE UPDATE ON weekly_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Database Functions
-- ============================================================================

-- Function to calculate user level based on lifetime points
CREATE OR REPLACE FUNCTION calculate_user_level(lifetime_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(lifetime_points / 100) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get streak status
CREATE OR REPLACE FUNCTION get_streak_status(user_uuid UUID, streak_type TEXT)
RETURNS JSON AS $$
DECLARE
    current_streak INTEGER;
    longest_streak INTEGER;
    last_activity DATE;
BEGIN
    SELECT current_count, longest_count, last_activity_date
    INTO current_streak, longest_streak, last_activity
    FROM streaks
    WHERE user_id = user_uuid AND streak_type = get_streak_status.streak_type;

    RETURN JSON_BUILD_OBJECT(
        'current_count', COALESCE(current_streak, 0),
        'longest_count', COALESCE(longest_streak, 0),
        'last_activity_date', last_activity,
        'is_active', last_activity = CURRENT_DATE OR last_activity = CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to award points with transaction
CREATE OR REPLACE FUNCTION award_points(
    user_uuid UUID,
    point_amount INTEGER,
    transaction_type TEXT,
    source_type TEXT,
    source_id TEXT,
    description TEXT
) RETURNS INTEGER AS $$
DECLARE
    new_balance INTEGER;
    new_lifetime INTEGER;
    new_level INTEGER;
    points_in_current_level INTEGER;
BEGIN
    -- Get current points
    SELECT total_points, lifetime_points INTO new_balance, new_lifetime
    FROM user_points
    WHERE user_id = user_uuid;

    -- Initialize if user has no points
    IF new_balance IS NULL THEN
        new_balance := 0;
        new_lifetime := 0;
    END IF;

    -- Calculate new values
    new_balance := new_balance + point_amount;
    new_lifetime := new_lifetime + point_amount;
    new_level := FLOOR(new_lifetime / 100) + 1;
    points_in_current_level := new_lifetime % 100;

    -- Update user points
    INSERT INTO user_points (user_id, total_points, lifetime_points, level, points_to_next_level, updated_at)
    VALUES (user_uuid, new_balance, new_lifetime, new_level, 100 - points_in_current_level, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = new_balance,
        lifetime_points = new_lifetime,
        level = new_level,
        points_to_next_level = 100 - points_in_current_level,
        updated_at = NOW();

    -- Record transaction
    INSERT INTO points_transactions (user_id, amount, transaction_type, source_type, source_id, description, balance_after, created_at)
    VALUES (user_uuid, point_amount, transaction_type, source_type, source_id, description, new_balance, NOW());

    RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Achievement Definitions (stored as JSON for flexibility)
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievement_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    achievement_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    points_reward INTEGER DEFAULT 10,
    criteria JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO achievement_definitions (achievement_id, name, description, category, icon, tier, points_reward, criteria) VALUES
('first_mood', 'First Steps', 'Log your first mood entry', 'mood', '🌱', 'bronze', 10, '{"type": "count", "target": 1}'),
('mood_streak_7', 'Mood Master', 'Track your mood for 7 consecutive days', 'mood', '📈', 'silver', 50, '{"type": "streak", "target": 7}'),
('mood_streak_30', 'Consistency King', 'Track your mood for 30 consecutive days', 'mood', '👑', 'gold', 200, '{"type": "streak", "target": 30}'),
('mood_100', 'Mood Historian', 'Log 100 mood entries', 'mood', '📚', 'gold', 150, '{"type": "count", "target": 100}'),
('first_meditation', 'Mindful Beginnings', 'Complete your first meditation session', 'wellness', '🧘', 'bronze', 10, '{"type": "count", "target": 1}'),
('meditation_total_60', 'Zen Seeker', 'Complete 60 minutes of meditation', 'wellness', '✨', 'silver', 30, '{"type": "total_duration", "target": 60}'),
('meditation_streak_7', 'Meditation Master', 'Meditate for 7 consecutive days', 'wellness', '🎯', 'gold', 100, '{"type": "streak", "target": 7}'),
('first_yoga', 'Yoga Starter', 'Complete your first yoga session', 'wellness', '🧎', 'bronze', 10, '{"type": "count", "target": 1}'),
('yoga_streak_7', 'Flexible Mind', 'Practice yoga for 7 consecutive days', 'wellness', '🌟', 'silver', 75, '{"type": "streak", "target": 7}'),
('wellness_total_300', 'Wellness Warrior', 'Complete 300 minutes of wellness activities', 'wellness', '💪', 'gold', 100, '{"type": "total_duration", "target": 300}'),
('first_journal', 'Journal Journey', 'Write your first journal entry', 'journal', '📝', 'bronze', 10, '{"type": "count", "target": 1}'),
('journal_30', 'Dedicated Writer', 'Write 30 journal entries', 'journal', '✍️', 'silver', 50, '{"type": "count", "target": 30}'),
('first_achievement', 'Achievement Hunter', 'Unlock your first achievement', 'achievements', '🏆', 'bronze', 15, '{"type": "count", "target": 1}'),
('achievement_hunter_10', 'Achievement Seeker', 'Unlock 10 achievements', 'achievements', '🎖️', 'silver', 75, '{"type": "count", "target": 10}'),
('achievement_hunter_50', 'Master Collector', 'Unlock 50 achievements', 'achievements', '💎', 'platinum', 300, '{"type": "count", "target": 50}'),
('points_100', 'Point Collector', 'Earn 100 points', 'points', '⭐', 'bronze', 0, '{"type": "lifetime_points", "target": 100}'),
('points_1000', 'Point Master', 'Earn 1,000 points', 'points', '🌠', 'silver', 0, '{"type": "lifetime_points", "target": 1000}'),
('points_10000', 'Point Legend', 'Earn 10,000 points', 'points', '🏅', 'gold', 0, '{"type": "lifetime_points", "target": 10000}'),
('level_5', 'Rising Star', 'Reach level 5', 'level', '🌟', 'silver', 50, '{"type": "level", "target": 5}'),
('level_10', 'Accomplished', 'Reach level 10', 'level', '⭐', 'gold', 100, '{"type": "level", "target": 10}'),
('level_25', 'Expert', 'Reach level 25', 'level', '💫', 'platinum', 250, '{"type": "level", "target": 25}'),
('first_challenge', 'Challenge Accepted', 'Complete your first challenge', 'challenges', '🎯', 'bronze', 20, '{"type": "count", "target": 1}'),
('challenge_winner', 'Champion', 'Win a challenge', 'challenges', '🏆', 'gold', 100, '{"type": "wins", "target": 1}'),
('challenge_streak_4', 'Consistent Winner', 'Win 4 weekly challenges in a row', 'challenges', '🔥', 'platinum', 200, '{"type": "streak", "target": 4}'),
('all_streaks_7', 'Multitasker', 'Maintain 7-day streaks in all categories', 'streaks', '🌈', 'platinum', 500, '{"type": "all_streaks", "target": 7}'),
('mood_explorer', 'Mood Explorer', 'Log 10 different mood types', 'mood', '🎨', 'silver', 40, '{"type": "unique_moods", "target": 10}'),
('wellness_variety', 'Variety Champion', 'Try all 6 wellness activity types', 'wellness', '🌿', 'gold', 100, '{"type": "unique_types", "target": 6}'),
('early_bird', 'Early Bird', 'Log a mood before 7 AM', 'mood', '🐦', 'bronze', 15, '{"type": "time_based", "target": 1}'),
('night_owl', 'Night Owl', 'Log a mood after 10 PM', 'mood', '🦉', 'bronze', 15, '{"type": "time_based", "target": 1}'),
('weekend_warrior', 'Weekend Warrior', 'Complete wellness activities on both weekend days', 'wellness', '🎪', 'silver', 40, '{"type": "weekend", "target": 2}'),
('perfect_week', 'Perfect Week', 'Complete all daily goals for a week', 'challenges', '💯', 'platinum', 300, '{"type": "perfect_week", "target": 1}'),
('year_committed', 'Year of Growth', 'Use MoodMash for 365 days', 'commitment', '🎉', 'platinum', 1000, '{"type": "days_active", "target": 365}'),
('first_insight', 'Insightful', 'Receive your first AI insight', 'insights', '💡', 'bronze', 20, '{"type": "count", "target": 1}'),
('insight_follower', 'Action Taker', 'Follow 5 AI recommendations', 'insights', '👉', 'silver', 50, '{"type": "followed_recommendations", "target": 5}'),
('sentiment_sage', 'Sentiment Sage', 'Log 20 positive sentiment journal entries', 'journal', '😊', 'silver', 60, '{"type": "positive_entries", "target": 20}'),
('social_sharing', 'Social Butterfly', 'Share 5 achievements', 'social', '📤', 'silver', 40, '{"type": "shares", "target": 5}'),
('feedback_provider', 'Valuable Feedback', 'Complete 10 ratings', 'engagement', '⭐', 'bronze', 25, '{"type": "ratings", "target": 10}');

-- ============================================================================
-- Challenge Definitions
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'bonus', 'special')),
    duration_days INTEGER DEFAULT 7,
    target_value INTEGER DEFAULT 1,
    target_unit TEXT,
    points_reward INTEGER DEFAULT 50,
    bonus_points INTEGER DEFAULT 25,
    criteria JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default challenges
INSERT INTO challenge_definitions (challenge_id, name, description, category, icon, tier, duration_days, target_value, target_unit, points_reward, bonus_points) VALUES
('weekly_mood_streak', 'Mood Tracker Week', 'Log your mood every day this week', 'mood', '📊', 'standard', 7, 7, 'days', 75, 25),
('mood_mania', 'Mood Mania', 'Log 15 moods this week', 'mood', '😀', 'bonus', 7, 15, 'entries', 100, 50),
('meditation_marathon', 'Meditation Marathon', 'Meditate for 5 days this week', 'wellness', '🧘', 'standard', 7, 5, 'days', 60, 20),
('zen_master', 'Zen Master', 'Complete 100 minutes of meditation', 'wellness', '✨', 'special', 7, 100, 'minutes', 150, 75),
('yoga_yogi', 'Yoga Yogi', 'Practice yoga 4 times', 'wellness', '🧎', 'standard', 7, 4, 'sessions', 50, 15),
('breathing_buddy', 'Breathing Buddy', 'Complete 10 breathing exercises', 'wellness', '💨', 'bonus', 7, 10, 'exercises', 40, 20),
('wellness_warrior', 'Wellness Warrior', 'Complete 10 wellness sessions', 'wellness', '💪', 'standard', 7, 10, 'sessions', 80, 30),
('journal_journey', 'Journal Journey', 'Write 5 journal entries', 'journal', '📔', 'standard', 7, 5, 'entries', 50, 15),
('gratitude_guru', 'Gratitude Guru', 'Write 7 gratitude entries', 'journal', '🙏', 'bonus', 7, 7, 'entries', 70, 35),
('streak_survivor', 'Streak Survivor', 'Maintain all your streaks', 'streaks', '🔥', 'special', 7, 7, 'days', 100, 50),
('achievement_adder', 'Achievement Adder', 'Unlock 3 achievements', 'achievements', '🏆', 'standard', 7, 3, 'achievements', 60, 20),
('point_producer', 'Point Producer', 'Earn 200 points', 'points', '⭐', 'standard', 7, 200, 'points', 40, 15),
('mood_mixologist', 'Mood Mixologist', 'Log 8 different mood types', 'mood', '🎨', 'special', 7, 8, 'unique moods', 80, 40),
('wellness_explorer', 'Wellness Explorer', 'Try 4 different wellness types', 'wellness', '🌟', 'bonus', 7, 4, 'types', 70, 35),
('early_riser', 'Early Riser', 'Log 5 moods before 8 AM', 'mood', '🌅', 'bonus', 7, 5, 'early moods', 50, 25),
('mindful_moments', 'Mindful Moments', 'Complete mindfulness activities 6 days', 'wellness', '🧠', 'standard', 7, 6, 'days', 55, 20);

-- ============================================================================
-- Functions for Triggering Achievements
-- ============================================================================

CREATE OR REPLACE FUNCTION check_achievement_progress()
RETURNS TRIGGER AS $$
DECLARE
    user_uuid UUID;
    achievement_record RECORD;
    current_count INTEGER;
    should_unlock BOOLEAN := FALSE;
BEGIN
    -- Determine user ID based on the operation
    IF TG_OP = 'INSERT' THEN
        user_uuid := NEW.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        user_uuid := NEW.user_id;
    ELSE
        user_uuid := OLD.user_id;
    END IF;

    -- Check each achievement type
    -- This is a simplified version; full implementation would check all achievements

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- End of Schema
-- ============================================================================

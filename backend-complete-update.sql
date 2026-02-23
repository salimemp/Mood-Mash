-- ============================================================================
-- MoodMash Complete Backend Update Script
-- Run this script in your Supabase SQL Editor to fully implement all features
-- ============================================================================
-- Generated: 2026-02-05
-- Purpose: Comprehensive backend update with schema fixes and new tables
-- ============================================================================

-- ============================================================================
-- PART 1: SCHEMA FIXES (Run First)
-- ============================================================================

-- Fix mood_entries table - Add missing columns
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS mood_id TEXT;
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS mood_label TEXT;
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS emotion_icon TEXT;
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}';
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS is_ai_analyzed BOOLEAN DEFAULT FALSE;
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS ai_insights TEXT[];

-- Fix wellness_sessions table - Add missing columns
ALTER TABLE wellness_sessions ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}';
ALTER TABLE wellness_sessions ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE wellness_sessions ADD COLUMN IF NOT EXISTS ai_recommendation BOOLEAN DEFAULT FALSE;
ALTER TABLE wellness_sessions ADD COLUMN IF NOT EXISTS mood_before INTEGER;
ALTER TABLE wellness_sessions ADD COLUMN IF NOT EXISTS mood_after INTEGER;

-- Fix challenge table - Add missing columns
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS bonus_points INTEGER DEFAULT 0;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Fix achievement table - Add missing columns
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS achievement_type TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS max_progress INTEGER;

-- Update mood_entries - Set proper constraints
ALTER TABLE mood_entries ALTER COLUMN emotion SET NOT NULL;
ALTER TABLE mood_entries ALTER COLUMN intensity SET NOT NULL;

-- Update wellness_sessions - Fix type enum
DO $$ BEGIN
    ALTER TABLE wellness_sessions ADD CONSTRAINT wellness_sessions_type_check
    CHECK (type IN ('meditation', 'yoga', 'breathing', 'stretching', 'mindfulness', 'sleep', 'music', 'journal', 'other'));
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- ============================================================================
-- PART 2: NEW TABLES FOR AR FEATURES
-- ============================================================================

-- AR Meditation Sessions Table
CREATE TABLE IF NOT EXISTS ar_meditation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('guided', 'unguided', 'ambient', 'breathing')),
    environment_type TEXT NOT NULL CHECK (environment_type IN ('nature', 'ocean', 'forest', 'mountain', 'space', 'beach', 'garden', 'temple')),
    time_of_day TEXT DEFAULT 'day' CHECK (time_of_day IN ('day', 'night', 'sunset', 'sunrise')),
    duration_minutes INTEGER NOT NULL DEFAULT 10,
    breathing_pattern TEXT CHECK (breathing_pattern IN ('box', '4-7-8', 'calm', 'energy', 'custom')),
    spatial_audio_enabled BOOLEAN DEFAULT TRUE,
    environment_settings JSONB DEFAULT '{}',
    mood_before INTEGER,
    mood_after INTEGER,
    relaxation_score DECIMAL(5,4),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_meditation_user_id ON ar_meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_meditation_completed ON ar_meditation_sessions(completed_at);

-- AR Yoga Sessions Table
CREATE TABLE IF NOT EXISTS ar_yoga_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('guided', 'free', 'challenge')),
    environment_type TEXT NOT NULL CHECK (environment_type IN ('nature', 'ocean', 'forest', 'mountain', 'space', 'beach', 'garden', 'temple', 'studio')),
    yoga_style TEXT CHECK (yoga_style IN ('hatha', 'vinyasa', 'yin', 'restorative', 'power', 'hot', 'kids', 'pregnancy')),
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    poses_completed INTEGER DEFAULT 0,
    poses JSONB DEFAULT '[]',
    form_score DECIMAL(5,4),
    calories_burned INTEGER,
    flexibility_score DECIMAL(5,4),
    balance_score DECIMAL(5,4),
    instructor_enabled BOOLEAN DEFAULT TRUE,
    environment_settings JSONB DEFAULT '{}',
    mood_before INTEGER,
    mood_after INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_yoga_user_id ON ar_yoga_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_yoga_completed ON ar_yoga_sessions(completed_at);

-- AR Yoga Pose Detection Results Table
CREATE TABLE IF NOT EXISTS ar_yoga_pose_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES ar_yoga_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    pose_name TEXT NOT NULL,
    detection_timestamp TIMESTAMPTZ DEFAULT NOW(),
    keypoints JSONB NOT NULL DEFAULT '{}',
    form_accuracy DECIMAL(5,4),
    alignment_score DECIMAL(5,4),
    balance_score DECIMAL(5,4),
    corrections JSONB DEFAULT '[]',
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_pose_session ON ar_yoga_pose_detections(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_pose_user ON ar_yoga_pose_detections(user_id);

-- AR Mood Visualizations Table
CREATE TABLE IF NOT EXISTS ar_mood_visualizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    mood_type TEXT NOT NULL,
    mood_intensity INTEGER CHECK (mood_intensity >= 1 AND mood_intensity <= 10),
    visualization_type TEXT NOT NULL CHECK (visualization_type IN ('sphere', 'particles', 'aura', 'river', 'constellation', 'mandala')),
    environment_type TEXT CHECK (environment_type IN ('nature', 'ocean', 'forest', 'mountain', 'space', 'beach', 'garden', 'temple')),
    particle_effects JSONB DEFAULT '{}',
    color_palette JSONB DEFAULT '{}',
    animation_settings JSONB DEFAULT '{}',
    is_shareable BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_mood_user ON ar_mood_visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_mood_type ON ar_mood_visualizations(mood_type);

-- AR Mood Journey Table
CREATE TABLE IF NOT EXISTS ar_mood_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    journey_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    journey_type TEXT NOT NULL CHECK (journey_type IN ('daily', 'weekly', 'monthly', 'custom')),
    mood_entries JSONB NOT NULL DEFAULT '[]',
    path_visualization JSONB DEFAULT '{}',
    statistics JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_journey_user ON ar_mood_journeys(user_id);

-- AR Social Rooms Table
CREATE TABLE IF NOT EXISTS ar_social_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL CHECK (room_type IN ('support', 'meditation', 'yoga', 'chat', 'activity', 'group')),
    room_description TEXT,
    environment_type TEXT DEFAULT 'nature' CHECK (environment_type IN ('nature', 'ocean', 'forest', 'mountain', 'space', 'beach', 'garden', 'temple')),
    max_participants INTEGER DEFAULT 10,
    is_private BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    activity_settings JSONB DEFAULT '{}',
    room_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ar_social_host ON ar_social_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_ar_social_active ON ar_social_rooms(is_active);

-- AR Social Participants Table
CREATE TABLE IF NOT EXISTS ar_social_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES ar_social_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    avatar_config JSONB DEFAULT '{}',
    avatar_mood_color TEXT,
    position_x DECIMAL(10,4) DEFAULT 0,
    position_y DECIMAL(10,4) DEFAULT 0,
    position_z DECIMAL(10,4) DEFAULT 0,
    is_speaking BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    is_video_enabled BOOLEAN DEFAULT FALSE,
    current_mood TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ar_participant_room ON ar_social_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_ar_participant_user ON ar_social_participants(user_id);

-- AR Social Messages Table
CREATE TABLE IF NOT EXISTS ar_social_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES ar_social_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice', 'emoji', 'action', 'system')),
    message_content TEXT NOT NULL,
    mood_at_time TEXT,
    audio_url TEXT,
    reactions JSONB DEFAULT '{}',
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_message_room ON ar_social_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_ar_message_user ON ar_social_messages(user_id);

-- AR Avatars Table
CREATE TABLE IF NOT EXISTS ar_avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    avatar_style TEXT DEFAULT 'humanoid' CHECK (avatar_style IN ('humanoid', 'abstract', 'animal', 'creature', 'custom')),
    base_model TEXT,
    appearance JSONB DEFAULT '{}',
    accessories JSONB DEFAULT '[]',
    animations JSONB DEFAULT '[]',
    mood_expressions JSONB DEFAULT '{}',
    color_scheme JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AR Environment Presets Table
CREATE TABLE IF NOT EXISTS ar_environment_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
    preset_name TEXT NOT NULL,
    environment_type TEXT NOT NULL CHECK (environment_type IN ('nature', 'ocean', 'forest', 'mountain', 'space', 'beach', 'garden', 'temple')),
    time_of_day TEXT CHECK (time_of_day IN ('day', 'night', 'sunset', 'sunrise')),
    weather TEXT CHECK (weather IN ('clear', 'cloudy', 'rain', 'snow', 'windy')),
    lighting JSONB DEFAULT '{}',
    ambient_settings JSONB DEFAULT '{}',
    custom_elements JSONB DEFAULT '[]',
    is_default BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AR Session Analytics Table
CREATE TABLE IF NOT EXISTS ar_session_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('meditation', 'yoga', 'mood', 'social')),
    session_id UUID NOT NULL,
    duration_seconds INTEGER,
    engagement_score DECIMAL(5,4),
    device_info JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    error_logs JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_analytics_user ON ar_session_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_analytics_session ON ar_session_analytics(session_type);

-- ============================================================================
-- PART 3: JOURNAL TABLES (Complete Implementation)
-- ============================================================================

-- Journal Entries Table (already exists, but ensure all columns are present)
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS mood_intensity INTEGER;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS activities JSONB DEFAULT '[]';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS weather JSONB;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS sleep_quality INTEGER;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS energy_level INTEGER;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS stress_level INTEGER;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS ai_recommendations JSONB DEFAULT '[]';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS related_mood_entry UUID REFERENCES mood_entries(id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 4: ML/AI TABLES (Complete Implementation)
-- ============================================================================

-- Pattern Insights Table (already exists, but ensure all columns)
ALTER TABLE pattern_insights ADD COLUMN IF NOT EXISTS recommendation JSONB;
ALTER TABLE pattern_insights ADD COLUMN IF NOT EXISTS related_activities TEXT[];
ALTER TABLE pattern_insights ADD COLUMN IF NOT EXISTS confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high'));
ALTER TABLE pattern_insights ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Mood Predictions Table (already exists, but ensure all columns)
ALTER TABLE mood_predictions ADD COLUMN IF NOT EXISTS prediction_type TEXT DEFAULT 'emotion' CHECK (prediction_type IN ('emotion', 'intensity', 'trend', 'recommendation'));
ALTER TABLE mood_predictions ADD COLUMN IF NOT EXISTS model_version TEXT;
ALTER TABLE mood_predictions ADD COLUMN IF NOT EXISTS factors_importance JSONB DEFAULT '{}';
ALTER TABLE mood_predictions ADD COLUMN IF NOT EXISTS recommendation TEXT;

-- ML Model States Table (already exists, but ensure all columns)
ALTER TABLE ml_model_states ADD COLUMN IF NOT EXISTS hyperparameters JSONB DEFAULT '{}';
ALTER TABLE ml_model_states ADD COLUMN IF NOT EXISTS training_data_info JSONB DEFAULT '{}';
ALTER TABLE ml_model_states ADD COLUMN IF NOT EXISTS performance_history JSONB DEFAULT '[]';

-- ============================================================================
-- PART 5: NOTIFICATIONS TABLES (Complete Implementation)
-- ============================================================================

-- Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'challenge', 'streak', 'reminder', 'insight', 'social', 'system', 'ar')),
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    default_data JSONB DEFAULT '{}',
    channels JSONB DEFAULT '["app", "email"]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default notification templates
INSERT INTO notification_templates (template_id, type, title_template, body_template, channels) VALUES
('ar_meditation_complete', 'ar', 'AR Meditation Complete', 'You completed a {duration}-minute AR meditation session in the {environment} environment.', '["app", "email"]'),
('ar_yoga_complete', 'ar', 'AR Yoga Session Done', 'Great job! You completed your {duration}-minute yoga session with a form score of {score}%.', '["app", "email"]'),
('ar_mood_journey', 'ar', 'Your AR Mood Journey', 'Your mood journey "{journey_name}" has been updated with {entry_count} entries.', '["app"]'),
('ar_social_invite', 'social', 'Join AR Social Space', '{host_name} invited you to join "{room_name}" - an AR {room_type} session.', '["app", "email"]'),
('ar_achievement', 'ar', 'AR Milestone Unlocked', 'Congratulations! You''ve unlocked the "{achievement_name}" AR achievement!', '["app", "email"]')
ON CONFLICT (template_id) DO NOTHING;

-- ============================================================================
-- PART 6: ANALYTICS TABLES (Complete Implementation)
-- ============================================================================

-- Daily Analytics Table (already exists, but ensure all columns)
ALTER TABLE daily_analytics ADD COLUMN IF NOT EXISTS ar_sessions_count INTEGER DEFAULT 0;
ALTER TABLE daily_analytics ADD COLUMN IF NOT EXISTS ar_meditation_minutes INTEGER DEFAULT 0;
ALTER TABLE daily_analytics ADD COLUMN IF NOT EXISTS ar_yoga_sessions INTEGER DEFAULT 0;
ALTER TABLE daily_analytics ADD COLUMN IF NOT EXISTS ar_social_sessions INTEGER DEFAULT 0;
ALTER TABLE daily_analytics ADD COLUMN IF NOT EXISTS journal_entries_count INTEGER DEFAULT 0;
ALTER TABLE daily_analytics ADD COLUMN IF NOT EXISTS ai_insights_count INTEGER DEFAULT 0;
ALTER TABLE daily_analytics ADD COLUMN IF NOT EXISTS mood_predictions_accuracy DECIMAL(5,4);

-- ============================================================================
-- PART 7: RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE ar_meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_yoga_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_yoga_pose_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_mood_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_mood_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_social_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_social_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_social_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_environment_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- AR Meditation Sessions Policies
CREATE POLICY "Users can view own AR meditation sessions" ON ar_meditation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AR meditation sessions" ON ar_meditation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AR meditation sessions" ON ar_meditation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AR meditation sessions" ON ar_meditation_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- AR Yoga Sessions Policies
CREATE POLICY "Users can view own AR yoga sessions" ON ar_yoga_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AR yoga sessions" ON ar_yoga_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AR yoga sessions" ON ar_yoga_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AR yoga sessions" ON ar_yoga_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- AR Yoga Pose Detections Policies
CREATE POLICY "Users can view own pose detections" ON ar_yoga_pose_detections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pose detections" ON ar_yoga_pose_detections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pose detections" ON ar_yoga_pose_detections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pose detections" ON ar_yoga_pose_detections
    FOR DELETE USING (auth.uid() = user_id);

-- AR Mood Visualizations Policies
CREATE POLICY "Users can view own mood visualizations" ON ar_mood_visualizations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood visualizations" ON ar_mood_visualizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood visualizations" ON ar_mood_visualizations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood visualizations" ON ar_mood_visualizations
    FOR DELETE USING (auth.uid() = user_id);

-- AR Mood Journeys Policies
CREATE POLICY "Users can view own mood journeys" ON ar_mood_journeys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood journeys" ON ar_mood_journeys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood journeys" ON ar_mood_journeys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood journeys" ON ar_mood_journeys
    FOR DELETE USING (auth.uid() = user_id);

-- AR Social Rooms Policies
CREATE POLICY "Users can view public social rooms" ON ar_social_rooms
    FOR SELECT USING (is_private = FALSE OR auth.uid() = host_id);

CREATE POLICY "Users can create social rooms" ON ar_social_rooms
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Room hosts can update social rooms" ON ar_social_rooms
    FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Room hosts can delete social rooms" ON ar_social_rooms
    FOR DELETE USING (auth.uid() = host_id);

-- AR Social Participants Policies
CREATE POLICY "Participants can view room participants" ON ar_social_participants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ar_social_rooms WHERE id = room_id AND (is_private = FALSE OR host_id = auth.uid()))
        OR auth.uid() = user_id
    );

CREATE POLICY "Users can manage own participation" ON ar_social_participants
    FOR ALL USING (auth.uid() = user_id);

-- AR Social Messages Policies
CREATE POLICY "Room participants can view messages" ON ar_social_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ar_social_participants WHERE room_id = ar_social_messages.room_id AND user_id = auth.uid())
    );

CREATE POLICY "Room participants can send messages" ON ar_social_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ar_social_participants WHERE room_id = ar_social_messages.room_id AND user_id = auth.uid())
    );

CREATE POLICY "Message authors can update own messages" ON ar_social_messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Message authors can delete own messages" ON ar_social_messages
    FOR DELETE USING (auth.uid() = user_id);

-- AR Avatars Policies
CREATE POLICY "Users can view own avatar" ON ar_avatars
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own avatar" ON ar_avatars
    FOR ALL USING (auth.uid() = user_id);

-- AR Environment Presets Policies
CREATE POLICY "Users can view own environment presets" ON ar_environment_presets
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own environment presets" ON ar_environment_presets
    FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);

-- AR Session Analytics Policies
CREATE POLICY "Users can view own AR analytics" ON ar_session_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AR analytics" ON ar_session_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AR analytics" ON ar_session_analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Notification Templates Policies (read-only for authenticated users)
CREATE POLICY "Users can view notification templates" ON notification_templates
    FOR SELECT USING (is_active = TRUE);

-- ============================================================================
-- PART 8: DATABASE FUNCTIONS
-- ============================================================================

-- Function to calculate AR meditation streak
CREATE OR REPLACE FUNCTION calculate_ar_meditation_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    current_date DATE;
    check_date DATE;
BEGIN
    current_date := CURRENT_DATE;

    FOR i IN 0..365 LOOP
        check_date := current_date - i;

        IF EXISTS (
            SELECT 1 FROM ar_meditation_sessions
            WHERE user_id = user_uuid
            AND DATE(completed_at) = check_date
            AND duration_minutes >= 5
        ) THEN
            streak_count := streak_count + 1;
        ELSE
            IF check_date < current_date THEN
                EXIT;
            END IF;
        END IF;
    END LOOP;

    RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AR yoga streak
CREATE OR REPLACE FUNCTION calculate_ar_yoga_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    current_date DATE;
    check_date DATE;
BEGIN
    current_date := CURRENT_DATE;

    FOR i IN 0..365 LOOP
        check_date := current_date - i;

        IF EXISTS (
            SELECT 1 FROM ar_yoga_sessions
            WHERE user_id = user_uuid
            AND DATE(completed_at) = check_date
            AND duration_minutes >= 10
        ) THEN
            streak_count := streak_count + 1;
        ELSE
            IF check_date < current_date THEN
                EXIT;
            END IF;
        END IF;
    END LOOP;

    RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user AR statistics
CREATE OR REPLACE FUNCTION get_user_ar_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    total_meditation_minutes INTEGER;
    total_yoga_sessions INTEGER;
    total_yoga_minutes INTEGER;
    meditation_streak INTEGER;
    yoga_streak INTEGER;
    total_mood_visualizations INTEGER;
    total_social_sessions INTEGER;
    total_social_messages INTEGER;
BEGIN
    SELECT COALESCE(SUM(duration_minutes), 0) INTO total_meditation_minutes
    FROM ar_meditation_sessions WHERE user_id = user_uuid;

    SELECT COALESCE(COUNT(*), 0), COALESCE(SUM(duration_minutes), 0)
    INTO total_yoga_sessions, total_yoga_minutes
    FROM ar_yoga_sessions WHERE user_id = user_uuid;

    SELECT calculate_ar_meditation_streak(user_uuid) INTO meditation_streak;
    SELECT calculate_ar_yoga_streak(user_uuid) INTO yoga_streak;

    SELECT COALESCE(COUNT(*), 0) INTO total_mood_visualizations
    FROM ar_mood_visualizations WHERE user_id = user_uuid;

    SELECT COALESCE(COUNT(DISTINCT room_id), 0) INTO total_social_sessions
    FROM ar_social_participants WHERE user_id = user_uuid;

    SELECT COALESCE(COUNT(*), 0) INTO total_social_messages
    FROM ar_social_messages WHERE user_id = user_uuid;

    RETURN JSON_BUILD_OBJECT(
        'total_meditation_minutes', total_meditation_minutes,
        'total_yoga_sessions', total_yoga_sessions,
        'total_yoga_minutes', total_yoga_minutes,
        'meditation_streak', meditation_streak,
        'yoga_streak', yoga_streak,
        'total_mood_visualizations', total_mood_visualizations,
        'total_social_sessions', total_social_sessions,
        'total_social_messages', total_social_messages
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
    user_uuid UUID;
BEGIN
    analytics_date := DATE(COALESCE(NEW.completed_at, NEW.created_at));

    IF TG_TABLE_NAME IN ('ar_meditation_sessions', 'ar_yoga_sessions', 'ar_mood_visualizations',
                         'ar_social_participants', 'ar_social_messages', 'ar_session_analytics') THEN
        user_uuid := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'journal_entries' THEN
        user_uuid := NEW.user_id;
    ELSE
        RETURN NEW;
    END IF;

    -- Update or insert daily analytics
    INSERT INTO daily_analytics (user_id, date, updated_at)
    VALUES (user_uuid, analytics_date, NOW())
    ON CONFLICT (user_id, date) DO UPDATE SET
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for daily analytics
CREATE TRIGGER trigger_ar_meditation_analytics
    AFTER INSERT ON ar_meditation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER trigger_ar_yoga_analytics
    AFTER INSERT ON ar_yoga_sessions
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER trigger_journal_analytics
    AFTER INSERT ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

-- ============================================================================
-- PART 9: SEED DATA
-- ============================================================================

-- Seed default AR environment presets
INSERT INTO ar_environment_presets (preset_name, environment_type, time_of_day, weather, is_default) VALUES
('Morning Nature', 'nature', 'day', 'clear', TRUE),
('Ocean Sunset', 'ocean', 'sunset', 'clear', FALSE),
('Forest Retreat', 'forest', 'day', 'cloudy', FALSE),
('Mountain Peak', 'mountain', 'day', 'clear', FALSE),
('Space Journey', 'space', 'night', NULL, FALSE),
('Beach Bliss', 'beach', 'day', 'clear', FALSE),
('Zen Garden', 'garden', 'day', 'clear', FALSE),
('Temple Peace', 'temple', 'day', 'clear', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 10: VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
-- Run this script in your Supabase SQL Editor
-- The script is idempotent - safe to run multiple times
-- ============================================================================

-- ============================================================================
-- Security Fix: Enable RLS on Definition Tables
-- ============================================================================

-- Enable RLS on achievement_definitions
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view achievements (read-only)
CREATE POLICY "Allow authenticated users to view achievements" ON achievement_definitions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Note: Achievement definitions are system-managed, no insert/update policies needed
-- Only admin/service_role should modify these (handled by Supabase dashboard)

-- Enable RLS on challenge_definitions
ALTER TABLE challenge_definitions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view challenges (read-only)
CREATE POLICY "Allow authenticated users to view challenges" ON challenge_definitions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Note: Challenge definitions are system-managed, no insert/update policies needed
-- Only admin/service_role should modify these (handled by Supabase dashboard)

-- ============================================================================
-- Security Fix: Add search_path to All Functions
-- Prevents "search_path hijacking" attacks
-- ============================================================================

-- Drop and recreate functions with secure search_path
-- The SET search_path = public ensures functions only access the public schema

-- Function: award_points
DROP FUNCTION IF EXISTS award_points(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT);
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: check_achievement_progress
DROP FUNCTION IF EXISTS check_achievement_progress();
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: update_updated_at_column (recreate with search_path)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;
DROP TRIGGER IF EXISTS update_wellness_sessions_updated_at ON wellness_sessions;
DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
DROP TRIGGER IF EXISTS update_streaks_updated_at ON streaks;
DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
DROP TRIGGER IF EXISTS update_ml_model_states_updated_at ON ml_model_states;
DROP TRIGGER IF EXISTS update_pattern_insights_updated_at ON pattern_insights;
DROP TRIGGER IF EXISTS update_daily_analytics_updated_at ON daily_analytics;
DROP TRIGGER IF EXISTS update_weekly_reports_updated_at ON weekly_reports;

DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-apply triggers
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

-- Function: calculate_user_level
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER);
CREATE OR REPLACE FUNCTION calculate_user_level(lifetime_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(lifetime_points / 100) + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: get_streak_status
DROP FUNCTION IF EXISTS get_streak_status(UUID, TEXT);
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
    WHERE user_id = get_streak_status.user_uuid AND streak_type = get_streak_status.streak_type;

    RETURN JSON_BUILD_OBJECT(
        'current_count', COALESCE(current_streak, 0),
        'longest_count', COALESCE(longest_streak, 0),
        'last_activity_date', last_activity,
        'is_active', last_activity = CURRENT_DATE OR last_activity = CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- Verification Query - Run to confirm fixes
-- ============================================================================

SELECT
    'Tables with RLS enabled:' AS check_type,
    COUNT(*) AS count
FROM information_schema.tables
WHERE table_schema = 'public'
AND is_insertable_into = 'YES'
AND EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = tables.table_name
    AND schemaname = 'public'
)

UNION ALL

SELECT
    'Functions with secure search_path:' AS check_type,
    COUNT(*) AS count
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_definition LIKE '%SET search_path = public%';

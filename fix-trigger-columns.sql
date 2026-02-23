-- ============================================================================
-- MoodMash Trigger Fix Script
-- Fixes column reference errors after initial SQL execution
-- ============================================================================

-- Step 1: Drop existing triggers and function
DROP TRIGGER IF EXISTS trigger_ar_meditation_analytics ON ar_meditation_sessions;
DROP TRIGGER IF EXISTS trigger_ar_yoga_analytics ON ar_yoga_sessions;
DROP TRIGGER IF EXISTS trigger_journal_analytics ON journal_entries;
DROP FUNCTION IF EXISTS update_daily_analytics();

-- Step 2: Recreate the function
-- Note: journal_entries, ar_meditation_sessions, and ar_yoga_sessions all have user_id column
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
    user_uuid UUID;
BEGIN
    -- Get the date from completed_at or created_at
    analytics_date := DATE(COALESCE(NEW.completed_at, NEW.created_at));

    -- Get user_id from the appropriate table
    IF TG_TABLE_NAME = 'journal_entries' THEN
        user_uuid := NEW.user_id;
    ELSIF TG_TABLE_NAME IN ('ar_meditation_sessions', 'ar_yoga_sessions', 'ar_mood_visualizations',
                             'ar_social_participants', 'ar_social_messages', 'ar_session_analytics') THEN
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

-- Step 3: Recreate triggers
CREATE TRIGGER trigger_ar_meditation_analytics
    AFTER INSERT ON ar_meditation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER trigger_ar_yoga_analytics
    AFTER INSERT ON ar_yoga_sessions
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER trigger_journal_analytics
    AFTER INSERT ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

-- Step 4: Fix ar_environment_presets foreign key if needed
-- The table references user_profiles(user_id) which might have a different name

-- Check if user_profiles table exists and what its primary key is
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name LIKE '%user%'
ORDER BY ordinal_position;

-- If user_profiles doesn't have 'user_id', update the foreign key reference
-- This is a safe alter - it will only succeed if the current column name is different
DO $$
BEGIN
    -- Try to drop the foreign key constraint if it exists with wrong column
    ALTER TABLE ar_environment_presets DROP CONSTRAINT IF EXISTS ar_environment_presets_user_id_fkey;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Update the foreign key reference (adjust column name based on actual schema)
-- If user_profiles uses 'user_id' as the column:
-- ALTER TABLE ar_environment_presets ALTER COLUMN user_id REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- Step 5: Verify the setup
SELECT 'Tables created:' as status, COUNT(*) as count FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'ar_%';

SELECT 'RLS enabled:' as status, COUNT(*) as count FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'ar_%' AND rowsecurity = true;

-- ============================================================================
-- END OF FIX SCRIPT
-- ============================================================================

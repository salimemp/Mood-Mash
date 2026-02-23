-- ============================================================================
-- MoodMash Simple Trigger Creation Script
-- This script only creates the analytics triggers - tables are already created
-- ============================================================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS trigger_ar_meditation_analytics ON ar_meditation_sessions;
DROP TRIGGER IF EXISTS trigger_ar_yoga_analytics ON ar_yoga_sessions;
DROP TRIGGER IF EXISTS trigger_journal_analytics ON journal_entries;

-- Drop the function
DROP FUNCTION IF EXISTS update_daily_analytics();

-- Create the function
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
    user_uuid UUID;
BEGIN
    -- Get the date from completed_at or created_at
    analytics_date := DATE(COALESCE(NEW.completed_at, NEW.created_at));

    -- Get user_id based on table name
    IF TG_TABLE_NAME = 'journal_entries' THEN
        user_uuid := NEW.user_id;
    ELSIF TG_TABLE_NAME IN ('ar_meditation_sessions', 'ar_yoga_sessions',
                             'ar_mood_visualizations', 'ar_social_participants',
                             'ar_social_messages', 'ar_session_analytics') THEN
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

-- Create triggers
CREATE TRIGGER trigger_ar_meditation_analytics
    AFTER INSERT ON ar_meditation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER trigger_ar_yoga_analytics
    AFTER INSERT ON ar_yoga_sessions
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER trigger_journal_analytics
    AFTER INSERT ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

-- Verify
SELECT 'Triggers created successfully' as result;

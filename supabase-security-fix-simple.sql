-- ============================================================================
-- Simple Security Fix for MoodMash
-- Run this entire script in one go
-- ============================================================================

-- Step 1: Enable RLS on definition tables
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_definitions ENABLE ROW LEVEL SECURITY;

-- Step 2: Create read-only policies for authenticated users
CREATE POLICY "View achievements" ON achievement_definitions FOR SELECT
TO authenticated USING (true);

CREATE POLICY "View challenges" ON challenge_definitions FOR SELECT
TO authenticated USING (true);

-- Step 3: Fix function security by setting search_path
-- Run each ALTER FUNCTION command separately
ALTER FUNCTION award_points SET search_path = public;
ALTER FUNCTION check_achievement_progress SET search_path = public;
ALTER FUNCTION update_updated_at_column SET search_path = public;
ALTER FUNCTION calculate_user_level SET search_path = public;
ALTER FUNCTION get_streak_status SET search_path = public;

-- Step 4: Verify the fixes
SELECT
    'RLS Status' AS check_type,
    tablename AS entity,
    relrowsecurity::text AS status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('achievement_definitions', 'challenge_definitions')
ORDER BY tablename;

SELECT
    'Function Security' AS check_type,
    proname AS entity,
    pg_get_function_arguments(oid) AS arguments
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('award_points', 'check_achievement_progress', 'update_updated_at_column', 'calculate_user_level', 'get_streak_status')
ORDER BY proname;

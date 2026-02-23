# MoodMash Backend Complete Update Instructions

This document provides complete instructions for updating the MoodMash backend infrastructure to support all features including AR (Augmented Reality) features, journaling, and comprehensive analytics.

## Overview

The update includes:
- Database schema updates with new tables for AR features
- TypeScript type definitions updated to match schema
- New service layers for all features
- Fixed column mismatches between frontend and backend
- Comprehensive analytics and ML support

## Prerequisites

Before starting, ensure you have:
1. Access to your Supabase project
2. Supabase CLI installed (optional, for local development)
3. Node.js and npm/yarn for frontend updates
4. Backup of your current database (recommended)

## Part 1: Database Schema Update

### Step 1.1: Run the SQL Schema Update

1. Open your Supabase SQL Editor at: https://supabase.com/dashboard/project/pdcvmcbbyruurllxurok/sql

2. Copy the contents of `backend-complete-update.sql`

3. Paste and execute the SQL script

4. The script will:
   - Add missing columns to existing tables
   - Create new tables for AR features
   - Create new tables for journaling
   - Set up Row Level Security (RLS) policies
   - Create database functions for analytics
   - Seed default data

### Step 1.2: Verify Schema Update

Run the following query to verify all tables were created:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all these tables:
- ar_avatars
- ar_environment_presets
- ar_meditation_sessions
- ar_mood_journeys
- ar_mood_visualizations
- ar_social_messages
- ar_social_participants
- ar_social_rooms
- ar_session_analytics
- ar_yoga_pose_detections
- ar_yoga_sessions
- daily_analytics
- journal_entries
- mood_entries
- notifications
- user_profiles
- wellness_sessions
- achievements
- challenges
- streaks
- points_transactions
- user_points
- ml_model_states
- mood_predictions
- pattern_insights
- notification_templates
- achievement_definitions
- challenge_definitions
- weekly_reports

## Part 2: Frontend Updates

### Step 2.1: Install New Dependencies

No additional npm packages are required for the backend services as they use existing Supabase client.

### Step 2.2: Update TypeScript Types

The `src/types/database.ts` file has been updated with all necessary types. No further action needed.

### Step 2.3: Import New Services

Add the following imports to your components:

**For Journal Features:**
```typescript
import {
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStatistics,
  searchJournalEntries,
  analyzeAndUpdateJournal,
} from '../services/journalService';
```

**For AR Features:**
```typescript
import {
  createARMeditationSession,
  completeARMeditationSession,
  getARMeditationStatistics,
  createARYogaSession,
  completeARYogaSession,
  getARYogaStatistics,
  createARMoodVisualization,
  getARMoodVisualizations,
  createARSocialRoom,
  joinARSocialRoom,
  leaveARSocialRoom,
  sendARSocialMessage,
  saveARAvatar,
  getARAvatar,
  createAREnvironmentPreset,
  getAREnvironmentPresets,
  getAROverallStatistics,
} from '../services/arBackendService';
```

## Part 3: Feature Implementation Examples

### Journal Entry Example

```typescript
// Create a new journal entry
const journalResult = await createJournalEntry({
  title: 'Morning Reflection',
  content: 'Today I woke up feeling energized and ready to tackle my goals...',
  mood_id: 'happy',
  mood_intensity: 8,
  activities: ['meditation', 'exercise'],
  tags: ['morning', 'gratitude'],
  sleep_quality: 7,
  energy_level: 8,
});

// Get journal statistics
const statsResult = await getJournalStatistics();
if (statsResult.success && statsResult.data) {
  console.log('Total entries:', statsResult.data.totalEntries);
  console.log('Writing streak:', statsResult.data.writingStreak);
  console.log('Sentiment distribution:', statsResult.data.sentimentDistribution);
}
```

### AR Meditation Session Example

```typescript
// Start an AR meditation session
const sessionResult = await createARMeditationSession({
  session_type: 'guided',
  environment_type: 'nature',
  time_of_day: 'sunrise',
  duration_minutes: 15,
  breathing_pattern: '4-7-8',
  spatial_audio_enabled: true,
  mood_before: 5,
});

if (sessionResult.success && sessionResult.data) {
  const sessionId = sessionResult.data.id;

  // Complete the session
  await completeARMeditationSession(sessionId, 8, 0.85);
}

// Get meditation statistics
const statsResult = await getARMeditationStatistics();
if (statsResult.success && statsResult.data) {
  console.log('Total sessions:', statsResult.data.totalSessions);
  console.log('Total minutes:', statsResult.data.totalMinutes);
  console.log('Current streak:', statsResult.data.currentStreak);
}
```

### AR Yoga Session Example

```typescript
// Start an AR yoga session
const sessionResult = await createARYogaSession({
  session_type: 'guided',
  environment_type: 'beach',
  yoga_style: 'vinyasa',
  difficulty_level: 3,
  duration_minutes: 30,
  instructor_enabled: true,
  mood_before: 6,
});

if (sessionResult.success && sessionResult.data) {
  const sessionId = sessionResult.data.id;

  // Simulate completed poses
  const poses = [
    {
      pose_name: 'Downward Dog',
      detection_timestamp: new Date().toISOString(),
      keypoints: { /* keypoint data */ },
      form_accuracy: 0.92,
      alignment_score: 0.88,
      balance_score: 0.95,
      corrections: ['Keep hands shoulder-width apart'],
      duration_seconds: 45,
    },
    // ... more poses
  ];

  // Complete the session
  await completeARYogaSession(
    sessionId,
    poses,
    8, // mood after
    0.89, // form score
    0.75, // flexibility score
    0.85, // balance score
    120 // calories burned
  );
}
```

### AR Social Room Example

```typescript
// Create a social room
const roomResult = await createARSocialRoom({
  room_name: 'Morning Meditation Group',
  room_type: 'meditation',
  room_description: 'Join us for daily morning meditation',
  environment_type: 'garden',
  max_participants: 8,
  is_private: false,
});

if (roomResult.success && roomResult.data) {
  const roomId = roomResult.data.id;

  // Join the room
  await joinARSocialRoom(roomId, '#4F46E5'); // mood color

  // Send a message
  await sendARSocialMessage(roomId, 'Good morning everyone! 🌅', 'text');

  // Get messages
  const messagesResult = await getARSocialMessages(roomId, 50);

  // Leave when done
  await leaveARSocialRoom(roomId);
}
```

### AR Avatar Example

```typescript
// Save custom avatar
const avatarResult = await saveARAvatar({
  avatar_style: 'humanoid',
  appearance: {
    skinTone: '#F5D0C5',
    hairStyle: 'short',
    hairColor: '#2C1810',
  },
  accessories: ['glasses', 'earrings'],
  animations: ['idle', 'happy', 'excited'],
  mood_expressions: {
    happy: { eyes: 'happy', mouth: 'smile' },
    calm: { eyes: 'closed', mouth: 'neutral' },
  },
  color_scheme: {
    primary: '#4F46E5',
    secondary: '#10B981',
  },
  is_public: true,
});

// Get user's avatar
const getResult = await getARAvatar();
if (getResult.success && getResult.data) {
  console.log('Avatar style:', getResult.data.avatar_style);
  console.log('Customizations:', getResult.data.appearance);
}
```

### AR Environment Preset Example

```typescript
// Create a favorite environment preset
const presetResult = await createAREnvironmentPreset({
  preset_name: 'Sunset Beach',
  environment_type: 'beach',
  time_of_day: 'sunset',
  weather: 'clear',
  lighting: {
    sunPosition: { x: 100, y: 30, z: 50 },
    ambientIntensity: 0.4,
    sunsetColors: true,
  },
  ambient_settings: {
    oceanSounds: true,
    volume: 0.7,
    windEffect: true,
  },
  custom_elements: ['palm_trees', 'seagulls'],
  is_favorite: true,
});

// Get all presets (user's + defaults)
const presetsResult = await getAREnvironmentPresets();
if (presetsResult.success && presetsResult.data) {
  console.log('Available presets:', presetsResult.data);
}
```

## Part 4: Analytics Integration

### Track AR Session Analytics

```typescript
import { createARSessionAnalytics } from '../services/arBackendService';

// After any AR session
await createARSessionAnalytics({
  session_type: 'meditation',
  session_id: sessionId,
  duration_seconds: 900,
  engagement_score: 0.92,
  device_info: {
    browser: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  },
  performance_metrics: {
    frameRate: 60,
    loadTime: 2.5,
    memoryUsage: 150,
  },
});
```

## Part 5: Database Functions

The following PostgreSQL functions are automatically created:

### AR Meditation Streak Calculation

```sql
SELECT calculate_ar_meditation_streak('user-uuid-here');
```

### AR Yoga Streak Calculation

```sql
SELECT calculate_ar_yoga_streak('user-uuid-here');
```

### Get User AR Statistics

```sql
SELECT get_user_ar_stats('user-uuid-here');
```

Returns JSON with:
- total_meditation_minutes
- total_yoga_sessions
- total_yoga_minutes
- meditation_streak
- yoga_streak
- total_mood_visualizations
- total_social_sessions
- total_social_messages

## Part 6: Troubleshooting

### Issue: RLS Policy Errors

If you encounter Row Level Security errors:

1. Ensure user is authenticated before API calls
2. Check that the user's ID matches the record's user_id
3. Verify RLS is enabled on the table

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';
```

### Issue: Missing Columns

If columns are missing after running the SQL script:

1. Re-run the SQL script
2. Check for any error messages during execution
3. Manually add any missing columns:

```sql
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS mood_id TEXT;
ALTER TABLE wellness_sessions ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}';
```

### Issue: TypeScript Type Errors

If you see TypeScript errors after updating types:

1. Ensure `database.ts` is properly saved
2. Restart your TypeScript server (VS Code: Ctrl+Shift+P > TypeScript: Restart TS Server)
3. Check import paths are correct

### Issue: Service Integration

If services return errors:

1. Verify Supabase credentials are set in environment variables
2. Check browser console for detailed error messages
3. Ensure all async/await patterns are correct
4. Verify user is authenticated before calling services

## Part 7: Security Considerations

### RLS Policies

All new tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Public rooms can be viewed by all authenticated users
- Room hosts have additional management permissions

### Data Validation

All input is validated on the server side:
- Type checking ensures correct data types
- Constraint checks prevent invalid values
- Authentication checks prevent unauthorized access

### Privacy

- Users can mark avatars and mood visualizations as private
- Social rooms can be password-protected
- Default environment presets are shared but can be duplicated

## Part 8: Migration from Previous Version

If you have existing data:

### Migrate Mood Entries

```sql
-- Existing mood entries will be preserved
-- New columns will be added with NULL/DEFAULT values
-- No data loss should occur
```

### Migrate Wellness Sessions

```sql
-- Existing sessions will be preserved
-- New columns (metrics, settings, etc.) will be added
-- Type constraints may need manual adjustment if data doesn't match
```

### Migrate Achievements/Challenges

```sql
-- Data will be preserved
-- New columns added with defaults
-- Check achievement_definitions table for correct format
```

## Part 9: Rollback Instructions

If you need to rollback:

1. **Remove AR Tables:**
```sql
DROP TABLE IF EXISTS ar_meditation_sessions;
DROP TABLE IF EXISTS ar_yoga_sessions;
DROP TABLE IF EXISTS ar_mood_visualizations;
-- ... etc for all AR tables
```

2. **Remove New Columns:**
```sql
ALTER TABLE mood_entries DROP COLUMN IF EXISTS mood_id;
ALTER TABLE wellness_sessions DROP COLUMN IF EXISTS metrics;
-- ... etc for all new columns
```

3. **Remove Functions:**
```sql
DROP FUNCTION IF EXISTS calculate_ar_meditation_streak(UUID);
DROP FUNCTION IF EXISTS calculate_ar_yoga_streak(UUID);
DROP FUNCTION IF EXISTS get_user_ar_stats(UUID);
DROP FUNCTION IF EXISTS update_daily_analytics();
```

4. **Restore Previous TypeScript Types:**
   - Restore from git backup
   - Or manually remove AR types from database.ts

## Part 10: Support and Maintenance

### Regular Maintenance

1. **Clean Up Expired Social Rooms:**
```sql
DELETE FROM ar_social_rooms
WHERE expires_at < NOW();
```

2. **Archive Old Analytics:**
```sql
-- Move data older than 1 year to archive table
INSERT INTO ar_session_analytics_archive
SELECT * FROM ar_session_analytics
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM ar_session_analytics
WHERE created_at < NOW() - INTERVAL '1 year';
```

3. **Monitor Table Sizes:**
```sql
SELECT
  relname AS table_name,
  pg_size_pretty(pg_relation_size(relid)) AS size
FROM pg_stat_user_tables
ORDER BY pg_relation_size(relid) DESC;
```

### Performance Optimization

1. **Add Custom Indexes:**
```sql
CREATE INDEX idx_ar_meditation_user_completed
ON ar_meditation_sessions(user_id, completed_at DESC);

CREATE INDEX idx_ar_yoga_session_type
ON ar_yoga_sessions(user_id, session_type);
```

2. **Vacuum Analyze:**
```sql
VACUUM ANALYZE;
```

## Conclusion

This update provides a complete backend infrastructure for all MoodMash features including:
- Comprehensive mood tracking
- Wellness session management
- Gamification (achievements, challenges, streaks)
- Journaling with AI insights
- AR meditation, yoga, and mood visualization
- AR social features with real-time interactions
- Customizable AR avatars and environment presets
- Advanced analytics and ML predictions

For questions or issues, refer to the troubleshooting section or contact support.

---

**Generated:** 2026-02-05
**Version:** 2.0.0
**Compatibility:** MoodMash Frontend v2.0+

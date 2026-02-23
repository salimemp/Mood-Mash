// Wellness Content Data - Meditation, Yoga, and Music Therapy
// This file contains all the wellness content for the application

// ============================================================================
// Meditation Sessions
// ============================================================================

export interface MeditationSession {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'stress' | 'sleep' | 'anxiety' | 'focus' | 'gratitude' | 'self_love' | 'morning' | 'evening' | 'energy' | 'breathing';
  level: 'beginner' | 'intermediate' | 'advanced';
  narrator: string;
  benefits: string[];
  tags: string[];
  icon?: string;
}

export const MEDITATION_SESSIONS: MeditationSession[] = [
  // Stress Relief (12 sessions)
  { id: 'stress_1', name: 'Stress Release', description: 'Let go of tension', duration: 10, category: 'stress', level: 'beginner', narrator: 'Sarah', benefits: ['Stress relief', 'Relaxation', 'Calm'], tags: ['stress', 'relief'] },
  { id: 'stress_2', name: 'Deep Relaxation', description: 'Complete body-mind relaxation', duration: 15, category: 'stress', level: 'intermediate', narrator: 'Michael', benefits: ['Deep rest', 'Body release', 'Peace'], tags: ['deep', 'relaxation'] },
  { id: 'stress_3', name: 'Work Stress Relief', description: 'Leave work worries behind', duration: 12, category: 'stress', level: 'beginner', narrator: 'Emma', benefits: ['Work relief', 'Mental break', 'Recovery'], tags: ['work', 'professional'] },
  { id: 'stress_4', name: 'Financial Peace', description: 'Calm money worries', duration: 15, category: 'stress', level: 'intermediate', narrator: 'James', benefits: ['Financial calm', 'Perspective', 'Peace'], tags: ['money', 'finance'] },
  { id: 'stress_5', name: 'Release and Let Go', description: 'Surrender what you cannot control', duration: 10, category: 'stress', level: 'beginner', narrator: 'Olivia', benefits: ['Release', 'Surrender', 'Freedom'], tags: ['letting go', 'surrender'] },
  { id: 'stress_6', name: 'Calm in Chaos', description: 'Find stillness amid chaos', duration: 20, category: 'stress', level: 'intermediate', narrator: 'William', benefits: ['Chaos calm', 'Stillness', 'Balance'], tags: ['chaos', 'peaceful'] },
  { id: 'stress_7', name: 'Nervous System Soothe', description: 'Reset your nervous system', duration: 15, category: 'stress', level: 'intermediate', narrator: 'Ava', benefits: ['Nervous system', 'Regulation', 'Calm'], tags: ['body', 'physical'] },
  { id: 'stress_8', name: 'Overwhelm Relief', description: 'Handle feeling overwhelmed', duration: 10, category: 'stress', level: 'beginner', narrator: 'Benjamin', benefits: ['Overwhelm relief', 'Manageable', 'Clarity'], tags: ['overwhelm', 'manage'] },
  { id: 'stress_9', name: 'Tension Dissolve', description: 'Melt away physical tension', duration: 12, category: 'stress', level: 'beginner', narrator: 'Sophia', benefits: ['Tension release', 'Physical calm', 'Relaxation'], tags: ['tension', 'body'] },
  { id: 'stress_10', name: 'Mental Clarity', description: 'Clear the mental fog', duration: 15, category: 'stress', level: 'intermediate', narrator: 'Lucas', benefits: ['Mental clarity', 'Focus', 'Sharpness'], tags: ['clarity', 'thinking'] },
  { id: 'stress_11', name: 'Peaceful Place', description: 'Visit your inner sanctuary', duration: 10, category: 'stress', level: 'beginner', narrator: 'Mia', benefits: ['Safe space', 'Peace', 'Comfort'], tags: ['visualization', 'peace'] },
  { id: 'stress_12', name: 'Stress Response Reset', description: 'Activate relaxation response', duration: 20, category: 'stress', level: 'advanced', narrator: 'Noah', benefits: ['Parasympathetic', 'Reset', 'Healing'], tags: ['body', 'science'] },

  // Sleep (12 sessions)
  { id: 'sleep_1', name: 'Sleep Journey', description: 'Drift into peaceful sleep', duration: 20, category: 'sleep', level: 'beginner', narrator: 'Sarah', benefits: ['Sleep onset', 'Relaxation', 'Rest'], tags: ['sleep', 'night'] },
  { id: 'sleep_2', name: 'Body Scan for Sleep', description: 'Progressive relaxation for sleep', duration: 15, category: 'sleep', level: 'beginner', narrator: 'Michael', benefits: ['Body relaxation', 'Sleep prep', 'Calm'], tags: ['body scan', 'relaxation'] },
  { id: 'sleep_3', name: 'Sleep Meditation', description: 'Guided meditation for sleep', duration: 25, category: 'sleep', level: 'intermediate', narrator: 'Emma', benefits: ['Deep sleep', 'Restoration', 'Peace'], tags: ['meditation', 'rest'] },
  { id: 'sleep_4', name: 'Quiet the Mind', description: 'Silence racing thoughts', duration: 12, category: 'sleep', level: 'intermediate', narrator: 'James', benefits: ['Mental quiet', 'Sleep readiness', 'Calm'], tags: ['mind', 'thoughts'] },
  { id: 'sleep_5', name: 'Breathing for Sleep', description: 'Sleep-inducing breathing', duration: 10, category: 'sleep', level: 'beginner', narrator: 'Olivia', benefits: ['Sleep breathing', 'Relaxation', 'Rest'], tags: ['breathing', 'sleep'] },
  { id: 'sleep_6', name: 'Sleep Stories: Meadow', description: 'Peaceful meadow visualization', duration: 25, category: 'sleep', level: 'beginner', narrator: 'William', benefits: ['Visualization', 'Calm', 'Sleep'], tags: ['story', 'visualization'] },
  { id: 'sleep_7', name: 'Deep Sleep Delta', description: 'Delta wave meditation', duration: 30, category: 'sleep', level: 'intermediate', narrator: 'Ava', benefits: ['Deep rest', 'Delta waves', 'Restoration'], tags: ['brain waves', 'deep'] },
  { id: 'sleep_8', name: 'Sleep Hygiene Basics', description: 'Foundation for good sleep', duration: 12, category: 'sleep', level: 'beginner', narrator: 'Sophia', benefits: ['Sleep habits', 'Routine building', 'Health'], tags: ['education', 'basics'] },
  { id: 'sleep_9', name: 'Counting Sheep Remix', description: 'Modern take on sleep classic', duration: 8, category: 'sleep', level: 'beginner', narrator: 'Lucas', benefits: ['Easy sleep', 'Gentle focus', 'Relaxation'], tags: ['fun', 'light'] },
  { id: 'sleep_10', name: 'Temperature Drop', description: 'Cool down for sleep', duration: 10, category: 'sleep', level: 'beginner', narrator: 'Mia', benefits: ['Body cooling', 'Sleep trigger', 'Comfort'], tags: ['physical', 'temperature'] },
  { id: 'sleep_11', name: 'Full Body Sleep', description: 'Complete body relaxation', duration: 20, category: 'sleep', level: 'intermediate', narrator: 'Noah', benefits: ['Body release', 'Deep rest', 'Complete calm'], tags: ['body scan', 'complete'] },
  { id: 'sleep_12', name: 'Sleep Affirmations', description: 'Positive beliefs for rest', duration: 12, category: 'sleep', level: 'beginner', narrator: 'Emma', benefits: ['Positive mindset', 'Sleep confidence', 'Relaxation'], tags: ['affirmations', 'positive'] },

  // Anxiety (12 sessions)
  { id: 'anxiety_1', name: 'Anxiety SOS', description: 'Immediate relief for anxious moments', duration: 5, category: 'anxiety', level: 'beginner', narrator: 'Sarah', benefits: ['Quick calm', 'Grounding', 'Emergency relief'], tags: ['emergency', 'quick'] },
  { id: 'anxiety_2', name: 'Coping with Uncertainty', description: 'Find peace with the unknown', duration: 15, category: 'anxiety', level: 'intermediate', narrator: 'Michael', benefits: ['Acceptance', 'Courage', 'Trust'], tags: ['uncertainty', 'courage'] },
  { id: 'anxiety_3', name: 'Social Anxiety Release', description: 'Calm before social situations', duration: 12, category: 'anxiety', level: 'intermediate', narrator: 'Emma', benefits: ['Social confidence', 'Calm presence', 'Ease'], tags: ['social', 'confidence'] },
  { id: 'anxiety_4', name: 'Panic Recovery', description: 'Bounce back from panic', duration: 20, category: 'anxiety', level: 'advanced', narrator: 'James', benefits: ['Recovery', 'Self-regulation', 'Strength'], tags: ['panic', 'recovery'] },
  { id: 'anxiety_5', name: 'Worry Time', description: 'Structured worry management', duration: 15, category: 'anxiety', level: 'intermediate', narrator: 'Olivia', benefits: ['Worry control', 'Management', 'Peace'], tags: ['worry', 'management'] },
  { id: 'anxiety_6', name: 'Breathing Room', description: 'Space to breathe and reset', duration: 8, category: 'anxiety', level: 'beginner', narrator: 'William', benefits: ['Breath focus', 'Pause', 'Reset'], tags: ['breathing', 'pause'] },
  { id: 'anxiety_7', name: 'Safe Place Visualization', description: 'Create your sanctuary', duration: 12, category: 'anxiety', level: 'beginner', narrator: 'Ava', benefits: ['Safety', 'Visualization', 'Comfort'], tags: ['visualization', 'safe'] },
  { id: 'anxiety_8', name: 'Health Anxiety Relief', description: 'Ease health-related worries', duration: 15, category: 'anxiety', level: 'intermediate', narrator: 'Benjamin', benefits: ['Peace of mind', 'Body trust', 'Relaxation'], tags: ['health', 'body'] },
  { id: 'anxiety_9', name: 'Performance Calm', description: 'Pre-performance relaxation', duration: 10, category: 'anxiety', level: 'beginner', narrator: 'Sophia', benefits: ['Performance', 'Confidence', 'Focus'], tags: ['performance', 'confidence'] },
  { id: 'anxiety_10', name: 'Gradual Exposure', description: 'Face fears gently', duration: 18, category: 'anxiety', level: 'advanced', narrator: 'Lucas', benefits: ['Courage', 'Growth', 'Strength'], tags: ['exposure', 'courage'] },
  { id: 'anxiety_11', name: 'Inner Peace', description: 'Discover lasting calm', duration: 20, category: 'anxiety', level: 'advanced', narrator: 'Mia', benefits: ['Inner peace', 'Long-term calm', 'Resilience'], tags: ['deep', 'spiritual'] },
  { id: 'anxiety_12', name: 'Root Chakra Balance', description: 'Ground anxiety through energy work', duration: 15, category: 'anxiety', level: 'intermediate', narrator: 'Noah', benefits: ['Grounding', 'Energy balance', 'Stability'], tags: ['chakra', 'energy'] },

  // Focus (7 sessions)
  { id: 'focus_1', name: 'Laser Focus', description: 'Sharpen your concentration', duration: 15, category: 'focus', level: 'beginner', narrator: 'Sarah', benefits: ['Concentration', 'Mental sharpness', 'Productivity'], tags: ['focus', 'concentration'] },
  { id: 'focus_2', name: 'Deep Work Preparation', description: 'Enter flow state', duration: 10, category: 'focus', level: 'intermediate', narrator: 'Michael', benefits: ['Flow state', 'Productivity', 'Focus'], tags: ['work', 'productivity'] },
  { id: 'focus_3', name: 'Study Session', description: 'Optimize for learning', duration: 20, category: 'focus', level: 'beginner', narrator: 'Emma', benefits: ['Memory', 'Learning', 'Retention'], tags: ['study', 'learning'] },
  { id: 'focus_4', name: 'Creative Flow', description: 'Unlock creative energy', duration: 15, category: 'focus', level: 'intermediate', narrator: 'James', benefits: ['Creativity', 'Inspiration', 'Flow'], tags: ['creative', 'art'] },
  { id: 'focus_5', name: 'Present Moment Awareness', description: 'Stay anchored in now', duration: 10, category: 'focus', level: 'beginner', narrator: 'Olivia', benefits: ['Mindfulness', 'Presence', 'Awareness'], tags: ['mindfulness', 'present'] },
  { id: 'focus_6', name: 'Decision Making Clarity', description: 'Clear path for choices', duration: 12, category: 'focus', level: 'intermediate', narrator: 'William', benefits: ['Clarity', 'Decisions', 'Wisdom'], tags: ['decisions', 'choices'] },
  { id: 'focus_7', name: 'Attention Training', description: 'Strengthen focus muscles', duration: 18, category: 'focus', level: 'advanced', narrator: 'Ava', benefits: ['Focus strength', 'Mental discipline', 'Endurance'], tags: ['training', 'discipline'] },

  // Gratitude (6 sessions)
  { id: 'gratitude_1', name: 'Gratitude Practice', description: 'Cultivate thankfulness', duration: 10, category: 'gratitude', level: 'beginner', narrator: 'Sarah', benefits: ['Gratitude', 'Positive outlook', 'Happiness'], tags: ['gratitude', 'thankful'] },
  { id: 'gratitude_2', name: 'Appreciation Meditation', description: 'Value what you have', duration: 12, category: 'gratitude', level: 'beginner', narrator: 'Michael', benefits: ['Appreciation', 'Contentment', 'Joy'], tags: ['appreciation', 'abundance'] },
  { id: 'gratitude_3', name: 'Gratitude Journaling', description: 'Reflect on blessings', duration: 15, category: 'gratitude', level: 'intermediate', narrator: 'Emma', benefits: ['Reflection', 'Positivity', 'Wellbeing'], tags: ['journal', 'writing'] },
  { id: 'gratitude_4', name: 'Thanks for Today', description: 'End day with thanks', duration: 10, category: 'gratitude', level: 'beginner', narrator: 'James', benefits: ['Daily review', 'Closure', 'Peace'], tags: ['evening', 'daily'] },
  { id: 'gratitude_5', name: 'Gratitude for Others', description: 'Appreciate your people', duration: 12, category: 'gratitude', level: 'beginner', narrator: 'Olivia', benefits: ['Connection', 'Love', 'Relationships'], tags: ['relationships', 'community'] },
  { id: 'gratitude_6', name: 'Self Appreciation', description: 'Thank yourself', duration: 10, category: 'gratitude', level: 'beginner', narrator: 'William', benefits: ['Self-love', 'Confidence', 'Acceptance'], tags: ['self', 'worth'] },

  // Self-Love (6 sessions)
  { id: 'self_love_1', name: 'Loving Kindness', description: 'Radiate love to yourself', duration: 12, category: 'self_love', level: 'beginner', narrator: 'Sarah', benefits: ['Self-compassion', 'Warmth', 'Acceptance'], tags: ['kindness', 'compassion'] },
  { id: 'self_love_2', name: 'Inner Child Healing', description: 'Nurture your inner self', duration: 20, category: 'self_love', level: 'intermediate', narrator: 'Michael', benefits: ['Healing', 'Nurturing', 'Wholeness'], tags: ['healing', 'inner child'] },
  { id: 'self_love_3', name: 'Forgiveness Practice', description: 'Release self-judgment', duration: 15, category: 'self_love', level: 'intermediate', narrator: 'Emma', benefits: ['Forgiveness', 'Freedom', 'Peace'], tags: ['forgiveness', 'release'] },
  { id: 'self_love_4', name: 'Body Acceptance', description: 'Honor your body', duration: 12, category: 'self_love', level: 'beginner', narrator: 'James', benefits: ['Body love', 'Gratitude', 'Respect'], tags: ['body', 'acceptance'] },
  { id: 'self_love_5', name: 'Strength Acknowledgment', description: 'Recognize your resilience', duration: 10, category: 'self_love', level: 'beginner', narrator: 'Olivia', benefits: ['Strength', 'Confidence', 'Pride'], tags: ['strength', 'resilience'] },
  { id: 'self_love_6', name: 'Worthy of Love', description: 'Embrace your worthiness', duration: 15, category: 'self_love', level: 'intermediate', narrator: 'William', benefits: ['Worthiness', 'Deserving', 'Love'], tags: ['worth', 'deserving'] },

  // Morning (6 sessions)
  { id: 'morning_1', name: 'Morning Intention', description: 'Set your day with purpose', duration: 8, category: 'morning', level: 'beginner', narrator: 'Sarah', benefits: ['Purpose', 'Direction', 'Clarity'], tags: ['intention', 'goals'] },
  { id: 'morning_2', name: 'Energizing Breath', description: 'Awaken your body', duration: 5, category: 'morning', level: 'beginner', narrator: 'Michael', benefits: ['Energy', 'Vitality', 'Awakening'], tags: ['breath', 'energy'] },
  { id: 'morning_3', name: 'Sunrise Visualization', description: 'Visualize a bright day', duration: 10, category: 'morning', level: 'beginner', narrator: 'Emma', benefits: ['Positivity', 'Hope', 'Optimism'], tags: ['visualization', 'sun'] },
  { id: 'morning_4', name: 'Grounding Start', description: 'Begin anchored and present', duration: 12, category: 'morning', level: 'beginner', narrator: 'James', benefits: ['Grounding', 'Presence', 'Stability'], tags: ['grounding', 'roots'] },
  { id: 'morning_5', name: 'Abundance Attraction', description: 'Open to possibilities', duration: 10, category: 'morning', level: 'intermediate', narrator: 'Olivia', benefits: ['Abundance', 'Openness', 'Opportunity'], tags: ['abundance', 'manifest'] },
  { id: 'morning_6', name: 'Quick Morning Reset', description: 'Brief morning boost', duration: 5, category: 'morning', level: 'beginner', narrator: 'William', benefits: ['Refresh', 'Quick calm', 'Balance'], tags: ['quick', 'fast'] },

  // Evening (6 sessions)
  { id: 'evening_1', name: 'Day Release', description: 'Let go of todays worries', duration: 12, category: 'evening', level: 'beginner', narrator: 'Sarah', benefits: ['Release', 'Closure', 'Peace'], tags: ['release', 'closure'] },
  { id: 'evening_2', name: 'Reflect and Release', description: 'Process the day', duration: 15, category: 'evening', level: 'intermediate', narrator: 'Michael', benefits: ['Reflection', 'Processing', 'Growth'], tags: ['reflection', 'review'] },
  { id: 'evening_3', name: 'Sleep Preparation', description: 'Wind down gently', duration: 10, category: 'evening', level: 'beginner', narrator: 'Emma', benefits: ['Relaxation', 'Sleep prep', 'Calm'], tags: ['wind down', 'rest'] },
  { id: 'evening_4', name: 'Evening Gratitude', description: 'Give thanks for the day', duration: 8, category: 'evening', level: 'beginner', narrator: 'James', benefits: ['Gratitude', 'Positivity', 'Contentment'], tags: ['thanks', 'appreciation'] },
  { id: 'evening_5', name: 'Digital Detox', description: 'Disconnect and unwind', duration: 10, category: 'evening', level: 'beginner', narrator: 'Olivia', benefits: ['Detox', 'Unplug', 'Presence'], tags: ['digital', 'unplug'] },
  { id: 'evening_6', name: 'Peaceful Slumber', description: 'Drift into rest', duration: 15, category: 'evening', level: 'beginner', narrator: 'William', benefits: ['Peace', 'Rest', 'Sleep'], tags: ['sleep', 'rest'] },

  // Energy (5 sessions)
  { id: 'energy_1', name: 'Vitality Boost', description: 'Increase your life force', duration: 10, category: 'energy', level: 'beginner', narrator: 'Sarah', benefits: ['Vitality', 'Energy', 'Dynamism'], tags: ['vitality', 'life force'] },
  { id: 'energy_2', name: 'Chakra Activation', description: 'Energize your centers', duration: 15, category: 'energy', level: 'intermediate', narrator: 'Michael', benefits: ['Chakra balance', 'Energy flow', 'Vitality'], tags: ['chakra', 'energy'] },
  { id: 'energy_3', name: 'Movement Preparation', description: 'Ready your body', duration: 8, category: 'energy', level: 'beginner', narrator: 'Emma', benefits: ['Warm-up', 'Readiness', 'Activation'], tags: ['movement', 'exercise'] },
  { id: 'energy_4', name: 'Afternoon Pick-Me-Up', description: 'Combat afternoon slump', duration: 5, category: 'energy', level: 'beginner', narrator: 'James', benefits: ['Awakening', 'Alertness', 'Renewal'], tags: ['afternoon', 'slump'] },
  { id: 'energy_5', name: 'Power Charging', description: 'Rapid energy restoration', duration: 12, category: 'energy', level: 'intermediate', narrator: 'Olivia', benefits: ['Recharge', 'Power', 'Strength'], tags: ['charging', 'power'] },

  // Breathing (4 sessions)
  { id: 'breathing_1', name: 'Box Breathing', description: 'Equal inhale and exhale', duration: 8, category: 'breathing', level: 'beginner', narrator: 'Sarah', benefits: ['Balance', 'Calm', 'Focus'], tags: ['box', 'equal'] },
  { id: 'breathing_2', name: '4-7-8 Relaxation', description: 'Calming breath pattern', duration: 10, category: 'breathing', level: 'beginner', narrator: 'Michael', benefits: ['Relaxation', 'Sleep', 'Peace'], tags: ['calm', 'sleep'] },
  { id: 'breathing_3', name: 'Energizing Breath', description: 'Building breath', duration: 8, category: 'breathing', level: 'beginner', narrator: 'Emma', benefits: ['Energy', 'Alertness', 'Vitality'], tags: ['energize', 'awake'] },
  { id: 'breathing_4', name: 'Breath Awareness', description: 'Observe your breath', duration: 12, category: 'breathing', level: 'beginner', narrator: 'James', benefits: ['Awareness', 'Mindfulness', 'Presence'], tags: ['awareness', 'observe'] },
];

// ============================================================================
// Yoga Poses
// ============================================================================

export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  category: 'standing' | 'seated' | 'balance' | 'backbend' | 'forward_fold' | 'twist' | 'inversion' | 'restorative' | 'prone' | 'supine';
  level: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  instructions: string[];
  precautions: string[];
  duration: number; // hold time in seconds for static poses
}

export const YOGA_POSES: YogaPose[] = [
  // Standing Poses (20 poses)
  { id: 'mountain', name: 'Mountain Pose', sanskritName: 'Tadasana', description: 'Foundational standing pose', category: 'standing', level: 'beginner', benefits: ['Posture', 'Awareness', 'Strength'], instructions: ['Stand with feet together', 'Arms at sides', 'Ground through feet', 'Engage thighs', 'Lengthen spine'], precautions: ['Low blood pressure'], duration: 30 },
  { id: 'forward_fold', name: 'Forward Fold', sanskritName: 'Uttanasana', description: 'Fold forward from hips', category: 'forward_fold', level: 'beginner', benefits: ['Calm', 'Stretch', 'Digestion'], instructions: ['Stand tall', 'Hinge at hips', 'Let head hang', 'Bend knees slightly'], precautions: ['Back issues', 'High blood pressure'], duration: 30 },
  { id: 'downward_dog', name: 'Downward Facing Dog', sanskritName: 'Adho Mukha Svanasana', description: 'Inverted V pose', category: 'inversion', level: 'beginner', benefits: ['Strength', 'Stretch', 'Calm'], instructions: ['Hands shoulder-width', 'Feet hip-width', 'Lift hips high', 'Press chest toward thighs'], precautions: ['Wrist issues', 'Carpal tunnel'], duration: 30 },
  { id: 'warrior_i', name: 'Warrior I', sanskritName: 'Virabhadrasana I', description: 'Powerful standing pose', category: 'standing', level: 'beginner', benefits: ['Strength', 'Stability', 'Focus'], instructions: ['Step one foot back', 'Bend front knee', 'Raise arms overhead', 'Square hips forward'], precautions: ['Shoulder issues', 'High blood pressure'], duration: 30 },
  { id: 'warrior_ii', name: 'Warrior II', sanskritName: 'Virabhadrasana II', description: 'Wide stance warrior pose', category: 'standing', level: 'beginner', benefits: ['Strength', 'Stamina', 'Focus'], instructions: ['Feet wide apart', 'Front knee bent', 'Arms parallel to floor', 'Gaze over front hand'], precautions: ['Shoulder issues'], duration: 30 },
  { id: 'triangle', name: 'Triangle Pose', sanskritName: 'Trikonasana', description: 'Extended triangle pose', category: 'standing', level: 'beginner', benefits: ['Stretch', 'Strength', 'Balance'], instructions: ['Feet wide', 'Reach to front foot', 'Lower hand to shin or floor', 'Top arm reaches up'], precautions: ['Low blood pressure', 'Neck issues'], duration: 30 },
  { id: 'half_moon', name: 'Half Moon Pose', sanskritName: 'Ardha Chandrasana', description: 'Balanced standing pose', category: 'balance', level: 'intermediate', benefits: ['Balance', 'Strength', 'Focus'], instructions: ['Feet wide', 'Shift weight to one foot', 'Other leg parallel to floor', 'Bottom hand on hip or floor'], precautions: ['Balance issues', 'Vertigo'], duration: 30 },
  { id: 'tree', name: 'Tree Pose', sanskritName: 'Vrksasana', description: 'Balanced standing pose', category: 'balance', level: 'beginner', benefits: ['Balance', 'Focus', 'Grounding'], instructions: ['Stand on one foot', 'Place other foot on inner thigh', 'Hands at heart or overhead'], precautions: ['Balance issues'], duration: 30 },
  { id: 'extended_tree', name: 'Extended Tree Pose', sanskritName: 'Utthita Vrksasana', description: 'Extended tree variation', category: 'balance', level: 'beginner', benefits: ['Balance', 'Strength', 'Concentration'], instructions: ['Stand on one foot', 'Other foot on inner thigh', 'Extend arms overhead'], precautions: ['Balance issues'], duration: 30 },
  { id: 'chair', name: 'Chair Pose', sanskritName: 'Utkatasana', description: 'Powerful seated standing', category: 'standing', level: 'beginner', benefits: ['Strength', 'Endurance', 'Power'], instructions: ['Stand tall', 'Bend knees as if sitting', 'Raise arms overhead', 'Keep chest lifted'], precautions: ['Knee issues', 'Low blood pressure'], duration: 30 },
  { id: 'gate', name: 'Gate Pose', sanskritName: 'Parighasana', description: 'Standing side stretch', category: 'standing', level: 'beginner', benefits: ['Side stretch', 'Spine mobility', 'Hip opener'], instructions: ['Kneel on one knee', 'Other leg out to side', 'Reach arm over head', 'Slide hand down leg'], precautions: ['Knee issues'], duration: 30 },
  { id: 'warrior_iii', name: 'Warrior III', sanskritName: 'Virabhadrasana III', description: 'Balancing warrior', category: 'balance', level: 'intermediate', benefits: ['Balance', 'Strength', 'Focus'], instructions: ['Hinge forward on one foot', 'Other leg extends back', 'Arms extend forward'], precautions: ['Balance issues', 'Back issues'], duration: 30 },
  { id: 'eagle', name: 'Eagle Pose', sanskritName: 'Garudasana', description: 'Wrapped balance pose', category: 'balance', level: 'intermediate', benefits: ['Balance', 'Focus', 'Shoulder stretch'], instructions: ['Stand on one foot', 'Wrap other leg', 'Wrap arms opposite'], precautions: ['Balance issues', 'Shoulder issues'], duration: 30 },
  { id: 'dancer', name: 'Dancer Pose', sanskritName: 'Natarajasana', description: 'Balancing pose', category: 'balance', level: 'intermediate', benefits: ['Balance', 'Flexibility', 'Grace'], instructions: ['Stand on one foot', 'Grab opposite ankle', 'Extend other arm forward'], precautions: ['Balance issues', 'Ankle issues'], duration: 30 },
  { id: 'side_lean', name: 'Side Lean Pose', sanskritName: 'Trikonasana', description: 'Standing side stretch', category: 'standing', level: 'beginner', benefits: ['Side stretch', 'Spine flexibility', 'Hip opening'], instructions: ['Stand wide', 'Lean to one side', 'Hand on shin or floor'], precautions: ['Neck issues'], duration: 30 },
  { id: 'reverse_warrior', name: 'Reverse Warrior', sanskritName: 'Viparita Virabhadrasana', description: 'Back-bending warrior', category: 'standing', level: 'beginner', benefits: ['Side stretch', 'Backbend', 'Hip opener'], instructions: ['From warrior II', 'Lower back hand', 'Raise front arm overhead'], precautions: ['High blood pressure'], duration: 30 },
  { id: 'extended_dog', name: 'Extended Puppy Pose', sanskritName: 'Uttana Shishosana', description: 'Gentle forward fold', category: 'forward_fold', level: 'beginner', benefits: ['Relaxation', 'Spine stretch', 'Calm'], instructions: ['From downward dog', 'Walk hands forward', 'Lower forehead to mat'], precautions: ['Shoulder issues'], duration: 45 },
  { id: 'crescent', name: 'High Lunge', sanskritName: 'Ashta Chandrasana', description: 'Lunging pose', category: 'standing', level: 'beginner', benefits: ['Strength', 'Power', 'Stability'], instructions: ['Step one foot forward', 'Bend front knee', 'Raise arms overhead'], precautions: ['Knee issues'], duration: 30 },
  { id: 'reverse_dog', name: 'Upward Facing Dog', sanskritName: 'Urdhva Mukha Svanasana', description: 'Back-bending pose', category: 'backbend', level: 'intermediate', benefits: ['Back strength', 'Chest opener', 'Energy'], instructions: ['Lie face down', 'Press hands down', 'Lift chest up'], precautions: ['Back issues', 'Pregnancy'], duration: 30 },
  { id: 'cobra', name: 'Cobra Pose', sanskritName: 'Bhujangasana', description: 'Gentle backbend', category: 'backbend', level: 'beginner', benefits: ['Back strength', 'Flexibility', 'Energy'], instructions: ['Lie face down', 'Lift chest with arms', 'Keep elbows bent'], precautions: ['Back issues', 'Pregnancy'], duration: 30 },

  // Seated Poses (15 poses)
  { id: 'easy_seat', name: 'Easy Pose', sanskritName: 'Sukhasana', description: 'Comfortable seated position', category: 'seated', level: 'beginner', benefits: ['Relaxation', 'Grounding', 'Meditation'], instructions: ['Sit with legs crossed', 'Hands on knees', 'Lengthen spine'], precautions: ['Knee issues'], duration: 60 },
  { id: 'staff', name: 'Staff Pose', sanskritName: 'Dandasana', description: 'Foundation seated pose', category: 'seated', level: 'beginner', benefits: ['Posture', 'Core strength', 'Spine awareness'], instructions: ['Sit with legs extended', 'Flex feet', 'Hands beside hips'], precautions: ['Lower back issues'], duration: 30 },
  { id: 'head_to_knee', name: 'Head to Knee Pose', sanskritName: 'Janu Sirsasana', description: 'Forward fold variation', category: 'seated', level: 'intermediate', benefits: ['Hip opener', 'Spine stretch', 'Calm'], instructions: ['Sit with one leg bent', 'Fold forward over extended leg'], precautions: ['Back issues'], duration: 45 },
  { id: 'bound_angle', name: 'Bound Angle Pose', sanskritName: 'Baddha Konasana', description: 'Butterfly position', category: 'seated', level: 'beginner', benefits: ['Hip opener', 'Groin stretch', 'Relaxation'], instructions: ['Sit with soles together', 'Knees out', 'Hold feet'], precautions: ['Knee issues', 'Groin issues'], duration: 60 },
  { id: 'seated_twist', name: 'Seated Spinal Twist', sanskritName: 'Ardha Matsyendrasana', description: 'Twisting pose', category: 'twist', level: 'beginner', benefits: ['Spine mobility', 'Digestion', 'Balance'], instructions: ['Sit with legs extended', 'Bend one knee', 'Twist toward bent knee'], precautions: ['Back issues'], duration: 45 },
  { id: 'pigeon', name: 'Pigeon Pose', sanskritName: 'Eka Pada Rajakapotasana', description: 'Deep hip opener', category: 'seated', level: 'intermediate', benefits: ['Hip opener', 'Glute release', 'Relaxation'], instructions: ['From downward dog', 'Bring one knee forward', 'Extend back leg'], precautions: ['Knee issues', 'Sacroiliac issues'], duration: 60 },
  { id: 'figure_four', name: 'Figure Four Pose', sanskritName: 'Fire Log Pose', description: 'Hip and glute stretch', category: 'seated', level: 'intermediate', benefits: ['Hip opener', 'Glute release', 'Lower back relief'], instructions: ['Lie on back', 'Cross ankle over knee', 'Pull leg toward chest'], precautions: ['Knee issues', 'Lower back issues'], duration: 60 },
  { id: 'hero', name: 'Hero Pose', sanskritName: 'Virasana', description: 'Kneeling pose', category: 'seated', level: 'beginner', benefits: ['Knee flexibility', 'Digestion', 'Calm'], instructions: ['Kneel on mat', 'Sit back on heels', 'Hands on thighs'], precautions: ['Knee issues', 'Ankle issues'], duration: 60 },
  { id: 'reclined_hero', name: 'Reclined Hero Pose', sanskritName: 'Supta Virasana', description: 'Restorative hip opener', category: 'restorative', level: 'intermediate', benefits: ['Hip opener', 'Relaxation', 'Stretch'], instructions: ['From hero pose', 'Lean back on elbows', 'Eventually lie flat'], precautions: ['Knee issues', 'Lower back issues'], duration: 60 },
  { id: 'child', name: 'Childs Pose', sanskritName: 'Balasana', description: 'Resting pose', category: 'restorative', level: 'beginner', benefits: ['Relaxation', 'Hip release', 'Calm'], instructions: ['Kneel on mat', 'Sit back on heels', 'Fold forward on mat'], precautions: ['Knee issues', 'Pregnancy'], duration: 60 },
  { id: 'wide_angle', name: 'Wide Angle Seated Forward Fold', sanskritName: 'Upavistha Konasana', description: 'Seated straddle', category: 'seated', level: 'intermediate', benefits: ['Hip opener', 'Hamstring stretch', 'Inner thigh stretch'], instructions: ['Sit with legs wide', 'Fold forward', 'Reach toward feet'], precautions: ['Hamstring issues'], duration: 45 },
  { id: 'borrowed', name: 'Boat Pose', sanskritName: 'Navasana', description: 'Core strength pose', category: 'seated', level: 'intermediate', benefits: ['Core strength', 'Abdominal strength', 'Balance'], instructions: ['Sit with knees bent', 'Lean back slightly', 'Lift feet and legs'], precautions: ['Lower back issues', 'Neck issues'], duration: 30 },
  { id: 'half_boat', name: 'Half Boat Pose', sanskritName: 'Ardha Navasana', description: 'Partial boat pose', category: 'seated', level: 'beginner', benefits: ['Core strength', 'Abdominal activation', 'Balance'], instructions: ['Sit with knees bent', 'Lean back slightly', 'Keep feet on floor'], precautions: ['Lower back issues'], duration: 30 },
  { id: 'cow_face', name: 'Cow Face Pose', sanskritName: 'Gomukhasana', description: 'Cross-legged hip opener', category: 'seated', level: 'intermediate', benefits: ['Hip opener', 'Shoulder stretch', 'Grounding'], instructions: ['Sit with one knee over other', 'Stack knees', 'Clasp hands behind back'], precautions: ['Knee issues', 'Shoulder issues'], duration: 60 },
  { id: 'accompanying', name: 'Accomplished Pose', sanskritName: 'Siddhasana', description: 'Meditative seated pose', category: 'seated', level: 'intermediate', benefits: ['Meditation', 'Grounding', 'Focus'], instructions: ['Sit with one heel at perineum', 'Other foot in front'], precautions: ['Knee issues'], duration: 60 },

  // Balance Poses (12 poses)
  { id: 'crow', name: 'Crow Pose', sanskritName: 'Bakasana', description: 'Arm balance', category: 'balance', level: 'intermediate', benefits: ['Arm strength', 'Core strength', 'Focus'], instructions: ['Squat with feet close', 'Place hands on mat', 'Lift feet to arms'], precautions: ['Wrist issues'], duration: 15 },
  { id: 'side_crow', name: 'Side Crow', sanskritName: 'Parsva Bakasana', description: 'Twisted arm balance', category: 'balance', level: 'advanced', benefits: ['Arm strength', 'Twist', 'Balance'], instructions: ['From crow pose', 'Twist torso', 'Stack hips'], precautions: ['Wrist issues', 'Core strength needed'], duration: 15 },
  { id: 'scale', name: 'Scale Pose', sanskritName: 'Tolasana', description: 'Lifted pose', category: 'balance', level: 'intermediate', benefits: ['Arm strength', 'Core strength', 'Willpower'], instructions: ['Sit in lotus', 'Lift off mat using arm strength'], precautions: ['Wrist issues', 'Knee issues'], duration: 15 },
  { id: 'headstand', name: 'Supported Headstand', sanskritName: 'Sirsasana', description: 'Inverted balance', category: 'inversion', level: 'advanced', benefits: ['Focus', 'Inversion benefits', 'Strength'], instructions: ['Interlace fingers', 'Place crown of head on mat', 'Lift legs slowly'], precautions: ['Neck issues', 'High blood pressure'], duration: 60 },
  { id: 'shoulder_stand', name: 'Shoulder Stand', sanskritName: 'Sarvangasana', description: 'Full shoulder inversion', category: 'inversion', level: 'intermediate', benefits: ['Calm', 'Relaxation', 'Thyroid support'], instructions: ['Lie on back', 'Lift legs overhead', 'Support lower back'], precautions: ['Neck issues', 'High blood pressure'], duration: 60 },
  { id: 'plow', name: 'Plow Pose', sanskritName: 'Halasana', description: 'Legs over head', category: 'inversion', level: 'intermediate', benefits: ['Spine flexibility', 'Calm', 'Relaxation'], instructions: ['From shoulder stand', 'Lower legs over head'], precautions: ['Neck issues', 'Lower back issues'], duration: 30 },
  { id: 'feathered_peacock', name: 'Feathered Peacock Pose', sanskritName: 'Pincha Mayurasana', description: 'Forearm balance', category: 'inversion', level: 'advanced', benefits: ['Balance', 'Strength', 'Focus'], instructions: ['Forearms on mat', 'Lift one leg at a time', 'Engage core'], precautions: ['Wrist issues', 'Forearm strength needed'], duration: 30 },
  { id: 'king_dancer', name: 'King Dancer Pose', sanskritName: 'Natarajasana', description: 'Extended balancing pose', category: 'balance', level: 'advanced', benefits: ['Balance', 'Flexibility', 'Strength'], instructions: ['Stand on one foot', 'Grab opposite foot behind', 'Lean forward'], precautions: ['Balance issues', 'Hip issues'], duration: 30 },
  { id: 'Flying_crow', name: 'Flying Crow', sanskritName: 'Eka Pada Galavasana', description: 'One-legged crow', category: 'balance', level: 'advanced', benefits: ['Arm strength', 'Balance', 'Focus'], instructions: ['From crow pose', 'Extend one leg back', 'Shift weight forward'], precautions: ['Wrist issues', 'Advanced skill required'], duration: 15 },
  { id: 'compass', name: 'Compass Pose', sanskritName: 'Parivrtta Surya Yantrasana', description: 'Seated leg stretch', category: 'seated', level: 'advanced', benefits: ['Hip opener', 'Hamstring stretch', 'Balance'], instructions: ['Extend one leg', 'Hook foot behind shoulder', 'Fold forward'], precautions: ['Hip issues', 'Hamstring issues'], duration: 30 },
  { id: 'revolved_half_moon', name: 'Revolved Half Moon', sanskritName: 'Parivrtta Ardha Chandrasana', description: 'Twisted balance', category: 'balance', level: 'advanced', benefits: ['Balance', 'Twist', 'Core strength'], instructions: ['From half moon', 'Twist torso', 'Bottom hand to floor'], precautions: ['Balance issues', 'Core strength needed'], duration: 30 },
  { id: '支撑平衡', name: 'Supported Balance', sanskritName: 'Supported Balance', description: 'Assisted balancing', category: 'balance', level: 'beginner', benefits: ['Balance', 'Confidence', 'Foundation'], instructions: ['Stand near wall', 'Lift one leg', 'Use wall for support'], precautions: ['Balance issues'], duration: 30 },

  // Backbend Poses (12 poses)
  { id: 'camel', name: 'Camel Pose', sanskritName: 'Ustrasana', description: 'Deep backbend', category: 'backbend', level: 'intermediate', benefits: ['Chest opener', 'Hip flexor stretch', 'Energy'], instructions: ['Kneel on mat', 'Lean back', 'Hold heels with hands'], precautions: ['Lower back issues', 'Neck issues'], duration: 30 },
  { id: 'wheel', name: 'Wheel Pose', sanskritName: 'Urdhva Dhanurasana', description: 'Full wheel pose', category: 'backbend', level: 'advanced', benefits: ['Full body stretch', 'Energy', 'Strength'], instructions: ['Lie on back', 'Place hands by ears', 'Push up to arch'], precautions: ['Lower back issues', 'Wrist issues'], duration: 30 },
  { id: 'bridge', name: 'Bridge Pose', sanskritName: 'Setu Bandhasana', description: 'Gentle backbend', category: 'backbend', level: 'beginner', benefits: ['Back strength', 'Hip opener', 'Calm'], instructions: ['Lie on back', 'Bend knees', 'Lift hips toward ceiling'], precautions: ['Lower back issues', 'Neck issues'], duration: 45 },
  { id: 'fish', name: 'Fish Pose', sanskritName: 'Matsyasana', description: 'Chest opener', category: 'backbend', level: 'beginner', benefits: ['Chest opener', 'Neck stretch', 'Energy'], instructions: ['Lie on back', 'Place forearms on mat', 'Lift chest'], precautions: ['Neck issues'], duration: 30 },
  { id: 'bow', name: 'Bow Pose', sanskritName: 'Dhanurasana', description: 'Lying backbend', category: 'backbend', level: 'intermediate', benefits: ['Back strength', 'Flexibility', 'Energy'], instructions: ['Lie face down', 'Grab ankles', 'Lift chest and legs'], precautions: ['Lower back issues', 'Neck issues'], duration: 30 },
  { id: 'cobra', name: 'Cobra Pose', sanskritName: 'Bhujangasana', description: 'Gentle backbend', category: 'backbend', level: 'beginner', benefits: ['Back strength', 'Chest opener', 'Energy'], instructions: ['Lie face down', 'Push up with arms', 'Keep hips on mat'], precautions: ['Back issues', 'Pregnancy'], duration: 30 },
  { id: 'upward_dog', name: 'Upward Facing Dog', sanskritName: 'Urdhva Mukha Svanasana', description: 'Strengthening backbend', category: 'backbend', level: 'intermediate', benefits: ['Back strength', 'Wrist strength', 'Energy'], instructions: ['Lie face down', 'Press hands down', 'Lift chest and thighs'], precautions: ['Wrist issues', 'Lower back issues'], duration: 30 },
  { id: 'sphinx', name: 'Sphinx Pose', sanskritName: 'Salamba Bhujangasana', description: 'Gentle supported backbend', category: 'backbend', level: 'beginner', benefits: ['Relaxation', 'Back stretch', 'Calm'], instructions: ['Lie face down', 'Prop on forearms', 'Relax into stretch'], precautions: ['Lower back issues'], duration: 60 },
  { id: 'locust', name: 'Locust Pose', sanskritName: 'Salabhasana', description: 'Strengthening pose', category: 'backbend', level: 'intermediate', benefits: ['Back strength', 'Glute strength', 'Energy'], instructions: ['Lie face down', 'Lift chest and legs', 'Arms at sides or overhead'], precautions: ['Lower back issues'], duration: 30 },
  { id: 'dolphin', name: 'Dolphin Pose', sanskritName: 'Ardha Pincha Mayurasana', description: 'Shoulder strengthening', category: 'backbend', level: 'intermediate', benefits: ['Shoulder strength', 'Arm strength', 'Inversion prep'], instructions: ['From downward dog', 'Lower forearms to mat', 'Lift hips'], precautions: ['Shoulder issues'], duration: 30 },
  { id: 'wild_thing', name: 'Wild Thing', sanskritName: 'Camatkarasana', description: 'Open heart backbend', category: 'backbend', level: 'intermediate', benefits: ['Chest opener', 'Hip opener', 'Playfulness'], instructions: ['From downward dog', 'Drop hips low', 'Open chest to sky'], precautions: ['Shoulder issues'], duration: 30 },
  { id: 'supine_twist', name: 'Supine Spinal Twist', sanskritName: 'Supta Matsyendrasana', description: 'Lying twist', category: 'twist', level: 'beginner', benefits: ['Spine mobility', 'Relaxation', 'Lower back relief'], instructions: ['Lie on back', 'Knees to one side', 'Opposite arm extended'], precautions: ['Lower back issues'], duration: 60 },

  // Forward Fold Poses (10 poses)
  { id: 'seated_forward', name: 'Seated Forward Bend', sanskritName: 'Paschimottanasana', description: 'Deep forward fold', category: 'forward_fold', level: 'beginner', benefits: ['Hamstring stretch', 'Calm', 'Relaxation'], instructions: ['Sit with legs extended', 'Fold forward', 'Reach for feet'], precautions: ['Hamstring issues', 'Lower back issues'], duration: 45 },
  { id: 'head_to_knee', name: 'Head to Knee Forward Fold', sanskritName: 'Janu Sirsasana', description: 'Single leg forward fold', category: 'forward_fold', level: 'intermediate', benefits: ['Hamstring stretch', 'Side body stretch', 'Calm'], instructions: ['Extend one leg', 'Fold toward extended leg'], precautions: ['Back issues'], duration: 45 },
  { id: 'wide_forward', name: 'Wide Leg Forward Fold', sanskritName: 'Prasarita Padottanasana', description: 'Straddle forward fold', category: 'forward_fold', level: 'beginner', benefits: ['Hamstring stretch', 'Inner thigh stretch', 'Calm'], instructions: ['Stand with feet wide', 'Fold forward', 'Hands to floor or blocks'], precautions: ['Hamstring issues', 'Lower back issues'], duration: 45 },
  { id: 'standing_forward', name: 'Standing Forward Fold', sanskritName: 'Uttanasana', description: 'Classic standing fold', category: 'forward_fold', level: 'beginner', benefits: ['Hamstring stretch', 'Calm', 'Grounding'], instructions: ['Stand tall', 'Fold from hips', 'Let head hang'], precautions: ['Hamstring issues', 'Lower back issues'], duration: 30 },
  { id: 'half_forward', name: 'Half Forward Fold', sanskritName: 'Ardha Uttanasana', description: 'Flat back forward fold', category: 'forward_fold', level: 'beginner', benefits: ['Spine lengthening', 'Hamstring stretch', 'Awareness'], instructions: ['Stand with feet hip-width', 'Fold halfway', 'Hands on shins or floor'], precautions: ['Hamstring issues'], duration: 30 },
  { id: 'downward_dog', name: 'Downward Facing Dog', sanskritName: 'Adho Mukha Svanasana', description: 'Inverted V fold', category: 'forward_fold', level: 'beginner', benefits: ['Full body stretch', 'Calm', 'Energy'], instructions: ['Hands and feet on mat', 'Lift hips high', 'Relax head between arms'], precautions: ['Wrist issues', 'Shoulder issues'], duration: 30 },
  { id: 'puppy', name: 'Puppy Pose', sanskritName: 'Uttana Shishosana', description: 'Extended puppy pose', category: 'forward_fold', level: 'beginner', benefits: ['Spine stretch', 'Shoulder stretch', 'Calm'], instructions: ['From downward dog', 'Lower forehead to mat', 'Keep hips high'], precautions: ['Shoulder issues'], duration: 45 },
  { id: 'child', name: 'Childs Pose', sanskritName: 'Balasana', description: 'Resting forward fold', category: 'forward_fold', level: 'beginner', benefits: ['Relaxation', 'Hip release', 'Calm'], instructions: ['Kneel on mat', 'Sit back on heels', 'Fold forward on mat'], precautions: ['Knee issues'], duration: 60 },
  { id: 'deer', name: 'Deer Pose', sanskritName: 'Mrigasana', description: 'Seated deer pose', category: 'seated', level: 'intermediate', benefits: ['Hip opener', 'Meditation', 'Focus'], instructions: ['Sit with one knee forward', 'Other leg behind'], precautions: ['Knee issues'], duration: 60 },
  { id: 'tortoise', name: 'Tortoise Pose', sanskritName: 'Kurmasana', description: 'Deep forward fold', category: 'forward_fold', level: 'advanced', benefits: ['Hamstring stretch', 'Relaxation', 'Grounding'], instructions: ['Sit with legs wide', 'Fold forward deeply', 'Arms under legs'], precautions: ['Hamstring issues', 'Lower back issues'], duration: 30 },

  // Twist Poses (8 poses)
  { id: 'revolved_triangle', name: 'Revolved Triangle', sanskritName: 'Parivrtta Trikonasana', description: 'Twisted standing pose', category: 'twist', level: 'intermediate', benefits: ['Twist', 'Balance', 'Digestion'], instructions: ['From triangle pose', 'Twist torso', 'Lower hand to floor'], precautions: ['Lower back issues', 'Balance issues'], duration: 30 },
  { id: 'revolved_chair', name: 'Revolved Chair', sanskritName: 'Parivrtta Utkatasana', description: 'Twisted chair pose', category: 'twist', level: 'intermediate', benefits: ['Twist', 'Strength', 'Balance'], instructions: ['From chair pose', 'Twist torso', 'Opposite elbow to knee'], precautions: ['Knee issues'], duration: 30 },
  { id: 'revolved_lunge', name: 'Revolved Lunge', sanskritName: 'Parivrtta Alanasana', description: 'Twisted lunge', category: 'twist', level: 'intermediate', benefits: ['Twist', 'Hip opener', 'Balance'], instructions: ['From crescent lunge', 'Twist torso', 'Hands at heart'], precautions: ['Hip issues', 'Balance issues'], duration: 30 },
  { id: 'revolved_side_angle', name: 'Revolved Side Angle', sanskritName: 'Parivrtta Parsvakonasana', description: 'Twisted side angle', category: 'twist', level: 'intermediate', benefits: ['Twist', 'Hip opener', 'Strength'], instructions: ['From side angle pose', 'Twist torso', 'Lower hand to floor'], precautions: ['Lower back issues'], duration: 30 },
  { id: 'supine_twist', name: 'Supine Spinal Twist', sanskritName: 'Supta Matsyendrasana', description: 'Lying twist', category: 'twist', level: 'beginner', benefits: ['Spine mobility', 'Lower back relief', 'Relaxation'], instructions: ['Lie on back', 'Knees to one side', 'Opposite arm extended'], precautions: ['Lower back issues'], duration: 60 },
  { id: 'thread_needle', name: 'Thread the Needle', sanskritName: 'Parivrtta Sukhasana', description: 'Seated twist', category: 'twist', level: 'beginner', benefits: ['Spine mobility', 'Shoulder stretch', 'Relaxation'], instructions: ['Sit cross-legged', 'Twist to one side', 'Use arm against knee'], precautions: ['Lower back issues'], duration: 45 },
  { id: 'marichi', name: 'Marichis Pose', sanskritName: 'Marichyasana', description: 'Seated twist with bind', category: 'twist', level: 'intermediate', benefits: ['Spine mobility', 'Shoulder stretch', 'Focus'], instructions: ['Sit with one leg bent', 'Twist toward bent knee', 'Try to bind'], precautions: ['Lower back issues', 'Shoulder issues'], duration: 45 },
  { id: 'jathara_parivartanasana', name: 'Belly Twist', sanskritName: 'Jathara Parivartanasana', description: 'Lying abdominal twist', category: 'twist', level: 'intermediate', benefits: ['Abdominal massage', 'Spine mobility', 'Digestion'], instructions: ['Lie on back', 'Knees to one side', 'Look opposite direction'], precautions: ['Lower back issues'], duration: 60 },

  // Inversion Poses (8 poses)
  { id: 'headstand', name: 'Headstand', sanskritName: 'Sirsasana', description: 'Full headstand', category: 'inversion', level: 'advanced', benefits: ['Focus', 'Inversion benefits', 'Strength'], instructions: ['Interlace fingers', 'Crown of head on mat', 'Lift legs slowly'], precautions: ['Neck issues', 'High blood pressure'], duration: 60 },
  { id: 'shoulder_stand', name: 'Shoulder Stand', sanskritName: 'Sarvangasana', description: 'Full shoulder stand', category: 'inversion', level: 'intermediate', benefits: ['Calm', 'Relaxation', 'Thyroid support'], instructions: ['Lie on back', 'Lift legs over head', 'Support lower back'], precautions: ['Neck issues', 'High blood pressure'], duration: 60 },
  { id: 'half_way', name: 'Half Headstand', sanskritName: 'Ardha Sirsasana', description: 'Supported headstand', category: 'inversion', level: 'intermediate', benefits: ['Balance', 'Focus', 'Strength'], instructions: ['From downward dog', 'Head on mat', 'Lift one leg at a time'], precautions: ['Neck issues'], duration: 30 },
  { id: 'feathered_peacock', name: 'Forearm Balance', sanskritName: 'Pincha Mayurasana', description: 'Forearm stand', category: 'inversion', level: 'advanced', benefits: ['Balance', 'Strength', 'Focus'], instructions: ['Forearms on mat', 'Lift one leg at a time'], precautions: ['Wrist issues', 'Forearm strength needed'], duration: 30 },
  { id: 'puppy_inversion', name: 'Dolphin Pose', sanskritName: 'Ardha Pincha Mayurasana', description: 'Dolphin inversion prep', category: 'inversion', level: 'beginner', benefits: ['Shoulder strength', 'Inversion prep', 'Calm'], instructions: ['From downward dog', 'Forearms to mat', 'Hips high'], precautions: ['Shoulder issues'], duration: 30 },
  { id: 'leg_up_wall', name: 'Legs Up the Wall', sanskritName: 'Viparita Karani', description: 'Restorative inversion', category: 'inversion', level: 'beginner', benefits: ['Relaxation', 'Circulation', 'Calm'], instructions: ['Lie on back', 'Legs up wall', 'Arms at sides'], precautions: ['Lower back issues'], duration: 120 },
  { id: 'supported_shoulders', name: 'Supported Shoulder Stand', sanskritName: 'Salamba Sarvangasana', description: 'Supported inversion', category: 'inversion', level: 'beginner', benefits: ['Calm', 'Relaxation', 'Restorative'], instructions: ['Lie on back with shoulders supported', 'Legs up wall'], precautions: ['Neck issues'], duration: 120 },
  { id: 'scorpion', name: 'Scorpion Pose', sanskritName: 'Vrschikasana', description: 'Advanced inversion', category: 'inversion', level: 'advanced', benefits: ['Balance', 'Flexibility', 'Strength'], instructions: ['From forearm stand', 'Curve back', 'Grab one foot with hand'], precautions: ['Neck issues', 'Advanced skill required'], duration: 15 },

  // Restorative Poses (5 poses)
  { id: 'savasana', name: 'Corpse Pose', sanskritName: 'Savasana', description: 'Final relaxation', category: 'restorative', level: 'beginner', benefits: ['Deep relaxation', 'Integration', 'Peace'], instructions: ['Lie flat on back', 'Arms at sides', 'Close eyes', 'Relax completely'], precautions: [], duration: 300 },
  { id: 'legs_up_wall', name: 'Legs Up the Wall', sanskritName: 'Viparita Karani', description: 'Gentle inversion', category: 'restorative', level: 'beginner', benefits: ['Relaxation', 'Circulation', 'Calm'], instructions: ['Lie on back', 'Legs up wall'], precautions: ['Lower back issues'], duration: 120 },
  { id: 'reclined_bound_angle', name: 'Reclined Bound Angle', sanskritName: 'Supta Baddha Konasana', description: 'Restorative hip opener', category: 'restorative', level: 'beginner', benefits: ['Hip opener', 'Relaxation', 'Calm'], instructions: ['Lie on back', 'Soles together', 'Knees out'], precautions: ['Lower back issues'], duration: 120 },
  { id: 'reclined_pigeon', name: 'Reclined Pigeon', sanskritName: 'Supta Eka Pada Rajakapotasana', description: 'Lying hip opener', category: 'restorative', level: 'beginner', benefits: ['Hip opener', 'Glute release', 'Relaxation'], instructions: ['Lie on back', 'Cross ankle over knee', 'Pull leg toward chest'], precautions: ['Knee issues', 'Lower back issues'], duration: 120 },
  { id: 'supported_fold', name: 'Supported Forward Fold', sanskritName: 'Salamba Uttanasana', description: 'Propped forward fold', category: 'restorative', level: 'beginner', benefits: ['Relaxation', 'Hamstring stretch', 'Calm'], instructions: ['Sit with bolster', 'Fold forward over bolster'], precautions: [], duration: 120 },

  // Prone Poses (4 poses)
  { id: 'sphinx', name: 'Sphinx Pose', sanskritName: 'Salamba Bhujangasana', description: 'Gentle prone backbend', category: 'prone', level: 'beginner', benefits: ['Back stretch', 'Relaxation', 'Calm'], instructions: ['Lie face down', 'Prop on forearms', 'Relax into stretch'], precautions: ['Lower back issues'], duration: 60 },
  { id: 'cobra', name: 'Cobra Pose', sanskritName: 'Bhujangasana', description: 'Prone backbend', category: 'prone', level: 'beginner', benefits: ['Back strength', 'Chest opener', 'Energy'], instructions: ['Lie face down', 'Push up with arms'], precautions: ['Back issues', 'Pregnancy'], duration: 30 },
  { id: 'locust', name: 'Locust Pose', sanskritName: 'Salabhasana', description: 'Prone strength pose', category: 'prone', level: 'intermediate', benefits: ['Back strength', 'Glute strength', 'Energy'], instructions: ['Lie face down', 'Lift chest and legs'], precautions: ['Lower back issues'], duration: 30 },
  { id: 'bow', name: 'Bow Pose', sanskritName: 'Dhanurasana', description: 'Prone bow backbend', category: 'prone', level: 'intermediate', benefits: ['Back strength', 'Flexibility', 'Energy'], instructions: ['Lie face down', 'Grab ankles', 'Lift chest and legs'], precautions: ['Lower back issues', 'Neck issues'], duration: 30 },

  // Supine Poses (4 poses)
  { id: 'supine_hip_circles', name: 'Supine Hip Circles', sanskritName: 'Supta Hip Circles', description: 'Lying hip mobility', category: 'supine', level: 'beginner', benefits: ['Hip mobility', 'Lower back relief', 'Relaxation'], instructions: ['Lie on back', 'Draw circles with one knee'], precautions: ['Lower back issues'], duration: 60 },
  { id: 'wind_relieving', name: 'Wind Relieving Pose', sanskritName: 'Pavanamuktasana', description: 'Lying knee hug', category: 'supine', level: 'beginner', benefits: ['Lower back relief', 'Digestive support', 'Relaxation'], instructions: ['Lie on back', 'Hug both knees to chest'], precautions: ['Lower back issues'], duration: 60 },
  { id: 'happy_baby', name: 'Happy Baby Pose', sanskritName: 'Ananda Balasana', description: 'Playful supine pose', category: 'supine', level: 'beginner', benefits: ['Hip opener', 'Lower back relief', 'Playfulness'], instructions: ['Lie on back', 'Grab outer feet', 'Knees toward armpits'], precautions: ['Lower back issues', 'Hip issues'], duration: 60 },
  { id: 'reclined_cow', name: 'Reclined Cow Face', sanskritName: 'Supta Gomukhasana', description: 'Lying cow face', category: 'supine', level: 'intermediate', benefits: ['Hip opener', 'Glute release', 'Relaxation'], instructions: ['Lie on back', 'Stack knees', 'Keep feet flexed'], precautions: ['Lower back issues', 'Knee issues'], duration: 60 },
];

// ============================================================================
// Yoga Routines
// ============================================================================

export interface YogaRoutine {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'standing' | 'seated' | 'balance' | 'backbend' | 'twist' | 'inversion' | 'restorative' | 'prone' | 'supine';
  focus: string;
  benefits: string[];
  poseIds: string[];
}

export const YOGA_ROUTINES: YogaRoutine[] = [
  { id: 'routine_1', name: 'Morning Flow', description: 'Energizing 20-minute routine', duration: 20, level: 'beginner', category: 'standing', focus: 'energy', benefits: ['Energizes body', 'Warms up joints', 'Prepares for day'], poseIds: ['mountain', 'forward_fold', 'downward_dog', 'warrior_i', 'warrior_ii', 'triangle'] },
  { id: 'routine_2', name: 'Evening Wind-Down', description: 'Relaxing 30-minute routine', duration: 30, level: 'beginner', category: 'restorative', focus: 'relaxation', benefits: ['Releases tension', 'Calms nervous system', 'Prepares for sleep'], poseIds: ['child', 'forward_fold', 'legs_up_wall', 'supine_twist', 'savasana'] },
  { id: 'routine_3', name: 'Power Yoga', description: 'Strength-building 45-minute routine', duration: 45, level: 'advanced', category: 'standing', focus: 'strength', benefits: ['Builds strength', 'Increases stamina', 'Improves flexibility'], poseIds: ['mountain', 'chair', 'warrior_i', 'warrior_ii', 'triangle', 'plank', 'cobra', 'downward_dog', 'headstand', 'bridge'] },
  { id: 'routine_4', name: 'Hip Opener', description: 'Hip-focused 25-minute routine', duration: 25, level: 'intermediate', category: 'seated', focus: 'flexibility', benefits: ['Opens hips', 'Releases tension', 'Improves mobility'], poseIds: ['easy_seat', 'bound_angle', 'pigeon', 'figure_four', 'child', 'reclined_hero'] },
  { id: 'routine_5', name: 'Back Care', description: 'Lower back relief 20-minute routine', duration: 20, level: 'beginner', category: 'restorative', focus: 'relief', benefits: ['Relieves lower back', 'Stretches spine', 'Promotes healing'], poseIds: ['cat_cow', 'child', 'sphinx', 'supine_twist', 'legs_up_wall', 'savasana'] },
  { id: 'routine_6', name: 'Balance Challenge', description: 'Balance and focus 30-minute routine', duration: 30, level: 'intermediate', category: 'balance', focus: 'balance', benefits: ['Improves balance', 'Enhances focus', 'Strengthens core'], poseIds: ['mountain', 'tree', 'warrior_iii', 'eagle', 'half_moon', 'dancer', 'crow', 'savasana'] },
  { id: 'routine_7', name: 'Twist and Detox', description: 'Twisting sequence 25-minute routine', duration: 25, level: 'intermediate', category: 'twist', focus: 'detox', benefits: ['Spine mobility', 'Digestive support', 'Detoxification'], poseIds: ['cat_cow', 'downward_dog', 'revolved_triangle', 'revolved_lunge', 'seated_twist', 'supine_twist', 'savasana'] },
  { id: 'routine_8', name: 'Heart Opener', description: 'Chest and heart opening 20-minute routine', duration: 20, level: 'beginner', category: 'backbend', focus: 'opening', benefits: ['Opens chest', 'Improves posture', 'Increases energy'], poseIds: ['cat_cow', 'cobra', 'sphinx', 'bridge', 'fish', 'camel', 'savasana'] },
  { id: 'routine_9', name: 'Gentle Stretch', description: 'Full body gentle stretch 30-minute routine', duration: 30, level: 'beginner', category: 'restorative', focus: 'stretch', benefits: ['Full body stretch', 'Relaxation', 'Flexibility'], poseIds: ['cat_cow', 'child', 'downward_dog', 'forward_fold', 'seated_forward', 'supine_twist', 'legs_up_wall', 'savasana'] },
  { id: 'routine_10', name: 'Core Strength', description: 'Core-building 25-minute routine', duration: 25, level: 'intermediate', category: 'seated', focus: 'strength', benefits: ['Builds core strength', 'Tones abs', 'Improves stability'], poseIds: ['cat_cow', 'plank', 'side_plank', 'boat', 'half_boat', 'cobra', 'downward_dog', 'bridge', 'savasana'] },
];

// ============================================================================
// Music Playlists
// ============================================================================

export interface MusicTrack {
  title: string;
  artist: string;
  duration: number; // in seconds
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description: string;
  mood: 'all' | 'happy' | 'sad' | 'anxious' | 'stressed' | 'calm' | 'tired' | 'energetic';
  duration: number; // in minutes
  trackCount: number;
  genre: string;
  tags: string[];
  color: string;
  tracks: MusicTrack[];
}

export const MUSIC_PLAYLISTS: MusicPlaylist[] = [
  // Happy Playlists (8 playlists)
  { id: 'happy_1', name: 'Joyful Moments', description: 'Celebrate happiness', mood: 'happy', duration: 60, trackCount: 12, genre: 'Pop', tags: ['happy', 'uplifting', 'positive'], color: '#FFD93D', tracks: [{ title: 'Happy Days', artist: 'Sunny Sound', duration: 240 }, { title: 'Smile', artist: 'Joy Radio', duration: 220 }, { title: 'Good Vibes', artist: 'Positive Energy', duration: 260 }] },
  { id: 'happy_2', name: 'Celebration', description: 'Party and celebrate', mood: 'happy', duration: 45, trackCount: 10, genre: 'Dance', tags: ['party', 'dance', 'celebrate'], color: '#FF9F43', tracks: [{ title: 'Celebration Time', artist: 'Party Band', duration: 270 }, { title: 'Dance All Night', artist: 'Groove Masters', duration: 250 }] },
  { id: 'happy_3', name: 'Sunshine Vibes', description: 'Bright and sunny music', mood: 'happy', duration: 55, trackCount: 11, genre: 'Indie Pop', tags: ['sunny', 'bright', 'cheerful'], color: '#FECA57', tracks: [{ title: 'Sunshine Day', artist: 'Bright Light', duration: 255 }, { title: 'Blue Sky', artist: 'Summer Sound', duration: 245 }] },
  { id: 'happy_4', name: 'Feel Good Friday', description: 'End of week celebration', mood: 'happy', duration: 50, trackCount: 10, genre: 'R&B', tags: ['friday', 'weekend', 'feel good'], color: '#FF6B6B', tracks: [{ title: 'Friday Feeling', artist: 'Weekend Vibes', duration: 260 }, { title: 'Good Times', artist: 'Feel Good Crew', duration: 250 }] },
  { id: 'happy_5', name: 'Victory Lap', description: 'Triumphant celebration', mood: 'happy', duration: 40, trackCount: 8, genre: 'Electronic', tags: ['victory', 'triumph', 'epic'], color: '#22A6B3', tracks: [{ title: 'Victory', artist: 'Triumph Sound', duration: 280 }, { title: 'Champion', artist: 'Winner Circle', duration: 270 }] },
  { id: 'happy_6', name: 'Delightful Dreams', description: 'Whimsical happiness', mood: 'happy', duration: 65, trackCount: 13, genre: 'Ambient', tags: ['dreams', 'whimsical', 'light'], color: '#A8D8EA', tracks: [{ title: 'Dream Big', artist: 'Whisper Dreams', duration: 240 }, { title: 'Delight', artist: 'Soft Sounds', duration: 235 }] },
  { id: 'happy_7', name: 'Optimism', description: 'Hopeful and uplifting', mood: 'happy', duration: 55, trackCount: 11, genre: 'Acoustic', tags: ['hope', 'uplift', 'positive'], color: '#26DE81', tracks: [{ title: 'New Beginning', artist: 'Hope Sound', duration: 250 }, { title: 'Tomorrow', artist: 'Bright Future', duration: 245 }] },
  { id: 'happy_8', name: 'Radiant Joy', description: 'Shine with joy', mood: 'happy', duration: 48, trackCount: 10, genre: 'Jazz', tags: ['joy', 'radiant', 'bright'], color: '#7ED6DF', tracks: [{ title: 'Radiant', artist: 'Joyful Jazz', duration: 260 }, { title: 'Shine On', artist: 'Sun Jazz', duration: 255 }] },

  // Calm Playlists (8 playlists)
  { id: 'calm_1', name: 'Peaceful Serenity', description: 'Find your inner calm', mood: 'calm', duration: 60, trackCount: 10, genre: 'Ambient', tags: ['calm', 'peaceful', 'relaxing'], color: '#6BCB77', tracks: [{ title: 'Still Waters', artist: 'Peaceful Sounds', duration: 300 }, { title: 'Gentle Breeze', artist: 'Nature Audio', duration: 280 }, { title: 'Tranquil Mind', artist: 'Calm Studio', duration: 320 }] },
  { id: 'calm_2', name: 'Stillness', description: 'Deep tranquility', mood: 'calm', duration: 90, trackCount: 15, genre: 'Classical', tags: ['stillness', 'peace', 'classical'], color: '#98D8C8', tracks: [{ title: 'Peaceful Piano', artist: 'Classical Calm', duration: 360 }, { title: 'Moonlight Sonata', artist: 'Beethoven', duration: 350 }] },
  { id: 'calm_3', name: 'Zen Garden', description: 'Japanese-inspired calm', mood: 'calm', duration: 75, trackCount: 12, genre: 'World', tags: ['zen', 'garden', 'asian'], color: '#7ED6DF', tracks: [{ title: 'Zen Garden', artist: 'Eastern Calm', duration: 340 }, { title: 'Bamboo Wind', artist: 'Far East', duration: 330 }] },
  { id: 'calm_4', name: 'Soft Rain', description: 'Gentle rainfall sounds', mood: 'calm', duration: 120, trackCount: 8, genre: 'Nature', tags: ['rain', 'soft', 'nature'], color: '#A8D8EA', tracks: [{ title: 'Gentle Rain', artist: 'Nature Sounds', duration: 480 }, { title: 'Raindrops', artist: 'Water Audio', duration: 470 }] },
  { id: 'calm_5', name: 'Candlelight', description: 'Warm and cozy calm', mood: 'calm', duration: 65, trackCount: 13, genre: 'Piano', tags: ['candle', 'warm', 'cozy'], color: '#F0932B', tracks: [{ title: 'Candlelight', artist: 'Evening Piano', duration: 310 }, { title: 'Warm Glow', artist: 'Soft Keys', duration: 300 }] },
  { id: 'calm_6', name: 'Ocean Breeze', description: 'Peaceful ocean sounds', mood: 'calm', duration: 90, trackCount: 10, genre: 'Nature', tags: ['ocean', 'waves', 'beach'], color: '#6B7FD7', tracks: [{ title: 'Ocean Waves', artist: 'Sea Sounds', duration: 540 }, { title: 'Beach Calm', artist: 'Coastal Audio', duration: 530 }] },
  { id: 'calm_7', name: 'Mindful Moments', description: 'Mindfulness meditation music', mood: 'calm', duration: 60, trackCount: 8, genre: 'Meditation', tags: ['mindfulness', 'present', 'aware'], color: '#26DE81', tracks: [{ title: 'Mindful', artist: 'Present Moment', duration: 420 }, { title: 'Awareness', artist: 'Inner Peace', duration: 410 }] },
  { id: 'calm_8', name: 'Forest Mist', description: 'Mystical forest ambiance', mood: 'calm', duration: 80, trackCount: 10, genre: 'Nature', tags: ['forest', 'mystical', 'nature'], color: '#22A6B3', tracks: [{ title: 'Forest Walk', artist: 'Woodland Sounds', duration: 480 }, { title: 'Misty Woods', artist: 'Nature Audio', duration: 470 }] },

  // Stressed Playlists (8 playlists)
  { id: 'stressed_1', name: 'Stress Relief', description: 'Release tension and stress', mood: 'stressed', duration: 45, trackCount: 8, genre: 'Nature', tags: ['stress', 'relief', 'nature'], color: '#4D96FF', tracks: [{ title: 'Ocean Waves', artist: 'Nature Sounds', duration: 360 }, { title: 'Forest Rain', artist: 'Nature Audio', duration: 340 }, { title: 'Mountain Stream', artist: 'Peaceful Sounds', duration: 320 }] },
  { id: 'stressed_2', name: 'Let It Go', description: 'Release and surrender', mood: 'stressed', duration: 50, trackCount: 10, genre: 'Ambient', tags: ['release', 'surrender', 'let go'], color: '#EB4D4B', tracks: [{ title: 'Letting Go', artist: 'Release Sound', duration: 310 }, { title: 'Surrender', artist: 'Flow Audio', duration: 300 }] },
  { id: 'stressed_3', name: 'Pressure Release', description: 'Melting away pressure', mood: 'stressed', duration: 55, trackCount: 11, genre: 'Electronic', tags: ['pressure', 'release', 'melt'], color: '#FF6B6B', tracks: [{ title: 'Pressure Off', artist: 'Release Beats', duration: 290 }, { title: 'Melt Away', artist: 'Flow State', duration: 280 }] },
  { id: 'stressed_4', name: 'Work Stress Relief', description: 'Professional stress relief', mood: 'stressed', duration: 40, trackCount: 8, genre: 'Instrumental', tags: ['work', 'professional', 'office'], color: '#A8D8EA', tracks: [{ title: 'Office Escape', artist: 'Work Relief', duration: 300 }, { title: 'Desk Break', artist: 'Relaxation Audio', duration: 290 }] },
  { id: 'stressed_5', name: 'Deep Soothe', description: 'Deep stress relief', mood: 'stressed', duration: 70, trackCount: 10, genre: 'Meditation', tags: ['deep', 'soothe', 'relief'], color: '#6B7FD7', tracks: [{ title: 'Deep Soothe', artist: 'Calm Center', duration: 420 }, { title: 'Inner Peace', artist: 'Serenity Sound', duration: 410 }] },
  { id: 'stressed_6', name: 'Nervous System Reset', description: 'Reset your nervous system', mood: 'stressed', duration: 60, trackCount: 8, genre: 'Binaural', tags: ['nervous system', 'reset', 'body'], color: '#98D8C8', tracks: [{ title: 'Parasympathetic', artist: 'Body Sound', duration: 450 }, { title: 'Restoration', artist: 'Healing Audio', duration: 440 }] },
  { id: 'stressed_7', name: 'Tension Melt', description: 'Melt physical tension', mood: 'stressed', duration: 45, trackCount: 9, genre: 'Relaxation', tags: ['tension', 'physical', 'melt'], color: '#7ED6DF', tracks: [{ title: 'Tension Release', artist: 'Body Relax', duration: 300 }, { title: 'Muscle Melt', artist: 'Deep Rest', duration: 290 }] },
  { id: 'stressed_8', name: 'Calm After Storm', description: 'Peace after stress', mood: 'stressed', duration: 65, trackCount: 12, genre: 'Orchestral', tags: ['peace', 'after', 'storm'], color: '#BE2EDD', tracks: [{ title: 'After the Storm', artist: 'Calm Orchestra', duration: 350 }, { title: 'Peaceful Dawn', artist: 'New Start', duration: 340 }] },

  // Sad Playlists (8 playlists)
  { id: 'sad_1', name: 'Emotional Healing', description: 'Process and release sadness', mood: 'sad', duration: 50, trackCount: 10, genre: 'Acoustic', tags: ['sad', 'emotional', 'healing'], color: '#A8D8EA', tracks: [{ title: 'Rainy Day', artist: 'Melancholy Music', duration: 280 }, { title: 'Tears', artist: 'Emotional Sound', duration: 300 }, { title: 'Healing Heart', artist: 'Care Studio', duration: 260 }] },
  { id: 'sad_2', name: 'Comfort in Sadness', description: 'Gentle comfort during grief', mood: 'sad', duration: 75, trackCount: 12, genre: 'Classical', tags: ['comfort', 'grief', 'gentle'], color: '#6B7FD7', tracks: [{ title: 'Comfort', artist: 'Grief Support', duration: 380 }, { title: 'Gentle Embrace', artist: 'Warm Sound', duration: 370 }] },
  { id: 'sad_3', name: 'Rainy Day Blues', description: 'Embrace the melancholy', mood: 'sad', duration: 55, trackCount: 11, genre: 'Jazz', tags: ['rain', 'blues', 'melancholy'], color: '#833471', tracks: [{ title: 'Rainy Jazz', artist: 'Blue Notes', duration: 320 }, { title: 'Grey Skies', artist: 'Melancholy Sound', duration: 310 }] },
  { id: 'sad_4', name: 'Letting Tears Flow', description: 'Crying and releasing', mood: 'sad', duration: 60, trackCount: 10, genre: 'Piano', tags: ['tears', 'release', 'cry'], color: '#BE2EDD', tracks: [{ title: 'Tears', artist: 'Piano Tears', duration: 360 }, { title: 'Release', artist: 'Emotional Piano', duration: 350 }] },
  { id: 'sad_5', name: 'Missing You', description: 'Honoring loss and longing', mood: 'sad', duration: 65, trackCount: 11, genre: 'Ambient', tags: ['missing', 'loss', 'longing'], color: '#A8D8EA', tracks: [{ title: 'Missing', artist: 'Longing Sound', duration: 370 }, { title: 'Remember', artist: 'Memory Audio', duration: 360 }] },
  { id: 'sad_6', name: 'Broken Heart', description: 'Healing a hurting heart', mood: 'sad', duration: 50, trackCount: 10, genre: 'R&B', tags: ['heartbreak', 'healing', 'love'], color: '#FF6B6B', tracks: [{ title: 'Broken Heart', artist: 'Heart Sound', duration: 310 }, { title: 'Healing', artist: 'Love Lost', duration: 300 }] },
  { id: 'sad_7', name: 'Alone but Okay', description: 'Finding peace in solitude', mood: 'sad', duration: 55, trackCount: 10, genre: 'Indie', tags: ['alone', 'solitude', 'okay'], color: '#6B7FD7', tracks: [{ title: 'Alone Time', artist: 'Solo Sound', duration: 330 }, { title: 'Okay Alone', artist: 'Indie Healing', duration: 320 }] },
  { id: 'sad_8', name: 'Grief to Grace', description: 'Processing grief with grace', mood: 'sad', duration: 70, trackCount: 12, genre: 'Classical', tags: ['grief', 'grace', 'process'], color: '#7ED6DF', tracks: [{ title: 'Grace', artist: 'Classical Grief', duration: 380 }, { title: 'Journey Through', artist: 'Healing Strings', duration: 370 }] },

  // Anxious Playlists (8 playlists)
  { id: 'anxious_1', name: 'Anxiety Relief', description: 'Calm anxious thoughts', mood: 'anxious', duration: 60, trackCount: 12, genre: 'Ambient', tags: ['anxiety', 'calming', 'soothing'], color: '#A8D8EA', tracks: [{ title: 'Calm Waters', artist: 'Peaceful Sound', duration: 300 }, { title: 'Breathe Easy', artist: 'Relaxation', duration: 280 }, { title: 'Safe Space', artist: 'Sanctuary', duration: 320 }] },
  { id: 'anxious_2', name: 'Grounding Sounds', description: 'Feel grounded and present', mood: 'anxious', duration: 50, trackCount: 10, genre: 'Nature', tags: ['grounding', 'present', 'roots'], color: '#26DE81', tracks: [{ title: 'Grounding', artist: 'Root Sound', duration: 320 }, { title: 'Present Moment', artist: 'Now Audio', duration: 310 }] },
  { id: 'anxious_3', name: 'Breathe', description: 'Breath-focused calming', mood: 'anxious', duration: 40, trackCount: 8, genre: 'Meditation', tags: ['breathe', 'breath', 'calm'], color: '#22A6B3', tracks: [{ title: 'Breathe In', artist: 'Breath Sound', duration: 300 }, { title: 'Breathe Out', artist: 'Flow Audio', duration: 290 }] },
  { id: 'anxious_4', name: 'Safe Place', description: 'Visualize your sanctuary', mood: 'anxious', duration: 55, trackCount: 9, genre: 'Ambient', tags: ['safe', 'sanctuary', 'visualization'], color: '#7ED6DF', tracks: [{ title: 'Safe Place', artist: 'Sanctuary Sound', duration: 380 }, { title: 'Inner Sanctuary', artist: 'Protected Audio', duration: 370 }] },
  { id: 'anxious_5', name: 'Racing Thoughts', description: 'Slow down racing mind', mood: 'anxious', duration: 45, trackCount: 8, genre: 'Electronic', tags: ['racing', 'slow', 'calm'], color: '#4D96FF', tracks: [{ title: 'Slow Down', artist: 'Mind Calm', duration: 340 }, { title: 'Still Mind', artist: 'Peace Electronic', duration: 330 }] },
  { id: 'anxious_6', name: 'Uncertainty Peace', description: 'Find peace with unknown', mood: 'anxious', duration: 60, trackCount: 10, genre: 'Ambient', tags: ['uncertainty', 'peace', 'accept'], color: '#98D8C8', tracks: [{ title: 'Uncertain Peace', artist: 'Acceptance Sound', duration: 380 }, { title: 'Unknown Grace', artist: 'Trust Audio', duration: 370 }] },
  { id: 'anxious_7', name: 'Panic Recovery', description: 'Recover from panic', mood: 'anxious', duration: 35, trackCount: 7, genre: 'Relaxation', tags: ['panic', 'recover', 'emergency'], color: '#EB4D4B', tracks: [{ title: 'Panic Release', artist: 'Emergency Calm', duration: 300 }, { title: 'Recovery', artist: 'Return to Calm', duration: 290 }] },
  { id: 'anxious_8', name: 'Social Anxiety Ease', description: 'Calm before social situations', mood: 'anxious', duration: 50, trackCount: 10, genre: 'Acoustic', tags: ['social', 'confidence', 'ease'], color: '#F0932B', tracks: [{ title: 'Social Ease', artist: 'Confidence Sound', duration: 320 }, { title: 'Before the Party', artist: 'Gathering Calm', duration: 310 }] },

  // Tired Playlists (8 playlists)
  { id: 'tired_1', name: 'Rest and Restore', description: 'Gentle rest for tired bodies', mood: 'tired', duration: 90, trackCount: 15, genre: 'Ambient', tags: ['rest', 'restore', 'tired'], color: '#B8B8B8', tracks: [{ title: 'Rest', artist: 'Recovery Sound', duration: 360 }, { title: 'Restore', artist: 'Renew Audio', duration: 350 }] },
  { id: 'tired_2', name: 'Power Nap', description: 'Perfect for a quick rest', mood: 'tired', duration: 30, trackCount: 6, genre: 'Nature', tags: ['nap', 'sleep', 'rest'], color: '#6B7FD7', tracks: [{ title: 'Nap Time', artist: 'Sleep Aid', duration: 300 }, { title: 'Quick Rest', artist: 'Power Nap', duration: 290 }] },
  { id: 'tired_3', name: 'Refresh', description: 'Gently wake up refreshed', mood: 'tired', duration: 25, trackCount: 5, genre: 'Meditation', tags: ['refresh', 'wake', 'renew'], color: '#FECA57', tracks: [{ title: 'Wake Refreshed', artist: 'Morning Audio', duration: 300 }, { title: 'Renewal', artist: 'Fresh Start', duration: 290 }] },
  { id: 'tired_4', name: 'Fatigue Recovery', description: 'Overcome exhaustion', mood: 'tired', duration: 60, trackCount: 10, genre: 'Binaural', tags: ['fatigue', 'recovery', 'energy'], color: '#26DE81', tracks: [{ title: 'Energy Return', artist: 'Recovery Beats', duration: 380 }, { title: 'Overcome Fatigue', artist: 'Strength Sound', duration: 370 }] },
  { id: 'tired_5', name: 'Gentle Awakening', description: 'Soft and gradual wake up', mood: 'tired', duration: 35, trackCount: 7, genre: 'Piano', tags: ['awakening', 'gentle', 'gradual'], color: '#FFD93D', tracks: [{ title: 'Gentle Wake', artist: 'Morning Piano', duration: 320 }, { title: 'Slow Rise', artist: 'Awakening Sound', duration: 310 }] },
  { id: 'tired_6', name: 'Sleepy Time', description: 'Drift into peaceful rest', mood: 'tired', duration: 120, trackCount: 12, genre: 'Ambient', tags: ['sleepy', 'bedtime', 'rest'], color: '#6B7FD7', tracks: [{ title: 'Bedtime', artist: 'Sleep Sound', duration: 600 }, { title: 'Sleep Now', artist: 'Night Audio', duration: 590 }] },
  { id: 'tired_7', name: 'Burnout Recovery', description: 'Heal from burnout', mood: 'tired', duration: 80, trackCount: 12, genre: 'Meditation', tags: ['burnout', 'recovery', 'heal'], color: '#7ED6DF', tracks: [{ title: 'Burnout Recovery', artist: 'Heal Sound', duration: 420 }, { title: 'Restore Energy', artist: 'Recovery Audio', duration: 410 }] },
  { id: 'tired_8', name: 'Sunday Rest', description: 'Weekend relaxation', mood: 'tired', duration: 75, trackCount: 15, genre: 'Acoustic', tags: ['sunday', 'weekend', 'relax'], color: '#98D8C8', tracks: [{ title: 'Sunday Morning', artist: 'Weekend Sound', duration: 350 }, { title: 'Rest Day', artist: 'Lazy Audio', duration: 340 }] },

  // Energetic Playlists (8 playlists)
  { id: 'energetic_1', name: 'Workout Beats', description: 'High-energy for exercise', mood: 'energetic', duration: 60, trackCount: 15, genre: 'EDM', tags: ['workout', 'energy', 'pump'], color: '#EB4D4B', tracks: [{ title: 'Pump It Up', artist: 'Gym Sound', duration: 240 }, { title: 'Sweat', artist: 'Cardio King', duration: 240 }, { title: 'Maximum Effort', artist: 'Peak Performance', duration: 240 }] },
  { id: 'energetic_2', name: 'Morning Motivation', description: 'Start your day strong', mood: 'energetic', duration: 40, trackCount: 10, genre: 'Pop', tags: ['morning', 'motivation', 'energy'], color: '#FFD93D', tracks: [{ title: 'Rise and Shine', artist: 'Morning Crew', duration: 240 }, { title: 'Lets Go', artist: 'Motivation Sound', duration: 230 }] },
  { id: 'energetic_3', name: 'Power Hour', description: 'One hour of power', mood: 'energetic', duration: 60, trackCount: 12, genre: 'Rock', tags: ['power', 'rock', 'energy'], color: '#FF6B6B', tracks: [{ title: 'Power Hour', artist: 'Rock Energy', duration: 300 }, { title: 'Electric', artist: 'High Voltage', duration: 290 }] },
  { id: 'energetic_4', name: 'Dance Party', description: 'Get up and dance', mood: 'energetic', duration: 55, trackCount: 12, genre: 'Dance', tags: ['dance', 'party', 'fun'], color: '#FF9F43', tracks: [{ title: 'Dance Floor', artist: 'Party Sound', duration: 275 }, { title: 'Move Your Body', artist: 'Groove Masters', duration: 265 }] },
  { id: 'energetic_5', name: 'Runner High', description: 'Perfect running soundtrack', mood: 'energetic', duration: 50, trackCount: 14, genre: 'Electronic', tags: ['running', 'cardio', 'pace'], color: '#22A6B3', tracks: [{ title: 'Run Fast', artist: 'Cardio Beats', duration: 210 }, { title: 'Pace Setter', artist: 'Running Sound', duration: 200 }] },
  { id: 'energetic_6', name: 'Electric Energy', description: 'Charged up and ready', mood: 'energetic', duration: 45, trackCount: 10, genre: 'Electronic', tags: ['electric', 'charged', 'power'], color: '#4D96FF', tracks: [{ title: 'Charged Up', artist: 'Power Sound', duration: 270 }, { title: 'Full Power', artist: 'Energy Beats', duration: 260 }] },
  { id: 'energetic_7', name: 'Summit Push', description: 'Reach your peak', mood: 'energetic', duration: 35, trackCount: 8, genre: 'Cinematic', tags: ['summit', 'peak', 'achieve'], color: '#BE2EDD', tracks: [{ title: 'Summit', artist: 'Peak Sound', duration: 280 }, { title: 'Reach the Top', artist: 'Achieve Audio', duration: 270 }] },
  { id: 'energetic_8', name: 'Friday Feeling', description: 'End of week energy', mood: 'energetic', duration: 48, trackCount: 11, genre: 'Pop', tags: ['friday', 'weekend', 'freedom'], color: '#FECA57', tracks: [{ title: 'Friday Energy', artist: 'Weekend Vibes', duration: 265 }, { title: 'Freedom', artist: 'Release Sound', duration: 255 }] },
];

// ============================================================================
// Wellness Tips
// ============================================================================

export interface WellnessTip {
  morning: string[];
  afternoon: string[];
  evening: string[];
  mood_based: Record<string, string[]>;
}

export const WELLNESS_TIPS: WellnessTip = {
  morning: [
    'Start your day with 5 deep breaths before checking your phone.',
    'Drink a glass of water first thing to hydrate your body.',
    'Write down three things you are grateful for each morning.',
    'Get 15 minutes of natural sunlight to regulate your circadian rhythm.',
    'Do a quick 5-minute stretch to awaken your muscles.',
    'Eat a protein-rich breakfast to sustain your energy.',
    'Set one clear intention for your day.',
    'Avoid screens for the first 30 minutes after waking.',
  ],
  afternoon: [
    'Take a short walk after lunch to aid digestion.',
    'Practice mindful breathing for 2 minutes between tasks.',
    'Eat a balanced lunch with protein to maintain energy levels.',
    'Step outside for fresh air, even for just 5 minutes.',
    'Do quick shoulder rolls to release tension from desk work.',
    'Take a 5-minute power nap if feeling tired.',
    'Eat a healthy snack to maintain blood sugar levels.',
    'Practice the 5-4-3-2-1 grounding technique.',
  ],
  evening: [
    'Dim lights 2 hours before bed to prepare for sleep.',
    'Write down tomorrows priorities to clear your mind.',
    'Avoid screens at least 1 hour before bedtime.',
    'Practice gratitude by noting 3 good things from your day.',
    'Do a body scan meditation to release physical tension.',
    'Take a warm bath to relax your muscles.',
    'Set your alarm and put devices away early.',
    'Practice gentle stretching to release the days tension.',
  ],
  mood_based: {
    happy: ['Share your joy with someone today!', 'Use this positive energy for a challenging task.', 'Take a moment to appreciate this feeling.', 'Channel this happiness into creative work.', 'Spread some happiness to others around you.'],
    sad: ['Be gentle with yourself today.', 'Its okay to not feel okay.', 'Reach out to a friend or loved one.', 'Allow yourself to feel without judgment.', 'Practice self-compassion during difficult times.'],
    anxious: ['Focus on your breath - 4 counts in, 6 counts out.', 'Remember: this feeling will pass.', 'Ground yourself by naming 5 things you can see.', 'Practice the 5-4-3-2-1 grounding technique.', 'Write down your worries and set them aside for now.'],
    stressed: ['Take a break and step away from the source of stress.', 'Practice the 5-4-3-2-1 grounding technique.', 'Do some gentle movement to release tension.', 'Take 10 deep breaths and exhale slowly.', 'Prioritize and tackle one task at a time.'],
    calm: ['Savor this peaceful moment.', 'This is a great time for meditation or reflection.', 'Use this clarity for creative work.', 'Practice gratitude for this peaceful state.', 'Share your calm energy with others.'],
    tired: ['Listen to your body and rest if needed.', 'Take a short nap if possible.', 'Drink some water and get some fresh air.', 'Eat a light, energizing snack.', 'Avoid caffeine after 2 PM to protect tonight\'s sleep.'],
    energetic: ['Channel this energy into productive work!', 'Use this time for exercise or creative projects.', 'Accomplish tasks you have been putting off.', 'Share your energy with others who may need a boost.', 'Take on a challenging task while you feel strong.'],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getMeditationByCategory(category: string): MeditationSession[] {
  return MEDITATION_SESSIONS.filter(s => s.category === category);
}

export function getMeditationByLevel(level: string): MeditationSession[] {
  return MEDITATION_SESSIONS.filter(s => s.level === level);
}

export function getRecommendedMeditations(mood?: string): MeditationSession[] {
  const moodCategoryMap: Record<string, string> = {
    happy: 'gratitude',
    sad: 'self_love',
    anxious: 'anxiety',
    stressed: 'stress',
    calm: 'morning',
    tired: 'sleep',
  };

  if (mood && moodCategoryMap[mood]) {
    return getMeditationByCategory(moodCategoryMap[mood]);
  }

  return getMeditationByCategory('stress').slice(0, 5);
}

export function getYogaPoseById(id: string): YogaPose | undefined {
  return YOGA_POSES.find(p => p.id === id);
}

export function getYogaRoutineById(id: string): YogaRoutine | undefined {
  return YOGA_ROUTINES.find(r => r.id === id);
}

export function getMusicPlaylistByMood(mood: string): MusicPlaylist[] {
  if (mood === 'all') return MUSIC_PLAYLISTS;
  return MUSIC_PLAYLISTS.filter(p => p.mood === mood || p.mood === 'all');
}

export function getRecommendedPlaylist(mood?: string): MusicPlaylist[] {
  if (mood && mood !== 'all') {
    const playlists = getMusicPlaylistByMood(mood);
    if (playlists.length > 0) return playlists;
  }
  return MUSIC_PLAYLISTS.slice(0, 3);
}

export function getRecommendedYoga(mood?: string): YogaRoutine[] {
  if (mood === 'stressed' || mood === 'anxious') {
    return YOGA_ROUTINES.filter(r => r.focus === 'relaxation' || r.category === 'restorative').slice(0, 3);
  }
  if (mood === 'tired') {
    return YOGA_ROUTINES.filter(r => r.focus === 'energy').slice(0, 3);
  }
  return YOGA_ROUTINES.slice(0, 3);
}

export type MeditationCategory = MeditationSession['category'];
export type YogaCategory = YogaPose['category'];

export function getWellnessTip(timeOfDay: 'morning' | 'afternoon' | 'evening', mood?: string): string {
  let tips: string[] = [];

  if (timeOfDay === 'morning') {
    tips = [...WELLNESS_TIPS.morning];
  } else if (timeOfDay === 'afternoon') {
    tips = [...WELLNESS_TIPS.afternoon];
  } else {
    tips = [...WELLNESS_TIPS.evening];
  }

  if (mood && WELLNESS_TIPS.mood_based[mood]) {
    tips = [...tips, ...WELLNESS_TIPS.mood_based[mood]];
  }

  return tips[Math.floor(Math.random() * tips.length)];
}

export function getMeditationDurationFilter(duration: 'short' | 'medium' | 'long'): MeditationSession[] {
  const durationRanges = {
    short: (d: number) => d <= 10,
    medium: (d: number) => d > 10 && d <= 20,
    long: (d: number) => d > 20,
  };

  return MEDITATION_SESSIONS.filter(s => durationRanges[duration](s.duration));
}

export function getYogaRoutinesByLevel(level: string): YogaRoutine[] {
  return YOGA_ROUTINES.filter(r => r.level === level);
}

export function searchMeditations(query: string): MeditationSession[] {
  const lowerQuery = query.toLowerCase();
  return MEDITATION_SESSIONS.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery) ||
    s.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

export function searchYogaPoses(query: string): YogaPose[] {
  const lowerQuery = query.toLowerCase();
  return YOGA_POSES.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.sanskritName.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

export function searchMusicPlaylists(query: string): MusicPlaylist[] {
  const lowerQuery = query.toLowerCase();
  return MUSIC_PLAYLISTS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.genre.toLowerCase().includes(lowerQuery) ||
    p.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

// ============================================================================
// Breathing Exercises & Pranayama
// ============================================================================

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'calming' | 'energizing' | 'balancing' | 'sleep' | 'focus' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced';
  pattern: {
    inhale: number; // seconds
    holdAfterInhale: number;
    exhale: number;
    holdAfterExhale: number;
  };
  benefits: string[];
  instructions: string[];
  tags: string[];
  arEnvironment?: string;
  haptics: boolean;
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  // Calming (12 exercises)
  {
    id: 'box_breathing',
    name: 'Box Breathing',
    description: 'Equal duration breathing for balance and calm',
    duration: 8,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 4, exhale: 4, holdAfterExhale: 4 },
    benefits: ['Stress reduction', 'Improved focus', 'Balanced nervous system'],
    instructions: ['Find a comfortable position', 'Breathe in for 4 seconds', 'Hold for 4 seconds', 'Exhale for 4 seconds', 'Hold for 4 seconds', 'Repeat'],
    tags: ['box', 'equal', 'stress relief', 'military'],
    arEnvironment: 'zen_garden',
    haptics: true
  },
  {
    id: 'relaxing_478',
    name: '4-7-8 Relaxing Breath',
    description: 'Calming breath pattern for anxiety and sleep',
    duration: 10,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 7, exhale: 8, holdAfterExhale: 0 },
    benefits: ['Anxiety relief', 'Better sleep', 'Deep relaxation'],
    instructions: ['Sit upright', 'Inhale through nose for 4 seconds', 'Hold for 7 seconds', 'Exhale through mouth for 8 seconds', 'Repeat 3-4 cycles'],
    tags: ['478', 'anxiety', 'sleep', 'relaxation'],
    arEnvironment: 'moonlight',
    haptics: true
  },
  {
    id: 'calm_breath',
    name: 'Calm Breath',
    description: 'Simple calming breath for beginners',
    duration: 5,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 2, exhale: 6, holdAfterExhale: 0 },
    benefits: ['Quick calm', 'Beginner friendly', 'Stress relief'],
    instructions: ['Breathe naturally', 'Slowly inhale for 4 seconds', 'Hold for 2 seconds', 'Exhale slowly for 6 seconds'],
    tags: ['beginner', 'simple', 'quick'],
    arEnvironment: 'forest',
    haptics: false
  },
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic Breathing',
    description: 'Deep belly breathing for relaxation',
    duration: 8,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 5, holdAfterInhale: 2, exhale: 5, holdAfterExhale: 2 },
    benefits: ['Deep relaxation', 'Better oxygenation', 'Reduced anxiety'],
    instructions: ['Place hand on belly', 'Inhale deeply into belly', 'Feel belly rise', 'Exhale slowly', 'Repeat'],
    tags: ['belly breathing', 'deep', 'beginner'],
    arEnvironment: 'ocean_waves',
    haptics: true
  },
  {
    id: 'lion_breath',
    name: 'Lion Breath',
    description: 'Powerful exhale for stress release',
    duration: 6,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 0, exhale: 4, holdAfterExhale: 0 },
    benefits: ['Tension release', 'Face relaxation', 'Stress relief'],
    instructions: ['Inhale deeply', 'Open mouth wide', 'Stick out tongue', 'Exhale with sound', 'Repeat'],
    tags: ['lion', 'exhale', 'tension'],
    arEnvironment: 'mountain',
    haptics: true
  },
  {
    id: 'progressive_calm',
    name: 'Progressive Calm',
    description: 'Building relaxation breath by breath',
    duration: 12,
    category: 'calming',
    level: 'intermediate',
    pattern: { inhale: 4, holdAfterInhale: 4, exhale: 6, holdAfterExhale: 2 },
    benefits: ['Deep calm', 'Progressive relaxation', 'Nervous system reset'],
    instructions: ['Start with short breaths', 'Gradually increase duration', 'Focus on the exhale', 'Let tension dissolve'],
    tags: ['progressive', 'deep', 'intermediate'],
    arEnvironment: 'zen_garden',
    haptics: true
  },
  {
    id: 'ocean_breath',
    name: 'Ocean Breath',
    description: 'Ujjayi breathing for ocean-like calm',
    duration: 10,
    category: 'calming',
    level: 'intermediate',
    pattern: { inhale: 5, holdAfterInhale: 2, exhale: 5, holdAfterExhale: 2 },
    benefits: ['Calm focus', 'Ocean feeling', 'Balancing'],
    instructions: ['Constrict throat slightly', 'Create ocean sound', 'Breathe through nose', 'Maintain sound throughout'],
    tags: ['ujjayi', 'ocean', 'yoga'],
    arEnvironment: 'beach',
    haptics: false
  },
  {
    id: 'extended_exhale',
    name: 'Extended Exhale',
    description: 'Longer exhale for parasympathetic activation',
    duration: 8,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 2, exhale: 8, holdAfterExhale: 0 },
    benefits: ['Parasympathetic activation', 'Deep rest', 'Anxiety reduction'],
    instructions: ['Inhale normally', 'Focus on extending exhale', 'Make exhale longer than inhale', 'Feel the calm'],
    tags: ['parasympathetic', 'rest', 'extended'],
    arEnvironment: 'moonlight',
    haptics: true
  },
  {
    id: 'resonant_breathing',
    name: 'Resonant Breathing',
    description: '5-6 breaths per minute for HRV optimization',
    duration: 10,
    category: 'calming',
    level: 'intermediate',
    pattern: { inhale: 5, holdAfterInhale: 0, exhale: 5, holdAfterExhale: 0 },
    benefits: ['HRV optimization', 'Heart-brain coherence', 'Emotional regulation'],
    instructions: ['Breathe at 5-6 BPM', 'Focus on smooth breaths', 'Keep ratio equal', 'Notice the rhythm'],
    tags: ['HRV', 'coherence', 'heart rate'],
    arEnvironment: 'forest',
    haptics: true
  },
  {
    id: 'visualization_breath',
    name: 'Visualization Breath',
    description: 'Breathing with positive imagery',
    duration: 12,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 2, exhale: 6, holdAfterExhale: 2 },
    benefits: ['Positive visualization', 'Relaxation', 'Mental imagery'],
    instructions: ['Inhale white light', 'Hold light in heart', 'Exhale dark energy', 'Repeat with visualization'],
    tags: ['visualization', 'imagery', 'light'],
    arEnvironment: 'sunrise',
    haptics: false
  },
  {
    id: 'tension_release',
    name: 'Tension Release Breath',
    description: 'Systematic muscle relaxation through breath',
    duration: 15,
    category: 'calming',
    level: 'intermediate',
    pattern: { inhale: 4, holdAfterInhale: 4, exhale: 6, holdAfterExhale: 2 },
    benefits: ['Muscle relaxation', 'Tension release', 'Full body calm'],
    instructions: ['Inhale and tense muscles', 'Hold and feel tension', 'Exhale and release', 'Move through body parts'],
    tags: ['tension', 'muscle', 'progressive'],
    arEnvironment: 'zen_garden',
    haptics: true
  },
  {
    id: 'sleep_breath',
    name: 'Sleep Preparation Breath',
    description: 'Wind-down breathing for bedtime',
    duration: 10,
    category: 'calming',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 0, exhale: 8, holdAfterExhale: 0 },
    benefits: ['Sleep preparation', 'Deep relaxation', 'Bedtime routine'],
    instructions: ['Lie down comfortably', 'Long slow exhales', 'Let breath slow naturally', 'Drift to sleep'],
    tags: ['sleep', 'bedtime', 'night'],
    arEnvironment: 'night_sky',
    haptics: false
  },

  // Energizing (8 exercises)
  {
    id: 'kapalabhati',
    name: 'Kapalabhati',
    description: 'Skull-shining breath for energy',
    duration: 5,
    category: 'energizing',
    level: 'intermediate',
    pattern: { inhale: 1, holdAfterInhale: 0, exhale: 1, holdAfterExhale: 0 },
    benefits: ['Energy boost', 'Mental clarity', 'Respiratory cleanse'],
    instructions: ['Quick forceful exhales', 'Passive inhales', 'Pump belly muscles', 'Start slow, build speed'],
    tags: ['energizing', 'cleansing', 'traditional'],
    arEnvironment: 'sunrise',
    haptics: true
  },
  {
    id: 'bhastrika',
    name: 'Bhastrika',
    description: 'Bellows breath for vital energy',
    duration: 6,
    category: 'energizing',
    level: 'advanced',
    pattern: { inhale: 2, holdAfterInhale: 2, exhale: 2, holdAfterExhale: 2 },
    benefits: ['Energy increase', 'Warmth', 'Mental alertness'],
    instructions: ['Deep forceful breaths', 'Fill lungs completely', 'Strong exhales', 'Build heat in body'],
    tags: ['bellows', 'energy', 'heating'],
    arEnvironment: 'volcano',
    haptics: true
  },
  {
    id: 'victory_breath',
    name: 'Victory Breath',
    description: 'Ujjayi for alertness and focus',
    duration: 8,
    category: 'energizing',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 2, exhale: 4, holdAfterExhale: 2 },
    benefits: ['Alertness', 'Focus', 'Confidence'],
    instructions: ['Constrict throat', 'Create hissing sound', 'Breathe through nose', 'Maintain ocean sound'],
    tags: ['victory', 'alertness', 'focus'],
    arEnvironment: 'mountain_sunrise',
    haptics: false
  },
  {
    id: 'stimulating_breath',
    name: 'Stimulating Breath',
    description: 'Quick breaths for morning wake-up',
    duration: 3,
    category: 'energizing',
    level: 'beginner',
    pattern: { inhale: 2, holdAfterInhale: 0, exhale: 2, holdAfterExhale: 0 },
    benefits: ['Quick energy', 'Wake up', 'Mental alertness'],
    instructions: ['Rhythmic breathing', 'Quick but smooth', 'Build energy', 'Stay relaxed'],
    tags: ['morning', 'quick', 'energy'],
    arEnvironment: 'sunrise',
    haptics: true
  },
  {
    id: 'power_breath',
    name: 'Power Breath',
    description: 'Deep inhales for power and presence',
    duration: 6,
    category: 'energizing',
    level: 'intermediate',
    pattern: { inhale: 6, holdAfterInhale: 3, exhale: 4, holdAfterExhale: 0 },
    benefits: ['Power', 'Confidence', 'Presence'],
    instructions: ['Deep maximal inhale', 'Hold with full lungs', 'Controlled exhale', 'Build power'],
    tags: ['power', 'confidence', 'strength'],
    arEnvironment: 'mountain',
    haptics: true
  },
  {
    id: 'fire_breath',
    name: 'Fire Breath',
    description: 'Solar plexus activation',
    duration: 5,
    category: 'energizing',
    level: 'intermediate',
    pattern: { inhale: 2, holdAfterInhale: 0, exhale: 1, holdAfterExhale: 0 },
    benefits: ['Core energy', 'Willpower', 'Digestion'],
    instructions: ['Rapid breaths', 'Exhale sharply', 'Contract navel', 'Build inner fire'],
    tags: ['fire', 'solar', 'core'],
    arEnvironment: 'desert_sun',
    haptics: true
  },
  {
    id: 'mountain_breath',
    name: 'Mountain Breath',
    description: 'Tall breathing for energy expansion',
    duration: 8,
    category: 'energizing',
    level: 'beginner',
    pattern: { inhale: 5, holdAfterInhale: 3, exhale: 5, holdAfterExhale: 2 },
    benefits: ['Energy expansion', 'Uplift', 'Vitality'],
    instructions: ['Stand or sit tall', 'Inhale expanding upward', 'Hold at top', 'Exhale grounding down'],
    tags: ['mountain', 'expansion', 'uplift'],
    arEnvironment: 'mountain_peak',
    haptics: false
  },
  {
    id: 'energy_circulation',
    name: 'Energy Circulation',
    description: 'Breath for energy movement',
    duration: 10,
    category: 'energizing',
    level: 'advanced',
    pattern: { inhale: 6, holdAfterInhale: 4, exhale: 6, holdAfterExhale: 4 },
    benefits: ['Energy circulation', 'Chi activation', 'Vitality'],
    instructions: ['Inhale energy up spine', 'Hold at crown', 'Exhale energy down', 'Feel energy flow'],
    tags: ['energy', 'circulation', 'chi'],
    arEnvironment: 'forest_mystical',
    haptics: true
  },

  // Balancing (8 exercises)
  {
    id: 'nadi_shodhana',
    name: 'Nadi Shodhana',
    description: 'Alternate nostril breathing for balance',
    duration: 10,
    category: 'balancing',
    level: 'intermediate',
    pattern: { inhale: 5, holdAfterInhale: 5, exhale: 5, holdAfterExhale: 5 },
    benefits: ['Energy balance', 'Brain hemispheres', 'Calm focus'],
    instructions: ['Close right nostril', 'Inhale through left', 'Close both', 'Exhale through right', 'Inhale right', 'Close both', 'Exhale left'],
    tags: ['alternate nostril', 'balance', 'traditional'],
    arEnvironment: 'zen_garden',
    haptics: true
  },
  {
    id: 'balance_breath',
    name: 'Balance Breath',
    description: 'Equal breathing for equilibrium',
    duration: 8,
    category: 'balancing',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 4, exhale: 4, holdAfterExhale: 4 },
    benefits: ['Equilibrium', 'Balance', 'Centeredness'],
    instructions: ['Equal inhale and exhale', 'Equal holds', 'Maintain rhythm', 'Find balance'],
    tags: ['balance', 'equal', 'equilibrium'],
    arEnvironment: 'forest',
    haptics: false
  },
  {
    id: 'energy_balancer',
    name: 'Energy Balancer',
    description: 'Balance left and right energy',
    duration: 12,
    category: 'balancing',
    level: 'advanced',
    pattern: { inhale: 6, holdAfterInhale: 6, exhale: 6, holdAfterExhale: 6 },
    benefits: ['Energy balancing', 'Hemispheric harmony', 'Deep balance'],
    instructions: ['Long balanced breaths', 'Focus on energy centers', 'Left and right balance', 'Achieve harmony'],
    tags: ['energy', 'balance', 'harmony'],
    arEnvironment: 'moonlight',
    haptics: true
  },
  {
    id: 'humming_breath',
    name: 'Humming Breath',
    description: 'Humming bee breath for calm',
    duration: 8,
    category: 'balancing',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 4, exhale: 4, holdAfterExhale: 0 },
    benefits: ['Calm', 'Vibration healing', 'Nervous system'],
    instructions: ['Inhale normally', 'Exhale with hum', 'Feel vibration', 'Repeat'],
    tags: ['humming', 'bee', 'vibration'],
    arEnvironment: 'garden',
    haptics: true
  },
  {
    id: 'clearing_breath',
    name: 'Clearing Breath',
    description: 'Energy clearing practice',
    duration: 10,
    category: 'balancing',
    level: 'intermediate',
    pattern: { inhale: 5, holdAfterInhale: 3, exhale: 7, holdAfterExhale: 1 },
    benefits: ['Energy clearing', 'Mental clarity', 'Release'],
    instructions: ['Inhale fresh energy', 'Hold to absorb', 'Exhale stale energy', 'Clear the channels'],
    tags: ['clearing', 'release', 'refresh'],
    arEnvironment: 'waterfall',
    haptics: true
  },
  {
    id: 'grounding_breath',
    name: 'Grounding Breath',
    description: 'Earth-connection breathing',
    duration: 10,
    category: 'balancing',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 2, exhale: 6, holdAfterExhale: 2 },
    benefits: ['Grounding', 'Earth connection', 'Stability'],
    instructions: ['Visualize roots', 'Inhale from earth', 'Exhale down', 'Feel grounded'],
    tags: ['grounding', 'earth', 'roots'],
    arEnvironment: 'ancient_forest',
    haptics: false
  },
  {
    id: 'unity_breath',
    name: 'Unity Breath',
    description: 'Connecting breath practice',
    duration: 12,
    category: 'balancing',
    level: 'intermediate',
    pattern: { inhale: 5, holdAfterInhale: 5, exhale: 5, holdAfterExhale: 5 },
    benefits: ['Unity', 'Connection', 'Wholeness'],
    instructions: ['All equal parts', 'Complete cycles', 'Feel wholeness', 'Experience unity'],
    tags: ['unity', 'connection', 'wholeness'],
    arEnvironment: 'starfield',
    haptics: true
  },
  {
    id: 'chakra_breath',
    name: 'Chakra Breathing',
    description: 'Energy center activation',
    duration: 15,
    category: 'balancing',
    level: 'advanced',
    pattern: { inhale: 6, holdAfterInhale: 4, exhale: 6, holdAfterExhale: 4 },
    benefits: ['Chakra activation', 'Energy flow', 'Spiritual balance'],
    instructions: ['Focus on energy centers', 'Breathe into each chakra', 'Activate from base to crown', 'Balance all centers'],
    tags: ['chakra', 'energy', 'spiritual'],
    arEnvironment: 'chakra_lotus',
    haptics: true
  },

  // Sleep (4 exercises)
  {
    id: 'sleep_easy',
    name: 'Sleep Easy',
    description: 'Gentle breath for falling asleep',
    duration: 15,
    category: 'sleep',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 0, exhale: 8, holdAfterExhale: 0 },
    benefits: ['Sleep onset', 'Deep relaxation', 'Letting go'],
    instructions: ['Lie down comfortably', 'Long exhales', 'Let breath slow', 'Drift to sleep'],
    tags: ['sleep', 'easy', 'gentle'],
    arEnvironment: 'night_sky',
    haptics: false
  },
  {
    id: 'deep_sleep_breath',
    name: 'Deep Sleep Breath',
    description: 'Preparing body for deep sleep',
    duration: 20,
    category: 'sleep',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 0, exhale: 10, holdAfterExhale: 0 },
    benefits: ['Deep sleep', 'Body preparation', 'Complete relaxation'],
    instructions: ['Very long exhales', 'Let body sink', 'Prepare for sleep', 'Stay in bed'],
    tags: ['deep sleep', 'preparation', 'night'],
    arEnvironment: 'night_forest',
    haptics: false
  },
  {
    id: 'dream_breath',
    name: 'Dream Breath',
    description: 'Setting up for peaceful dreams',
    duration: 12,
    category: 'sleep',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 2, exhale: 8, holdAfterExhale: 0 },
    benefits: ['Peaceful dreams', 'Dream intention', 'Restful sleep'],
    instructions: ['Set dream intention', 'Breathe smoothly', 'Release the day', 'Welcome dreams'],
    tags: ['dreams', 'intention', 'peaceful'],
    arEnvironment: 'dream_clouds',
    haptics: false
  },
  {
    id: 'snore_prevention',
    name: 'Snore Prevention',
    description: 'Breathing for clear airways',
    duration: 10,
    category: 'sleep',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 0, exhale: 6, holdAfterExhale: 0 },
    benefits: ['Clear airways', 'Better breathing', 'Partner sleep'],
    instructions: ['Nasal breathing', 'Tongue position', 'Soft palate', 'Quiet breathing'],
    tags: ['snoring', 'airways', 'quiet'],
    arEnvironment: 'night_sky',
    haptics: false
  },

  // Focus (4 exercises)
  {
    id: 'focus_breath',
    name: 'Focus Breath',
    description: 'Sharpen concentration',
    duration: 8,
    category: 'focus',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 4, exhale: 4, holdAfterExhale: 0 },
    benefits: ['Concentration', 'Mental clarity', 'Sharp focus'],
    instructions: ['Equal parts', 'Hold at top', 'Full focus', 'Maintain attention'],
    tags: ['focus', 'concentration', 'clarity'],
    arEnvironment: 'mountain_peak',
    haptics: true
  },
  {
    id: 'mental_clear',
    name: 'Mental Clear',
    description: 'Clear the mental fog',
    duration: 10,
    category: 'focus',
    level: 'intermediate',
    pattern: { inhale: 5, holdAfterInhale: 5, exhale: 5, holdAfterExhale: 5 },
    benefits: ['Mental clarity', 'Fog clearing', 'Sharpness'],
    instructions: ['Deep breathing', 'Full cycles', 'Clear mind', 'Stay present'],
    tags: ['mental', 'clarity', 'fog'],
    arEnvironment: 'crystal_cave',
    haptics: false
  },
  {
    id: 'study_breath',
    name: 'Study Breath',
    description: 'Before study or work',
    duration: 6,
    category: 'focus',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 2, exhale: 4, holdAfterExhale: 2 },
    benefits: ['Memory', 'Retention', 'Study prep'],
    instructions: ['Prepare brain', 'Increase oxygen', 'Focus attention', 'Ready to learn'],
    tags: ['study', 'memory', 'work'],
    arEnvironment: 'library',
    haptics: false
  },
  {
    id: 'mindful_breath',
    name: 'Mindful Breath',
    description: 'Present moment awareness',
    duration: 15,
    category: 'focus',
    level: 'beginner',
    pattern: { inhale: 4, holdAfterInhale: 0, exhale: 4, holdAfterExhale: 0 },
    benefits: ['Mindfulness', 'Present moment', 'Awareness'],
    instructions: ['Natural breath', 'Observe without control', 'Stay present', 'Notice everything'],
    tags: ['mindfulness', 'present', 'awareness'],
    arEnvironment: 'zen_garden',
    haptics: false
  },

  // Advanced (6 exercises)
  {
    id: 'kriya_breath',
    name: 'Kriya Breathing',
    description: 'Advanced breath technique',
    duration: 15,
    category: 'advanced',
    level: 'advanced',
    pattern: { inhale: 8, holdAfterInhale: 8, exhale: 8, holdAfterExhale: 8 },
    benefits: ['Deep purification', 'Energy awakening', 'Advanced practice'],
    instructions: ['Long holds', 'Complete retention', 'Advanced level', 'Experienced practitioners only'],
    tags: ['kriya', 'advanced', 'purification'],
    arEnvironment: 'temple',
    haptics: true
  },
  {
    id: 'samaveta',
    name: 'Samaveta',
    description: 'Merging breath practice',
    duration: 20,
    category: 'advanced',
    level: 'advanced',
    pattern: { inhale: 10, holdAfterInhale: 10, exhale: 10, holdAfterExhale: 10 },
    benefits: ['Unity experience', 'Deep meditation', 'Transcendence'],
    instructions: ['Complete stillness', 'No movement', 'Pure awareness', 'Beyond breath'],
    tags: ['unity', 'transcendence', 'advanced'],
    arEnvironment: 'void',
    haptics: false
  },
  {
    id: 'pranic_healing',
    name: 'Pranic Healing',
    description: 'Energy healing breath',
    duration: 25,
    category: 'advanced',
    level: 'advanced',
    pattern: { inhale: 6, holdAfterInhale: 6, exhale: 6, holdAfterExhale: 6 },
    benefits: ['Energy healing', 'Prana cultivation', 'Vitality'],
    instructions: ['Draw prana in', 'Circulate energy', 'Heal the body', 'Increase vitality'],
    tags: ['prana', 'healing', 'energy'],
    arEnvironment: 'healing_light',
    haptics: true
  },
  {
    id: 'sound_breath',
    name: 'Sound Breathing',
    description: 'Breath with mantras',
    duration: 15,
    category: 'advanced',
    level: 'advanced',
    pattern: { inhale: 6, holdAfterInhale: 4, exhale: 8, holdAfterExhale: 2 },
    benefits: ['Sound healing', 'Vibration', 'Mantra integration'],
    instructions: ['Choose mantra', 'Sync with breath', 'Feel vibration', 'Heal with sound'],
    tags: ['sound', 'mantra', 'vibration'],
    arEnvironment: 'sacred_space',
    haptics: true
  },
  {
    id: 'awakening_breath',
    name: 'Kundalini Awakening',
    description: 'Energy rising practice',
    duration: 30,
    category: 'advanced',
    level: 'advanced',
    pattern: { inhale: 5, holdAfterInhale: 5, exhale: 5, holdAfterExhale: 5 },
    benefits: ['Kundalini rise', 'Energy awakening', 'Spiritual'],
    instructions: ['Chant mantra', 'Breath of fire', 'Feel rising energy', 'Awaken kundalini'],
    tags: ['kundalini', 'spiritual', 'awakening'],
    arEnvironment: 'chakra_lotus',
    haptics: true
  },
  {
    id: 'cosmic_breath',
    name: 'Cosmic Breath',
    description: 'Universal energy breathing',
    duration: 20,
    category: 'advanced',
    level: 'advanced',
    pattern: { inhale: 8, holdAfterInhale: 8, exhale: 8, holdAfterExhale: 8 },
    benefits: ['Cosmic connection', 'Universal energy', 'Oneness'],
    instructions: ['Breathe universe', 'Expand beyond body', 'Connect with cosmos', 'Experience oneness'],
    tags: ['cosmic', 'universal', 'spiritual'],
    arEnvironment: 'galaxy',
    haptics: false
  },
];

// ============================================================================
// Sleep & Rest Content
// ============================================================================

export interface SleepContent {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'story' | 'soundscape' | 'asmr' | 'binaural' | 'meditation' | 'education';
  level: 'beginner' | 'intermediate';
  narrator?: string;
  audioType: 'narration' | 'ambient' | 'music' | 'binaural';
  benefits: string[];
  tags: string[];
  arEnvironment?: string;
  forSleep: boolean;
}

export const SLEEP_CONTENT: SleepContent[] = [
  // Sleep Stories (12)
  { id: 'story_meadow', name: 'Peaceful Meadow', description: 'Walk through a tranquil meadow', duration: 25, category: 'story', level: 'beginner', narrator: 'Sarah', audioType: 'narration', benefits: ['Relaxation', 'Peaceful imagery', 'Sleep onset'], tags: ['nature', 'walk', 'peaceful'], arEnvironment: 'meadow_night', forSleep: true },
  { id: 'story_forest', name: 'Enchanted Forest', description: 'Discover a magical forest', duration: 30, category: 'story', level: 'beginner', narrator: 'Michael', audioType: 'narration', benefits: ['Imagination', 'Wonder', 'Calm'], tags: ['fantasy', 'magic', 'forest'], arEnvironment: 'forest_night', forSleep: true },
  { id: 'story_beach', name: 'Gentle Waves', description: 'Relax by the ocean', duration: 25, category: 'story', level: 'beginner', narrator: 'Emma', audioType: 'narration', benefits: ['Ocean calm', 'Relaxation', 'Peace'], tags: ['beach', 'ocean', 'waves'], arEnvironment: 'beach_night', forSleep: true },
  { id: 'story_mountain', name: 'Mountain Lodge', description: 'Cozy night in a mountain cabin', duration: 28, category: 'story', level: 'beginner', narrator: 'James', audioType: 'narration', benefits: ['Cozy', 'Warmth', 'Security'], tags: ['mountain', 'cabin', 'cozy'], arEnvironment: 'mountain_lodge', forSleep: true },
  { id: 'story_garden', name: 'Moonlight Garden', description: 'Stroll through a moonlit garden', duration: 22, category: 'story', level: 'beginner', narrator: 'Olivia', audioType: 'narration', benefits: ['Beauty', 'Tranquility', 'Calm'], tags: ['garden', 'moonlight', 'flowers'], arEnvironment: 'moon_garden', forSleep: true },
  { id: 'story_river', name: 'Flowing River', description: 'Follow a gentle river', duration: 25, category: 'story', level: 'beginner', narrator: 'William', audioType: 'narration', benefits: ['Flow', 'Movement', 'Relaxation'], tags: ['river', 'water', 'flow'], arEnvironment: 'river_night', forSleep: true },
  { id: 'story_stargazing', name: 'Stargazing', description: 'Count stars in the night sky', duration: 20, category: 'story', level: 'beginner', narrator: 'Ava', audioType: 'narration', benefits: ['Wonder', 'Limitlessness', 'Peace'], tags: ['stars', 'sky', 'universe'], arEnvironment: 'stargazing', forSleep: true },
  { id: 'story_rain', name: 'Rainy Cottage', description: 'Cozy evening in a cottage in the rain', duration: 30, category: 'story', level: 'beginner', narrator: 'Benjamin', audioType: 'narration', benefits: ['Comfort', 'Cozy', 'Security'], tags: ['rain', 'cottage', 'warm'], arEnvironment: 'cottage_rain', forSleep: true },
  { id: 'story_farm', name: 'Old Farmhouse', description: 'Peaceful night at the farm', duration: 28, category: 'story', level: 'beginner', narrator: 'Sophia', audioType: 'narration', benefits: ['Nostalgia', 'Simplicity', 'Peace'], tags: ['farm', 'nostalgia', 'rural'], arEnvironment: 'farm_night', forSleep: true },
  { id: 'story_train', name: 'Train Journey', description: 'Rhythmic train ride at night', duration: 25, category: 'story', level: 'beginner', narrator: 'Lucas', audioType: 'narration', benefits: ['Rhythm', 'Motion', 'Comfort'], tags: ['train', 'rhythm', 'travel'], arEnvironment: 'train_night', forSleep: true },
  { id: 'story_balloon', name: 'Hot Air Balloon', description: 'Floating peacefully in a balloon', duration: 22, category: 'story', level: 'beginner', narrator: 'Mia', audioType: 'narration', benefits: ['Freedom', 'Gentle', 'Lightness'], tags: ['balloon', 'floating', 'sky'], arEnvironment: 'balloon_sunset', forSleep: true },
  { id: 'story_library', name: 'Old Library', description: 'Quiet night in a grand library', duration: 30, category: 'story', level: 'beginner', narrator: 'Noah', audioType: 'narration', benefits: ['Quiet', 'Knowledge', 'Peace'], tags: ['library', 'books', 'quiet'], arEnvironment: 'library_night', forSleep: true },

  // Soundscapes (12)
  { id: 'sound_rain', name: 'Rain Sounds', description: 'Gentle rainfall', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Relaxation', 'Sleep', 'Calm'], tags: ['rain', 'nature', 'ambient'], arEnvironment: 'rain_window', forSleep: true },
  { id: 'sound_ocean', name: 'Ocean Waves', description: 'Rhythmic ocean waves', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Deep relaxation', 'Sleep', 'Rhythm'], tags: ['ocean', 'waves', 'beach'], arEnvironment: 'beach_waves', forSleep: true },
  { id: 'sound_forest', name: 'Forest Night', description: 'Nighttime forest ambience', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Nature', 'Peace', 'Sleep'], tags: ['forest', 'night', 'crickets'], arEnvironment: 'forest_night', forSleep: true },
  { id: 'sound_thunder', name: 'Thunderstorm', description: 'Distant thunder and rain', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Comfort', 'Security', 'Sleep'], tags: ['thunder', 'storm', 'rain'], arEnvironment: 'storm_distance', forSleep: true },
  { id: 'sound_wind', name: 'Wind Through Trees', description: 'Gentle wind', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Gentle', 'Flow', 'Relaxation'], tags: ['wind', 'trees', 'gentle'], arEnvironment: 'wind_trees', forSleep: true },
  { id: 'sound_fire', name: 'Crackling Fire', description: 'Cozy fireplace', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Cozy', 'Warmth', 'Comfort'], tags: ['fire', 'fireplace', 'cozy'], arEnvironment: 'fireplace', forSleep: true },
  { id: 'sound_stream', name: 'Babbling Brook', description: 'Gentle stream', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Flow', 'Nature', 'Calm'], tags: ['stream', 'water', 'brook'], arEnvironment: 'forest_stream', forSleep: true },
  { id: 'sound_campfire', name: 'Campfire', description: 'Outdoor campfire', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Outdoors', 'Warmth', 'Relaxation'], tags: ['campfire', 'outdoors', 'nature'], arEnvironment: 'campfire_night', forSleep: true },
  { id: 'sound_whitenoise', name: 'White Noise', description: 'Classic white noise', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Focus', 'Sleep', 'Masking'], tags: ['white noise', 'static', 'focus'], arEnvironment: 'void', forSleep: true },
  { id: 'sound_pinknoise', name: 'Pink Noise', description: 'Softer pink noise', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Deeper', 'Sleep', 'Balance'], tags: ['pink noise', 'softer', 'balance'], arEnvironment: 'void', forSleep: true },
  { id: 'sound_fan', name: 'Fan Sound', description: 'Electric fan', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Familiar', 'Comfort', 'Sleep'], tags: ['fan', 'familiar', 'comfort'], arEnvironment: 'bedroom', forSleep: true },
  { id: 'sound_waterfall', name: 'Waterfall', description: 'Distant waterfall', duration: 60, category: 'soundscape', level: 'beginner', audioType: 'ambient', benefits: ['Powerful', 'Nature', 'Sleep'], tags: ['waterfall', 'power', 'nature'], arEnvironment: 'waterfall_distance', forSleep: true },

  // ASMR (8)
  { id: 'asmr_whisper', name: 'Gentle Whispers', description: 'Soft spoken relaxation', duration: 30, category: 'asmr', level: 'beginner', narrator: 'Emma', audioType: 'narration', benefits: ['ASMR', 'Relaxation', 'Tingle'], tags: ['whisper', 'soft', 'tingle'], arEnvironment: 'moonlight', forSleep: true },
  { id: 'asmr_tapping', name: 'Tapping Sounds', description: 'Rhythmic tapping', duration: 30, category: 'asmr', level: 'beginner', audioType: 'ambient', benefits: ['Focus', 'Relaxation', 'Tingle'], tags: ['tapping', 'rhythm', 'asmr'], arEnvironment: 'void', forSleep: true },
  { id: 'asmr_brushing', name: 'Hair Brushing', description: 'Gentle brushing sounds', duration: 25, category: 'asmr', level: 'beginner', audioType: 'ambient', benefits: ['Comfort', 'Relaxation', 'Nurturing'], tags: ['brushing', 'hair', 'gentle'], arEnvironment: 'moonlight', forSleep: true },
  { id: 'asmr_crisp', name: 'Crisp Sounds', description: 'Paper and crisp sounds', duration: 20, category: 'asmr', level: 'beginner', audioType: 'ambient', benefits: ['Focus', 'Satisfaction', 'Tingle'], tags: ['crisp', 'paper', 'satisfying'], arEnvironment: 'void', forSleep: true },
  { id: 'asmr_ear', name: 'Ear Massage', description: 'Whispered ear care', duration: 25, category: 'asmr', level: 'beginner', narrator: 'Sarah', audioType: 'narration', benefits: ['Intimate', 'Relaxing', 'Calm'], tags: ['ear', 'whisper', 'gentle'], arEnvironment: 'moonlight', forSleep: true },
  { id: 'asmr_breath', name: 'Breathing ASMR', description: 'Soft breathing sounds', duration: 30, category: 'asmr', level: 'beginner', audioType: 'ambient', benefits: ['Natural', 'Soothing', 'Sleep'], tags: ['breath', 'natural', 'soothing'], arEnvironment: 'moonlight', forSleep: true },
  { id: 'asmr_rain_asmr', name: 'Rain ASMR', description: 'Rain with soft spoken words', duration: 35, category: 'asmr', level: 'beginner', narrator: 'James', audioType: 'narration', benefits: ['Rain', 'Whisper', 'Deep relax'], tags: ['rain', 'asmr', 'combination'], arEnvironment: 'rain_window', forSleep: true },
  { id: 'asmr_spa', name: 'Spa Experience', description: 'Spa relaxation sounds', duration: 30, category: 'asmr', level: 'beginner', audioType: 'ambient', benefits: ['Luxury', 'Relaxation', 'Pampering'], tags: ['spa', 'luxury', 'relax'], arEnvironment: 'spa_room', forSleep: true },

  // Binaural Beats (8)
  { id: 'binaural_delta', name: 'Delta Waves', description: 'Deep sleep brainwaves (0.5-4 Hz)', duration: 60, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['Deep sleep', 'Healing', 'Restoration'], tags: ['delta', 'deep sleep', 'brainwaves'], arEnvironment: 'void', forSleep: true },
  { id: 'binaural_theta', name: 'Theta Waves', description: 'Light sleep brainwaves (4-8 Hz)', duration: 60, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['Light sleep', 'Creativity', 'Relaxation'], tags: ['theta', 'light sleep', 'brainwaves'], arEnvironment: 'void', forSleep: true },
  { id: 'binaural_alpha', name: 'Alpha Waves', description: 'Relaxed awareness (8-14 Hz)', duration: 45, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['Relaxation', 'Alert calm', 'Focus'], tags: ['alpha', 'relaxed', 'brainwaves'], arEnvironment: 'void', forSleep: false },
  { id: 'binaural_beta', name: 'Beta Waves', description: 'Active thinking (14-30 Hz)', duration: 30, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['Focus', 'Alertness', 'Energy'], tags: ['beta', 'focus', 'energy'], arEnvironment: 'void', forSleep: false },
  { id: 'binaural_432', name: '432 Hz Healing', description: '432 Hz frequency', duration: 60, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['Healing', 'Harmony', 'Calm'], tags: ['432', 'frequency', 'healing'], arEnvironment: 'void', forSleep: true },
  { id: 'binaural_528', name: '528 Hz Miracle', description: '528 Hz DNA repair', duration: 60, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['DNA healing', 'Miracle tone', 'Repair'], tags: ['528', 'miracle', 'dna'], arEnvironment: 'void', forSleep: true },
  { id: 'binaural_hollow', name: 'Hollow Brain', description: 'Deep hollow sound', duration: 45, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['Deep', 'Meditative', 'Void'], tags: ['hollow', 'deep', 'meditation'], arEnvironment: 'void', forSleep: true },
  { id: 'binaural_sleep', name: 'Sleep Combination', description: 'Delta + Theta for sleep', duration: 60, category: 'binaural', level: 'beginner', audioType: 'binaural', benefits: ['Deep sleep', 'Combination', 'Effective'], tags: ['sleep', 'combination', 'effective'], arEnvironment: 'void', forSleep: true },

  // Sleep Meditations (10)
  { id: 'meditation_sleep_1', name: 'Body Scan Sleep', description: 'Full body relaxation for sleep', duration: 20, category: 'meditation', level: 'beginner', narrator: 'Sarah', audioType: 'narration', benefits: ['Body relaxation', 'Sleep', 'Letting go'], tags: ['body scan', 'relaxation', 'sleep'], arEnvironment: 'moonlight', forSleep: true },
  { id: 'meditation_sleep_2', name: 'Gratitude Sleep', description: 'End day with gratitude', duration: 15, category: 'meditation', level: 'beginner', narrator: 'Michael', audioType: 'narration', benefits: ['Gratitude', 'Positive sleep', 'Peace'], tags: ['gratitude', 'positive', 'evening'], arEnvironment: 'moon_garden', forSleep: true },
  { id: 'meditation_sleep_3', name: 'Release Day', description: 'Let go of the day', duration: 18, category: 'meditation', level: 'beginner', narrator: 'Emma', audioType: 'narration', benefits: ['Release', 'Letting go', 'Freedom'], tags: ['release', 'letting go', 'evening'], arEnvironment: 'sunset', forSleep: true },
  { id: 'meditation_sleep_4', name: 'Breath Sleep', description: 'Breath-focused sleep', duration: 15, category: 'meditation', level: 'beginner', narrator: 'James', audioType: 'narration', benefits: ['Breath', 'Sleep', 'Simple'], tags: ['breath', 'simple', 'easy'], arEnvironment: 'night_sky', forSleep: true },
  { id: 'meditation_sleep_5', name: 'Loving Kindness Sleep', description: 'Send love as you sleep', duration: 20, category: 'meditation', level: 'beginner', narrator: 'Olivia', audioType: 'narration', benefits: ['Love', 'Compassion', 'Warmth'], tags: ['loving kindness', 'love', 'compassion'], arEnvironment: 'heart_light', forSleep: true },
  { id: 'meditation_sleep_6', name: 'Visualization Sleep', description: 'Peaceful sleep visualization', duration: 22, category: 'meditation', level: 'beginner', narrator: 'William', audioType: 'narration', benefits: ['Visualization', 'Peace', 'Calm'], tags: ['visualization', 'peace', 'calm'], arEnvironment: 'peaceful_place', forSleep: true },
  { id: 'meditation_sleep_7', name: 'Counting Sleep', description: 'Counting down to sleep', duration: 12, category: 'meditation', level: 'beginner', narrator: 'Ava', audioType: 'narration', benefits: ['Counting', 'Focus', 'Sleep'], tags: ['counting', 'simple', 'focus'], arEnvironment: 'moonlight', forSleep: true },
  { id: 'meditation_sleep_8', name: 'Progressive Sleep', description: 'Progressive relaxation', duration: 25, category: 'meditation', level: 'intermediate', narrator: 'Benjamin', audioType: 'narration', benefits: ['Deep relaxation', 'Complete release', 'Sleep'], tags: ['progressive', 'deep', 'complete'], arEnvironment: 'void', forSleep: true },
  { id: 'meditation_sleep_9', name: 'Healing Sleep', description: 'Sleep for body healing', duration: 20, category: 'meditation', level: 'beginner', narrator: 'Sophia', audioType: 'narration', benefits: ['Healing', 'Recovery', 'Rest'], tags: ['healing', 'recovery', 'rest'], arEnvironment: 'healing_light', forSleep: true },
  { id: 'meditation_sleep_10', name: 'Goodnight Sleep', description: 'Gentle bedtime meditation', duration: 15, category: 'meditation', level: 'beginner', narrator: 'Lucas', audioType: 'narration', benefits: ['Bedtime', 'Gentle', 'Peaceful'], tags: ['goodnight', 'gentle', 'bedtime'], arEnvironment: 'bedroom_night', forSleep: true },

  // Sleep Education (8)
  { id: 'edu_sleep_hygiene', name: 'Sleep Hygiene Basics', description: 'Foundation for good sleep', duration: 15, category: 'education', level: 'beginner', narrator: 'Dr. Smith', audioType: 'narration', benefits: ['Knowledge', 'Habits', 'Health'], tags: ['education', 'hygiene', 'basics'], arEnvironment: 'classroom', forSleep: false },
  { id: 'edu_circadian', name: 'Circadian Rhythm', description: 'Understanding your body clock', duration: 18, category: 'education', level: 'beginner', narrator: 'Dr. Johnson', audioType: 'narration', benefits: ['Body clock', 'Timing', 'Health'], tags: ['circadian', 'rhythm', 'biology'], arEnvironment: 'classroom', forSleep: false },
  { id: 'edu_sleep_stages', name: 'Sleep Stages Explained', description: 'Understanding sleep phases', duration: 20, category: 'education', level: 'intermediate', narrator: 'Dr. Williams', audioType: 'narration', benefits: ['Knowledge', 'Science', 'Understanding'], tags: ['stages', 'science', 'phases'], arEnvironment: 'classroom', forSleep: false },
  { id: 'edu_blue_light', name: 'Blue Light Effects', description: 'How screens affect sleep', duration: 12, category: 'education', level: 'beginner', narrator: 'Dr. Brown', audioType: 'narration', benefits: ['Screen awareness', 'Better sleep', 'Habits'], tags: ['blue light', 'screens', 'habits'], arEnvironment: 'classroom', forSleep: false },
  { id: 'edu_temperature', name: 'Sleep Temperature', description: 'Optimal temperature for sleep', duration: 15, category: 'education', level: 'beginner', narrator: 'Dr. Davis', audioType: 'narration', benefits: ['Temperature', 'Optimization', 'Comfort'], tags: ['temperature', 'environment', 'comfort'], arEnvironment: 'classroom', forSleep: false },
  { id: 'edu_caffeine', name: 'Caffeine and Sleep', description: 'Impact of caffeine on rest', duration: 15, category: 'education', level: 'beginner', narrator: 'Dr. Miller', audioType: 'narration', benefits: ['Caffeine awareness', 'Timing', 'Health'], tags: ['caffeine', 'timing', 'habits'], arEnvironment: 'classroom', forSleep: false },
  { id: 'edu_stress_sleep', name: 'Stress and Sleep', description: 'Managing stress for better rest', duration: 18, category: 'education', level: 'beginner', narrator: 'Dr. Wilson', audioType: 'narration', benefits: ['Stress management', 'Sleep quality', 'Health'], tags: ['stress', 'management', 'relaxation'], arEnvironment: 'classroom', forSleep: false },
  { id: 'edu_sleep_tracking', name: 'Sleep Tracking Guide', description: 'Understanding your sleep data', duration: 15, category: 'education', level: 'beginner', narrator: 'Dr. Taylor', audioType: 'narration', benefits: ['Data', 'Tracking', 'Insights'], tags: ['tracking', 'data', 'insights'], arEnvironment: 'classroom', forSleep: false },
];

// ============================================================================
// Exercise & Movement Content
// ============================================================================

export interface ExerciseMovement {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'tai_chi' | 'qigong' | 'stretching' | 'dance' | 'walking' | 'chair' | 'hiit' | 'bodyweight';
  level: 'beginner' | 'intermediate' | 'advanced';
  caloriesBurned: number;
  benefits: string[];
  instructions: string[];
  precautions: string[];
  tags: string[];
  arEnvironment?: string;
  arPoseDetection: boolean;
}

export const EXERCISE_MOVEMENTS: ExerciseMovement[] = [
  { id: 'tc_beginner_1', name: 'Tai Chi Basics', description: 'Foundation movements for beginners', duration: 15, category: 'tai_chi', level: 'beginner', caloriesBurned: 80, benefits: ['Balance', 'Coordination', 'Relaxation'], instructions: ['Learn basic stance', 'Practice arm movements', 'Slow coordinated movements', 'Breathe naturally'], precautions: ['Move slowly', 'Stop if dizzy'], tags: ['basics', 'beginner', 'foundation'], arEnvironment: 'zen_garden', arPoseDetection: true },
  { id: 'tc_forms', name: 'Short Form Practice', description: 'Simplified Tai Chi form', duration: 20, category: 'tai_chi', level: 'beginner', caloriesBurned: 100, benefits: ['Flow', 'Meditation', 'Health'], instructions: ['Learn sequence', 'Connect movements', 'Maintain flow', 'Breathe deeply'], precautions: ['Consult doctor', 'Modify if needed'], tags: ['form', 'sequence', 'flow'], arEnvironment: 'forest', arPoseDetection: true },
  { id: 'tc_balance', name: 'Balance Focus', description: 'Balance-improving Tai Chi', duration: 18, category: 'tai_chi', level: 'intermediate', caloriesBurned: 90, benefits: ['Balance', 'Stability', 'Focus'], instructions: ['Single leg stands', 'Weight shifting', 'Eyes closed practice', 'Controlled movements'], precautions: ['Have support', 'Move slowly'], tags: ['balance', 'stability', 'focus'], arEnvironment: 'mountain', arPoseDetection: true },
  { id: 'tc_stress', name: 'Stress Relief Tai Chi', description: 'Calming Tai Chi routine', duration: 20, category: 'tai_chi', level: 'beginner', caloriesBurned: 85, benefits: ['Stress relief', 'Calm', 'Relaxation'], instructions: ['Slow movements', 'Deep breathing', 'Release tension', 'Find peace'], precautions: ['Breathe naturally', 'Stay relaxed'], tags: ['stress', 'calm', 'relaxation'], arEnvironment: 'moon_garden', arPoseDetection: false },
  { id: 'tc_energy', name: 'Energy Building', description: 'Vitality-increasing Tai Chi', duration: 22, category: 'tai_chi', level: 'intermediate', caloriesBurned: 110, benefits: ['Energy', 'Vitality', 'Circulation'], instructions: ['Upward movements', 'Open chest', 'Deep breathing', 'Build energy'], precautions: ['Stop if tired', 'Rest when needed'], tags: ['energy', 'vitality', 'circulation'], arEnvironment: 'sunrise', arPoseDetection: false },
  { id: 'tc_joint', name: 'Joint Mobility', description: 'Gentle joint movements', duration: 15, category: 'tai_chi', level: 'beginner', caloriesBurned: 60, benefits: ['Joint health', 'Mobility', 'Flexibility'], instructions: ['Circle joints', 'Gentle movements', 'Full range', 'No strain'], precautions: ['No force', 'Gentle only'], tags: ['joints', 'mobility', 'gentle'], arEnvironment: 'garden', arPoseDetection: true },
  { id: 'tc_morning', name: 'Morning Wake-Up', description: 'Energizing morning routine', duration: 12, category: 'tai_chi', level: 'beginner', caloriesBurned: 70, benefits: ['Awakening', 'Energy', 'Focus'], instructions: ['Sun movements', 'Arm stretches', 'Activation', 'Morning breath'], precautions: ['Wake body gently', 'No strain'], tags: ['morning', 'energy', 'wake up'], arEnvironment: 'sunrise', arPoseDetection: false },
  { id: 'tc_evening', name: 'Evening Wind Down', description: 'Relaxing evening practice', duration: 18, category: 'tai_chi', level: 'beginner', caloriesBurned: 75, benefits: ['Relaxation', 'Sleep prep', 'Release'], instructions: ['Slow movements', 'Downward focus', 'Release', 'Prepare for rest'], precautions: ['Very slow', 'Relaxed pace'], tags: ['evening', 'relaxation', 'sleep'], arEnvironment: 'sunset', arPoseDetection: false },
  { id: 'tc_standing', name: 'Standing Meditation', description: 'Quiet standing practice', duration: 15, category: 'tai_chi', level: 'intermediate', caloriesBurned: 50, benefits: ['Stillness', 'Grounding', 'Strength'], instructions: ['Stand quietly', 'Weight evenly', 'Breathe naturally', 'Stillness'], precautions: ['Have support', 'Stop if uncomfortable'], tags: ['standing', 'meditation', 'stillness'], arEnvironment: 'mountain', arPoseDetection: false },
  { id: 'tc_partner', name: 'Partner Exercise', description: 'Two-person Tai Chi', duration: 20, category: 'tai_chi', level: 'advanced', caloriesBurned: 95, benefits: ['Connection', 'Coordination', 'Fun'], instructions: ['Face partner', 'Mirror movements', 'Coordinate', 'Flow together'], precautions: ['Communicate', 'Go slowly'], tags: ['partner', 'connection', 'social'], arEnvironment: 'dojo', arPoseDetection: false },
  { id: 'tc_sword', name: 'Sword Form', description: 'Tai Chi with sword', duration: 25, category: 'tai_chi', level: 'advanced', caloriesBurned: 130, benefits: ['Focus', 'Grace', 'Coordination'], instructions: ['Hold sword', 'Learn movements', 'Flow with sword', 'Coordinate breath'], precautions: ['Safe space', 'Sharp objects'], tags: ['sword', 'advanced', 'grace'], arEnvironment: 'temple', arPoseDetection: false },
  { id: 'tc_fan', name: 'Fan Dance', description: 'Tai Chi with fan', duration: 20, category: 'tai_chi', level: 'intermediate', caloriesBurned: 100, benefits: ['Grace', 'Flow', 'Creativity'], instructions: ['Hold fan', 'Fan movements', 'Flow', 'Express'], precautions: ['Space needed', 'Delicate fan'], tags: ['fan', 'grace', 'creative'], arEnvironment: 'garden', arPoseDetection: false },

  // Qigong (12)
  { id: 'qg_standing', name: 'Standing Qigong', description: 'Foundation standing practice', duration: 15, category: 'qigong', level: 'beginner', caloriesBurned: 60, benefits: ['Energy cultivation', 'Grounding', 'Health'], instructions: ['Stand properly', 'Collect energy', 'Breathe into dantian', 'Hold positions'], precautions: ['Warm up first', 'Do not strain'], tags: ['standing', 'basics', 'energy'], arEnvironment: 'forest', arPoseDetection: false },
  { id: 'qg_moving', name: 'Moving Qigong', description: 'Gentle flowing movements', duration: 20, category: 'qigong', level: 'beginner', caloriesBurned: 90, benefits: ['Flow', 'Energy movement', 'Relaxation'], instructions: ['Move slowly', 'Guide energy', 'Arm movements', 'Breathe'], precautions: ['Smooth movements', 'No jerks'], tags: ['moving', 'flow', 'gentle'], arEnvironment: 'forest', arPoseDetection: true },
  { id: 'qg_healing', name: 'Healing Qigong', description: 'Self-healing practice', duration: 25, category: 'qigong', level: 'intermediate', caloriesBurned: 85, benefits: ['Healing', 'Recovery', 'Vitality'], instructions: ['Focus on organs', 'Specific movements', 'Energy to areas', 'Healing intent'], precautions: ['Stay calm', 'Rest if tired'], tags: ['healing', 'recovery', 'organs'], arEnvironment: 'healing_temple', arPoseDetection: false },
  { id: 'qg_morning', name: 'Morning Qigong', description: 'Wake up with energy', duration: 15, category: 'qigong', level: 'beginner', caloriesBurned: 80, benefits: ['Energy', 'Awakening', 'Vitality'], instructions: ['Sun movements', 'Wake body', 'Activate qi', 'Morning routine'], precautions: ['Gentle start', 'Breathe deep'], tags: ['morning', 'energy', 'wake up'], arEnvironment: 'sunrise', arPoseDetection: false },
  { id: 'qg_stress', name: 'Stress Release Qigong', description: 'Let go of tension', duration: 20, category: 'qigong', level: 'beginner', caloriesBurned: 75, benefits: ['Stress release', 'Tension let go', 'Calm'], instructions: ['Shake body', 'Release down', 'Let go', 'Breathe out'], precautions: ['Controlled', 'Noforce'], tags: ['stress', 'release', 'calm'], arEnvironment: 'moon_garden', arPoseDetection: false },
  { id: 'qg_immune', name: 'Immune Boost', description: 'Strengthen immunity', duration: 20, category: 'qigong', level: 'intermediate', caloriesBurned: 85, benefits: ['Immune', 'Health', 'Defense'], instructions: ['Rub hands', 'Face movements', 'Neck exercises', 'Boost defense'], precautions: ['Gentle', 'Consistent'], tags: ['immune', 'health', 'defense'], arEnvironment: 'forest', arPoseDetection: false },
  { id: 'qg_digestion', name: 'Digestive Qigong', description: 'Support digestion', duration: 15, category: 'qigong', level: 'beginner', caloriesBurned: 65, benefits: ['Digestion', 'Stomach health', 'Comfort'], instructions: ['Abdominal massage', 'Clockwise circles', 'Breath into belly', 'After meals'], precautions: ['After eating', 'Gentle only'], tags: ['digestion', 'stomach', 'comfort'], arEnvironment: 'garden', arPoseDetection: false },
  { id: 'qg_sleep', name: 'Sleep Preparation', description: 'Evening qigong', duration: 18, category: 'qigong', level: 'beginner', caloriesBurned: 60, benefits: ['Sleep prep', 'Calm', 'Release'], instructions: ['Slow movements', 'Downward energy', 'Relax', 'Prepare rest'], precautions: ['Very slow', 'Relaxed'], tags: ['sleep', 'evening', 'calm'], arEnvironment: 'moonlight', arPoseDetection: false },
  { id: 'qg_bone', name: 'Bone Health', description: 'Bone-strengthening practice', duration: 20, category: 'qigong', level: 'intermediate', caloriesBurned: 90, benefits: ['Bone health', 'Strength', 'Density'], instructions: ['Stamping', 'Weight bearing', 'Bone focus', 'Strengthen'], precautions: ['Careful', 'Build gradually'], tags: ['bones', 'strength', 'health'], arEnvironment: 'mountain', arPoseDetection: false },
  { id: 'qg_eyes', name: 'Eye Health', description: 'Eye relaxation practice', duration: 12, category: 'qigong', level: 'beginner', caloriesBurned: 40, benefits: ['Eye health', 'Relaxation', 'Vision'], instructions: ['Rub hands', 'Warm eyes', 'Look around', 'Palming'], precautions: ['Gentle', 'No strain'], tags: ['eyes', 'vision', 'relaxation'], arEnvironment: 'garden', arPoseDetection: false },
  { id: 'qg_spine', name: 'Spine Health', description: 'Spine mobility', duration: 18, category: 'qigong', level: 'intermediate', caloriesBurned: 80, benefits: ['Spine health', 'Flexibility', 'Posture'], instructions: ['Spine waves', 'Cat-cow', 'Twists', 'Lengthen'], precautions: ['No twisting pain', 'Gentle'], tags: ['spine', 'flexibility', 'posture'], arEnvironment: 'forest', arPoseDetection: true },
  { id: 'qg_chi', name: 'Chi Ball', description: 'Energy ball practice', duration: 20, category: 'qigong', level: 'intermediate', caloriesBurned: 95, benefits: ['Energy', 'Power', 'Focus'], instructions: ['Create ball', 'Move energy', 'Expand', 'Contract'], precautions: ['Build slowly', 'Listen to body'], tags: ['chi', 'energy', 'power'], arEnvironment: 'energy_field', arPoseDetection: false },

  // Stretching (12)
  { id: 'stretch_morning', name: 'Morning Stretch', description: 'Wake up your body', duration: 10, category: 'stretching', level: 'beginner', caloriesBurned: 45, benefits: ['Awakening', 'Flexibility', 'Energy'], instructions: ['Start in bed', 'Gentle stretches', 'Full body', 'Gradual'], precautions: ['No bouncing', 'Gentle only'], tags: ['morning', 'wake up', 'gentle'], arEnvironment: 'sunrise', arPoseDetection: true },
  { id: 'stretch_full', name: 'Full Body Stretch', description: 'Complete stretching routine', duration: 20, category: 'stretching', level: 'beginner', caloriesBurned: 70, benefits: ['Flexibility', 'Range of motion', 'Relaxation'], instructions: ['All major muscle groups', 'Hold each stretch', 'Breathe', 'No bouncing'], precautions: ['Never bounce', 'Stop at pain'], tags: ['full body', 'flexibility', 'complete'], arEnvironment: 'studio', arPoseDetection: true },
  { id: 'stretch_office', name: 'Office Desk Stretch', description: 'Combat desk tension', duration: 8, category: 'stretching', level: 'beginner', caloriesBurned: 30, benefits: ['Tension release', 'Posture', 'Comfort'], instructions: ['Neck rolls', 'Shoulder shrugs', 'Wrist circles', 'Back twist'], precautions: ['Chair stable', 'No strain'], tags: ['office', 'desk', 'work'], arEnvironment: 'office', arPoseDetection: false },
  { id: 'stretch_sleep', name: 'Bedtime Stretch', description: 'Relax before sleep', duration: 12, category: 'stretching', level: 'beginner', caloriesBurned: 40, benefits: ['Sleep prep', 'Relaxation', 'Release'], instructions: ['Gentle stretches', 'Calm movements', 'Breathing', 'Bed'], precautions: ['In bed', 'Very gentle'], tags: ['bedtime', 'sleep', 'relaxation'], arEnvironment: 'bedroom', arPoseDetection: false },
  { id: 'stretch_back', name: 'Back Pain Relief', description: 'Ease back tension', duration: 15, category: 'stretching', level: 'beginner', caloriesBurned: 50, benefits: ['Back relief', 'Pain reduction', 'Comfort'], instructions: ['Cat-cow', 'Childs pose', 'Gentle twist', 'Knee to chest'], precautions: ['Stop if pain', 'Gentle only'], tags: ['back', 'pain', 'relief'], arEnvironment: 'studio', arPoseDetection: true },
  { id: 'stretch_hip', name: 'Hip Opener', description: 'Release hip tension', duration: 18, category: 'stretching', level: 'intermediate', caloriesBurned: 65, benefits: ['Hip flexibility', 'Release', 'Mobility'], instructions: ['Lunges', 'Pigeon', 'Butterfly', 'Deep stretches'], precautions: ['Warm up first', 'No forcing'], tags: ['hips', 'flexibility', 'mobility'], arEnvironment: 'studio', arPoseDetection: true },
  { id: 'stretch_neck', name: 'Neck & Shoulder', description: 'Release neck tension', duration: 10, category: 'stretching', level: 'beginner', caloriesBurned: 35, benefits: ['Neck relief', 'Shoulder release', 'Comfort'], instructions: ['Neck rolls', 'Shoulder shrugs', 'Ear to shoulder', 'Chin to chest'], precautions: ['Very gentle', 'No force'], tags: ['neck', 'shoulders', 'tension'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'stretch_legs', name: 'Leg Stretch', description: 'Lower body flexibility', duration: 15, category: 'stretching', level: 'beginner', caloriesBurned: 55, benefits: ['Leg flexibility', 'Range of motion', 'Recovery'], instructions: ['Hamstrings', 'Quadriceps', 'Calves', 'Inner thigh'], precautions: ['Warm up', 'Hold do not bounce'], tags: ['legs', 'flexibility', 'lower body'], arEnvironment: 'studio', arPoseDetection: true },
  { id: 'stretch_sports', name: 'Pre-Sport Warmup', description: 'Warm up before activity', duration: 10, category: 'stretching', level: 'beginner', caloriesBurned: 60, benefits: ['Warm up', 'Prevent injury', 'Performance'], instructions: ['Light cardio', 'Dynamic stretches', 'Sport specific', 'Gradual intensity'], precautions: ['Dynamic not static', 'Build intensity'], tags: ['warmup', 'sports', 'dynamic'], arEnvironment: 'gym', arPoseDetection: false },
  { id: 'stretch_recovery', name: 'Post-Workout Recovery', description: 'Cool down stretching', duration: 12, category: 'stretching', level: 'beginner', caloriesBurned: 45, benefits: ['Recovery', 'Reduce soreness', 'Flexibility'], instructions: ['Light walking', 'Gentle stretches', 'Focus on worked muscles', 'Breathe'], precautions: ['After workout', 'Very gentle'], tags: ['recovery', 'cooldown', 'soreness'], arEnvironment: 'gym', arPoseDetection: false },
  { id: 'stretch_senior', name: 'Gentle Senior Stretch', description: 'Safe stretching for seniors', duration: 15, category: 'stretching', level: 'beginner', caloriesBurned: 35, benefits: ['Mobility', 'Safety', 'Comfort'], instructions: ['Chair support', 'Very gentle', 'Slow movements', 'Breathe'], precautions: ['Have support', 'Very gentle', 'Stop if dizzy'], tags: ['senior', 'gentle', 'safe'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'stretch_deep', name: 'Deep Stretch', description: 'Intensive flexibility work', duration: 25, category: 'stretching', level: 'advanced', caloriesBurned: 90, benefits: ['Deep flexibility', 'Progress', 'Range'], instructions: ['Long holds', 'Deep breathing', 'Edge of stretch', 'Relax into it'], precautions: ['Experienced only', 'Never pain'], tags: ['deep', 'intensive', 'advanced'], arEnvironment: 'studio', arPoseDetection: true },

  // Walking Meditation (8)
  { id: 'walk_mindful', name: 'Mindful Walking', description: 'Present moment walking', duration: 20, category: 'walking', level: 'beginner', caloriesBurned: 100, benefits: ['Mindfulness', 'Movement', 'Nature'], instructions: ['Slow walk', 'Feel each step', 'Notice surroundings', 'Stay present'], precautions: ['Safe path', 'Watch where'], tags: ['mindful', 'present', 'awareness'], arEnvironment: 'forest', arPoseDetection: false },
  { id: 'walk_nature', name: 'Nature Connection', description: 'Walk with nature awareness', duration: 25, category: 'walking', level: 'beginner', caloriesBurned: 120, benefits: ['Nature connection', 'Grounding', 'Peace'], instructions: ['Notice nature', 'All senses', 'Breathe', 'Connect'], precautions: ['Nature path', 'Appropriate'], tags: ['nature', 'grounding', 'senses'], arEnvironment: 'forest', arPoseDetection: false },
  { id: 'walk_gratitude', name: 'Gratitude Walk', description: 'Walking with gratitude', duration: 20, category: 'walking', level: 'beginner', caloriesBurned: 95, benefits: ['Gratitude', 'Positive', 'Movement'], instructions: ['While walking', 'Think gratitude', 'Notice blessings', 'Feel good'], precautions: ['Safe area', 'Traffic'], tags: ['gratitude', 'positive', 'appreciation'], arEnvironment: 'garden', arPoseDetection: false },
  { id: 'walk_intention', name: 'Intention Setting', description: 'Walk with purpose', duration: 15, category: 'walking', level: 'beginner', caloriesBurned: 75, benefits: ['Clarity', 'Focus', 'Direction'], instructions: ['Set intention', 'Walk with purpose', 'Feel direction', 'Manifest'], precautions: ['Safe path', 'Clear head'], tags: ['intention', 'purpose', 'focus'], arEnvironment: 'path', arPoseDetection: false },
  { id: 'walk_energy', name: 'Energy Walk', description: 'Energizing walking', duration: 20, category: 'walking', level: 'beginner', caloriesBurned: 130, benefits: ['Energy', 'Vitality', 'Alertness'], instructions: ['Brisk pace', 'Arm swing', 'Deep breathing', 'Build energy'], precautions: ['Comfortable pace', 'Do not overdo'], tags: ['energy', 'vitality', 'brisk'], arEnvironment: 'trail', arPoseDetection: false },
  { id: 'walk_meditation', name: 'Walking Meditation', description: 'Traditional walking meditation', duration: 30, category: 'walking', level: 'intermediate', caloriesBurned: 110, benefits: ['Meditation', 'Movement', 'Focus'], instructions: ['Very slow', 'Step by step', 'Full attention', 'Each footfall'], precautions: ['Private space', 'No obstacles'], tags: ['meditation', 'traditional', 'slow'], arEnvironment: 'zen_garden', arPoseDetection: false },
  { id: 'walk_breath', name: 'Breath Walking', description: 'Walking with breath focus', duration: 20, category: 'walking', level: 'beginner', caloriesBurned: 100, benefits: ['Breath focus', 'Calm', 'Combination'], instructions: ['Natural breath', 'Sync steps', 'Breathe', 'Calm'], precautions: ['Comfortable', 'Not rushed'], tags: ['breath', 'combination', 'calm'], arEnvironment: 'park', arPoseDetection: false },
  { id: 'walk_interval', name: 'Interval Walking', description: 'Fast and slow intervals', duration: 25, category: 'walking', level: 'intermediate', caloriesBurned: 160, benefits: ['Cardio', 'Variety', 'Calories'], instructions: ['Warm up', 'Fast intervals', 'Slow recovery', 'Repeat'], precautions: ['Cardio health', 'Build gradually'], tags: ['interval', 'cardio', 'intensity'], arEnvironment: 'trail', arPoseDetection: false },

  // Chair Exercises (8)
  { id: 'chair_seated', name: 'Seated Full Body', description: 'Exercise while seated', duration: 15, category: 'chair', level: 'beginner', caloriesBurned: 50, benefits: ['Seated exercise', 'Full body', 'Accessible'], instructions: ['Sit tall', 'Arm movements', 'Leg lifts', 'Core engagement'], precautions: ['Stable chair', 'No sliding'], tags: ['seated', 'accessible', 'office'], arEnvironment: 'office', arPoseDetection: false },
  { id: 'chair_office', name: 'Office Chair Workout', description: 'Workday exercise', duration: 10, category: 'chair', level: 'beginner', caloriesBurned: 40, benefits: ['Break from work', 'Energy', 'Circulation'], instructions: ['Seated marches', 'Chair squats', 'Arm circles', 'Torso twists'], precautions: ['Stable chair', 'Work-friendly'], tags: ['office', 'work', 'break'], arEnvironment: 'office', arPoseDetection: false },
  { id: 'chair_senior', name: 'Senior Chair Exercise', description: 'Safe seated exercise', duration: 15, category: 'chair', level: 'beginner', caloriesBurned: 35, benefits: ['Senior fitness', 'Safety', 'Mobility'], instructions: ['Gentle movements', 'Support', 'Slow pace', 'Breathe'], precautions: ['Have support', 'Gentle'], tags: ['senior', 'gentle', 'safety'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'chair_stretch', name: 'Seated Stretching', description: 'Seated stretch routine', duration: 12, category: 'chair', level: 'beginner', caloriesBurned: 30, benefits: ['Flexibility', 'Release', 'Relaxation'], instructions: ['Seated stretches', 'Neck', 'Shoulders', 'Arms', 'Back'], precautions: ['Stable chair', 'Gentle'], tags: ['stretching', 'seated', 'gentle'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'chair_balance', name: 'Seated Balance', description: 'Balance while seated', duration: 10, category: 'chair', level: 'beginner', caloriesBurned: 25, benefits: ['Balance', 'Core', 'Stability'], instructions: ['Sit tall', 'Lift leg', 'Arm opposite', 'Hold'], precautions: ['Near support', 'Start easy'], tags: ['balance', 'core', 'stability'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'chair_cardio', name: 'Seated Cardio', description: 'Heart-healthy sitting', duration: 15, category: 'chair', level: 'intermediate', caloriesBurned: 65, benefits: ['Cardio', 'Heart health', 'Energy'], instructions: ['Seated jumping', 'High knees', 'Arm pumps', 'Build heart rate'], precautions: ['Doctor approval', 'Start slow'], tags: ['cardio', 'heart', 'intensity'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'chair_strength', name: 'Seated Strength', description: 'Build strength while sitting', duration: 18, category: 'chair', level: 'intermediate', caloriesBurned: 70, benefits: ['Strength', 'Muscle', 'Endurance'], instructions: ['Leg presses', 'Arm curls', 'Core work', 'Progressive'], precautions: ['Good posture', 'Controlled'], tags: ['strength', 'muscle', 'building'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'chair_recovery', name: 'Recovery Chair', description: 'Gentle recovery movement', duration: 10, category: 'chair', level: 'beginner', caloriesBurned: 25, benefits: ['Recovery', 'Gentle', 'Circulation'], instructions: ['Gentle movement', 'Shake out', 'Circulation', 'Rest'], precautions: ['Very gentle', 'Comfort'], tags: ['recovery', 'gentle', 'rest'], arEnvironment: 'home', arPoseDetection: false },

  // HIIT (6)
  { id: 'hiit_beginner', name: 'Beginner HIIT', description: 'Start with intervals', duration: 15, category: 'hiit', level: 'beginner', caloriesBurned: 150, benefits: ['Start fitness', 'Build endurance', 'Confidence'], instructions: ['Warm up', 'Work 20 sec', 'Rest 40 sec', '8 rounds'], precautions: ['Doctor approval', 'Stop if dizzy'], tags: ['beginner', 'start', 'intervals'], arEnvironment: 'gym', arPoseDetection: false },
  { id: 'hiit_full', name: 'Full Body HIIT', description: 'Complete HIIT workout', duration: 20, category: 'hiit', level: 'intermediate', caloriesBurned: 250, benefits: ['Full body', 'Calories', 'Endurance'], instructions: ['Warm up', 'Various exercises', 'High intensity', 'Cool down'], precautions: ['Fit baseline', 'Stay hydrated'], tags: ['full body', 'intense', 'calories'], arEnvironment: 'gym', arPoseDetection: false },
  { id: 'hiit_low', name: 'Low Impact HIIT', description: 'Joint-friendly intensity', duration: 18, category: 'hiit', level: 'beginner', caloriesBurned: 180, benefits: ['Low impact', 'Joint friendly', 'Effective'], instructions: ['No jumping', 'Controlled', 'Maintain form', 'Effective'], precautions: ['Joint issues', 'Take breaks'], tags: ['low impact', 'joints', 'gentle'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'hiit_tabata', name: 'Tabata', description: 'Classic 20/10 protocol', duration: 12, category: 'hiit', level: 'intermediate', caloriesBurned: 200, benefits: ['Tabata', 'Protocol', 'Classic'], instructions: ['20 sec work', '10 sec rest', '8 rounds', 'Total 4 min'], precautions: ['High intensity', 'Only 4 min'], tags: ['tabata', 'classic', 'protocol'], arEnvironment: 'gym', arPoseDetection: false },
  { id: 'hiit_emom', name: 'EMOM Workout', description: 'Every minute on the minute', duration: 20, category: 'hiit', level: 'advanced', caloriesBurned: 280, benefits: ['Timing', 'Consistency', 'Challenge'], instructions: ['Each minute', '60 sec work', 'Rest remainder', '20 min'], precautions: ['Advanced', 'Experienced only'], tags: ['emom', 'timing', 'advanced'], arEnvironment: 'gym', arPoseDetection: false },
  { id: 'hiit_mindful', name: 'Mindful HIIT', description: 'High intensity with awareness', duration: 18, category: 'hiit', level: 'intermediate', caloriesBurned: 200, benefits: ['Mind-body', 'Awareness', 'Effective'], instructions: ['Breathe focus', 'Full awareness', 'Work', 'Connect'], precautions: ['Balance', 'Listen to body'], tags: ['mindful', 'awareness', 'combination'], arEnvironment: 'studio', arPoseDetection: false },

  // Bodyweight (10)
  { id: 'bw_beginner', name: 'Bodyweight Basics', description: 'Fundamental movements', duration: 20, category: 'bodyweight', level: 'beginner', caloriesBurned: 120, benefits: ['Foundation', 'Strength', 'Start'], instructions: ['Squats', 'Pushups', 'Lunges', 'Plank'], precautions: ['Form first', 'No weight'], tags: ['basics', 'foundation', 'start'], arEnvironment: 'home', arPoseDetection: true },
  { id: 'bw_no_squat', name: 'No-Squat Legs', description: 'Legs without squats', duration: 18, category: 'bodyweight', level: 'beginner', caloriesBurned: 110, benefits: ['Legs', 'No squat', 'Alternative'], instructions: ['Lunges', 'Glute bridges', 'Step ups', 'Calf raises'], precautions: ['Balance', 'Support'], tags: ['legs', 'alternative', 'no squat'], arEnvironment: 'home', arPoseDetection: true },
  { id: 'bw_push', name: 'Push Workout', description: 'Upper body pushing', duration: 15, category: 'bodyweight', level: 'beginner', caloriesBurned: 100, benefits: ['Push strength', 'Chest', 'Triceps'], instructions: ['Pushups', 'Diamond', 'Pike', 'Dips'], precautions: ['Modify if needed', 'Form'], tags: ['push', 'upper body', 'chest'], arEnvironment: 'home', arPoseDetection: true },
  { id: 'bw_pull', name: 'Pull Workout', description: 'Upper body pulling', duration: 15, category: 'bodyweight', level: 'intermediate', caloriesBurned: 95, benefits: ['Pull strength', 'Back', 'Biceps'], instructions: ['Inverted rows', 'Door rows', 'Superman', 'Reverse fly'], precautions: ['No pullup bar needed', 'Modify'], tags: ['pull', 'upper body', 'back'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'bw_core', name: 'Core Crusher', description: 'Abdominal focus', duration: 12, category: 'bodyweight', level: 'beginner', caloriesBurned: 90, benefits: ['Core', 'Abs', 'Stability'], instructions: ['Crunches', 'Plank', 'Leg raises', 'Russian twists'], precautions: ['Lower back', 'Form'], tags: ['core', 'abs', 'stability'], arEnvironment: 'home', arPoseDetection: true },
  { id: 'bw_full', name: 'Full Body Flow', description: 'Complete bodyweight workout', duration: 25, category: 'bodyweight', level: 'intermediate', caloriesBurned: 200, benefits: ['Full body', 'Flow', 'Complete'], instructions: ['Warm up', 'Full circuit', 'All muscle groups', 'Cool down'], precautions: ['Experience', 'Form'], tags: ['full body', 'complete', 'circuit'], arEnvironment: 'home', arPoseDetection: true },
  { id: 'bw_isometric', name: 'Isometric Hold', description: 'Strength through stillness', duration: 15, category: 'bodyweight', level: 'intermediate', caloriesBurned: 80, benefits: ['Isometric', 'Strength', 'Control'], instructions: ['Wall sit', 'Plank hold', 'Lunge hold', 'Hold each'], precautions: ['Hold breath', 'Time under tension'], tags: ['isometric', 'holds', 'strength'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'bw_cardio', name: 'Bodyweight Cardio', description: 'Cardio without equipment', duration: 20, category: 'bodyweight', level: 'intermediate', caloriesBurned: 220, benefits: ['Cardio', 'No equipment', 'Heart'], instructions: ['Jumping jacks', 'Burpees', 'Mountain climbers', 'High knees'], precautions: ['Joint friendly', 'Modify'], tags: ['cardio', 'no equipment', 'heart'], arEnvironment: 'home', arPoseDetection: false },
  { id: 'bw_mobility', name: 'Mobility Flow', description: 'Movement and flexibility', duration: 20, category: 'bodyweight', level: 'beginner', caloriesBurned: 70, benefits: ['Mobility', 'Movement', 'Flexibility'], instructions: ['Hip circles', 'Arm sweeps', 'Spinal waves', 'Deep movement'], precautions: ['Pain-free', 'Gentle'], tags: ['mobility', 'movement', 'flexibility'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'bw_develop', name: 'Progressive Bodyweight', description: 'Build to advanced', duration: 25, category: 'bodyweight', level: 'advanced', caloriesBurned: 250, benefits: ['Progression', 'Advanced', 'Mastery'], instructions: ['Plan pushup', 'Pistol squat', 'Muscle up', 'Advanced'], precautions: ['Years of training', 'Expert only'], tags: ['progressive', 'advanced', 'mastery'], arEnvironment: 'gym', arPoseDetection: true },

  // Dance (8)
  { id: 'dance_free', name: 'Free Movement', description: 'Express yourself freely', duration: 15, category: 'dance', level: 'beginner', caloriesBurned: 120, benefits: ['Expression', 'Joy', 'Freedom'], instructions: ['Play music', 'Move naturally', 'Express', 'No rules'], precautions: ['Space', 'No judgment'], tags: ['free', 'expression', 'joy'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'dance_energy', name: 'Energy Dance', description: 'High energy dance', duration: 20, category: 'dance', level: 'intermediate', caloriesBurned: 250, benefits: ['Energy', 'Cardio', 'Fun'], instructions: ['Upbeat music', 'Full body', 'Dance moves', 'High energy'], precautions: ['Hydration', 'Space'], tags: ['energy', 'cardio', 'fun'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'dance_calm', name: 'Gentle Dance', description: 'Slow mindful movement', duration: 20, category: 'dance', level: 'beginner', caloriesBurned: 80, benefits: ['Calm', 'Mindful', 'Gentle'], instructions: ['Slow music', 'Gentle movement', 'Flow', 'Mindful'], precautions: ['Gentle', 'No strain'], tags: ['gentle', 'mindful', 'slow'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'dance_therapy', name: 'Dance Therapy', description: 'Healing through movement', duration: 25, category: 'dance', level: 'beginner', caloriesBurned: 100, benefits: ['Healing', 'Expression', 'Emotions'], instructions: ['Process emotions', 'Move freely', 'Heal', 'Express'], precautions: ['Safe space', 'Private'], tags: ['therapy', 'healing', 'emotions'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'dance_party', name: 'Dance Party', description: 'Fun party workout', duration: 20, category: 'dance', level: 'intermediate', caloriesBurned: 220, benefits: ['Fun', 'Party', 'Workout'], instructions: ['Upbeat', 'Fun moves', 'Dance', 'Enjoy'], precautions: ['Space', 'Hydration'], tags: ['party', 'fun', 'upbeat'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'dance_latin', name: 'Latin Vibes', description: 'Latin-inspired movement', duration: 20, category: 'dance', level: 'intermediate', caloriesBurned: 200, benefits: ['Latin', 'Rhythm', 'Culture'], instructions: ['Latin rhythm', 'Hip movements', 'Dance', 'Feel music'], precautions: ['Partner optional', 'Space'], tags: ['latin', 'rhythm', 'dance'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'dance_bollywood', name: 'Bollywood Dance', description: 'Indian dance workout', duration: 20, category: 'dance', level: 'intermediate', caloriesBurned: 180, benefits: ['Bollywood', 'Culture', 'Fun'], instructions: ['Bollywood music', 'Expressive moves', 'Full body', 'Enjoy'], precautions: ['Space', 'Hydration'], tags: ['bollywood', 'indian', 'fun'], arEnvironment: 'studio', arPoseDetection: false },
  { id: 'dance_zumba', name: 'Zumba Style', description: 'Latin-inspired fitness', duration: 20, category: 'dance', level: 'beginner', caloriesBurned: 200, benefits: ['Zumba', 'Fitness', 'Fun'], instructions: ['Latin beats', 'Easy moves', 'Dance', 'Fitness'], precautions: ['Hydration', 'Modification'], tags: ['zumba', 'latin', 'fitness'], arEnvironment: 'studio', arPoseDetection: false },
];

// ============================================================================
// Search Functions
// ============================================================================

// Placeholder search functions - to be implemented
export function searchBreathingExercises(query: string): BreathingExercise[] {
  return BREATHING_EXERCISES;
}

export function searchSleepContent(query: string): SleepContent[] {
  return SLEEP_CONTENT;
}

export function searchExerciseMovements(query: string): ExerciseMovement[] {
  return [];
}

export function getRecommendedBreathing(timeOfDay: string, mood: string): BreathingExercise[] {
  return BREATHING_EXERCISES.slice(0, 3);
}

export function getRecommendedSleep(mood: string, time: string): SleepContent[] {
  return SLEEP_CONTENT.slice(0, 3);
}

export function getRecommendedExercise(fitnessLevel: string, timeAvailable: number): ExerciseMovement[] {
  return [];
}

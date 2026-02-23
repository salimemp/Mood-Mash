// ============================================================================
// Recommendations Engine & Smart Notifications
// MoodMash - Personalized suggestions and intelligent alerts
// ============================================================================

import type {
  RecommendationEngineInput,
  UserRecommendation,
  NotificationPreference,
  SmartNotification,
  InterventionTrigger,
  InterventionExecution,
  ChatMessage,
  ChatConversation
} from '../types/advanced';

// ============================================================================
// Personalized Recommendations Engine
// ============================================================================

export class RecommendationsEngine {
  private interventionConfig: Map<string, Record<string, unknown>>;

  constructor() {
    this.interventionConfig = new Map();
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(input: RecommendationEngineInput): Promise<UserRecommendation[]> {
    const recommendations: UserRecommendation[] = [];

    // Mood-based recommendations
    if (input.current_mood) {
      const moodRecs = this.getMoodRecommendations(input.current_mood, input.user_id || '', input.time_context);
      recommendations.push(...moodRecs);
    }

    // Sleep-based recommendations
    if (input.sleep_quality) {
      const sleepRecs = this.getSleepRecommendations(input.sleep_quality, input.user_id || '');
      recommendations.push(...sleepRecs);
    }

    // Activity-based recommendations
    if (input.activity_level) {
      const activityRecs = this.getActivityRecommendations(input.activity_level, input.user_id || '');
      recommendations.push(...activityRecs);
    }

    // Goal-based recommendations
    if (input.goals && input.goals.length > 0) {
      const goalRecs = this.getGoalRecommendations(input.goals, input.user_id || '');
      recommendations.push(...goalRecs);
    }

    // Time-based recommendations
    if (input.time_context) {
      const timeRecs = this.getTimeBasedRecommendations(input.time_context, input.user_id || '');
      recommendations.push(...timeRecs);
    }

    // Score and sort recommendations
    return this.scoreAndSortRecommendations(recommendations, input);
  }

  /**
   * Get recommendations based on current mood
   */
  private getMoodRecommendations(
    mood: string,
    userId: string,
    timeContext?: RecommendationEngineInput['time_context']
  ): UserRecommendation[] {
    const recommendations: UserRecommendation[] = [];

    const moodActionMap: Record<string, Array<{ type: string; title: string; description: string; category: string }>> = {
      'anxious': [
        { type: 'activity', title: 'Try Deep Breathing', description: '5 minutes of box breathing to calm your nervous system', category: 'breathing' },
        { type: 'intervention', title: 'Grounding Exercise', description: 'Use the 5-4-3-2-1 technique to feel present', category: 'mindfulness' },
        { type: 'content', title: 'Calming Music', description: 'Listen to our curated calming playlist', category: 'music' }
      ],
      'stressed': [
        { type: 'activity', title: 'Quick Walk', description: 'A 10-minute walk can reduce stress hormones', category: 'exercise' },
        { type: 'intervention', title: 'Journaling Session', description: 'Write about what\'s causing stress to process emotions', category: 'journal' },
        { type: 'tip', title: 'Progressive Relaxation', description: 'Try progressive muscle relaxation', category: 'wellness' }
      ],
      'sad': [
        { type: 'intervention', title: 'Gratitude Practice', description: 'List 3 things you\'re grateful for', category: 'mindset' },
        { type: 'content', title: 'Inspirational Read', description: 'Read an uplifting article', category: 'reading' },
        { type: 'activity', title: 'Reach Out', description: 'Connect with a friend or family member', category: 'social' }
      ],
      'tired': [
        { type: 'tip', title: 'Hydration Break', description: 'Drink a glass of water for a quick energy boost', category: 'health' },
        { type: 'intervention', title: 'Power Nap', description: 'Consider a 20-minute power nap', category: 'rest' },
        { type: 'activity', title: 'Stretching', description: '5 minutes of stretching can increase energy', category: 'exercise' }
      ],
      'neutral': [
        { type: 'activity', title: 'Mood Boost Workout', description: 'Quick exercise to elevate your mood', category: 'exercise' },
        { type: 'content', title: 'Learn Something New', description: 'Discover a new skill or topic', category: 'growth' },
        { type: 'goal', title: 'Set a Daily Goal', description: 'Achieve something small today', category: 'productivity' }
      ]
    };

    const actions = moodActionMap[mood] || moodActionMap['neutral'];

    actions.forEach((action, index) => {
      recommendations.push({
        id: `mood_${mood}_${index}_${Date.now()}`,
        user_id: userId,
        recommendation_type: action.type as UserRecommendation['recommendation_type'],
        category: action.category,
        title: action.title,
        description: action.description,
        rationale: `Based on your current ${mood} mood`,
        priority_score: this.calculatePriority(mood, action.type),
        relevance_score: 0.8,
        estimated_impact: 'medium',
        action_url: `/${action.category}`,
        action_label: 'Try Now',
        created_at: new Date().toISOString()
      });
    });

    return recommendations;
  }

  /**
   * Get recommendations based on sleep quality
   */
  private getSleepRecommendations(sleep: RecommendationEngineInput['sleep_quality'], userId: string): UserRecommendation[] {
    const recommendations: UserRecommendation[] = [];

    if (!sleep) return recommendations;

    if (sleep.average_duration < 420) { // Less than 7 hours
      recommendations.push({
        id: `sleep_duration_${Date.now()}`,
        user_id: userId,
        recommendation_type: 'tip',
        category: 'sleep',
        title: 'Prioritize Sleep',
        description: 'Aim for 7-9 hours of sleep for optimal well-being',
        rationale: 'Your average sleep duration is below recommended levels',
        priority_score: 0.9,
        relevance_score: 0.85,
        estimated_impact: 'high',
        created_at: new Date().toISOString()
      });
    }

    if (sleep.quality_trend === 'declining') {
      recommendations.push({
        id: `sleep_trend_${Date.now()}`,
        user_id: userId,
        recommendation_type: 'intervention',
        category: 'sleep',
        title: 'Improve Sleep Hygiene',
        description: 'Establish a consistent bedtime routine',
        rationale: 'Your sleep quality has been declining',
        priority_score: 0.85,
        relevance_score: 0.8,
        estimated_impact: 'high',
        created_at: new Date().toISOString()
      });
    }

    if (sleep.debt_hours > 2) {
      recommendations.push({
        id: `sleep_debt_${Date.now()}`,
        user_id: userId,
        recommendation_type: 'tip',
        category: 'sleep',
        title: 'Recover Sleep Debt',
        description: 'Consider going to bed 30 minutes earlier',
        rationale: `You have ${sleep.debt_hours} hours of sleep debt`,
        priority_score: 0.75,
        relevance_score: 0.7,
        estimated_impact: 'medium',
        created_at: new Date().toISOString()
      });
    }

    return recommendations;
  }

  /**
   * Get recommendations based on activity level
   */
  private getActivityRecommendations(activity: RecommendationEngineInput['activity_level'], userId: string): UserRecommendation[] {
    const recommendations: UserRecommendation[] = [];

    if (!activity) return recommendations;

    if (activity.daily_steps < 5000) {
      recommendations.push({
        id: `activity_steps_${Date.now()}`,
        user_id: userId,
        recommendation_type: 'goal',
        category: 'activity',
        title: 'Increase Daily Steps',
        description: 'Try to reach 5,000 steps today',
        rationale: 'Your activity level is below optimal',
        priority_score: 0.8,
        relevance_score: 0.75,
        estimated_impact: 'medium',
        created_at: new Date().toISOString()
      });
    }

    if (activity.active_minutes < 30) {
      recommendations.push({
        id: `activity_minutes_${Date.now()}`,
        user_id: userId,
        recommendation_type: 'activity',
        category: 'exercise',
        title: 'Quick Exercise Session',
        description: 'A 15-minute workout can boost your mood',
        rationale: 'You\'ve had less than 30 minutes of activity',
        priority_score: 0.7,
        relevance_score: 0.7,
        estimated_impact: 'medium',
        created_at: new Date().toISOString()
      });
    }

    return recommendations;
  }

  /**
   * Get recommendations based on user goals
   */
  private getGoalRecommendations(goals: string[], userId: string): UserRecommendation[] {
    const recommendations: UserRecommendation[] = [];

    goals.forEach((goal, index) => {
      recommendations.push({
        id: `goal_${index}_${Date.now()}`,
        user_id: userId,
        recommendation_type: 'goal',
        category: 'productivity',
        title: `Progress on: ${goal}`,
        description: 'Small steps lead to big changes',
        rationale: `You've set "${goal}" as a goal`,
        priority_score: 0.6,
        relevance_score: 0.65,
        estimated_impact: 'medium',
        created_at: new Date().toISOString()
      });
    });

    return recommendations;
  }

  /**
   * Get time-based recommendations
   */
  private getTimeBasedRecommendations(time: RecommendationEngineInput['time_context'], userId: string): UserRecommendation[] {
    const recommendations: UserRecommendation[] = [];

    if (!time) return recommendations;

    // Early morning recommendations
    if (time.hour_of_day >= 5 && time.hour_of_day < 9) {
      if (!time.is_weekend) {
        recommendations.push({
          id: `morning_routine_${Date.now()}`,
          user_id: userId,
          recommendation_type: 'tip',
          category: 'routine',
          title: 'Start Your Day Right',
          description: 'Consider a morning mood check-in',
          rationale: 'Morning is a great time to set intentions',
          priority_score: 0.65,
          relevance_score: 0.6,
          estimated_impact: 'medium',
          created_at: new Date().toISOString()
        });
      }
    }

    // Evening recommendations
    if (time.hour_of_day >= 20 && time.hour_of_day < 23) {
      recommendations.push({
        id: `evening_reflect_${Date.now()}`,
        user_id: userId,
        recommendation_type: 'intervention',
        category: 'reflection',
        title: 'End-of-Day Reflection',
        description: 'Log your mood and review your day',
        rationale: 'Evening reflection improves self-awareness',
        priority_score: 0.6,
        relevance_score: 0.55,
        estimated_impact: 'medium',
        created_at: new Date().toISOString()
      });
    }

    return recommendations;
  }

  /**
   * Calculate priority score for a recommendation
   */
  private calculatePriority(mood: string, type: string): number {
    const moodPriority: Record<string, number> = {
      'anxious': 0.9,
      'stressed': 0.85,
      'sad': 0.8,
      'tired': 0.7,
      'neutral': 0.5
    };

    const typePriority: Record<string, number> = {
      'intervention': 0.9,
      'activity': 0.8,
      'goal': 0.7,
      'tip': 0.6,
      'content': 0.5
    };

    return (moodPriority[mood] || 0.5) * (typePriority[type] || 0.5) * 2;
  }

  /**
   * Score and sort recommendations
   */
  private scoreAndSortRecommendations(
    recommendations: UserRecommendation[],
    input: RecommendationEngineInput
  ): UserRecommendation[] {
    return recommendations
      .map(rec => ({
        ...rec,
        relevance_score: this.calculateRelevance(rec, input)
      }))
      .sort((a, b) => {
        // Sort by priority first, then relevance
        const priorityDiff = b.priority_score - a.priority_score;
        if (Math.abs(priorityDiff) > 0.1) return priorityDiff;
        return b.relevance_score - a.relevance_score;
      })
      .slice(0, 10); // Return top 10 recommendations
  }

  /**
   * Calculate relevance score for recommendation
   */
  private calculateRelevance(rec: UserRecommendation, input: RecommendationEngineInput): number {
    let relevance = rec.relevance_score;

    // Boost if matches current mood
    if (input.current_mood && rec.description.toLowerCase().includes(input.current_mood)) {
      relevance += 0.15;
    }

    // Boost if time is appropriate
    if (input.time_context) {
      const hour = input.time_context.hour_of_day;
      if (rec.category === 'sleep' && hour >= 20) {
        relevance += 0.1;
      }
      if (rec.category === 'exercise' && hour >= 6 && hour <= 20) {
        relevance += 0.1;
      }
    }

    return Math.min(relevance, 1);
  }
}

// ============================================================================
// Smart Notifications Service
// ============================================================================

export class SmartNotificationsService {
  private checkInterval: number = 60000; // Check every minute
  private intervalId: number | null = null;

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const response = await fetch(`/api/notifications/preferences?user_id=${userId}`);
      const data = await response.json();
      return data.preferences || [];
    } catch (error) {
      console.error('[Notifications] Error fetching preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreference[] {
    return [
      { user_id: userId, channel: 'app', notification_type: 'reminder', enabled: true, timing_preference: 'immediate', priority: 'medium' },
      { user_id: userId, channel: 'app', notification_type: 'insight', enabled: true, timing_preference: 'daily_digest', priority: 'low' },
      { user_id: userId, channel: 'app', notification_type: 'achievement', enabled: true, timing_preference: 'immediate', priority: 'medium' },
      { user_id: userId, channel: 'app', notification_type: 'risk_alert', enabled: true, timing_preference: 'immediate', priority: 'critical' },
      { user_id: userId, channel: 'email', notification_type: 'insight', enabled: true, timing_preference: 'weekly_digest', priority: 'low' }
    ];
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferences: NotificationPreference[]): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, preferences })
      });
      return response.ok;
    } catch (error) {
      console.error('[Notifications] Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Send a notification
   */
  async sendNotification(userId: string, notification: Omit<SmartNotification, 'id' | 'created_at'>): Promise<SmartNotification> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...notification })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Notifications] Error sending notification:', error);
      return {
        ...notification,
        id: `local_${Date.now()}`,
        user_id: userId,
        created_at: new Date().toISOString()
      };
    }
  }

  /**
   * Check and send smart notifications based on triggers
   */
  async checkAndSendNotifications(userId: string): Promise<void> {
    const preferences = await this.getPreferences(userId);

    // Check for various notification types
    await Promise.all([
      this.checkReminders(userId, preferences),
      this.checkInsights(userId, preferences),
      this.checkAchievements(userId, preferences),
      this.checkRiskAlerts(userId, preferences)
    ]);
  }

  /**
   * Check reminder notifications
   */
  private async checkReminders(userId: string, preferences: NotificationPreference[]): Promise<void> {
    const pref = preferences.find(p => p.notification_type === 'reminder' && p.enabled);
    if (!pref) return;

    // Check time-based reminders
    const hour = new Date().getHours();
    const shouldNotify = this.shouldSendNotification(pref, hour);

    if (shouldNotify) {
      await this.sendNotification(userId, {
        user_id: userId,
        type: 'reminder',
        title: 'Daily Check-in',
        message: 'How are you feeling today? Take a moment to log your mood.',
        channel: pref.channel,
        priority: pref.priority,
        triggered_by: 'time_based',
        context: { reminder_type: 'daily_checkin' },
        action_url: '/mood/log',
        action_label: 'Log Mood'
      });
    }
  }

  /**
   * Check insight notifications
   */
  private async checkInsights(userId: string, preferences: NotificationPreference[]): Promise<void> {
    const pref = preferences.find(p => p.notification_type === 'insight' && p.enabled);
    if (!pref) return;

    // Send daily digest at specified time
    const shouldNotify = this.shouldSendNotification(pref, new Date().getHours());

    if (shouldNotify) {
      await this.sendNotification(userId, {
        user_id: userId,
        type: 'insight',
        title: 'Your Daily Insights',
        message: 'Check out your personalized insights for today.',
        channel: pref.channel,
        priority: pref.priority,
        triggered_by: 'daily_digest',
        context: { insight_type: 'daily_summary' },
        action_url: '/insights',
        action_label: 'View Insights'
      });
    }
  }

  /**
   * Check achievement notifications
   */
  private async checkAchievements(userId: string, preferences: NotificationPreference[]): Promise<void> {
    const pref = preferences.find(p => p.notification_type === 'achievement' && p.enabled);
    if (!pref) return;

    // Check for new achievements (would integrate with gamification service)
    // This is a placeholder - actual implementation would query the achievements table
  }

  /**
   * Check risk alerts
   */
  private async checkRiskAlerts(userId: string, preferences: NotificationPreference[]): Promise<void> {
    const pref = preferences.find(p => p.notification_type === 'risk_alert' && p.enabled);
    if (!pref) return;

    // Check for mental health risk indicators (placeholder)
    // Actual implementation would analyze mood patterns for concerning trends
  }

  /**
   * Determine if notification should be sent based on preferences
   */
  private shouldSendNotification(pref: NotificationPreference, currentHour: number): boolean {
    if (pref.timing_preference === 'immediate') {
      return true;
    }

    if (pref.timing_preference === 'daily_digest' && currentHour === 9) {
      return true;
    }

    if (pref.timing_preference === 'weekly_digest' && new Date().getDay() === 1 && currentHour === 9) {
      return true;
    }

    if (pref.custom_hours?.includes(currentHour)) {
      return true;
    }

    return false;
  }

  /**
   * Start background notification checking
   */
  startBackgroundChecks(userId: string): void {
    if (this.intervalId) return;

    this.intervalId = window.setInterval(() => {
      this.checkAndSendNotifications(userId);
    }, this.checkInterval);
  }

  /**
   * Stop background notification checking
   */
  stopBackgroundChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ============================================================================
// Context-Aware Chatbot Service
// ============================================================================

export class ChatbotService {
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  /**
   * Send a message to the chatbot
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    message: string,
    context?: ChatConversation['context']
  ): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      user_id: userId,
      conversation_id: conversationId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };

    // Add to history
    const history = this.getOrCreateConversation(userId, conversationId);
    history.push(userMessage);

    // Get AI response
    const assistantMessage = await this.getAIResponse(userId, conversationId, message, context);

    // Add assistant response to history
    history.push(assistantMessage);

    return assistantMessage;
  }

  /**
   * Get AI response (placeholder for actual AI integration)
   */
  private async getAIResponse(
    userId: string,
    conversationId: string,
    message: string,
    context?: ChatConversation['context']
  ): Promise<ChatMessage> {
    // This would integrate with an AI service like OpenAI, Gemini, etc.
    // For now, return a simple response

    const lowerMessage = message.toLowerCase();
    let responseText = '';

    // Context-aware responses
    if (context?.current_mood) {
      if (lowerMessage.includes('feel') || lowerMessage.includes('feeling')) {
        responseText = `I hear that you're feeling ${context.current_mood}. Would you like to talk more about it, or would you prefer some suggestions to help with that?`;
      } else if (['anxious', 'stressed'].includes(context.current_mood)) {
        responseText = `I understand you're feeling ${context.current_mood}. Would you like to try a quick breathing exercise together, or would you prefer some other support?`;
      }
    }

    // Default responses
    if (!responseText) {
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        responseText = 'Hello! How are you feeling today? I\'m here to chat whenever you need support.';
      } else if (lowerMessage.includes('sad') || lowerMessage.includes('unhappy')) {
        responseText = 'I\'m sorry you\'re feeling sad. Would you like to share what\'s on your mind, or would you prefer some activities that might help lift your mood?';
      } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
        responseText = 'It sounds like you\'re feeling anxious. Remember to breathe - try the 4-7-8 technique: breathe in for 4 seconds, hold for 7, exhale for 8. Would you like to talk about what\'s causing these feelings?';
      } else if (lowerMessage.includes('help')) {
        responseText = 'I\'m here to help! You can ask me about tracking your mood, wellness activities, or just chat about how you\'re feeling. What would be most helpful right now?';
      } else {
        responseText = 'Thank you for sharing. I\'m here to support you. Is there anything specific you\'d like to talk about or any help you need?';
      }
    }

    return {
      id: `msg_${Date.now()}_assistant`,
      user_id: userId,
      conversation_id: conversationId,
      role: 'assistant',
      content: responseText,
      intent: this.detectIntent(message),
      created_at: new Date().toISOString()
    };
  }

  /**
   * Detect user intent from message
   */
  private detectIntent(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('sad') || lower.includes('unhappy') || lower.includes('depressed')) {
      return 'express_sadness';
    }
    if (lower.includes('anxious') || lower.includes('worried') || lower.includes('stress')) {
      return 'express_anxiety';
    }
    if (lower.includes('happy') || lower.includes('great') || lower.includes('good')) {
      return 'express_positive';
    }
    if (lower.includes('help') || lower.includes('advice') || lower.includes('suggestion')) {
      return 'seek_help';
    }
    if (lower.includes('breathing') || lower.includes('exercise') || lower.includes('meditation')) {
      return 'seek_activity';
    }

    return 'general_conversation';
  }

  /**
   * Get or create conversation history
   */
  private getOrCreateConversation(userId: string, conversationId: string): ChatMessage[] {
    const key = `${userId}_${conversationId}`;
    if (!this.conversationHistory.has(key)) {
      this.conversationHistory.set(key, []);
    }
    return this.conversationHistory.get(key)!;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(userId: string, conversationId: string): ChatMessage[] {
    return this.getOrCreateConversation(userId, conversationId);
  }

  /**
   * Clear conversation history
   */
  clearConversation(userId: string, conversationId: string): void {
    const key = `${userId}_${conversationId}`;
    this.conversationHistory.delete(key);
  }

  // ============================================================================
  // Content Customization Methods
  // ============================================================================

  /**
   * Analyze user content preferences from interaction history
   */
  analyzeContentPreferences(
    interactionHistory: Array<{ contentType: string; category: string; action: string }>
  ): {
    preferredContentTypes: string[];
    preferredCategories: string[];
    dislikedCategories: string[];
    contentDensity: 'compact' | 'standard' | 'expanded';
  } {
    const contentTypeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const dismissCounts: Record<string, number> = {};
    const viewCounts: Record<string, number> = {};

    interactionHistory.forEach(interaction => {
      const { contentType, category, action } = interaction;

      // Count content type preferences
      contentTypeCounts[contentType] = (contentTypeCounts[contentType] || 0) + 1;

      // Track categories
      if (action !== 'dismiss') {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        viewCounts[category] = (viewCounts[category] || 0) + 1;
      } else {
        dismissCounts[category] = (dismissCounts[category] || 0) + 1;
      }
    });

    // Calculate preferred content types (top 5)
    const preferredContentTypes = Object.entries(contentTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type);

    // Calculate preferred categories (high view, low dismiss)
    const preferredCategories = Object.entries(categoryCounts)
      .filter(([category]) => {
        const views = viewCounts[category] || 0;
        const dismisses = dismissCounts[category] || 0;
        return views > dismisses * 2; // At least 2x more views than dismisses
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    // Calculate disliked categories (high dismiss relative to views)
    const dislikedCategories = Object.entries(dismissCounts)
      .filter(([category]) => {
        const views = viewCounts[category] || 0;
        const dismisses = dismissCounts[category] || 0;
        return dismisses > views * 0.5; // More than 50% dismiss rate
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    // Determine content density based on interaction patterns
    let contentDensity: 'compact' | 'standard' | 'expanded' = 'standard';
    const avgInteractionsPerSession = interactionHistory.length / 7; // Per week
    if (avgInteractionsPerSession < 3) {
      contentDensity = 'compact';
    } else if (avgInteractionsPerSession > 15) {
      contentDensity = 'expanded';
    }

    return {
      preferredContentTypes,
      preferredCategories,
      dislikedCategories,
      contentDensity,
    };
  }

  /**
   * Generate personalized content feed
   */
  generatePersonalizedFeed(
    userPreferences: {
      preferredCategories: string[];
      dislikedCategories: string[];
      preferredContentTypes: string[];
    },
    availableContent: Array<{
      id: string;
      type: string;
      category: string;
      title: string;
      tags: string[];
    }>,
    limit: number = 10
  ): Array<{ content: typeof availableContent[0]; score: number; reason: string }> {
    const scored = availableContent.map(content => {
      let score = 50; // Base score
      let reason = '';

      // Boost for preferred categories
      if (userPreferences.preferredCategories.includes(content.category)) {
        score += 30;
        reason = 'Based on your interests';
      }

      // Boost for preferred content types
      if (userPreferences.preferredContentTypes.includes(content.type)) {
        score += 20;
        reason = reason || 'Content type you enjoy';
      }

      // Check tags for additional relevance
      content.tags.forEach(tag => {
        if (userPreferences.preferredCategories.includes(tag)) {
          score += 10;
        }
      });

      // Penalty for disliked categories
      if (userPreferences.dislikedCategories.includes(content.category)) {
        score -= 40;
        reason = '';
      }

      // Additional relevance scoring
      const relevanceScore = this.calculateContentRelevance(content, userPreferences);
      score += relevanceScore;

      return { content, score: Math.max(0, Math.min(100, score)), reason: reason || 'Recommended for you' };
    });

    // Sort by score and return top results
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calculate content relevance score
   */
  private calculateContentRelevance(
    content: { tags: string[]; category: string },
    preferences: { preferredCategories: string[] }
  ): number {
    let relevance = 0;

    content.tags.forEach(tag => {
      if (preferences.preferredCategories.includes(tag)) {
        relevance += 5;
      }
    });

    // Cap relevance bonus
    return Math.min(relevance, 20);
  }

  /**
   * Adapt content presentation based on user engagement
   */
  adaptContentPresentation(
    engagementMetrics: {
      avgViewDuration: number;
      clickThroughRate: number;
      dismissRate: number;
      scrollSpeed: number;
    }
  ): {
    contentDensity: 'compact' | 'standard' | 'expanded';
    showThumbnails: boolean;
    showDescriptions: boolean;
    cardStyle: 'minimal' | 'standard' | 'detailed';
    animationLevel: 'none' | 'subtle' | 'full';
  } {
    const { avgViewDuration, clickThroughRate, dismissRate, scrollSpeed } = engagementMetrics;

    // Determine content density
    let contentDensity: 'compact' | 'standard' | 'expanded' = 'standard';
    if (avgViewDuration < 3000 || dismissRate > 0.4) {
      contentDensity = 'compact';
    } else if (avgViewDuration > 15000 && clickThroughRate > 0.3) {
      contentDensity = 'expanded';
    }

    // Determine what to show
    const showThumbnails = clickThroughRate > 0.2 || contentDensity !== 'compact';
    const showDescriptions = contentDensity !== 'compact' && avgViewDuration > 5000;

    // Determine card style
    let cardStyle: 'minimal' | 'standard' | 'detailed' = 'standard';
    if (scrollSpeed > 500) { // Fast scroller
      cardStyle = 'minimal';
    } else if (avgViewDuration > 10000) {
      cardStyle = 'detailed';
    }

    // Determine animation level
    let animationLevel: 'none' | 'subtle' | 'full' = 'subtle';
    if (scrollSpeed > 800) {
      animationLevel = 'none';
    } else if (clickThroughRate > 0.4) {
      animationLevel = 'full';
    }

    return {
      contentDensity,
      showThumbnails,
      showDescriptions,
      cardStyle,
      animationLevel,
    };
  }

  /**
   * Get adaptive UI suggestions based on usage patterns
   */
  getAdaptiveUISuggestions(usagePatterns: {
    frequentFeatures: string[];
    timeOfDayUsage: Record<string, number>;
    sessionDuration: number;
    featureSequence: string[];
  }): {
    layoutSuggestion: 'dashboard' | 'focus' | 'compact';
    showGamification: boolean;
    quickActions: string[];
    recommendedWidgets: string[];
    themeSuggestion: 'light' | 'dark' | 'auto';
  } {
    const { frequentFeatures, timeOfDayUsage, sessionDuration, featureSequence } = usagePatterns;

    // Determine layout based on usage patterns
    let layoutSuggestion: 'dashboard' | 'focus' | 'compact' = 'dashboard';

    // Explorer pattern: full dashboard
    if (frequentFeatures.length > 8 && sessionDuration > 600) {
      layoutSuggestion = 'dashboard';
    }
    // Routine pattern: focus mode
    else if (frequentFeatures.length < 4 && sessionDuration < 300) {
      layoutSuggestion = 'focus';
    }
    // Casual pattern: compact
    else if (sessionDuration < 180) {
      layoutSuggestion = 'compact';
    }

    // Determine if gamification should be shown
    const showGamification = frequentFeatures.includes('achievements') ||
      frequentFeatures.includes('challenges') ||
      timeOfDayUsage.afternoon > timeOfDayUsage.evening;

    // Suggest quick actions based on patterns
    const quickActions = frequentFeatures.slice(0, 3);

    // Determine recommended widgets
    const recommendedWidgets = frequentFeatures.slice(0, 5);

    // Suggest theme based on time of day
    let themeSuggestion: 'light' | 'dark' | 'auto' = 'auto';
    const peakUsageTime = Object.entries(timeOfDayUsage).sort((a, b) => b[1] - a[1])[0];
    if (peakUsageTime[0] === 'night' && peakUsageTime[1] > 10) {
      themeSuggestion = 'dark';
    } else if (peakUsageTime[0] === 'morning' && peakUsageTime[1] > 10) {
      themeSuggestion = 'light';
    }

    return {
      layoutSuggestion,
      showGamification,
      quickActions,
      recommendedWidgets,
      themeSuggestion,
    };
  }
}

// Create singleton instances
export const recommendationsEngine = new RecommendationsEngine();
export const smartNotificationsService = new SmartNotificationsService();
export const chatbotService = new ChatbotService();

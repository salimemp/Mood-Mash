// ============================================================================
// Email Service for MoodMash
// Resend-powered transactional email service
// ============================================================================

import { Resend } from 'resend';
import {
  generateEmail,
  WelcomeEmailData,
  VerificationEmailData,
  PasswordResetData,
  SecurityAlertData,
  AchievementUnlockedData,
  ChallengeCompletedData,
  StreakReminderData,
  WeeklySummaryData,
  MonthlyReportData,
  EmailTemplateName,
} from '../data/emailTemplates';

// ============================================================================
// Environment Configuration
// ============================================================================

const getResendApiKey = (): string | null => {
  // Try environment variable first
  if (import.meta.env['VITE_RESEND_API_KEY']) {
    return import.meta.env['VITE_RESEND_API_KEY'];
  }

  // Check localStorage (for user-provided keys)
  const stored = localStorage.getItem('resend_api_key');
  if (stored) {
    return stored;
  }

  return null;
};

const getFromEmail = (): string => {
  return import.meta.env['VITE_FROM_EMAIL'] || 'noreply@moodmash.app';
};

const getAppUrl = (): string => {
  return import.meta.env['VITE_APP_URL'] || 'https://moodmash.app';
};

// ============================================================================
// Email Service Class
// ============================================================================

class EmailService {
  private resend: Resend | null = null;
  private initialized: boolean = false;
  private mockMode: boolean = false;

  /**
   * Initialize the email service
   */
  initialize(): boolean {
    if (this.initialized) return true;

    const apiKey = getResendApiKey();

    if (apiKey) {
      try {
        this.resend = new Resend(apiKey);
        this.mockMode = false;
        this.initialized = true;
        console.log('[EmailService] Initialized with Resend API');
        return true;
      } catch (error) {
        console.error('[EmailService] Failed to initialize Resend:', error);
        this.mockMode = true;
      }
    } else {
      console.log('[EmailService] No API key found, running in mock mode');
      this.mockMode = true;
    }

    this.initialized = true;
    return true;
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    this.initialize();
    return !this.mockMode && this.resend !== null;
  }

  /**
   * Set API key for the service
   */
  setApiKey(apiKey: string): void {
    localStorage.setItem('resend_api_key', apiKey);
    this.resend = new Resend(apiKey);
    this.mockMode = false;
    this.initialized = true;
    console.log('[EmailService] API key set successfully');
  }

  /**
   * Clear API key
   */
  clearApiKey(): void {
    localStorage.removeItem('resend_api_key');
    this.resend = null;
    this.mockMode = true;
  }

  /**
   * Send a welcome email to new users
   */
  async sendWelcomeEmail(
    email: string,
    userName: string,
    verificationUrl: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const data: WelcomeEmailData = {
      userName,
      userEmail: email,
      verificationUrl,
    };

    const html = generateEmail('welcome', data);

    return this.sendEmail({
      to: email,
      subject: 'Welcome to MoodMash! 🌈 Start Your Wellness Journey',
      html,
    });
  }

  /**
   * Send email verification code
   */
  async sendVerificationEmail(
    email: string,
    userName: string,
    verificationCode: string,
    expiresIn: string = '24 hours'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const verificationUrl = `${getAppUrl()}/verify-email?code=${verificationCode}`;

    const data: VerificationEmailData = {
      userName,
      userEmail: email,
      verificationCode,
      verificationUrl,
      expiresIn,
    };

    const html = generateEmail('verification', data);

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - MoodMash',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    userName: string,
    resetCode: string,
    expiresIn: string = '1 hour'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const resetUrl = `${getAppUrl()}/reset-password?code=${resetCode}`;

    const data: PasswordResetData = {
      userName,
      userEmail: email,
      resetCode,
      resetUrl,
      expiresIn,
    };

    const html = generateEmail('passwordReset', data);

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - MoodMash',
      html,
    });
  }

  /**
   * Send security alert email
   */
  async sendSecurityAlertEmail(
    email: string,
    userName: string,
    deviceInfo: string,
    location: string,
    ipAddress: string,
    timestamp: Date,
    actionUrl: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const data: SecurityAlertData = {
      userName,
      userEmail: email,
      deviceInfo,
      location,
      ipAddress,
      timestamp,
      actionUrl,
    };

    const html = generateEmail('securityAlert', data);

    return this.sendEmail({
      to: email,
      subject: '🔔 Security Alert: New Sign-In Detected',
      html,
    });
  }

  /**
   * Send achievement unlocked notification
   */
  async sendAchievementEmail(
    email: string,
    userName: string,
    achievementName: string,
    achievementDescription: string,
    achievementIcon: string,
    achievementBadge: string,
    pointsEarned: number,
    totalPoints: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const data: AchievementUnlockedData = {
      userName,
      userEmail: email,
      achievementName,
      achievementDescription,
      achievementIcon,
      achievementBadge,
      pointsEarned,
      totalPoints,
    };

    const html = generateEmail('achievementUnlocked', data);

    return this.sendEmail({
      to: email,
      subject: `🎉 Achievement Unlocked: ${achievementName}`,
      html,
    });
  }

  /**
   * Send challenge completed notification
   */
  async sendChallengeCompletedEmail(
    email: string,
    userName: string,
    challengeName: string,
    challengeDescription: string,
    duration: string,
    completedDate: Date,
    rewardPoints: number,
    rank: number,
    totalParticipants: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const data: ChallengeCompletedData = {
      userName,
      userEmail: email,
      challengeName,
      challengeDescription,
      duration,
      completedDate,
      rewardPoints,
      rank,
      totalParticipants,
    };

    const html = generateEmail('challengeCompleted', data);

    return this.sendEmail({
      to: email,
      subject: `🎊 Challenge Completed: ${challengeName}`,
      html,
    });
  }

  /**
   * Send streak reminder notification
   */
  async sendStreakReminderEmail(
    email: string,
    userName: string,
    currentStreak: number,
    longestStreak: number,
    streakMilestone: number,
    lastActivityDate: Date,
    motivationalMessage: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const data: StreakReminderData = {
      userName,
      userEmail: email,
      currentStreak,
      longestStreak,
      streakMilestone,
      lastActivityDate,
      motivationalMessage,
    };

    const html = generateEmail('streakReminder', data);

    return this.sendEmail({
      to: email,
      subject: `🔥 Keep Your ${currentStreak}-Day Streak Alive!`,
      html,
    });
  }

  /**
   * Send weekly summary email
   */
  async sendWeeklySummaryEmail(
    email: string,
    userName: string,
    weekStartDate: Date,
    weekEndDate: Date,
    totalMoodEntries: number,
    dominantMood: string,
    moodTrend: 'improving' | 'stable' | 'declining',
    moodTrendPercentage: number,
    topInsights: string[],
    achievements: string[],
    weeklyGoalProgress: number,
    suggestedActivities: string[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const data: WeeklySummaryData = {
      userName,
      userEmail: email,
      weekStartDate,
      weekEndDate,
      totalMoodEntries,
      dominantMood,
      moodTrend,
      moodTrendPercentage,
      topInsights,
      achievements,
      weeklyGoalProgress,
      suggestedActivities,
    };

    const html = generateEmail('weeklySummary', data);

    return this.sendEmail({
      to: email,
      subject: '📊 Your Weekly Wellness Summary',
      html,
    });
  }

  /**
   * Send monthly report email
   */
  async sendMonthlyReportEmail(
    email: string,
    userName: string,
    month: string,
    year: number,
    totalMoodEntries: number,
    moodDistribution: Record<string, number>,
    moodTrend: 'improving' | 'stable' | 'declining',
    monthlyGrowth: number,
    topPatterns: string[],
    accomplishments: string[],
    yearlyGoalProgress: number,
    yearlyMilestones: string[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const data: MonthlyReportData = {
      userName,
      userEmail: email,
      month,
      year,
      totalMoodEntries,
      moodDistribution,
      moodTrend,
      monthlyGrowth,
      topPatterns,
      accomplishments,
      yearlyGoalProgress,
      yearlyMilestones,
    };

    const html = generateEmail('monthlyReport', data);

    return this.sendEmail({
      to: email,
      subject: `📈 Your ${month} ${year} Wellness Report`,
      html,
    });
  }

  /**
   * Send custom transactional email
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({ to, subject, html, text });
  }

  /**
   * Core email sending method
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    this.initialize();

    if (this.mockMode) {
      console.log('[EmailService] Mock mode - email would be sent:', {
        to: params.to,
        subject: params.subject,
        previewUrl: 'https://resend.com/emails',
      });

      return {
        success: true,
        messageId: `mock_${Date.now()}`,
      };
    }

    if (!this.resend) {
      return {
        success: false,
        error: 'Email service not initialized',
      };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: getFromEmail(),
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || this.generatePlainText(params.html),
      });

      if (error) {
        console.error('[EmailService] Send error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      console.log('[EmailService] Email sent successfully:', data?.id);

      return {
        success: true,
        messageId: data?.id || undefined,
      };
    } catch (err) {
      console.error('[EmailService] Unexpected error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate plain text version from HTML
   */
  private generatePlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const emailService = new EmailService();

// ============================================================================
// Email Queue Management
// ============================================================================

interface QueuedEmail {
  id: string;
  type: EmailTemplateName;
  data: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing: boolean = false;

  /**
   * Add email to queue
   */
  async add(type: EmailTemplateName, data: Record<string, unknown>): Promise<void> {
    const email: QueuedEmail = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    };

    this.queue.push(email);
    await this.processQueue();
  }

  /**
   * Process queued emails
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const email = this.queue[0];

      if (email.attempts >= email.maxAttempts) {
        console.error('[EmailQueue] Max attempts reached for:', email.id);
        this.queue.shift();
        continue;
      }

      try {
        // For now, we'll just log - actual implementation would send via emailService
        console.log('[EmailQueue] Processing email:', email.type, email.id);
        this.queue.shift();
      } catch (error) {
        console.error('[EmailQueue] Failed to process email:', error);
        email.attempts++;
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
  }

  /**
   * Get queue status
   */
  getStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.queue.length,
      processing: this.processing,
    };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }
}

export const emailQueue = new EmailQueue();

// ============================================================================
// Email Validation Utilities
// ============================================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function formatEmailDisplayName(name: string): string {
  // Remove any special characters that could cause issues in email display
  return name.replace(/[<>{}()\[\]]/g, '').trim();
}

// ============================================================================
// Export Types
// ============================================================================

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Export template data types for external use
export type {
  WelcomeEmailData,
  VerificationEmailData,
  PasswordResetData,
  SecurityAlertData,
  AchievementUnlockedData,
  ChallengeCompletedData,
  StreakReminderData,
  WeeklySummaryData,
  MonthlyReportData,
};

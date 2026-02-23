// ============================================================================
// Email Templates for MoodMash
// Transactional email templates powered by Resend
// ============================================================================

import { format } from 'date-fns';

// ============================================================================
// Email Template Interfaces
// ============================================================================

export interface BaseEmailData {
  userName: string;
  userEmail: string;
  year?: number;
}

export interface WelcomeEmailData extends BaseEmailData {
  verificationUrl: string;
}

export interface VerificationEmailData extends BaseEmailData {
  verificationCode: string;
  verificationUrl: string;
  expiresIn: string;
}

export interface PasswordResetData extends BaseEmailData {
  resetCode: string;
  resetUrl: string;
  expiresIn: string;
}

export interface SecurityAlertData extends BaseEmailData {
  deviceInfo: string;
  location: string;
  ipAddress: string;
  timestamp: Date;
  actionUrl: string;
}

export interface AchievementUnlockedData extends BaseEmailData {
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  achievementBadge: string;
  pointsEarned: number;
  totalPoints: number;
}

export interface ChallengeCompletedData extends BaseEmailData {
  challengeName: string;
  challengeDescription: string;
  duration: string;
  completedDate: Date;
  rewardPoints: number;
  rank: number;
  totalParticipants: number;
}

export interface StreakReminderData extends BaseEmailData {
  currentStreak: number;
  longestStreak: number;
  streakMilestone: number;
  lastActivityDate: Date;
  motivationalMessage: string;
}

export interface WeeklySummaryData extends BaseEmailData {
  weekStartDate: Date;
  weekEndDate: Date;
  totalMoodEntries: number;
  dominantMood: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  moodTrendPercentage: number;
  topInsights: string[];
  achievements: string[];
  weeklyGoalProgress: number;
  suggestedActivities: string[];
}

export interface MonthlyReportData extends BaseEmailData {
  month: string;
  year: number;
  totalMoodEntries: number;
  moodDistribution: Record<string, number>;
  moodTrend: 'improving' | 'stable' | 'declining';
  monthlyGrowth: number;
  topPatterns: string[];
  accomplishments: string[];
  yearlyGoalProgress: number;
  yearlyMilestones: string[];
}

// ============================================================================
// Email Styles
// ============================================================================

const emailStyles = {
  container: `
    margin: 0;
    padding: 0;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f3f4f6;
  `,
  wrapper: `
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `,
  header: `
    text-align: center;
    padding: 30px 20px;
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    border-radius: 12px 12px 0 0;
  `,
  headerLogo: `
    font-size: 28px;
    font-weight: bold;
    color: white;
    margin: 0;
  `,
  headerSubtitle: `
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    margin: 8px 0 0 0;
  `,
  content: `
    background-color: white;
    padding: 40px 30px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,
  heading: `
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
  `,
  paragraph: `
    font-size: 16px;
    line-height: 1.6;
    color: #4b5563;
    margin: 0 0 16px 0;
  `,
  highlight: `
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `,
  button: `
    display: inline-block;
    padding: 14px 28px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
    transition: opacity 0.2s;
  `,
  buttonSecondary: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #f3f4f6;
    color: #4b5563;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    margin: 10px 5px;
    border: 1px solid #e5e7eb;
  `,
  card: `
    background-color: #f9fafb;
    border-radius: 12px;
    padding: 24px;
    margin: 20px 0;
  `,
  statCard: `
    display: inline-block;
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 16px 20px;
    margin: 8px;
    text-align: center;
    min-width: 100px;
  `,
  statValue: `
    font-size: 28px;
    font-weight: 700;
    color: #8b5cf6;
    display: block;
  `,
  statLabel: `
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  `,
  footer: `
    text-align: center;
    padding: 20px;
    font-size: 14px;
    color: #9ca3af;
  `,
  footerLink: `
    color: #8b5cf6;
    text-decoration: none;
  `,
  achievementBadge: `
    display: inline-block;
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 50%;
    font-size: 48px;
    margin: 10px;
  `,
  progressBar: `
    width: 100%;
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin: 10px 0;
  `,
  progressFill: `
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  `,
  alertBox: `
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 16px;
    border-radius: 0 8px 8px 0;
    margin: 20px 0;
  `,
  successBox: `
    background-color: #d1fae5;
    border-left: 4px solid #10b981;
    padding: 16px;
    border-radius: 0 8px 8px 0;
    margin: 20px 0;
  `,
  insightItem: `
    display: flex;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  `,
  insightIcon: `
    margin-right: 12px;
    font-size: 20px;
  `,
  insightText: `
    flex: 1;
    font-size: 14px;
    color: #4b5563;
  `,
  activityList: `
    list-style: none;
    padding: 0;
    margin: 0;
  `,
  activityItem: `
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: #f9fafb;
    border-radius: 8px;
    margin: 8px 0;
  `,
  activityIcon: `
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 12px;
    font-size: 18px;
  `,
  divider: `
    height: 1px;
    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    margin: 24px 0;
  `,
};

// ============================================================================
// Base Email Template Generator
// ============================================================================

function generateBaseEmail(
  content: string,
  userName: string,
  options: { showHeader?: boolean; headerTitle?: string; headerSubtitle?: string } = {}
): string {
  const { showHeader = true, headerTitle = 'MoodMash', headerSubtitle = 'Your Wellness Journey' } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>MoodMash - Wellness Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; }
    table { border-spacing: 0; border-collapse: collapse; }
    img { border: 0; display: block; max-width: 100%; height: auto; }
    a { color: #8b5cf6; }
    .email-body { background-color: #f3f4f6; }
    .email-container { max-width: 600px; margin: 0 auto; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-content { padding: 20px !important; }
      .email-header { padding: 20px !important; }
    }
  </style>
</head>
<body style="${emailStyles.container}">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" class="email-container" style="max-width: 600px; width: 100%;">
          ${showHeader ? `
          <tr>
            <td style="${emailStyles.header}">
              <h1 style="${emailStyles.headerLogo}; margin: 0;">${headerTitle}</h1>
              <p style="${emailStyles.headerSubtitle}">${headerSubtitle}</p>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="${emailStyles.content}" class="email-content">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="${emailStyles.footer}">
              <p style="margin: 0 0 8px 0;">
                <a href="https://moodmash.app" style="${emailStyles.footerLink}">MoodMash</a> · Your Personal Wellness Companion
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} MoodMash. All rights reserved.<br>
                <a href="https://moodmash.app/unsubscribe" style="${emailStyles.footerLink}">Unsubscribe</a> ·
                <a href="https://moodmash.app/privacy" style="${emailStyles.footerLink}">Privacy Policy</a> ·
                <a href="https://moodmash.app/terms" style="${emailStyles.footerLink}">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================================================
// Welcome Email Template
// ============================================================================

export function getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  const content = `
    <h1 style="${emailStyles.heading}">Welcome to MoodMash, ${data.userName}! 🌟</h1>
    <p style="${emailStyles.paragraph}">
      We're thrilled to have you join our wellness community! MoodMash is your personal space for
      tracking moods, discovering patterns, and building healthier emotional habits.
    </p>
    <p style="${emailStyles.paragraph}">
      To get started, please verify your email address by clicking the button below:
    </p>
    <div style="text-align: center;">
      <a href="${data.verificationUrl}" style="${emailStyles.button}">Verify My Email</a>
    </div>
    <p style="${emailStyles.paragraph}; font-size: 14px; color: #6b7280;">
      This verification link will expire in 24 hours. If you didn't create an account with MoodMash,
      please ignore this email or <a href="mailto:support@moodmash.app">contact support</a>.
    </p>
    <div style="${emailStyles.divider}"></div>
    <h3 style="font-size: 18px; color: #1f2937; margin: 0 0 16px 0;">Here's what you can do with MoodMash:</h3>
    <ul style="${emailStyles.activityList}">
      <li style="${emailStyles.activityItem}">
        <span style="${emailStyles.activityIcon}">📊</span>
        <div>
          <strong style="color: #1f2937;">Track Your Moods</strong>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Log emotions with notes and context</p>
        </div>
      </li>
      <li style="${emailStyles.activityItem}">
        <span style="${emailStyles.activityIcon}">🤖</span>
        <div>
          <strong style="color: #1f2937;">AI-Powered Insights</strong>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Get personalized patterns and recommendations</p>
        </div>
      </li>
      <li style="${emailStyles.activityItem}">
        <span style="${emailStyles.activityIcon}">🧘</span>
        <div>
          <strong style="color: #1f2937;">Wellness Sessions</strong>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Guided meditation, yoga, and breathing exercises</p>
        </div>
      </li>
      <li style="${emailStyles.activityItem}">
        <span style="${emailStyles.activityIcon}">🏆</span>
        <div>
          <strong style="color: #1f2937;">Gamification</strong>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Earn achievements and maintain streaks</p>
        </div>
      </li>
    </ul>
    <div style="${emailStyles.successBox}">
      <strong style="color: #065f46;">💡 Pro Tip:</strong>
      <span style="color: #047857;">Complete your first mood log today to start your wellness journey!</span>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '🌈 MoodMash',
    headerSubtitle: 'Welcome to Your Wellness Journey'
  });
}

// ============================================================================
// Email Verification Template
// ============================================================================

export function getVerificationEmailTemplate(data: VerificationEmailData): string {
  const content = `
    <h1 style="${emailStyles.heading}">Verify Your Email Address 📧</h1>
    <p style="${emailStyles.paragraph}">
      Hi <strong>${data.userName}</strong>, thank you for signing up with MoodMash!
      Please enter the verification code below or click the button to confirm your email.
    </p>
    <div style="text-align: center; padding: 30px 0;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 36px; font-weight: bold; letter-spacing: 8px;">
        ${data.verificationCode}
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">Verification Code</p>
    </div>
    <div style="text-align: center;">
      <a href="${data.verificationUrl}" style="${emailStyles.button}">Verify Email</a>
    </div>
    <p style="${emailStyles.paragraph}; font-size: 14px; color: #6b7280;">
      This verification code expires in <strong>${data.expiresIn}</strong>. If you didn't request this,
      please ignore this email.
    </p>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '📧 Email Verification',
    headerSubtitle: 'Verify Your MoodMash Account'
  });
}

// ============================================================================
// Password Reset Template
// ============================================================================

export function getPasswordResetTemplate(data: PasswordResetData): string {
  const content = `
    <h1 style="${emailStyles.heading}">Reset Your Password 🔐</h1>
    <p style="${emailStyles.paragraph}">
      Hi <strong>${data.userName}</strong>, we received a request to reset your password.
      Enter the code below or click the button to create a new password.
    </p>
    <div style="text-align: center; padding: 30px 0;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 36px; font-weight: bold; letter-spacing: 8px;">
        ${data.resetCode}
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">Reset Code</p>
    </div>
    <div style="text-align: center;">
      <a href="${data.resetUrl}" style="${emailStyles.button}">Reset Password</a>
    </div>
    <div style="${emailStyles.alertBox}">
      <strong style="color: #92400e;">⚠️ Security Notice:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px;">
        <li>This reset code expires in <strong>${data.expiresIn}</strong></li>
        <li>If you didn't request this, please ignore or change your password immediately</li>
        <li>Never share this code with anyone</li>
      </ul>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '🔐 Password Reset',
    headerSubtitle: 'Secure Your Account'
  });
}

// ============================================================================
// Security Alert Template
// ============================================================================

export function getSecurityAlertTemplate(data: SecurityAlertData): string {
  const formattedTime = format(data.timestamp, 'MMMM d, yyyy \'at\' h:mm a');

  const content = `
    <h1 style="${emailStyles.heading}">🔔 Security Alert</h1>
    <p style="${emailStyles.paragraph}">
      Hi <strong>${data.userName}</strong>, we detected a new sign-in to your MoodMash account.
    </p>
    <div style="${emailStyles.card}">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Sign-In Details</h3>
      <p style="${emailStyles.paragraph}; margin: 8px 0;">
        <strong style="color: #1f2937;">📍 Location:</strong>
        <span style="color: #4b5563;">${data.location}</span>
      </p>
      <p style="${emailStyles.paragraph}; margin: 8px 0;">
        <strong style="color: #1f2937;">💻 Device:</strong>
        <span style="color: #4b5563;">${data.deviceInfo}</span>
      </p>
      <p style="${emailStyles.paragraph}; margin: 8px 0;">
        <strong style="color: #1f2937;">🌐 IP Address:</strong>
        <span style="color: #4b5563;">${data.ipAddress}</span>
      </p>
      <p style="${emailStyles.paragraph}; margin: 8px 0;">
        <strong style="color: #1f2937;">🕐 Time:</strong>
        <span style="color: #4b5563;">${formattedTime}</span>
      </p>
    </div>
    <div style="${emailStyles.alertBox}">
      <strong style="color: #92400e;">Was this you?</strong>
      <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
        If you don't recognize this activity, please secure your account immediately.
      </p>
    </div>
    <div style="text-align: center;">
      <a href="${data.actionUrl}" style="${emailStyles.button}">Review Account Security</a>
      <br>
      <a href="#" style="color: #6b7280; font-size: 14px;">This wasn't me - secure my account</a>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '🛡️ Security Alert',
    headerSubtitle: 'New Device Detected'
  });
}

// ============================================================================
// Achievement Unlocked Template
// ============================================================================

export function getAchievementUnlockedTemplate(data: AchievementUnlockedData): string {
  const content = `
    <h1 style="${emailStyles.heading}">🎉 Achievement Unlocked!</h1>
    <p style="${emailStyles.paragraph}">
      Congratulations <strong>${data.userName}</strong>! You've earned a new achievement!
    </p>
    <div style="text-align: center; padding: 30px 0;">
      <div style="font-size: 64px; margin-bottom: 16px;">${data.achievementIcon}</div>
      <h2 style="font-size: 24px; color: #1f2937; margin: 0 0 8px 0;">${data.achievementName}</h2>
      <p style="color: #6b7280; margin: 0;">${data.achievementDescription}</p>
    </div>
    <div style="${emailStyles.card}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Points Earned</p>
          <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: bold; color: #8b5cf6;">+${data.pointsEarned}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Total Points</p>
          <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: bold; color: #10b981;">${data.totalPoints}</p>
        </div>
      </div>
    </div>
    <div style="${emailStyles.successBox}">
      <strong style="color: #065f46;">🏆 Great job!</strong>
      <span style="color: #047857;">Keep up the amazing work on your wellness journey!</span>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '🏆 Achievement',
    headerSubtitle: 'You Did It!'
  });
}

// ============================================================================
// Challenge Completed Template
// ============================================================================

export function getChallengeCompletedTemplate(data: ChallengeCompletedData): string {
  const formattedDate = format(data.completedDate, 'MMMM d, yyyy');

  const content = `
    <h1 style="${emailStyles.heading}>🎊 Challenge Completed!</h1>
    <p style="${emailStyles.paragraph}">
      Amazing work <strong>${data.userName}</strong>! You completed the challenge!
    </p>
    <div style="${emailStyles.card}">
      <h2 style="font-size: 20px; color: #1f2937; margin: 0 0 8px 0;">${data.challengeName}</h2>
      <p style="color: #6b7280; margin: 0 0 16px 0;">${data.challengeDescription}</p>
      <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <div>
          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Duration</p>
          <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #1f2937;">${data.duration}</p>
        </div>
        <div style="text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Completed</p>
          <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #1f2937;">${formattedDate}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Reward</p>
          <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #8b5cf6;">${data.rewardPoints} pts</p>
        </div>
      </div>
    </div>
    <div style="text-align: center; padding: 20px 0;">
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 48px; font-weight: bold;">
        #${data.rank}
      </div>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">out of ${data.totalParticipants} participants</p>
    </div>
    <div style="${emailStyles.successBox}">
      <strong style="color: #065f46;">🌟 Outstanding!</strong>
      <span style="color: #047857;">You're crushing your wellness goals. What challenge will you take on next?</span>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '🎉 Challenge Complete',
    headerSubtitle: 'You\'re a Champion!'
  });
}

// ============================================================================
// Streak Reminder Template
// ============================================================================

export function getStreakReminderTemplate(data: StreakReminderData): string {
  const lastActivity = format(data.lastActivityDate, 'MMMM d, yyyy');
  const daysRemaining = Math.ceil((data.streakMilestone - data.currentStreak));

  const content = `
    <h1 style="${emailStyles.heading}">🔥 Keep Your Streak Alive!</h1>
    <p style="${emailStyles.paragraph}">
      Hi <strong>${data.userName}</strong>, your wellness streak needs some love!
    </p>
    <div style="text-align: center; padding: 30px 0;">
      <div style="display: inline-block; ${emailStyles.statCard}">
        <span style="${emailStyles.statValue}; font-size: 48px;">${data.currentStreak}</span>
        <span style="${emailStyles.statLabel}">Day Streak</span>
      </div>
      <div style="display: inline-block; ${emailStyles.statCard}">
        <span style="${emailStyles.statValue}; color: #10b981;">${data.longestStreak}</span>
        <span style="${emailStyles.statLabel}">Best Streak</span>
      </div>
    </div>
    <div style="${emailStyles.card}">
      <p style="margin: 0 0 12px 0; font-size: 16px; color: #4b5563;">
        Only <strong style="color: #8b5cf6;">${daysRemaining} days</strong> until you reach your ${data.streakMilestone}-day milestone!
      </p>
      <div style="${emailStyles.progressBar}">
        <div style="${emailStyles.progressFill}; width: ${(data.currentStreak / data.streakMilestone) * 100}%;"></div>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">
        ${data.currentStreak} / ${data.streakMilestone} days
      </p>
    </div>
    <div style="${emailStyles.alertBox}">
      <p style="margin: 0; font-size: 16px; color: #92400e; font-style: italic;">
        "${data.motivationalMessage}"
      </p>
    </div>
    <p style="${emailStyles.paragraph}; font-size: 14px; color: #6b7280;">
      Your last activity was on <strong>${lastActivity}</strong>. Log your mood today to keep your streak going!
    </p>
    <div style="text-align: center;">
      <a href="https://moodmash.app/dashboard" style="${emailStyles.button}">Log My Mood</a>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '🔥 Streak Alert',
    headerSubtitle: 'Don\'t Lose Your Progress'
  });
}

// ============================================================================
// Weekly Summary Template
// ============================================================================

export function getWeeklySummaryTemplate(data: WeeklySummaryData): string {
  const weekStart = format(data.weekStartDate, 'MMM d');
  const weekEnd = format(data.weekEndDate, 'MMM d, yyyy');

  const trendEmoji = data.moodTrend === 'improving' ? '📈' : data.moodTrend === 'declining' ? '📉' : '➡️';
  const trendColor = data.moodTrend === 'improving' ? '#10b981' : data.moodTrend === 'declining' ? '#ef4444' : '#6b7280';

  const content = `
    <h1 style="${emailStyles.heading}">📊 Your Weekly Wellness Summary</h1>
    <p style="${emailStyles.paragraph}">
      Hi <strong>${data.userName}</strong>, here's how your week went! 🌟
    </p>
    <p style="font-size: 14px; color: #6b7280; margin: 0 0 20px 0;">
      ${weekStart} - ${weekEnd}
    </p>

    <div style="text-align: center; padding: 20px 0;">
      <div style="display: inline-block; ${emailStyles.statCard}">
        <span style="${emailStyles.statValue}">${data.totalMoodEntries}</span>
        <span style="${emailStyles.statLabel}">Mood Entries</span>
      </div>
      <div style="display: inline-block; ${emailStyles.statCard}">
        <span style="${emailStyles.statValue}">${data.dominantMood}</span>
        <span style="${emailStyles.statLabel}">Top Mood</span>
      </div>
      <div style="display: inline-block; ${emailStyles.statCard}">
        <span style="${emailStyles.statValue}; color: ${trendColor};">${trendEmoji} ${Math.abs(data.moodTrendPercentage)}%</span>
        <span style="${emailStyles.statLabel}">Mood Trend</span>
      </div>
    </div>

    <div style="${emailStyles.card}">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Weekly Goal Progress</h3>
      <div style="${emailStyles.progressBar}">
        <div style="${emailStyles.progressFill}; width: ${data.weeklyGoalProgress}%;"></div>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">
        ${data.weeklyGoalProgress}% complete
      </p>
    </div>

    <h3 style="font-size: 18px; color: #1f2937; margin: 24px 0 16px 0;">💡 AI Insights</h3>
    <div style="${emailStyles.card}">
      ${data.topInsights.map(insight => `
        <div style="${emailStyles.insightItem}">
          <span style="${emailStyles.insightIcon}">✨</span>
          <span style="${emailStyles.insightText}">${insight}</span>
        </div>
      `).join('')}
    </div>

    ${data.achievements.length > 0 ? `
    <h3 style="font-size: 18px; color: #1f2937; margin: 24px 0 16px 0;">🏆 Weekly Achievements</h3>
    <div style="${emailStyles.card}">
      ${data.achievements.map(achievement => `
        <div style="${emailStyles.activityItem}">
          <span style="${emailStyles.activityIcon}">🏅</span>
          <div>
            <strong style="color: #1f2937;">${achievement}</strong>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <h3 style="font-size: 18px; color: #1f2937; margin: 24px 0 16px 0;">🌱 Suggested Activities for Next Week</h3>
    <ul style="${emailStyles.activityList}">
      ${data.suggestedActivities.map(activity => `
        <li style="${emailStyles.activityItem}">
          <span style="${emailStyles.activityIcon}">🧘</span>
          <div>
            <strong style="color: #1f2937;">${activity}</strong>
          </div>
        </li>
      `).join('')}
    </ul>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://moodmash.app/dashboard" style="${emailStyles.button}">View Full Dashboard</a>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '📊 Weekly Summary',
    headerSubtitle: `${weekStart} - ${weekEnd}`
  });
}

// ============================================================================
// Monthly Report Template
// ============================================================================

export function getMonthlyReportTemplate(data: MonthlyReportData): string {
  const content = `
    <h1 style="${emailStyles.heading}">📈 Your Monthly Wellness Report</h1>
    <p style="${emailStyles.paragraph}">
      Hi <strong>${data.userName}</strong>, let's celebrate your growth in ${data.month} ${data.year}! 🌟
    </p>

    <div style="text-align: center; padding: 20px 0;">
      <div style="display: inline-block; ${emailStyles.statCard}">
        <span style="${emailStyles.statValue}">${data.totalMoodEntries}</span>
        <span style="${emailStyles.statLabel}">Total Entries</span>
      </div>
      <div style="display: inline-block; ${emailStyles.statCard}">
        <span style="${emailStyles.statValue}; color: ${data.moodTrend === 'improving' ? '#10b981' : data.moodTrend === 'declining' ? '#ef4444' : '#6b7280'};">
          ${data.moodTrend === 'improving' ? '📈' : data.moodTrend === 'declining' ? '📉' : '➡️'} ${data.monthlyGrowth}%
        </span>
        <span style="${emailStyles.statLabel}">Growth</span>
      </div>
    </div>

    <h3 style="font-size: 18px; color: #1f2937; margin: 24px 0 16px 0;">🎯 Mood Distribution</h3>
    <div style="${emailStyles.card}">
      ${Object.entries(data.moodDistribution).map(([mood, count]) => `
        <div style="display: flex; align-items: center; margin: 12px 0;">
          <span style="width: 80px; font-size: 14px; color: #4b5563;">${mood}</span>
          <div style="flex: 1; height: 20px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 0 12px;">
            <div style="height: 100%; width: ${(count / data.totalMoodEntries) * 100}%; background: linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%); border-radius: 4px;"></div>
          </div>
          <span style="width: 40px; font-size: 14px; color: #6b7280; text-align: right;">${count}</span>
        </div>
      `).join('')}
    </div>

    <h3 style="font-size: 18px; color: #1f2937; margin: 24px 0 16px 0;">🧠 Patterns Discovered</h3>
    <div style="${emailStyles.card}">
      ${data.topPatterns.map(pattern => `
        <div style="${emailStyles.insightItem}">
          <span style="${emailStyles.insightIcon}">🔍</span>
          <span style="${emailStyles.insightText}">${pattern}</span>
        </div>
      `).join('')}
    </div>

    <h3 style="font-size: 18px; color: #1f2937; margin: 24px 0 16px 0;">🏆 Monthly Accomplishments</h3>
    <div style="${emailStyles.card}">
      ${data.accomplishments.map(acc => `
        <div style="${emailStyles.activityItem}">
          <span style="${emailStyles.activityIcon}">⭐</span>
          <div>
            <strong style="color: #1f2937;">${acc}</strong>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="${emailStyles.card}">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 12px 0;">Year Progress</h3>
      <div style="${emailStyles.progressBar}">
        <div style="${emailStyles.progressFill}; width: ${data.yearlyGoalProgress}%;"></div>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">
        ${data.yearlyGoalProgress}% toward your yearly wellness goals
      </p>
    </div>

    ${data.yearlyMilestones.length > 0 ? `
    <h3 style="font-size: 18px; color: #1f2937; margin: 24px 0 16px 0;">🎖️ Upcoming Milestones</h3>
    <div style="${emailStyles.card}">
      ${data.yearlyMilestones.map(milestone => `
        <div style="display: flex; align-items: center; padding: 12px; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 600;">
          🎯 ${milestone}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://moodmash.app/reports" style="${emailStyles.button}">View Full Report</a>
    </div>
  `;

  return generateBaseEmail(content, data.userName, {
    headerTitle: '📊 Monthly Report',
    headerSubtitle: `${data.month} ${data.year} Wellness Review`
  });
}

// ============================================================================
// Export Template Names for Resend
// ============================================================================

export type EmailTemplateName =
  | 'welcome'
  | 'verification'
  | 'passwordReset'
  | 'securityAlert'
  | 'achievementUnlocked'
  | 'challengeCompleted'
  | 'streakReminder'
  | 'weeklySummary'
  | 'monthlyReport';

export const emailTemplates: Record<EmailTemplateName, (data: any) => string> = {
  welcome: getWelcomeEmailTemplate,
  verification: getVerificationEmailTemplate,
  passwordReset: getPasswordResetTemplate,
  securityAlert: getSecurityAlertTemplate,
  achievementUnlocked: getAchievementUnlockedTemplate,
  challengeCompleted: getChallengeCompletedTemplate,
  streakReminder: getStreakReminderTemplate,
  weeklySummary: getWeeklySummaryTemplate,
  monthlyReport: getMonthlyReportTemplate,
};

export function generateEmail<T extends BaseEmailData>(
  templateName: EmailTemplateName,
  data: T
): string {
  const templateFn = emailTemplates[templateName];
  if (!templateFn) {
    throw new Error(`Unknown email template: ${templateName}`);
  }
  return templateFn(data);
}

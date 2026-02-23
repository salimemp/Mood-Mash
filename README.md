# MoodMash - Next-Generation Emotional Wellness Platform

MoodMash is a comprehensive emotional wellness application that integrates health monitoring, genomics insights, and artificial intelligence to provide personalized mood tracking, prediction, and improvement recommendations. The platform combines advanced machine learning algorithms with augmented reality experiences to deliver an immersive wellness journey.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Backend Infrastructure](#backend-infrastructure)
7. [Database Schema](#database-schema)
8. [API Services](#api-services)
9. [Compliance and Security](#compliance-and-security)
10. [ML and AI Features](#ml-and-ai-features)
11. [AR Experiences](#ar-experiences)
12. [Contributing](#contributing)
13. [License](#license)

## Overview

MoodMash represents a paradigm shift in emotional wellness management by combining multiple data sources with cutting-edge technology. The platform enables users to track their emotional states through various input methods, receive AI-powered insights, participate in guided wellness activities, and engage with a gamified reward system that encourages consistent self-improvement.

The application is built with a modern tech stack including React, TypeScript, Vite, and Supabase, ensuring fast performance, type safety, and scalable backend infrastructure. The frontend implements strict TypeScript mode throughout the codebase, while the backend provides comprehensive RESTful services with real-time capabilities.

## Features

### Core Mood Tracking

MoodMash provides sophisticated mood logging capabilities with support for 15 distinct emotions, each measurable on an intensity scale from 1 to 10. Users can log their emotional states through multiple methods including visual selection, voice journaling, text entry, and manual input. The system maintains a complete history of all mood entries, enabling trend analysis and pattern recognition over time.

The dashboard presents mood statistics through intuitive visualizations including line charts for trends, pie charts for emotion distribution, and calendar views for historical analysis. Users can filter data by time period, emotion type, and custom date ranges to gain specific insights into their emotional patterns.

### AI-Powered Insights

The platform incorporates advanced machine learning models that analyze mood patterns to generate actionable insights. The AI system identifies correlations between different emotions, detects anomalies in mood behavior, and provides personalized recommendations based on individual patterns. Users receive daily mood insights that include trend analysis, contributing factors, and suggested activities to improve their emotional state.

The pattern recognition engine continuously monitors user behavior to identify recurring themes and potential triggers. When significant changes or concerning patterns are detected, the system generates risk alerts and provides appropriate intervention suggestions. This proactive approach helps users maintain better emotional balance and seek help when needed.

### Gamification System

MoodMash features a comprehensive gamification system designed to encourage consistent engagement and personal growth. The points system awards users for various activities including daily mood logging, completed wellness sessions, achievement milestones, and streak maintenance. Points accumulate toward level progression, unlocking new features and recognition badges along the way.

The achievement system includes over 40 unique badges spanning categories such as consistency, exploration, wellness, and social engagement. Daily and weekly challenges provide specific goals that rotate regularly, keeping the experience fresh and motivating. Leaderboards allow users to compare their progress with friends and the global community, fostering a sense of healthy competition and community belonging.

### Wellness Content Library

The platform offers an extensive library of wellness content covering multiple modalities. Guided meditation sessions number over 64 entries, spanning various themes including stress relief, sleep improvement, focus enhancement, and emotional healing. Each session includes duration options, difficulty levels, and narrator choices to accommodate different preferences and experience levels.

The yoga practice module contains 94 poses organized by category, difficulty, and target benefits. Users can follow structured sessions or explore individual poses with detailed instructions and form guidance. Music therapy playlists number more than 55 curated collections, each designed to support specific emotional states and wellness goals. The system recommends content based on current mood and stated preferences.

#### Breathing Exercises & Pranayama

The breathing exercises module provides 42+ guided breathing sessions across six categories: calming, energizing, balancing, sleep, focus, and advanced. Each exercise includes customizable timing patterns for inhale, hold, exhale, and hold-after-exhale phases. The visual breathing guide displays animated cues that help users maintain proper rhythm throughout their session.

AR overlay support enables immersive breathing experiences in customizable virtual environments. Haptic feedback provides tactile guidance for timing transitions between breathing phases. Session tracking records completion data including cycle counts and total duration, which syncs automatically to the backend for analytics and progress monitoring.

#### Sleep & Rest

The sleep and rest module offers 59+ sleep content items across seven categories: stories, soundscapes, ASMR, binaural beats, meditation, and education. Audio playback features include volume control, playback speed adjustment, and a sleep timer with auto-stop functionality. The audio visualizer provides calming animations that respond to the audio content.

Content recommendations are personalized based on user preferences and time of day. The evening wind-down feature automatically suggests appropriate content as bedtime approaches. AR environments create immersive sleep experiences with ambient soundscapes and calming visualizations.

#### Exercise & Movement

The exercise and movement module provides 77+ exercises across eight categories: Tai Chi, Qigong, Stretching, Walking Meditation, Chair Exercises, HIIT, Bodyweight, and Dance. Each exercise includes step-by-step instructions, estimated calorie burn calculations, and target benefit descriptions.

AR pose detection provides real-time form feedback during supported exercises. The progress ring visualization displays completion status and time remaining. Session tracking records exercise completions with duration and calories burned, syncing to the backend for fitness analytics. The module supports all fitness levels from beginner to advanced, with modifications and precautions noted for each exercise.

### AR Experiences

MoodMash incorporates augmented reality experiences that transform wellness activities into immersive journeys. AR meditation sessions place users in customizable virtual environments ranging from peaceful beaches to serene forests, complete with ambient sounds and dynamic weather effects. The system supports spatial audio integration and environment customization to create deeply personal relaxation experiences.

AR yoga sessions provide real-time pose detection with form correction feedback. Using device camera input, the system analyzes user positioning and provides guidance to improve alignment and prevent injury. Virtual yoga instructors offer personalized coaching, while progress tracking documents improvements over time. The mood visualization feature represents emotional states through dynamic 3D particle systems and color gradients that respond to user input.

Social AR spaces enable users to join virtual wellness communities where they can meditate or practice yoga together in shared environments. Real-time messaging and presence indicators create a sense of togetherness regardless of physical distance. Users can create private rooms for intimate sessions with close friends or join public gatherings to meet new people with similar interests.

### Voice and Accessibility

The platform implements comprehensive voice support through speech-to-text and text-to-speech capabilities. Voice journaling allows users to record spoken reflections that are automatically transcribed and analyzed for sentiment. The system supports multiple languages and provides localized experiences for users around the world.

Accessibility compliance follows WCAG AA standards, ensuring the application is usable by people with diverse abilities. Screen reader compatibility, keyboard navigation, high contrast themes, and adjustable text sizes accommodate various accessibility needs. The accessibility panel provides quick access to all accommodation settings, allowing users to customize their experience without navigating complex menus.

### Wearables Integration

MoodMash integrates with popular fitness trackers and health devices to incorporate physiological data into mood analysis. The wearables service connects with devices to import sleep patterns, activity levels, heart rate variability, and other relevant metrics. This multimodal data approach provides a more complete picture of user wellness and enables more accurate predictions and recommendations.

## Technology Stack

### Frontend

The frontend application utilizes React 18 with TypeScript for robust type safety and component-based architecture. Vite serves as the build tool, providing fast development server startup and optimized production builds. The styling system combines Tailwind CSS for utility classes with custom glassmorphism effects and theming capabilities.

Key frontend dependencies include Recharts for data visualization, Lucide React for iconography, and React Router for navigation. The application implements code splitting, tree shaking, and lazy loading to optimize bundle size and initial load performance. Strict TypeScript mode is enforced across the entire codebase, with comprehensive type definitions for all data structures and API responses.

### Backend

The backend infrastructure relies on Supabase for database management, authentication, and real-time subscriptions. Supabase provides PostgreSQL database capabilities with Row Level Security policies, eliminating the need for separate API servers for many operations. The platform supports authentication through multiple methods including email/password, magic links, passkeys, biometrics, and OAuth providers.

Database functions and triggers handle complex operations including analytics calculations, streak tracking, and automated data management. The schema supports full-text search, geospatial queries, and JSON operations for flexible data handling. Real-time subscriptions enable instant updates across clients without polling.

### Additional Services

The platform integrates with Resend for transactional email delivery, providing notifications, password resets, and engagement communications. Cloudflare Turnstile protects registration and login forms from bot attacks while maintaining user-friendly experiences. The encryption system implements end-to-end encryption for sensitive data, ensuring privacy even in shared environments.

## Project Structure

The project follows a feature-based organization pattern that co-locates related components, services, and types. The main directories include:

The `src/components` directory contains all React components organized by feature area. Components related to mood tracking reside alongside their context providers, while feature-specific components like AR experiences or gamification elements maintain their own subdirectories. Shared UI components live in a dedicated `ui` folder with consistent styling and behavior.

The `src/contexts` directory houses React context providers for global state management. Each context handles a specific domain including authentication, mood data, gamification progress, and compliance preferences. Contexts provide clean APIs for component consumption while encapsulating complex state logic.

The `src/services` directory contains backend service modules that handle database operations, API calls, and business logic. Services are organized by feature with separate modules for mood operations, wellness tracking, gamification, AR features, and machine learning operations. Each service provides typed functions that wrap Supabase operations with error handling and validation.

The `src/types` directory contains TypeScript type definitions that mirror the database schema and API contracts. The `database.ts` file provides comprehensive types for all table structures, while `advanced.ts` extends these with complex types for ML, AR, and analytics features.

The `src/data` directory contains static data files including wellness content, ML models, and integration configurations. These files provide the foundation for content delivery and feature functionality without requiring database queries.

The `src/hooks` directory contains custom React hooks that encapsulate reusable logic patterns. Hooks provide abstractions for common operations including voice recording, ML inference, and responsive design.

## Getting Started

### Prerequisites

Before running the application, ensure you have Node.js 18 or later installed. The project uses pnpm as the package manager. You will also need access to a Supabase project with the database schema configured.

### Installation

Clone the repository and navigate to the project directory:

```bash
cd moodmash
```

Install dependencies using pnpm:

```bash
pnpm install
```

Configure environment variables by copying the example file:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`. The development server supports hot module replacement for instant updates during development.

### Build

Create a production build:

```bash
pnpm build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Backend Infrastructure

### Supabase Configuration

The backend leverages Supabase for database management and authentication. The client is configured in `src/lib/supabase.ts` with environment variable support for different deployment contexts. The configuration handles both authenticated and anonymous access patterns, with appropriate key selection based on the operation type.

Service-level operations use the service role key for administrative tasks that bypass Row Level Security policies. This is only used for trusted operations like data seeding and system maintenance. Regular user operations use the anon key with RLS enforcement for security.

### Database Schema

The database schema defines comprehensive tables for all platform features:

The `users` table extends Supabase Auth with profile information including display name, avatar URL, and preference settings. The `mood_entries` table stores individual mood logs with emotion type, intensity, notes, and context tags. The `wellness_sessions` table tracks completed meditation, yoga, and music therapy sessions with duration and completion status.

Gamification tables include `achievements` for unlocked badges, `challenges` for active and completed challenges, and `streaks` for consecutive day tracking. The `points_transactions` table provides a complete audit trail of point earnings and redemptions.

AR-related tables manage meditation sessions, yoga sessions, mood visualizations, social rooms, and environment presets. These tables store session parameters, completion metrics, and user-generated content. Real-time subscriptions enable live updates for social features.

Analytics tables aggregate daily metrics, weekly reports, and ML model states. These tables support the prediction and insight generation features while maintaining query performance for dashboard displays.

### Row Level Security

All tables implement Row Level Security policies that enforce data isolation between users. Policies restrict access so users can only read and modify their own records. Public content like achievement definitions and wellness content follows separate read-only patterns that allow universal access to shared data.

Social features implement more nuanced policies that allow viewing public rooms and participating in shared experiences while maintaining privacy for personal data. Users can control visibility settings for their own content, choosing between private, friends-only, and public access levels.

## API Services

### Authentication Service

The authentication service in `src/services/authService.ts` provides comprehensive user management. It supports registration with email verification, login through multiple methods, password management with reset functionality, and session handling. Two-factor authentication adds an extra security layer for sensitive operations.

Social authentication integrates with Google and GitHub OAuth providers, enabling streamlined account creation and login. The service handles token exchange, profile synchronization, and account linking for users who connect multiple providers.

### Mood Service

The mood service manages all mood-related database operations. Functions exist for creating entries with various input types, querying historical data with filters, updating existing entries, and deleting records. The service handles data validation and transformation to ensure consistency between frontend and database.

Statistics functions aggregate mood data for dashboard displays, calculating averages, distributions, and trends. These functions use database-level computations for efficiency, processing large datasets without transferring unnecessary data to clients.

### Wellness Service

The wellness service tracks user participation in guided activities. It records session starts and completions, calculates durations, and maintains completion rates. Statistics functions provide summaries by activity type, category, and time period, enabling users to track their wellness journey progress.

### Gamification Service

The gamification service manages the points economy, achievements, challenges, and streaks. Point transactions are recorded with categories and descriptions for complete transparency. Achievement tracking monitors progress toward badge criteria and unlocks new achievements when conditions are met.

Challenge functions provide daily and weekly challenge rotation, progress tracking, and completion handling. Streak management detects consecutive activity days, handles streak breaks, and maintains longest streak records. Leaderboard functions compute rankings based on points, achievements, and streak lengths.

### AR Services

The AR backend service handles all augmented reality features. Meditation session functions track environment selections, duration, and completion status. Yoga session functions store pose detections with form scores and correction feedback. Social room functions manage participant presence, messaging, and room lifecycle.

### Voice and ML Services

The voice service provides speech-to-text and text-to-speech capabilities through browser APIs and external services. Transcription functions process recorded audio and return structured text with timestamps. Sentiment analysis extracts emotional tone from transcribed text, enabling automatic mood logging from voice entries.

The ML service manages model state, prediction storage, and insight generation. Pattern recognition functions analyze historical data to identify trends and correlations. Prediction functions generate forecasts based on accumulated patterns and current context.

## Compliance and Security

### Privacy Regulations

MoodMash implements comprehensive compliance with major privacy regulations. The GDPR framework provides data subject rights including access, rectification, erasure, and portability. Consent management tracks user approvals for data processing activities, enabling granular control over privacy preferences.

CCPA compliance ensures California residents can opt out of data sales and request disclosure of collected information. PIPEDA requirements are met through explicit consent collection and purpose limitation. HIPAA considerations inform data handling practices for health-related information, though the platform does not currently process protected health information.

SOC 2 controls are implemented through access controls, encryption, and audit logging. The security infrastructure follows industry best practices for data protection and system integrity.

### Security Features

Password policies enforce strong authentication with requirements for complexity, breach checking, and regular rotation. Two-factor authentication supports authenticator apps and backup codes. Session management provides visibility into active sessions with remote revocation capabilities.

The encryption context implements client-side encryption for sensitive data before storage. Encryption keys are derived from user credentials, ensuring only authorized users can access their private information. Encryption indicators throughout the UI confirm when data is protected.

Security alerts notify users of suspicious activity including new device logins, unusual location access, and password changes. Alert banners provide immediate notification of security-relevant events, enabling users to respond quickly to potential threats.

### Cookie Consent

The cookie consent banner implements requirements for tracking and analytics cookies. Users can accept all cookies, reject non-essential cookies, or customize their preferences. Consent is recorded and respected throughout the platform, with easy access to preference management through the privacy settings page.

## ML and AI Features

### Mood Prediction

The mood prediction system uses historical mood data to forecast future emotional states. The model considers patterns including time of day, day of week, recent activities, and seasonal factors. Predictions are stored and updated as new data becomes available, enabling proactive wellness recommendations.

### Pattern Recognition

The pattern recognition engine analyzes mood data to identify correlations and trends. Functions detect recurring emotional patterns, identify trigger factors, and highlight significant changes. Insights are generated when patterns reach statistical significance, providing users with actionable awareness of their emotional dynamics.

### Anomaly Detection

Anomaly detection identifies unusual mood patterns that may warrant attention. The system uses statistical analysis to detect deviations from typical behavior, flagging both positive and negative anomalies. Users receive notifications when anomalies are detected, with context to help interpret the finding.

### Recommendations

The recommendation engine provides personalized suggestions based on user data and behavior. Content recommendations draw from the wellness library, matching activities to current mood and stated preferences. Intervention recommendations suggest actions when concerning patterns are detected, promoting proactive mental health management.

## AR Experiences

### Meditation Environments

AR meditation sessions offer immersive environments including nature scenes, cosmic spaces, and abstract calming visuals. Users can customize environment parameters including time of day, weather, and ambient sounds. Sessions track completion and collect feedback for continuous improvement.

### Yoga Sessions

AR yoga sessions provide real-time pose detection using device camera input. The system analyzes joint positions and provides form feedback through visual overlays and audio guidance. Virtual instructors demonstrate poses while tracking user progress through the session.

### Social Features

Social AR spaces enable multi-user wellness activities. Users can create or join rooms for group meditation and yoga sessions. Real-time presence indicators show active participants, while chat functionality enables communication during sessions. Privacy controls allow users to control who can see and join their activities.

### Mood Visualization

AR mood visualization creates artistic representations of emotional states. Users can explore their mood history through 3D visualizations that represent emotions through color, form, and motion. These visualizations provide creative outlets for emotional expression and reflection.

## Contributing

Contributions to MoodMash are welcome and encouraged. Before submitting pull requests, please review the coding standards and ensure TypeScript strict mode compliance. All new features should include appropriate type definitions and documentation.

To report bugs or request features, use the issue tracker. Provide detailed descriptions and reproduction steps for bugs. Feature requests should include use cases and proposed implementation approaches when possible.

## License

MoodMash is proprietary software. All rights are reserved. The source code is provided for reference and educational purposes but may not be redistributed or used for commercial purposes without explicit permission.

---

**Version:** 2.1.0
**Last Updated:** 2026-02-23
**Documentation Status:** Complete

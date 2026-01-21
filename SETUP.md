# Malaica Calendar - Setup Guide

This is a content calendar application for managing Dr. Lorraine Muluka's LinkedIn content. Joy Ocholla is the Digital Manager using this platform.

## Authentication

This application uses **Clerk** for authentication with Google OAuth support, enabling integration with Google Calendar API.

## Prerequisites

1. Node.js 20+
2. PostgreSQL database
3. Clerk account (free tier available)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable Google OAuth provider:
   - Go to "Configure" → "SSO Connections"
   - Enable Google
   - Configure OAuth consent screen and credentials
4. Copy your API keys from the Clerk dashboard

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your values:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # From Clerk Dashboard
CLERK_SECRET_KEY=sk_test_xxxxx       # From Clerk Dashboard

# Vite Client Environment Variables
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # Same as CLERK_PUBLISHABLE_KEY

# Server
PORT=5000
NODE_ENV=development
```

### 4. Set Up Database

Push the database schema:

```bash
npm run db:push
```

### 5. Run the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Features

- **Calendar View**: Visual content calendar with drag-and-drop scheduling
- **Kanban Board**: Three-stage workflow (Creation → Curation → Conversation)
- **Content Intelligence**: Track mission, vision, target audience, keywords, hashtags, and KPIs
- **Multi-Platform Support**: LinkedIn, X (Twitter), Blog, Email
- **Google Authentication**: Sign in with Google for easy Google Calendar integration

## User Management

This is a single-user application designed for Joy Ocholla to manage Dr. Lorraine Muluka's content. Additional users can be added through Clerk's dashboard if needed.

## Google Calendar Integration (Future)

With Clerk's Google OAuth, you can extend this application to:
- Sync scheduled content to Google Calendar
- Import events from Google Calendar
- Set reminders for content publication

To enable Google Calendar API:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Calendar API
3. Configure OAuth consent screen
4. Add the Calendar API scope in Clerk's Google provider settings

## Support

For issues or questions, contact the development team.


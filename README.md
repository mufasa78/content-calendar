# 📅 Malaica Content Calendar

Malaica Content Calendar is a powerful, modern content strategy and scheduling platform designed for creators, marketers, and teams. It streamlines the entire content lifecycle—from initial ideation and strategy to visual scheduling and Google Calendar synchronization.

![Malaica Calendar Preview](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200&h=400)

## ✨ Features

### 📋 Intelligent Kanban Workflow

Manage your content across three strategic stages:

- **Creation**: Draft and develop your initial ideas.
- **Curation**: Refine and polish your content.
- **Conversation**: Engagement and community management phase.

### 🗓 Visual Content Scheduling

- **Full-featured Calendar**: Drag-and-drop interface for intuitive rescheduling.
- **Platform Specifics**: Tailor content for X (Twitter), LinkedIn, Blogs, and Email.
- **Status Tracking**: Color-coded status system (Draft, Review, Scheduled, Published).

### 🧠 Post Intelligence Layer

Every post includes a strategic metadata layer:

- **Strategy**: Background, Mission, Vision, and Purpose.
- **Content**: Keywords, Hashtags, and Calls to Action (CTA).
- **KPIs**: Reach, Engagement, and Lead targets.

### 🔄 Google Calendar Integration

- **Two-way Sync**: Seamlessly sync your scheduled content with your Google Calendar.
- **Status Mapping**: Event colors in Google Calendar reflect your post status.
- **Automated Updates**: Changes in the app are instantly reflected in your calendar.

### 🔒 Secure & Private

- **Enterprise Auth**: Powered by [Clerk](https://clerk.com/) for secure, modern authentication.
- **User Isolation**: Your content and strategy remain private to your account.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **UI Components**: Radix UI, Shadcn UI, Lucide Icons
- **State Management**: TanStack Query (React Query)
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (via [Neon](https://neon.tech/))
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Integrations**: Google Calendar API (googleapis)

---

## 🛠 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL database (Neon recommended)
- Clerk Account
- Google Cloud Project (for Calendar API)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mufasa78/content-calendar.git
   cd content-calendar
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```env
   # Clerk Auth
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key

   # Database
   DATABASE_URL=your_postgresql_url

   # Google Calendar API
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

### Running the App

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

---

## 📊 Database Management

The project uses **Drizzle ORM** for database management.

- **Schema Definition**: Found in `shared/schema.ts`
- **Migrations**: Automated via `npm run db:push`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

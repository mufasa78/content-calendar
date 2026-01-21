# Quick Start Guide - Malaica Content Calendar

## For Joy Ocholla - Digital Manager

This is your content calendar for managing Dr. Lorraine Muluka's LinkedIn content.

## 🚀 Getting Started (5 Minutes)

### Step 1: Set Up Clerk (2 minutes)

1. Go to https://dashboard.clerk.com and sign up
2. Create a new application (name it "Malaica Calendar")
3. Enable Google OAuth:
   - Click "Configure" → "SSO Connections"
   - Toggle on "Google"
   - Click "Save"
4. Copy your keys from the "API Keys" page

### Step 2: Configure Environment (1 minute)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Clerk keys:
   ```env
   CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

3. Add your database URL (if using Replit, it's already set)

### Step 3: Set Up Database (1 minute)

```bash
npm run db:push
```

### Step 4: Start the App (1 minute)

```bash
npm run dev
```

Visit http://localhost:5000

## 🎯 First Time Use

1. Click "Get Started" or "Log In"
2. Sign in with your Google account
3. You'll be redirected to the Calendar view
4. Start adding content!

## 📅 Using the Calendar

### Add Content
1. Click on any date in the calendar
2. Fill in:
   - Title
   - Brief description
   - Platform (LinkedIn, X, Blog, Email)
   - Intelligence data (mission, vision, target audience, etc.)
3. Click "Create"

### Edit Content
- Click on any content item to edit
- Drag and drop to reschedule

### Delete Content
- Click on content item
- Click "Delete" button

## 📊 Using the Kanban Board

Navigate to "Kanban Board" in the sidebar to see your content workflow:

- **Creation** - Ideas and drafts
- **Curation** - Content being refined
- **Conversation** - Published content

Drag cards between columns to update status.

## 🔐 Security

- Only you (Joy) can access this calendar
- All content is private and scoped to your account
- Sign out when done using the button in the sidebar

## 📱 Access Anywhere

Once deployed, you can access this calendar from:
- Desktop computer
- Tablet
- Mobile phone

Just sign in with your Google account!

## 🆘 Need Help?

See the full documentation:
- `SETUP.md` - Detailed setup instructions
- `CLERK_MIGRATION_SUMMARY.md` - Technical details
- `MIGRATION_NOTES.md` - Database information

## 🎨 Customization

Want to customize the calendar for Dr. Muluka's brand?
- Colors can be changed in `tailwind.config.ts`
- Logo can be updated in the sidebar component
- Platform options can be modified in the content form

---

**Ready to manage Dr. Muluka's content like a pro!** 🚀


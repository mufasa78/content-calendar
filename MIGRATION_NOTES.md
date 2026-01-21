# Database Migration Notes

## Changes from Replit Auth to Clerk

### Schema Changes

1. **Removed `sessions` table** - Clerk handles session management
2. **Updated `users` table**:
   - `id` field now stores Clerk user IDs (format: `user_xxxxx`)
   - Removed auto-generated UUID default
   - Made `email` field required (NOT NULL)

### Migration Steps

If you have existing data, you'll need to:

1. **Backup your database** before making any changes

2. **Drop the sessions table** (if it exists):
   ```sql
   DROP TABLE IF EXISTS sessions CASCADE;
   ```

3. **Update the users table**:
   ```sql
   -- Remove the default UUID generation
   ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
   
   -- Make email required
   ALTER TABLE users ALTER COLUMN email SET NOT NULL;
   ```

4. **Clear existing users** (since Clerk user IDs are different):
   ```sql
   -- WARNING: This will delete all users and their content
   -- Only do this if you're okay losing existing data
   TRUNCATE TABLE content_items CASCADE;
   TRUNCATE TABLE users CASCADE;
   ```

5. **Push the new schema**:
   ```bash
   npm run db:push
   ```

### Fresh Installation

If this is a fresh installation with no existing data:

```bash
npm run db:push
```

This will create all tables with the correct schema.

## User Authentication Flow

1. User signs in with Google via Clerk
2. Clerk creates/manages the user session
3. On first API call, the user is automatically created in our database with their Clerk ID
4. All subsequent requests use the Clerk user ID to fetch user-specific content

## Notes

- Clerk handles all authentication, session management, and user profile updates
- Our database only stores the minimal user info needed for content association
- User profile images and other details are fetched from Clerk when needed


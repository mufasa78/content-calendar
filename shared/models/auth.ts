import { pgTable, timestamp, varchar, text, boolean, index } from "drizzle-orm/pg-core";

// User storage table for Clerk authentication
// The id field will store Clerk's user ID
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Clerk user ID (e.g., user_xxxxx)
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),

  // Google Calendar Integration
  googleCalendarEnabled: boolean("google_calendar_enabled").default(false),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  googleTokenExpiry: timestamp("google_token_expiry"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Add indexes for better query performance
  emailIdx: index("users_email_idx").on(table.email),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

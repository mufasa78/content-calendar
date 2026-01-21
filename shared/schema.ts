import { pgTable, text, serial, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Import auth models to ensure they are included in the schema
import { users } from "./models/auth";
export * from "./models/auth";

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to users.id from auth
  title: text("title").notNull(),
  brief: text("brief"),

  // Workflow tracking
  status: text("status").notNull().default("Draft"), // Draft, Review, Scheduled, Published, Repurposed
  kanbanStage: text("kanban_stage").notNull().default("Creation"), // Creation, Curation, Conversation

  // Scheduling
  scheduledAt: timestamp("scheduled_at"),
  platform: text("platform").notNull(), // X, LinkedIn, Blog, Email, etc.

  // Google Calendar Integration
  googleCalendarEventId: text("google_calendar_event_id"), // Stores the Google Calendar event ID for syncing

  // Post Intelligence Layer (JSONB for flexibility)
  // Contains: background, mission, vision, purpose, targetAudience, keywords, hashtags, cta, kpiTarget
  intelligence: jsonb("intelligence").$type<{
    background?: string;
    mission?: string;
    vision?: string;
    purpose?: string;
    targetAudience?: string;
    keywords?: string[];
    hashtags?: string[];
    cta?: string;
    metricsTarget?: {
      reach?: number;
      engagement?: number;
      leads?: number;
    };
  }>(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Add indexes for better query performance
  userIdIdx: index("content_items_user_id_idx").on(table.userId),
  createdAtIdx: index("content_items_created_at_idx").on(table.createdAt),
  statusIdx: index("content_items_status_idx").on(table.status),
  scheduledAtIdx: index("content_items_scheduled_at_idx").on(table.scheduledAt),
}));

export const insertContentItemSchema = createInsertSchema(contentItems, {
  scheduledAt: z.coerce.date().nullable(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;

export type CreateContentItemRequest = InsertContentItem;
export type UpdateContentItemRequest = Partial<InsertContentItem>;

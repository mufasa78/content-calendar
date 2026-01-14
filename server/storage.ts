import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  contentItems, 
  type ContentItem, 
  type InsertContentItem,
  type UpdateContentItemRequest 
} from "@shared/schema";
// Re-export auth storage for convenience if needed, 
// though we usually access it via the auth integration module directly.
export { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Content Items
  getContentItems(userId: string): Promise<ContentItem[]>;
  getContentItem(id: number): Promise<ContentItem | undefined>;
  createContentItem(userId: string, item: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: number, updates: UpdateContentItemRequest): Promise<ContentItem | undefined>;
  deleteContentItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getContentItems(userId: string): Promise<ContentItem[]> {
    return await db.select()
      .from(contentItems)
      .where(eq(contentItems.userId, userId))
      .orderBy(desc(contentItems.createdAt));
  }

  async getContentItem(id: number): Promise<ContentItem | undefined> {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return item;
  }

  async createContentItem(userId: string, item: InsertContentItem): Promise<ContentItem> {
    const [newItem] = await db.insert(contentItems).values({
      ...item,
      userId,
    }).returning();
    return newItem;
  }

  async updateContentItem(id: number, updates: UpdateContentItemRequest): Promise<ContentItem | undefined> {
    const [updated] = await db.update(contentItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contentItems.id, id))
      .returning();
    return updated;
  }

  async deleteContentItem(id: number): Promise<void> {
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }
}

export const storage = new DatabaseStorage();

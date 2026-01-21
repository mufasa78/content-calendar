import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  contentItems,
  type ContentItem,
  type InsertContentItem,
  type UpdateContentItemRequest
} from "@shared/schema";
import { contentCache, itemCache, cacheKeys } from "./cache";

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
    const cacheKey = cacheKeys.userContent(userId);
    
    // Try cache first
    const cached = contentCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const items = await db.select()
      .from(contentItems)
      .where(eq(contentItems.userId, userId))
      .orderBy(desc(contentItems.createdAt));

    // Cache the result
    contentCache.set(cacheKey, items);
    
    // Also cache individual items
    items.forEach(item => {
      itemCache.set(cacheKeys.contentItem(item.id), item);
    });

    return items;
  }

  async getContentItem(id: number): Promise<ContentItem | undefined> {
    const cacheKey = cacheKeys.contentItem(id);
    
    // Try cache first
    const cached = itemCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    
    // Cache the result
    if (item) {
      itemCache.set(cacheKey, item);
    }
    
    return item;
  }

  async createContentItem(userId: string, item: InsertContentItem): Promise<ContentItem> {
    const [newItem] = await db.insert(contentItems).values({
      ...item,
      userId,
      intelligence: item.intelligence as any, // Type assertion for JSONB field
    }).returning();

    // Invalidate user's content list cache
    contentCache.delete(cacheKeys.userContent(userId));
    
    // Cache the new item
    itemCache.set(cacheKeys.contentItem(newItem.id), newItem);

    return newItem;
  }

  async updateContentItem(id: number, updates: UpdateContentItemRequest): Promise<ContentItem | undefined> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Type assertion for JSONB field if present
    if (updates.intelligence) {
      updateData.intelligence = updates.intelligence as any;
    }

    const [updated] = await db.update(contentItems)
      .set(updateData)
      .where(eq(contentItems.id, id))
      .returning();

    if (updated) {
      // Update caches
      itemCache.set(cacheKeys.contentItem(id), updated);
      
      // Invalidate user's content list cache
      contentCache.delete(cacheKeys.userContent(updated.userId));
    }

    return updated;
  }

  async deleteContentItem(id: number): Promise<void> {
    // Get the item first to know which user's cache to invalidate
    const item = await this.getContentItem(id);
    
    await db.delete(contentItems).where(eq(contentItems.id, id));

    // Invalidate caches
    itemCache.delete(cacheKeys.contentItem(id));
    if (item) {
      contentCache.delete(cacheKeys.userContent(item.userId));
    }
  }
}

export const storage = new DatabaseStorage();

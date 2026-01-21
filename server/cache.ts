// High-performance in-memory cache with LRU eviction
class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; accessCount: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access count and timestamp for LRU
    item.accessCount++;
    item.timestamp = Date.now();
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }

  set(key: string, value: T): void {
    // Remove oldest items if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    let totalAccess = 0;
    const values = Array.from(this.cache.values());
    for (const item of values) {
      totalAccess += item.accessCount;
    }
    return totalAccess > 0 ? (this.cache.size / totalAccess) * 100 : 0;
  }
}

// Global cache instances
export const userCache = new LRUCache<any>(500, 10 * 60 * 1000); // 10 minutes for users
export const contentCache = new LRUCache<any[]>(200, 2 * 60 * 1000); // 2 minutes for content lists
export const itemCache = new LRUCache<any>(1000, 5 * 60 * 1000); // 5 minutes for individual items

// Cache key generators
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userContent: (userId: string) => `content:user:${userId}`,
  contentItem: (id: number) => `content:item:${id}`,
};

// Cache warming function
export async function warmCache() {
  console.log('Cache warming initiated...');
  // Could pre-load frequently accessed data here
}

// Cache cleanup function
export function cleanupCache() {
  const stats = {
    user: userCache.getStats(),
    content: contentCache.getStats(),
    item: itemCache.getStats()
  };
  
  console.log('Cache stats:', stats);
  
  // Optional: Clear caches periodically
  // userCache.clear();
  // contentCache.clear();
  // itemCache.clear();
}

// Set up periodic cache cleanup
setInterval(cleanupCache, 30 * 60 * 1000); // Every 30 minutes
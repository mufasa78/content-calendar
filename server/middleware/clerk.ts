import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, checkDatabaseHealth } from "../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { userCache, cacheKeys } from "../cache";

// Extend Express Request type to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string | null;
        sessionId: string | null;
      };
    }
  }
}

// Clerk middleware - this should be applied to all routes
export const clerkAuth = clerkMiddleware();

// Middleware to ensure user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  
  if (!auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.auth = {
    userId: auth.userId,
    sessionId: auth.sessionId,
  };
  
  next();
};

// Middleware to sync Clerk user to database
export const syncUserToDatabase = async (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  
  if (!auth.userId) {
    return next();
  }

  try {
    // Check cache first
    const cacheKey = cacheKeys.user(auth.userId);
    const cachedUser = userCache.get(cacheKey);
    
    if (!cachedUser) {
      // Check database health before querying
      const isHealthy = await checkDatabaseHealth();
      if (!isHealthy) {
        console.warn('Database unhealthy, skipping user sync');
        return next();
      }

      // Check if user exists in database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, auth.userId),
      });

      if (existingUser) {
        userCache.set(cacheKey, existingUser);
      }
    }
    
    next();
  } catch (error) {
    console.error("Error syncing user to database:", error);
    next();
  }
};

// Retry mechanism for database operations
async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retries exceeded');
}

// Auth routes for user management
export function registerAuthRoutes(app: any) {
  // Get current user - Ultra-fast with aggressive caching and error handling
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    const auth = getAuth(req);
    
    if (!auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const cacheKey = cacheKeys.user(auth.userId);
      
      // Check cache first - this should be instant
      const cachedUser = userCache.get(cacheKey);
      if (cachedUser) {
        return res.json(cachedUser);
      }

      // Check database health before proceeding
      const isHealthy = await checkDatabaseHealth();
      if (!isHealthy) {
        console.error('Database is unhealthy, cannot fetch user');
        return res.status(503).json({ 
          message: "Database temporarily unavailable. Please try again in a moment." 
        });
      }

      // Try to get user from database with retry mechanism
      let user = await retryDatabaseOperation(async () => {
        return await db.query.users.findFirst({
          where: eq(users.id, auth.userId),
        });
      });

      // If user doesn't exist in database, create them
      if (!user) {
        try {
          // Get user info from Clerk (this is the slow part, but only happens once)
          const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${auth.userId}`, {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
            timeout: 5000, // 5 second timeout for Clerk API
          });

          if (!clerkResponse.ok) {
            throw new Error(`Clerk API error: ${clerkResponse.status}`);
          }

          const clerkUser = await clerkResponse.json();

          // Create user in database with retry
          const [newUser] = await retryDatabaseOperation(async () => {
            return await db.insert(users).values({
              id: auth.userId,
              email: clerkUser.email_addresses[0]?.email_address || "",
              firstName: clerkUser.first_name,
              lastName: clerkUser.last_name,
              profileImageUrl: clerkUser.image_url,
            }).returning();
          });

          user = newUser;
        } catch (clerkError) {
          console.error('Error creating user from Clerk:', clerkError);
          return res.status(500).json({ 
            message: "Failed to create user account. Please try again." 
          });
        }
      }

      // Cache the user data with longer TTL for user data
      userCache.set(cacheKey, user);

      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('timeout')) {
        return res.status(504).json({ 
          message: "Request timeout. Please try again." 
        });
      } else if (error.message?.includes('Connection terminated')) {
        return res.status(503).json({ 
          message: "Database connection issue. Please try again in a moment." 
        });
      } else {
        return res.status(500).json({ 
          message: "Internal server error. Please try again." 
        });
      }
    }
  });

  // Logout endpoint (Clerk handles this on the client side, but we provide this for compatibility)
  app.post("/api/logout", (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (auth.userId) {
      // Clear user cache on logout
      userCache.delete(cacheKeys.user(auth.userId));
    }
    res.json({ message: "Logout successful. Please sign out on the client." });
  });
}


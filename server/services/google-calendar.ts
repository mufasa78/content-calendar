import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db';
import { users } from '@shared/models/auth';
import { contentItems } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { userCache, cacheKeys } from '../cache';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate Google OAuth URL for user to authorize
   */
  getAuthUrl(userId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId, // Pass userId to identify user after callback
      prompt: 'consent', // Force consent screen to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens and save to database
   */
  async handleCallback(code: string, userId: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    
    await db.update(users)
      .set({
        googleAccessToken: tokens.access_token || null,
        googleRefreshToken: tokens.refresh_token || null,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        googleCalendarEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Invalidate user cache
    userCache.delete(cacheKeys.user(userId));
  }

  /**
   * Get authenticated calendar client for a user
   */
  private async getCalendarClient(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || !user.googleAccessToken) {
      throw new Error('User not connected to Google Calendar');
    }

    this.oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken || undefined,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    // Refresh token if expired
    if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry) {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      await db.update(users)
        .set({
          googleAccessToken: credentials.access_token || null,
          googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      // Invalidate user cache
      userCache.delete(cacheKeys.user(userId));
      
      this.oauth2Client.setCredentials(credentials);
    }

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Create or update a Google Calendar event for a content item
   */
  async syncContentToCalendar(contentItemId: number, userId: string): Promise<string> {
    const calendar = await this.getCalendarClient(userId);
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, contentItemId));

    if (!item) {
      throw new Error('Content item not found');
    }

    if (!item.scheduledAt) {
      throw new Error('Content item must have a scheduled date');
    }

    const event = {
      summary: `📝 ${item.title}`,
      description: `Platform: ${item.platform}\n\n${item.brief || ''}\n\nStatus: ${item.status}`,
      start: {
        dateTime: item.scheduledAt.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(item.scheduledAt.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        timeZone: 'UTC',
      },
      colorId: this.getColorIdForStatus(item.status),
    };

    let eventId = item.googleCalendarEventId;

    if (eventId) {
      // Update existing event
      await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
      });
    } else {
      // Create new event
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      eventId = response.data.id!;

      // Save event ID to database
      await db.update(contentItems)
        .set({ googleCalendarEventId: eventId, updatedAt: new Date() })
        .where(eq(contentItems.id, contentItemId));
    }

    return eventId;
  }

  /**
   * Delete a Google Calendar event
   */
  async deleteCalendarEvent(contentItemId: number, userId: string): Promise<void> {
    const calendar = await this.getCalendarClient(userId);
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, contentItemId));

    if (item?.googleCalendarEventId) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: item.googleCalendarEventId,
        });
      } catch (error) {
        console.error('Error deleting calendar event:', error);
      }
    }
  }

  /**
   * Disconnect Google Calendar for a user
   */
  async disconnectCalendar(userId: string): Promise<void> {
    await db.update(users)
      .set({
        googleCalendarEnabled: false,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Invalidate user cache
    userCache.delete(cacheKeys.user(userId));
  }

  /**
   * Get color ID based on content status
   */
  private getColorIdForStatus(status: string): string {
    switch (status) {
      case 'Published': return '10'; // Green
      case 'Scheduled': return '9';  // Blue
      case 'Review': return '5';     // Yellow
      default: return '8';           // Gray
    }
  }
}

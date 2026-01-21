import { Router } from 'express';
import { GoogleCalendarService } from '../services/google-calendar';
import { isAuthenticated } from '../middleware/clerk';

const router = Router();
const googleCalendarService = new GoogleCalendarService();

/**
 * GET /api/google/auth
 * Get Google OAuth URL to start authorization flow
 */
router.get('/auth', isAuthenticated, (req, res) => {
  try {
    const userId = req.auth!.userId!;
    const authUrl = googleCalendarService.getAuthUrl(userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: 'Failed to generate authorization URL' });
  }
});

/**
 * GET /api/google/callback
 * Handle OAuth callback from Google
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).send('Missing authorization code or state');
    }

    const userId = state as string;
    await googleCalendarService.handleCallback(code as string, userId);
    
    // Redirect back to the app with success message
    res.redirect('http://localhost:8080/calendar?google_connected=true');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.redirect('http://localhost:8080/calendar?google_error=true');
  }
});

/**
 * POST /api/google/sync/:contentId
 * Sync a specific content item to Google Calendar
 */
router.post('/sync/:contentId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.auth!.userId!;
    const contentId = parseInt(req.params.contentId);
    
    if (isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }

    const eventId = await googleCalendarService.syncContentToCalendar(contentId, userId);
    res.json({ success: true, eventId });
  } catch (error: any) {
    console.error('Error syncing to calendar:', error);
    res.status(500).json({ message: error.message || 'Failed to sync to Google Calendar' });
  }
});

/**
 * DELETE /api/google/disconnect
 * Disconnect Google Calendar integration
 */
router.delete('/disconnect', isAuthenticated, async (req, res) => {
  try {
    const userId = req.auth!.userId!;
    await googleCalendarService.disconnectCalendar(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    res.status(500).json({ message: 'Failed to disconnect Google Calendar' });
  }
});

export default router;


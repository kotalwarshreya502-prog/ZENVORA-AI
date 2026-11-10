import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Storage.getPosts(userId);

    // Format posts into calendar events
    const events = posts
      .filter((p) => p.scheduledFor || p.publishedAt)
      .map((p) => ({
        id: p._id,
        title: p.title || p.content.slice(0, 30),
        platform: p.platform,
        status: p.status,
        date: p.scheduledFor || p.publishedAt,
        type: p.type,
      }));

    return successResponse(res, 'Calendar events fetched', { events });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch calendar', 500, err.message);
  }
};

export const scheduleEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, title, platform, scheduledFor, content } = req.body;

    if (!scheduledFor) {
      return errorResponse(res, 'Scheduled date and time is required', 400);
    }

    let post;
    if (postId) {
      post = await Storage.updatePost(postId, { scheduledFor: new Date(scheduledFor), status: 'Scheduled' });
    } else {
      post = await Storage.createPost(userId, {
        title: title || 'Scheduled Post',
        content: content || 'Scheduled marketing update',
        platform: platform || 'LinkedIn',
        scheduledFor: new Date(scheduledFor),
        status: 'Scheduled',
      });
    }

    return successResponse(res, 'Event scheduled successfully', { post }, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to schedule event', 500, err.message);
  }
};

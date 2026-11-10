import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Storage.getNotifications(userId);
    return successResponse(res, 'Notifications retrieved', { notifications });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch notifications', 500, err.message);
  }
};

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Storage.markNotificationsRead(userId);
    return successResponse(res, 'All notifications marked as read');
  } catch (err) {
    return errorResponse(res, 'Failed to update notifications', 500, err.message);
  }
};

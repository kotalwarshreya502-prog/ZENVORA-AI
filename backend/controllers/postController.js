import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, platform } = req.query;
    const posts = await Storage.getPosts(userId, { status, platform });
    return successResponse(res, 'Posts fetched', { posts });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch posts', 500, err.message);
  }
};

export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, type, platform, campaignId, scheduledFor, hashtags, mediaUrls } = req.body;

    if (!content || content.trim() === '') {
      return errorResponse(res, 'Post content is required', 400);
    }

    const post = await Storage.createPost(userId, {
      title: title || 'Untitled Post',
      content,
      type: type || 'Social Post',
      platform: platform || 'LinkedIn',
      campaignId: campaignId || null,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: scheduledFor ? 'Scheduled' : 'Draft',
      hashtags: hashtags || [],
      mediaUrls: mediaUrls || [],
    });

    return successResponse(res, 'Post saved successfully', { post }, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to save post', 500, err.message);
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Storage.updatePost(id, req.body);
    return successResponse(res, 'Post updated', { post: updated });
  } catch (err) {
    return errorResponse(res, 'Failed to update post', 500, err.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Storage.deletePost(id);
    return successResponse(res, 'Post deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete post', 500, err.message);
  }
};

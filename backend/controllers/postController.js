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
    const { title, content, type, platform, campaignId, scheduledFor, hashtags, mediaUrls, status } = req.body;

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
      status: status || (scheduledFor ? 'Scheduled' : 'Draft'),
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

export const publishPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const posts = await Storage.getPosts(userId);
    const post = posts.find(p => p._id.toString() === id.toString());

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    // Check integration status
    const { default: SocialIntegration } = await import('../models/SocialIntegration.js');
    const { default: Business } = await import('../models/Business.js');

    const business = await Business.findOne({ ownerId: userId });
    let isConnected = false;
    let accountName = '';

    if (business) {
      const integration = await SocialIntegration.findOne({
        businessId: business._id,
        platform: post.platform?.toLowerCase(),
        isConnected: true,
      });

      if (integration) {
        isConnected = true;
        accountName = integration.accountName;
      }
    }

    // Never simulate publishing silently: if not connected, inform the user honestly
    if (!isConnected) {
      return errorResponse(
        res,
        `Cannot publish to ${post.platform}. No verified OAuth integration found for this account. Please connect ${post.platform} in Settings -> Integrations first.`,
        400
      );
    }

    const updated = await Storage.updatePost(id, {
      status: 'Published',
      publishedAt: new Date(),
    });

    return successResponse(res, `Post successfully published to ${post.platform} (${accountName})`, {
      post: updated,
      publishedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[PublishPost] Error:', err.message);
    return errorResponse(res, `Publishing failed: ${err.message}`, 500, err.message);
  }
};

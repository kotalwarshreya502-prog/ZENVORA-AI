import { errorResponse, successResponse } from '../utils/responseHandler.js';
import SocialIntegration from '../models/SocialIntegration.js';
import Business from '../models/Business.js';
import Storage from '../services/storageService.js';

export const getIntegrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const business = await Storage.getBusinessByOwner(userId);
    const businessId = business?._id;

    const dbIntegrations = businessId
      ? await SocialIntegration.find({ businessId })
      : [];

    const dbMap = {};
    dbIntegrations.forEach(i => {
      dbMap[i.platform] = i;
    });

    const registry = [
      {
        id: 'linkedin',
        name: 'LinkedIn Company Pages',
        icon: 'linkedin',
        category: 'Social Media',
        status: dbMap['linkedin']?.isConnected ? 'Connected' : 'Not Connected',
        accountName: dbMap['linkedin']?.accountName || '',
        description: 'Publish company updates, long-form articles, and track engagement analytics.',
        requiredScopes: ['w_member_social', 'r_organization_social'],
      },
      {
        id: 'twitter',
        name: 'X (formerly Twitter)',
        icon: 'twitter',
        category: 'Social Media',
        status: dbMap['twitter']?.isConnected ? 'Connected' : 'Not Connected',
        accountName: dbMap['twitter']?.accountName || '',
        description: 'Auto-publish threads, monitor brand mentions, and schedule promotional tweets.',
        requiredScopes: ['tweet.write', 'tweet.read', 'users.read'],
      },
      {
        id: 'instagram',
        name: 'Instagram Professional',
        icon: 'instagram',
        category: 'Visual & Media',
        status: dbMap['instagram']?.isConnected ? 'Connected' : 'Not Connected',
        accountName: dbMap['instagram']?.accountName || '',
        description: 'Schedule feed posts, reels, and stories with automated hashtag clustering.',
        requiredScopes: ['instagram_basic', 'instagram_content_publish'],
        setupGuide: 'Requires an active Instagram Business or Creator account connected via Facebook Pages API.',
      },
      {
        id: 'facebook',
        name: 'Facebook Pages',
        icon: 'facebook',
        category: 'Social Media',
        status: dbMap['facebook']?.isConnected ? 'Connected' : 'Not Connected',
        accountName: dbMap['facebook']?.accountName || '',
        description: 'Broadcast community updates and target organic local audience growth.',
        requiredScopes: ['pages_manage_posts', 'pages_read_engagement'],
        setupGuide: 'Requires Meta Business Manager app registration.',
      },
      {
        id: 'google_business',
        name: 'Google Business Profile',
        icon: 'globe',
        category: 'Local SEO',
        status: dbMap['google_business']?.isConnected ? 'Connected' : 'Not Connected',
        accountName: dbMap['google_business']?.accountName || '',
        description: 'Monitor Google reviews, auto-draft replies, and publish weekly local updates.',
        requiredScopes: ['business.manage'],
        setupGuide: 'Authorize via Google Cloud Console with Google My Business API enabled.',
      },
      {
        id: 'wordpress',
        name: 'WordPress REST API',
        icon: 'code',
        category: 'CMS & Editorial',
        status: dbMap['wordpress']?.isConnected ? 'Connected' : 'Not Connected',
        accountName: dbMap['wordpress']?.accountName || '',
        description: 'Direct 1-click publishing of SEO-optimized blog drafts to your WordPress site.',
        requiredScopes: ['application_passwords'],
        setupGuide: 'Generate an Application Password in your WordPress User Profile.',
      },
    ];

    return successResponse(res, 'Integrations list fetched', { integrations: registry });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch integrations', 500, err.message);
  }
};

export const toggleIntegration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { action, accountName } = req.body; // 'connect' | 'disconnect'

    let business = await Storage.getBusinessByOwner(userId);
    if (!business) {
      business = await Storage.updateBusiness(userId, { name: 'My Business' });
    }

    const isConnect = action === 'connect';

    const integration = await SocialIntegration.findOneAndUpdate(
      { businessId: business._id, platform: id.toLowerCase() },
      {
        businessId: business._id,
        platform: id.toLowerCase(),
        isConnected: isConnect,
        accountName: isConnect ? (accountName || `${id}_official`) : '',
        connectedAt: isConnect ? new Date() : null,
      },
      { upsert: true, new: true }
    );

    return successResponse(
      res,
      `Integration ${id} ${isConnect ? 'connected successfully' : 'disconnected'}.`,
      { integration }
    );
  } catch (err) {
    return errorResponse(res, 'Failed to update integration state', 500, err.message);
  }
};

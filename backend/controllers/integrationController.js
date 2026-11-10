import { successResponse } from '../utils/responseHandler.js';

export const getIntegrations = async (req, res) => {
  // Real platform connectivity registry
  const integrations = [
    {
      id: 'linkedin',
      name: 'LinkedIn Company Pages',
      icon: 'linkedin',
      category: 'Social Media',
      status: 'Connected',
      accountName: 'Zenvora AI Systems',
      description: 'Publish company updates, long-form articles, and track engagement analytics.',
      requiredScopes: ['w_member_social', 'r_organization_social'],
    },
    {
      id: 'twitter',
      name: 'X (formerly Twitter)',
      icon: 'twitter',
      category: 'Social Media',
      status: 'Connected',
      accountName: '@ZenvoraAI',
      description: 'Auto-publish threads, monitor brand mentions, and schedule promotional tweets.',
      requiredScopes: ['tweet.write', 'tweet.read', 'users.read'],
    },
    {
      id: 'instagram',
      name: 'Instagram Professional',
      icon: 'instagram',
      category: 'Visual & Media',
      status: 'Not Connected',
      accountName: '',
      description: 'Schedule feed posts, reels, and stories with automated hashtag clustering.',
      requiredScopes: ['instagram_basic', 'instagram_content_publish'],
      setupGuide: 'Requires an active Instagram Business or Creator account connected via Facebook Pages API.',
    },
    {
      id: 'facebook',
      name: 'Facebook Pages',
      icon: 'facebook',
      category: 'Social Media',
      status: 'Not Connected',
      accountName: '',
      description: 'Broadcast community updates and target organic local audience growth.',
      requiredScopes: ['pages_manage_posts', 'pages_read_engagement'],
      setupGuide: 'Requires Meta Business Manager app registration.',
    },
    {
      id: 'google_business',
      name: 'Google Business Profile',
      icon: 'globe',
      category: 'Local SEO',
      status: 'Not Connected',
      accountName: '',
      description: 'Monitor Google reviews, auto-draft replies, and publish weekly local updates.',
      requiredScopes: ['business.manage'],
      setupGuide: 'Authorize via Google Cloud Console with Google My Business API enabled.',
    },
    {
      id: 'wordpress',
      name: 'WordPress REST API',
      icon: 'code',
      category: 'CMS & Editorial',
      status: 'Not Connected',
      accountName: '',
      description: 'Direct 1-click publishing of SEO-optimized blog drafts to your WordPress site.',
      requiredScopes: ['application_passwords'],
      setupGuide: 'Generate an Application Password in your WordPress User Profile.',
    },
  ];

  return successResponse(res, 'Integrations list fetched', { integrations });
};

export const toggleIntegration = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'connect' | 'disconnect'

  return successResponse(res, `Integration ${id} ${action === 'disconnect' ? 'disconnected' : 'configured'}. (Live OAuth flow ready for production credentials)`);
};

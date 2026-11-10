import GeminiService from '../services/geminiService.js';
import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const generateMarketingContent = async (req, res) => {
  try {
    const { type, platform, industry, targetAudience, topic, tone, language, keywords, length } = req.body;

    if (!topic || topic.trim() === '') {
      return errorResponse(res, 'Content topic is required', 400);
    }

    const userId = req.user?.id || 'demo_user';
    const brandGuidelines = await Storage.getBrandGuidelines(userId);

    const result = await GeminiService.generateMarketingContent({
      type,
      platform,
      industry,
      targetAudience,
      topic,
      tone,
      language,
      keywords,
      length,
      brandGuidelines,
    });

    return successResponse(res, 'Content generated successfully', result);
  } catch (err) {
    console.error('[AI Content Studio Error]:', err.message);
    return errorResponse(res, 'Failed to generate content', 500, err.message);
  }
};

export const generateBlog = async (req, res) => {
  try {
    const { topic, targetKeyword, secondaryKeywords, audience, tone, length } = req.body;

    if (!topic || topic.trim() === '') {
      return errorResponse(res, 'Blog topic is required', 400);
    }

    const userId = req.user?.id || 'demo_user';
    const brandGuidelines = await Storage.getBrandGuidelines(userId);

    const result = await GeminiService.generateBlogArticle({
      topic,
      targetKeyword,
      secondaryKeywords: Array.isArray(secondaryKeywords) ? secondaryKeywords : (secondaryKeywords ? [secondaryKeywords] : []),
      audience,
      tone,
      length,
      brandGuidelines,
    });

    return successResponse(res, 'Blog article generated successfully', result);
  } catch (err) {
    console.error('[AI Blog Generator Error]:', err.message);
    return errorResponse(res, 'Failed to generate blog', 500, err.message);
  }
};

export const generateCaptions = async (req, res) => {
  try {
    const { platform = 'Instagram', topic, tone = 'Engaging', count = 3 } = req.body;

    if (!topic) {
      return errorResponse(res, 'Topic is required', 400);
    }

    const result = await GeminiService.generateSocialCaptions({ platform, topic, tone, count });
    return successResponse(res, 'Captions generated successfully', result);
  } catch (err) {
    return errorResponse(res, 'Failed to generate captions', 500, err.message);
  }
};

export const generateHashtags = async (req, res) => {
  try {
    const { niche, platform = 'Instagram' } = req.body;

    if (!niche) {
      return errorResponse(res, 'Niche is required', 400);
    }

    const result = await GeminiService.generateHashtags({ niche, platform });
    return successResponse(res, 'Hashtags generated successfully', result);
  } catch (err) {
    return errorResponse(res, 'Failed to generate hashtags', 500, err.message);
  }
};

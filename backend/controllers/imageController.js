import crypto from 'crypto';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

async function saveToHistory(userId, input, output) {
  try {
    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    await GenerationHistory.create({
      userId, requestId: crypto.randomUUID(), module: 'image-generation',
      input, output, provider: 'pollinations-ai', model: 'pollinations-flux', status: 'success',
    });
  } catch (e) { console.warn('[History] Image save failed:', e.message); }
}

export const generateImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      campaignTitle = '',
      brandName = '',
      productService = '',
      targetAudience = '',
      offer = '',
      keywords = '',
      width = 1024,
      height = 1024,
      style = 'modern professional',
    } = req.body;

    if (!campaignTitle && !productService) {
      return errorResponse(res, 'Please provide a campaign title or product/service description', 400);
    }

    const { default: ImageService } = await import('../services/imageService.js');
    const result = await ImageService.generateImage({
      campaignTitle, brandName, productService, offer: offer || keywords,
      style, width: Math.min(Number(width), 1920), height: Math.min(Number(height), 1920),
    });

    const output = { ...result, campaignTitle, brandName, productService, targetAudience };

    // Save to history
    saveToHistory(userId, { campaignTitle, brandName, productService, style, width, height }, output);

    return successResponse(res, 'Image generated successfully', output);
  } catch (err) {
    console.error('[Image] Generation error:', err.message);
    return errorResponse(res, 'Image generation failed. Please try again.', 500, err.message);
  }
};

export const generateSocialGraphic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, platform = 'Instagram', style = 'modern' } = req.body;
    if (!topic) return errorResponse(res, 'Topic is required', 400);

    const { default: ImageService } = await import('../services/imageService.js');
    const result = await ImageService.generateSocialGraphic({ topic, platform, style });

    saveToHistory(userId, { topic, platform, style }, result);
    return successResponse(res, 'Social graphic generated', result);
  } catch (err) {
    return errorResponse(res, 'Graphic generation failed', 500, err.message);
  }
};

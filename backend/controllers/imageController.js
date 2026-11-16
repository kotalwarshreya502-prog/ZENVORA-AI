import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const generateImage = async (req, res) => {
  try {
    const { campaignTitle = '', productService = '' } = req.body;

    if (!campaignTitle && !productService) {
      return errorResponse(res, 'Please provide a campaign title or product/service description', 400);
    }

    const { default: ImageService } = await import('../services/imageService.js');
    const result = await ImageService.generateImage(req.body);

    return successResponse(res, 'Image generated successfully', result);
  } catch (err) {
    console.error('[Image] Generation error:', err.message);
    const message = err.message || 'Image generation is temporarily unavailable. Please configure an image-generation provider.';
    return errorResponse(res, message, 503, message);
  }
};

export const generateSocialGraphic = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return errorResponse(res, 'Topic is required', 400);

    const { default: ImageService } = await import('../services/imageService.js');
    const result = await ImageService.generateSocialGraphic(req.body);

    return successResponse(res, 'Social graphic generated', result);
  } catch (err) {
    console.error('[Image] Graphic generation error:', err.message);
    const message = err.message || 'Image generation is temporarily unavailable. Please configure an image-generation provider.';
    return errorResponse(res, message, 503, message);
  }
};

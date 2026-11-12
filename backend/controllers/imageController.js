/**
 * ZENVORA AI — Real Image Generation Controller
 * Uses Pollinations.ai (free, no API key) for real AI image generation.
 * Every generation gets a unique requestId and is user-scoped.
 */
import { randomUUID } from 'crypto';
import GenerationHistory from '../models/GenerationHistory.js';
import { generateImage } from '../services/aiProviderService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

const DIMENSION_MAP = {
  '1:1': { width: 1024, height: 1024, label: 'Square (1:1)' },
  '16:9': { width: 1344, height: 768, label: 'Wide (16:9)' },
  '4:5': { width: 896, height: 1120, label: 'Portrait (4:5)' },
  '9:16': { width: 768, height: 1344, label: 'Story (9:16)' },
  '3:2': { width: 1216, height: 832, label: 'Landscape (3:2)' },
};

const STYLE_MODIFIERS = {
  'Modern Tech 3D': 'modern tech 3D render, ultra realistic, 8K, professional lighting, clean minimalist design',
  'Clean Corporate': 'clean corporate design, professional, minimal, white background, studio lighting',
  'Cyber Tech': 'cyberpunk tech aesthetic, neon lights, dark background, futuristic digital art',
  'Lifestyle Brand': 'lifestyle photography style, warm tones, natural lighting, authentic, editorial quality',
  'Bold Graphic': 'bold graphic design, strong typography, high contrast, vibrant colors, poster art',
};

export const generateMarketingImage = async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      stylePreset = 'Modern Tech 3D',
      brandName = '',
      campaignTitle = '',
      colorGrading = '',
    } = req.body;
    const userId = req.user.id;
    const requestId = randomUUID();

    if (!prompt || !prompt.trim()) {
      return errorResponse(res, 'Visual concept prompt is required', 400);
    }

    const dimensions = DIMENSION_MAP[aspectRatio] || DIMENSION_MAP['1:1'];
    const styleModifier = STYLE_MODIFIERS[stylePreset] || STYLE_MODIFIERS['Modern Tech 3D'];
    const colorHint = colorGrading ? `, ${colorGrading} color palette` : '';
    const brandHint = brandName ? `, for brand: ${brandName}` : '';

    // Build enhanced prompt
    const enhancedPrompt = `${prompt}, ${styleModifier}${colorHint}${brandHint}, marketing visual, high quality, professional`;

    console.log(`[Image] Generating: "${enhancedPrompt.slice(0, 80)}..." (requestId: ${requestId})`);

    const result = await generateImage({
      prompt: enhancedPrompt,
      width: dimensions.width,
      height: dimensions.height,
      model: 'flux',
    });

    const output = {
      requestId,
      imageUrl: result.imageUrl,
      prompt: enhancedPrompt,
      originalPrompt: prompt,
      aspectRatio,
      dimensions,
      stylePreset,
      brandName,
      campaignTitle,
      provider: result.provider,
      model: result.model,
      generatedAt: new Date().toISOString(),
      title: campaignTitle || prompt.slice(0, 40),
    };

    // Persist to history (user-scoped)
    try {
      await GenerationHistory.create({
        requestId,
        userId,
        module: 'image-generation',
        input: { prompt, aspectRatio, stylePreset, brandName, campaignTitle },
        output,
        provider: result.provider,
        model: result.model,
        status: 'success',
        title: output.title,
      });
    } catch (histErr) {
      console.warn('[Image] History save failed:', histErr.message);
    }

    return successResponse(res, 'Image generated successfully', output, 201);
  } catch (err) {
    console.error('[Image] Generation error:', err.message);
    return errorResponse(res, 'Image generation failed. Please try again.', 500, err.message);
  }
};

export const getImageHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const images = await GenerationHistory.find({ userId, module: 'image-generation' })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return successResponse(res, 'Image history fetched', {
      images: images.map((img) => ({
        id: img._id,
        requestId: img.requestId,
        title: img.title,
        imageUrl: img.output?.imageUrl,
        aspectRatio: img.output?.aspectRatio,
        stylePreset: img.output?.stylePreset,
        prompt: img.output?.originalPrompt,
        generatedAt: img.createdAt,
      })),
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch image history', 500, err.message);
  }
};

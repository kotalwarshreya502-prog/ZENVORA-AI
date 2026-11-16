/**
 * ZENVORA AI — Universal Poster & Creative Generation Controller
 * Drives real AI visual generation and advertising composition data.
 * Zero hardcoded brands, zero fake mockups, zero coding screens.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postersDir = path.resolve(__dirname, '../uploads/posters');

// ── Lazy history save (non-blocking) ─────────────────────────────────────────
async function saveToHistory(userId, input, output) {
  try {
    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    const title = input.description || input.customHeadline || output?.designSpec?.headline || 'Creative Poster';
    await GenerationHistory.create({
      userId,
      requestId: crypto.randomUUID(),
      module: 'image-generation',
      input,
      output,
      provider: output.provider || 'google-gemini-image',
      model: output.model || 'gemini-3.1-flash-image',
      status: 'success',
      title,
    });
  } catch (e) {
    console.warn('[PosterController] History save failed:', e.message);
  }
}

// ── GET /api/poster/proxy ─────────────────────────────────────────────────────
// Proxies external image assets to eliminate browser canvas CORS taint
export const proxyImage = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return res.status(400).send('Invalid or missing image URL parameter');
    }

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch upstream image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = Buffer.from(await response.arrayBuffer());
    return res.send(buffer);
  } catch (err) {
    return res.status(500).send('Image proxy error: ' + err.message);
  }
};

// ── POST /api/poster/analyze ──────────────────────────────────────────────────
export const analyzePosterInput = async (req, res) => {
  try {
    const { description, additionalInstructions = '' } = req.body;

    if (!description || description.trim().length < 3) {
      return errorResponse(res, 'Please provide a description of your campaign or brand', 400);
    }

    const { analyzeInput, buildDesignSpec } = await import('../services/posterIntelligenceService.js');
    const apiKey = req.headers['x-gemini-api-key'] || req.body.geminiApiKey || process.env.GEMINI_API_KEY;

    const analysis = await analyzeInput(description.trim(), apiKey);
    const designSpec = buildDesignSpec(analysis);

    return successResponse(res, 'Campaign analyzed successfully', {
      analysis,
      designSpec,
      estimatedTime: '5-15 seconds',
      stages: [
        'Analyzing campaign theme & visual setting',
        'Synthesizing brand palette & typography',
        'Generating photorealistic AI background',
        'Compositing professional advertising poster',
      ],
    });
  } catch (err) {
    console.error('[PosterController] Analyze error:', err.message);
    return errorResponse(res, 'Failed to analyze campaign. Please try again.', 500, err.message);
  }
};

// ── POST /api/poster/generate ─────────────────────────────────────────────────
export const generatePoster = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const {
      description,
      style = '',
      size = 'square',
      additionalInstructions = '',
      customHeadline = '',
      customSubtext = '',
      customOffer = '',
      customCta = '',
      seed: customSeed,
    } = req.body;

    if (!description || description.trim().length < 3) {
      return errorResponse(res, 'Please provide a description of what you want to generate', 400);
    }

    const descTrimmed = description.trim();

    // ── 1. Analyze input with Gemini / Semantic Intelligence ──────────────────
    const { analyzeInput, generatePosterPrompt, buildDesignSpec, fetchBrandLogo, validatePosterOutput } =
      await import('../services/posterIntelligenceService.js');

    const apiKey = req.headers['x-gemini-api-key'] || req.body.geminiApiKey || process.env.GEMINI_API_KEY;
    const analysis = await analyzeInput(descTrimmed, apiKey, customOffer);

    // Apply user overrides
    if (customHeadline) {
      analysis.headline = customHeadline.replace(/\s*\.{3,}$/, '').trim();
    }
    if (customSubtext) analysis.subheadline = customSubtext.replace(/\s*\.{3,}$/, '').trim();
    if (customOffer) analysis.offer = customOffer.trim().toUpperCase();
    if (customCta) analysis.cta = customCta.trim();

    // ── 2. Parallel brand logo and asset resolution (Optimized - No duplicate Gemini calls) ──
    const effectiveBrand = analysis.brandName || descTrimmed.split(/\s+/)[0];
    const logoResult = effectiveBrand ? await fetchBrandLogo(effectiveBrand, analysis.officialWebsite) : null;
    const researchData = {
      industry: analysis.industry,
      officialWebsite: analysis.officialWebsite || '',
      colors: analysis.colorPalette || '',
    };

    // ── 4. Dimensions setup ───────────────────────────────────────────────────
    const sizeMap = {
      square:    { width: 1024, height: 1024, label: '1024×1024 (1:1 Feed)' },
      portrait:  { width: 1080, height: 1350, label: '1080×1350 (4:5 Portrait)' },
      story:     { width: 1080, height: 1920, label: '1080×1920 (9:16 Story)' },
      landscape: { width: 1200, height: 675,  label: '1200×675 (16:9 Banner)' },
      wide:      { width: 1600, height: 900,  label: '1600×900 (Wide)' },
      a4:        { width: 794,  height: 1123, label: '794×1123 (A4 Print)' },
    };

    const dimensions = sizeMap[size] || sizeMap.square;

    // ── 5. Craft High-Impact Atmospheric Background Scene Prompt ─────────────
    let imagePrompt = generatePosterPrompt(analysis, researchData, style);

    if (additionalInstructions) {
      imagePrompt = `${imagePrompt}, ${additionalInstructions.substring(0, 100)}`;
    }

    // ── 6. Generate Authentic Commercial Background Image (Imagen 3 / FLUX) ──
    const { ImageService } = await import('../services/imageService.js');
    const imageResult = await ImageService.generateImage({
      prompt: imagePrompt,
      campaignTitle: analysis.headline || descTrimmed,
      brandName: effectiveBrand,
      offer: analysis.offer,
      category: analysis.category,
      style: style || 'modern commercial advertising',
      width: dimensions.width,
      height: dimensions.height,
      seed: customSeed,
      customApiKey: apiKey,
    });

    // ── 7. Build complete design specification ────────────────────────────────
    const designSpec = buildDesignSpec(analysis, researchData);

    const host = req.get('host') || 'localhost:5000';
    const forwardedProto = req.headers['x-forwarded-proto'];
    const isHttps = forwardedProto === 'https' || req.secure || host.includes('render.com') || host.includes('zenvora') || process.env.NODE_ENV === 'production';
    const protocol = isHttps ? 'https' : 'http';
    const fullImageUrl = `${protocol}://${host}${imageResult.localUrl}`;

    const output = {
      imageUrl: fullImageUrl,
      localUrl: imageResult.localUrl,
      fullImageUrl,
      upstreamUrl: imageResult.upstreamUrl,
      proxyUrl: `/api/poster/proxy?url=${encodeURIComponent(imageResult.upstreamUrl || imageResult.imageUrl)}`,
      imageDownloaded: true,
      imagePrompt,
      designSpec,
      analysis: {
        brandName: analysis.brandName,
        industry: analysis.industry,
        category: analysis.category,
        headline: analysis.headline,
        subheadline: analysis.subheadline,
        offer: analysis.offer,
        cta: analysis.cta,
        targetAudience: analysis.targetAudience,
        posterType: analysis.posterType,
        mood: analysis.mood,
      },
      logoResult,
      dimensions,
      seed: imageResult.seed,
      model: imageResult.model,
      provider: imageResult.provider,
      validation: validatePosterOutput({ designSpec, analysis }, customOffer || analysis.offer),
      generatedAt: new Date().toISOString(),
    };

    // ── 8. Save to history in MongoDB ─────────────────────────────────────────
    if (userId) {
      saveToHistory(
        userId,
        { description: descTrimmed, style, size, additionalInstructions, headline: analysis.headline },
        output
      );
    }

    return successResponse(res, 'AI Background & Poster composed successfully', output);
  } catch (err) {
    console.error('[PosterController] Generate error:', err.message);
    const message = err.message || 'Image generation is temporarily unavailable. Please configure an image-generation provider.';
    return errorResponse(res, message, 503, message);
  }
};

// ── GET /api/poster/history ───────────────────────────────────────────────────
export const getPosterHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, 'Not authenticated', 401);

    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    const history = await GenerationHistory.find({
      userId,
      module: { $in: ['image-generation', 'intelligent-poster'] },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return successResponse(res, 'Poster history retrieved', { history });
  } catch (err) {
    console.error('[PosterController] History error:', err.message);
    return errorResponse(res, 'Failed to retrieve history', 500, err.message);
  }
};

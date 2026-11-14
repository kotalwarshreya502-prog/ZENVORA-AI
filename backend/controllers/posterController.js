/**
 * ZENVORA AI — Poster Controller
 * Universal Intelligent Poster Generation Engine.
 * Works for ANY brand, topic, industry, event, or idea.
 */

import crypto from 'crypto';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

// ── Lazy history save (non-blocking) ─────────────────────────────────────────
async function saveToHistory(userId, input, output) {
  try {
    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    await GenerationHistory.create({
      userId,
      requestId: crypto.randomUUID(),
      module: 'image-generation',
      input,
      output,
      provider: 'pollinations-ai',
      model: 'pollinations-flux',
      status: 'success',
    });
  } catch (e) {
    console.warn('[PosterController] History save failed:', e.message);
  }
}

// ── POST /api/poster/analyze ──────────────────────────────────────────────────
export const analyzePosterInput = async (req, res) => {
  try {
    const { description, additionalInstructions = '' } = req.body;

    if (!description || description.trim().length < 3) {
      return errorResponse(res, 'Please provide a description of what you want to generate', 400);
    }

    const { analyzeInput, buildDesignSpec } = await import('../services/posterIntelligenceService.js');

    const analysis = await analyzeInput(description.trim());
    const designSpec = buildDesignSpec(analysis);

    return successResponse(res, 'Input analyzed successfully', {
      analysis,
      designSpec,
      estimatedTime: '10-20 seconds',
      stages: [
        'Understanding your request',
        'Researching brand and topic',
        'Designing poster layout',
        'Generating AI visuals',
        'Finalizing poster',
      ],
    });
  } catch (err) {
    console.error('[PosterController] Analyze error:', err.message);
    return errorResponse(res, 'Failed to analyze input. Please try again.', 500, err.message);
  }
};

// ── POST /api/poster/generate ─────────────────────────────────────────────────
export const generatePoster = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      description,
      style = '',
      size = 'square',
      additionalInstructions = '',
      customHeadline = '',
      customSubtext = '',
      customCta = '',
    } = req.body;

    if (!description || description.trim().length < 3) {
      return errorResponse(res, 'Please provide a description of what you want to generate', 400);
    }

    const descTrimmed = description.trim();

    // ── 1. Analyze input ──────────────────────────────────────────────────────
    const { analyzeInput, generatePosterPrompt, buildDesignSpec, fetchBrandLogo } =
      await import('../services/posterIntelligenceService.js');

    const analysis = await analyzeInput(descTrimmed);

    // Apply user overrides
    if (customHeadline) analysis.headline = customHeadline;
    if (customSubtext) analysis.subheadline = customSubtext;
    if (customCta) analysis.cta = customCta;

    // ── 2. Research brand/topic ───────────────────────────────────────────────
    const { research } = await import('../services/searchService.js');
    const researchData = await research(analysis.brandName || descTrimmed);

    // Fill in gaps from research
    if (!analysis.officialWebsite && researchData.officialWebsite) {
      analysis.officialWebsite = researchData.officialWebsite;
    }
    if (!analysis.colorPalette && researchData.colors) {
      analysis.colorPalette = researchData.colors;
    }

    // ── 3. Fetch brand logo ───────────────────────────────────────────────────
    let logoResult = null;
    if (analysis.brandName) {
      logoResult = await fetchBrandLogo(analysis.brandName, analysis.officialWebsite || researchData.officialWebsite);
    }

    // ── 4. Generate Pollinations.ai image ────────────────────────────────────
    const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

    const sizeMap = {
      square:    { width: 1024, height: 1024, label: '1024×1024' },
      portrait:  { width: 1080, height: 1350, label: '1080×1350' },
      landscape: { width: 1200, height: 627,  label: '1200×627'  },
      story:     { width: 1080, height: 1920, label: '1080×1920' },
      wide:      { width: 1600, height: 900,  label: '1600×900'  },
      a4:        { width: 794,  height: 1123, label: '794×1123'  },
    };

    const dimensions = sizeMap[size] || sizeMap.square;

    // Build detailed image prompt
    let imagePrompt = generatePosterPrompt(analysis, researchData);

    // Apply style override
    if (style) {
      imagePrompt = `${style.toLowerCase()} style, ${imagePrompt}`;
    }

    // Apply additional instructions
    if (additionalInstructions) {
      imagePrompt = `${imagePrompt}, ${additionalInstructions.substring(0, 100)}`;
    }

    const seed = Math.floor(Math.random() * 999999);
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const imageUrl = `${POLLINATIONS_BASE}/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}&nologo=true&enhance=true&model=flux`;

    // ── 5. Build design spec ──────────────────────────────────────────────────
    const designSpec = buildDesignSpec(analysis, researchData);

    // ── 6. Compose response ───────────────────────────────────────────────────
    const output = {
      imageUrl,
      imagePrompt,
      designSpec,
      analysis: {
        brandName: analysis.brandName,
        industry: analysis.industry,
        category: analysis.category,
        headline: analysis.headline,
        subheadline: analysis.subheadline,
        cta: analysis.cta,
        targetAudience: analysis.targetAudience,
        posterType: analysis.posterType,
        mood: analysis.mood,
      },
      logoResult,
      research: {
        brandInfo: researchData.brandInfo,
        officialWebsite: researchData.officialWebsite || analysis.officialWebsite,
        sources: researchData.sources,
        researched: researchData.researched,
      },
      dimensions,
      seed,
      model: 'pollinations-flux',
      provider: 'pollinations-ai',
      generatedAt: new Date().toISOString(),
    };

    // ── 7. Save to history ────────────────────────────────────────────────────
    if (userId) {
      saveToHistory(
        userId,
        { description: descTrimmed, style, size, additionalInstructions },
        { imageUrl, designSpec, analysis: output.analysis }
      );
    }

    return successResponse(res, 'Poster generated successfully', output);
  } catch (err) {
    console.error('[PosterController] Generate error:', err.message);
    return errorResponse(res, 'Poster generation failed. Please try again.', 500, err.message);
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
      module: 'image-generation',
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return successResponse(res, 'Poster history retrieved', { history });
  } catch (err) {
    console.error('[PosterController] History error:', err.message);
    return errorResponse(res, 'Failed to retrieve history', 500, err.message);
  }
};

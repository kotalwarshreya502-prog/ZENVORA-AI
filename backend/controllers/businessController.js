import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';
import { scrapeAndAnalyzeBusiness } from '../services/websiteScraperService.js';

export const getBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let business = await Storage.getBusinessByOwner(userId);
    const guidelines = await Storage.getBrandGuidelines(userId);

    // Merge guidelines for comprehensive view
    const merged = {
      ...(business ? (business.toObject ? business.toObject() : business) : {}),
      brandVoice: guidelines?.brandVoice || business?.brandVoice || 'Professional, modern, and engaging',
      targetAudience: guidelines?.targetAudience || business?.targetAudience || '',
      uniqueSellingPoints: business?.uniqueSellingPoints || guidelines?.uniqueSellingPoints || [],
      productsServices: business?.productsServices || guidelines?.productsServices || [],
      brandColors: {
        primary: guidelines?.primaryColor || business?.brandColors?.primary || '#7657F6',
        secondary: guidelines?.accentColor || business?.brandColors?.secondary || '#11152B',
        accent: business?.brandColors?.accent || '#3B82F6',
      },
      logoUrl: guidelines?.logoUrl || business?.logoUrl || '',
    };

    return successResponse(res, 'Business profile retrieved', { business: merged });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch business profile', 500, err.message);
  }
};

export const updateBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const updated = await Storage.updateBusiness(userId, data);

    // Also sync brand guidelines
    try {
      await Storage.updateBrandGuidelines(userId, {
        brandVoice: data.brandVoice || updated.brandVoice,
        targetAudience: data.targetAudience || updated.targetAudience,
        primaryColor: data.brandColors?.primary || data.primaryColor,
        accentColor: data.brandColors?.secondary || data.accentColor,
        logoUrl: data.logoUrl || updated.logoUrl,
        productsServices: data.productsServices || updated.productsServices,
        uniqueSellingPoints: data.uniqueSellingPoints || updated.uniqueSellingPoints,
      });
    } catch (e) {
      console.warn('[BusinessController] Brand guidelines sync notice:', e.message);
    }

    return successResponse(res, 'Business profile updated successfully', { business: updated });
  } catch (err) {
    return errorResponse(res, 'Failed to update business profile', 500, err.message);
  }
};

export const analyzeWebsite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { websiteUrl } = req.body;
    const customApiKey = req.headers['x-openai-api-key'] || req.headers['x-anthropic-api-key'] || req.headers['x-gemini-api-key'] || req.body.openaiApiKey || req.body.anthropicApiKey || req.body.geminiApiKey || '';

    if (!websiteUrl || !websiteUrl.trim()) {
      return errorResponse(res, 'Please provide a valid website URL to analyze', 400);
    }

    console.log(`[BusinessController] Analyzing website for user ${userId}: ${websiteUrl}`);

    const extracted = await scrapeAndAnalyzeBusiness(websiteUrl, customApiKey);

    // Save to database
    const updatePayload = {
      name: extracted.name,
      website: extracted.website,
      industry: extracted.industry,
      description: extracted.description,
      brandVoice: extracted.brandVoice,
      targetAudience: extracted.targetAudience,
      uniqueSellingPoints: extracted.uniqueSellingPoints || [],
      productsServices: extracted.productsServices || [],
      brandColors: extracted.brandColors,
      pricingOverview: extracted.pricingOverview || '',
      competitors: extracted.competitors || [],
      logoUrl: extracted.logoUrl || '',
      lastAnalyzedAt: new Date(),
      locations: extracted.locations || [],
      rawMetadata: extracted.rawMetadata || {},
    };

    const savedBusiness = await Storage.updateBusiness(userId, updatePayload);

    // Sync to BrandGuideline
    try {
      await Storage.updateBrandGuidelines(userId, {
        brandVoice: extracted.brandVoice,
        targetAudience: extracted.targetAudience,
        primaryColor: extracted.brandColors?.primary || '#7657F6',
        accentColor: extracted.brandColors?.secondary || '#11152B',
        logoUrl: extracted.logoUrl || '',
        productsServices: extracted.productsServices || [],
        uniqueSellingPoints: extracted.uniqueSellingPoints || [],
      });
    } catch (e) {
      console.warn('[BusinessController] Brand guidelines sync notice:', e.message);
    }

    return successResponse(res, 'Website successfully analyzed and business profile updated', {
      business: savedBusiness,
      extracted,
    });
  } catch (err) {
    console.error('[BusinessController] Website analysis error:', err.message);
    return errorResponse(res, `Website analysis failed: ${err.message}`, 500, err.message);
  }
};

import Storage from '../services/storageService.js';
import Orchestrator from '../services/orchestratorService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const campaigns = await Storage.getCampaigns(userId);
    return successResponse(res, 'Campaigns retrieved', { campaigns });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch campaigns', 500, err.message);
  }
};

export const createCampaign = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, objective, targetAudience, platforms, startDate, endDate, budget, description, status } = req.body;

    if (!name || name.trim() === '') {
      return errorResponse(res, 'Campaign name is required', 400);
    }

    const campaign = await Storage.createCampaign(userId, {
      name,
      objective: objective || 'Lead Generation',
      targetAudience: targetAudience || 'General Audience',
      platforms: platforms || ['LinkedIn', 'Instagram'],
      startDate: startDate || new Date(),
      endDate: endDate || null,
      budget: Number(budget) || 0,
      description: description || '',
      status: status || 'Planned',
      progress: 0,
    });

    return successResponse(res, 'Campaign created successfully', { campaign }, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create campaign', 500, err.message);
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Storage.updateCampaign(id, req.body);
    return successResponse(res, 'Campaign updated', { campaign: updated });
  } catch (err) {
    return errorResponse(res, 'Failed to update campaign', 500, err.message);
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    await Storage.deleteCampaign(id);
    return successResponse(res, 'Campaign deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete campaign', 500, err.message);
  }
};

export const generateCampaignStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { objective, targetAudience, budget, timeline, platforms, campaignName } = req.body;
    const customApiKey = req.headers['x-gemini-api-key'] || req.body.geminiApiKey || '';

    const businessContext = await Orchestrator.getBusinessContext(userId);

    const [strategy, plan] = await Promise.all([
      Orchestrator.runMarketingStrategyAgent({
        objective,
        targetAudience,
        budget,
        timeline,
        businessContext,
        customApiKey,
      }),
      Orchestrator.runCampaignPlanningAgent({
        campaignName: campaignName || `${businessContext?.name || 'Brand'} Growth Campaign`,
        objective,
        targetAudience,
        platforms,
        businessContext,
        customApiKey,
      }),
    ]);

    return successResponse(res, 'Marketing strategy and campaign plan generated', {
      strategy,
      plan,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[CampaignStrategy] Error:', err.message);
    return errorResponse(res, `Strategy generation failed: ${err.message}`, 500, err.message);
  }
};

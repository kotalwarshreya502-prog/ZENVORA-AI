import Storage from '../services/storageService.js';
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
    const { name, objective, targetAudience, platforms, startDate, endDate, budget, description } = req.body;

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
      status: 'In Progress',
      progress: 10,
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

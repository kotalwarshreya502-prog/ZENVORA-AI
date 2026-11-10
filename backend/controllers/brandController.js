import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getBrandGuidelines = async (req, res) => {
  try {
    const userId = req.user.id;
    const guidelines = await Storage.getBrandGuidelines(userId);
    return successResponse(res, 'Brand guidelines retrieved', { guidelines });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch brand guidelines', 500, err.message);
  }
};

export const updateBrandGuidelines = async (req, res) => {
  try {
    const userId = req.user.id;
    const updated = await Storage.updateBrandGuidelines(userId, req.body);
    return successResponse(res, 'Brand guidelines updated successfully', { guidelines: updated });
  } catch (err) {
    return errorResponse(res, 'Failed to update brand guidelines', 500, err.message);
  }
};

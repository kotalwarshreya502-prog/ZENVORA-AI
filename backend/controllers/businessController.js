import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const business = await Storage.getBusinessByOwner(userId);
    return successResponse(res, 'Business profile retrieved', { business });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch business profile', 500, err.message);
  }
};

export const updateBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updated = await Storage.updateBusiness(userId, req.body);
    return successResponse(res, 'Business profile updated successfully', { business: updated });
  } catch (err) {
    return errorResponse(res, 'Failed to update business profile', 500, err.message);
  }
};

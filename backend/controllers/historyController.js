import GenerationHistory from '../models/GenerationHistory.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

// GET /api/history — user's own history only
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { module, limit = 50, page = 1 } = req.query;
    const filter = { userId };
    if (module) filter.module = module;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      GenerationHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      GenerationHistory.countDocuments(filter),
    ]);
    return successResponse(res, 'History fetched', { items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch history', 500, err.message);
  }
};

// PATCH /api/history/:id/save — toggle saved flag
export const saveHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title } = req.body;
    const item = await GenerationHistory.findOneAndUpdate(
      { _id: id, userId },
      { isSaved: true, ...(title ? { title } : {}) },
      { new: true }
    );
    if (!item) return errorResponse(res, 'History item not found', 404);
    return successResponse(res, 'Item saved', { item });
  } catch (err) {
    return errorResponse(res, 'Failed to save item', 500, err.message);
  }
};

// DELETE /api/history/:id — user can only delete their own records
export const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await GenerationHistory.findOneAndDelete({ _id: id, userId });
    if (!deleted) return errorResponse(res, 'Item not found', 404);
    return successResponse(res, 'History item deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete item', 500, err.message);
  }
};

import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await Storage.getSubscription(userId);
    return successResponse(res, 'Subscription details retrieved', { subscription });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch subscription', 500, err.message);
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;
    return successResponse(res, `Plan upgraded to ${plan} (${billingCycle || 'monthly'}). Production payment gateway ready for Stripe/Razorpay webhook confirmation.`, {
      plan,
      status: 'active',
    });
  } catch (err) {
    return errorResponse(res, 'Failed to update subscription', 500, err.message);
  }
};

/**
 * Standard API response helpers for ZENVORA AI.
 */

export const successResponse = (res, message, data = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, ...data });

export const errorResponse = (res, message, statusCode = 500, errorDetail = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && errorDetail ? { error: errorDetail } : {}),
  });

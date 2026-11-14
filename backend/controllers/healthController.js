import { getDbStatusString } from '../config/db.js';

/**
 * @desc   ZENVORA AI health check
 * @route  GET /api/health
 * @access Public
 */
export const getHealth = (_req, res) => {
  const jwtConfigured =
    Boolean(process.env.JWT_SECRET) && process.env.JWT_SECRET.length >= 20;

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const geminiConfigured = geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here';

  return res.status(200).json({
    success: true,
    message: 'ZENVORA AI API is running',
    database: getDbStatusString(),
    jwtConfigured,
    geminiConfigured,
    aiEngine: geminiConfigured ? 'gemini-1.5-flash' : 'zenvora-fallback',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

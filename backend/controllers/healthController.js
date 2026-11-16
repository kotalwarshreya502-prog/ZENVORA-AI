import mongoose from 'mongoose';
import { getDbStatusString, isDbConnected } from '../config/db.js';

/**
 * @desc   ZENVORA AI Comprehensive Multi-Subsystem Health Check
 * @route  GET /api/health
 * @access Public
 */
export const getHealth = async (req, res) => {
  const isDeep = req.query.deep === 'true';

  // 1. Backend Status
  const backend = {
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    version: '2.0.0',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
  };

  // 2. Database Status (MongoDB Atlas)
  const dbConnected = isDbConnected();
  const dbStateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const database = {
    status: dbConnected ? 'connected' : 'disconnected',
    state: dbStateMap[mongoose.connection.readyState] || 'unknown',
    host: dbConnected ? (mongoose.connection.host || 'atlas-cluster') : null,
    name: dbConnected ? (mongoose.connection.name || 'zenvora_ai') : null,
  };

  // 3. Text AI Engine Status (Google Gemini)
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const geminiConfigured = Boolean(
    geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.length > 10
  );

  let textAiStatus = geminiConfigured ? 'available' : 'unconfigured';
  let textAiLatencyMs = null;
  let textAiError = null;

  if (geminiConfigured && isDeep) {
    try {
      const start = Date.now();
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`,
        { method: 'GET' }
      );
      textAiLatencyMs = Date.now() - start;
      if (listRes.ok) {
        const listData = await listRes.json();
        const modelNames = (listData.models || []).map(m => m.name.replace('models/', ''));
        textAiStatus = 'connected';
        textAiError = `Available models: ${modelNames.join(', ')}`;
      } else {
        const errText = await listRes.text();
        textAiStatus = `api_error_${listRes.status}`;
        textAiError = errText.slice(0, 300);
      }
    } catch (e) {
      textAiStatus = 'network_unreachable';
      textAiError = e.message;
    }
  }

  const textAi = {
    status: textAiStatus,
    provider: 'Google Gemini',
    configured: geminiConfigured,
    models: ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    latencyMs: textAiLatencyMs,
    errorDetail: textAiError,
  };

  // 4. Image AI Engine Status (Google DeepMind Imagen 3 / Enterprise FLUX.1)
  const imageAi = {
    status: geminiConfigured ? 'available' : 'ready',
    provider: 'Google DeepMind Imagen 3 (imagen-3.0-generate-002) / Enterprise FLUX',
    models: ['imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001', 'FLUX.1-schnell'],
    capabilities: ['1:1 Square', '4:5 Portrait', '9:16 Story', '16:9 Landscape', 'A4 Print'],
  };

  // 5. Research Provider Status
  const researchProvider = {
    status: geminiConfigured ? 'available' : 'ready',
    provider: 'Gemini Web Grounding & Semantic Knowledge Engine',
    capabilities: ['Brand Intelligence', 'Competitor Research', 'Topic Analysis', 'Audience Profiling'],
  };

  // 6. Storage Subsystem Status
  const storage = {
    status: dbConnected ? 'connected' : 'degraded',
    mode: 'MongoDB Atlas Cloud Storage',
  };

  // Global status determination
  const isHealthy = backend.status === 'healthy' && dbConnected;

  return res.status(isHealthy ? 200 : 207).json({
    success: true,
    message: isHealthy ? 'All primary ZENVORA AI services online' : 'ZENVORA AI running with sub-service notices',
    database: database.status,
    jwtConfigured: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 20),
    geminiConfigured,
    aiEngine: geminiConfigured ? 'gemini-1.5-flash' : 'zenvora-direct',
    subsystems: {
      backend,
      database,
      textAi,
      imageAi,
      researchProvider,
      storage,
    },
    timestamp: new Date().toISOString(),
  });
};

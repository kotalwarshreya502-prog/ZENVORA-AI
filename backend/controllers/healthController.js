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

  // 3. Central AI Engine Status (OpenAI & Anthropic Claude)
  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
  const claudeKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  const openaiConfigured = Boolean(openaiKey && openaiKey !== 'your_openai_api_key_here' && openaiKey.length > 10);
  const claudeConfigured = Boolean(claudeKey && claudeKey !== 'your_claude_api_key_here' && claudeKey.length > 10);
  const aiConfigured = openaiConfigured || claudeConfigured;

  const textAi = {
    status: aiConfigured ? 'available' : 'deterministic_fallback',
    provider: openaiConfigured && claudeConfigured ? 'OpenAI GPT-4o + Anthropic Claude 3.5' : (openaiConfigured ? 'OpenAI GPT-4o' : (claudeConfigured ? 'Anthropic Claude 3.5' : 'Zenvora Multi-Provider Engine')),
    configured: aiConfigured,
    openaiConfigured,
    claudeConfigured,
    models: ['gpt-4o', 'gpt-4o-mini', 'claude-3-7-sonnet', 'claude-3-5-sonnet', 'claude-3-5-haiku'],
    capabilities: ['Dynamic Marketing Generation', 'Multi-Provider Orchestration', 'Deep Reasoning', 'Campaign Planning'],
  };

  // 4. Image AI Engine Status (OpenAI DALL-E 3 / Enterprise FLUX)
  const imageAi = {
    status: openaiConfigured ? 'available' : 'ready',
    provider: openaiConfigured ? 'OpenAI DALL-E 3 (1024x1024 HD)' : 'High-Speed Precision Engine',
    models: ['dall-e-3', 'FLUX.1-schnell'],
    capabilities: ['1:1 Square', '4:5 Portrait', '9:16 Story', '16:9 Landscape', 'A4 Print'],
  };

  // 5. Research Provider Status
  const researchProvider = {
    status: aiConfigured ? 'available' : 'ready',
    provider: 'ZENVORA Deep Knowledge & Brand Extraction Engine',
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
    aiConfigured,
    openaiConfigured,
    claudeConfigured,
    aiEngine: openaiConfigured ? 'gpt-4o' : (claudeConfigured ? 'claude-3-5-sonnet' : 'zenvora-unified'),
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

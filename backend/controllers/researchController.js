import crypto from 'crypto';
import Orchestrator from '../services/orchestratorService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

// Attempt to save to GenerationHistory (non-blocking)
async function saveToHistory(userId, module, input, output, model) {
  try {
    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    await GenerationHistory.create({
      userId,
      requestId: crypto.randomUUID(),
      module,
      input,
      output,
      provider: output.provider || 'claude',
      model: model || 'claude-3-7-sonnet-20250219',
      status: 'success',
      title: input.topic || input.question || 'Web Research',
    });
  } catch (e) {
    console.warn('[History] Save failed (non-critical):', e.message);
  }
}

export const analyzeResearch = async (req, res) => {
  try {
    const { topic, question, depth = 'standard' } = req.body;
    const userId = req.user?.id || 'demo_user';
    const customApiKey = req.headers['x-anthropic-api-key'] || req.headers['x-openai-api-key'] || req.body.apiKey || '';

    if (!topic && !question) {
      return errorResponse(res, 'Please provide a topic or research question', 400);
    }

    const researchQuery = question || topic;
    const businessContext = await Orchestrator.getBusinessContext(userId);

    const researchResult = await Orchestrator.runWebResearchAgent({
      topic: researchQuery,
      query: researchQuery,
      businessContext,
      customApiKey,
    });

    const output = {
      requestId: crypto.randomUUID(),
      topic: researchQuery,
      summary: researchResult.summary || 'Research synthesis completed.',
      keyOpportunities: researchResult.keyOpportunities || [],
      marketTrends: researchResult.marketTrends || [],
      competitiveLandscape: researchResult.competitiveLandscape || '',
      recommendedActionItems: researchResult.recommendedActionItems || [],
      confidenceScore: researchResult.confidenceScore || 'High',
      sources: (researchResult.sources || []).map(s => ({
        title: s.title || researchQuery,
        url: s.url || '',
        snippet: s.snippet || '',
        fetchedAt: new Date().toISOString(),
      })),
      model: researchResult.model || 'claude-3-7-sonnet-20250219',
      provider: researchResult.provider || 'claude',
      isAIGenerated: true,
      researchedAt: new Date().toISOString(),
    };

    saveToHistory(userId, 'research', { topic: researchQuery, depth }, output, output.model);

    return successResponse(res, 'Research completed successfully', output);
  } catch (err) {
    console.error('[Research] Error:', err.message);
    return errorResponse(res, `Research analysis failed: ${err.message}`, 500, err.message);
  }
};

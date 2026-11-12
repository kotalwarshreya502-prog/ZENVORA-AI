import crypto from 'crypto';
import GeminiService from '../services/geminiService.js';
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
      provider: model?.includes('gemini') ? 'google-gemini' : 'fallback-engine',
      model: model || 'zenvora-engine-v1',
      status: 'success',
    });
  } catch (e) {
    console.warn('[History] Save failed (non-critical):', e.message);
  }
}

export const analyzeResearch = async (req, res) => {
  try {
    const { topic, question, depth = 'standard' } = req.body;
    const userId = req.user.id;
    const requestId = crypto.randomUUID();

    if (!topic && !question) {
      return errorResponse(res, 'Please provide a topic or research question', 400);
    }

    const researchQuery = question || topic;

    // Step 1: Fetch real web content from public search-friendly sources
    const sources = [];
    const urlsToFetch = [
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(researchQuery.split(' ').slice(0, 3).join('_'))}`,
    ];

    for (const url of urlsToFetch) {
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'ZenvoraResearchBot/1.0' },
          signal: AbortSignal.timeout(6000),
        });
        if (r.ok) {
          const data = await r.json();
          if (data.extract || data.description) {
            sources.push({
              title: data.title || researchQuery,
              url: data.content_urls?.desktop?.page || url,
              excerpt: (data.extract || data.description || '').slice(0, 800),
              type: 'wikipedia',
              fetchedAt: new Date().toISOString(),
            });
          }
        }
      } catch { /* Skip failed fetches */ }
    }

    // Step 2: AI analysis using Gemini
    const sourceContext = sources.length > 0
      ? `Available sources:\n${sources.map(s => `[${s.title}]: ${s.excerpt}`).join('\n\n')}`
      : `No live sources fetched. Provide analysis based on general knowledge.`;

    const systemInstruction = `You are ZENVORA AI Research Assistant. Analyze the provided topic using the source data where available.
IMPORTANT RULES:
1. Clearly distinguish: "According to [source]:" vs "Based on AI analysis:"
2. Never fabricate statistics, URLs, or citations
3. If sources are limited, say so explicitly
4. Structure output with: Summary, Key Findings, Market Insights, Limitations`;

    const prompt = `Research Topic: "${researchQuery}"\n\n${sourceContext}\n\nProvide a comprehensive research summary with clear source attribution.`;

    const aiResult = await GeminiService.callGemini(prompt, systemInstruction);

    const output = {
      requestId,
      topic: researchQuery,
      summary: aiResult?.text || `Research on "${researchQuery}": AI analysis unavailable. Please configure GEMINI_API_KEY in Render environment variables.`,
      sources: sources.map(s => ({
        title: s.title,
        url: s.url,
        excerpt: s.excerpt,
        fetchedAt: s.fetchedAt,
        isLiveSource: true,
      })),
      model: aiResult?.source || 'zenvora-engine-v1',
      provider: aiResult ? 'google-gemini' : 'fallback-engine',
      isAIGenerated: true,
      dataNote: sources.length > 0
        ? `Analysis based on ${sources.length} live source(s) + AI knowledge.`
        : 'No live sources retrieved. Add SERPER_API_KEY to Render env for Google Search integration.',
      researchedAt: new Date().toISOString(),
    };

    // Save to history (non-blocking)
    saveToHistory(userId, 'research', { topic: researchQuery, depth }, output, output.model);

    return successResponse(res, 'Research completed', output);
  } catch (err) {
    console.error('[Research] Error:', err.message);
    return errorResponse(res, 'Research analysis failed. Please try again.', 500, err.message);
  }
};

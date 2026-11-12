/**
 * ZENVORA AI — Modular AI Provider Service
 * Adapts multiple AI providers behind a unified interface.
 * Providers: gemini (primary), fallback-engine (secondary)
 */
import crypto from 'crypto';
import GeminiService from './geminiService.js';

// Every generation call returns a unique requestId for isolation
export const generateRequestId = () => crypto.randomUUID();

const AIProvider = {
  // Text: marketing content, blogs, captions, hashtags
  generateText: async (prompt, systemInstruction = '', options = {}) => {
    const requestId = generateRequestId();
    const startedAt = new Date().toISOString();
    const result = await GeminiService.callGemini(prompt, systemInstruction);
    return {
      requestId,
      text: result?.text || null,
      provider: result ? 'google-gemini' : 'fallback-engine',
      model: result?.source || 'zenvora-engine-v1',
      startedAt,
      completedAt: new Date().toISOString(),
    };
  },

  // Research: web content analysis
  analyzeContent: async (content, task, options = {}) => {
    const requestId = generateRequestId();
    const prompt = `${task}\n\nContent to analyze:\n${content.slice(0, 8000)}`;
    const result = await GeminiService.callGemini(prompt, 'You are an expert analyst. Be factual, cite sources where available, and clearly distinguish verified data from AI analysis.');
    return {
      requestId,
      analysis: result?.text || null,
      provider: result ? 'google-gemini' : 'fallback-engine',
      model: result?.source || 'zenvora-engine-v1',
    };
  },

  // SEO: keyword and content analysis
  analyzeSEO: async (url, content, targetKeyword = '') => {
    const requestId = generateRequestId();
    const prompt = `Analyze this webpage for SEO. URL: ${url}\nTarget Keyword: ${targetKeyword || 'auto-detect'}\n\nPage content:\n${content.slice(0, 6000)}\n\nProvide: 1) Top 10 keyword opportunities with estimated search intent, 2) Content gaps, 3) Meta recommendations, 4) Internal link suggestions, 5) Semantic keywords to include`;
    const result = await GeminiService.callGemini(prompt, 'You are an SEO expert. Focus on actionable, specific recommendations.');
    return {
      requestId,
      analysis: result?.text || null,
      model: result?.source || 'zenvora-engine-v1',
    };
  },
};

export default AIProvider;

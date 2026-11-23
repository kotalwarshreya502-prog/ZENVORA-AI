/**
 * ZENVORA AI — Official Anthropic Claude Provider Integration
 * Powered by official '@anthropic-ai/sdk'.
 * Models: Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku
 * Dedicated to deep reasoning, strategy, brand consistency, structured analysis & quality copywriting.
 */

import Anthropic from '@anthropic-ai/sdk';

const clientCache = new Map();

function getClaudeClient(customApiKey = '') {
  const apiKey = (customApiKey && customApiKey.trim() && customApiKey !== 'your_anthropic_api_key_here')
    ? customApiKey.trim()
    : (process.env.ANTHROPIC_API_KEY || '').trim();

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return null;
  }

  if (clientCache.has(apiKey)) {
    return clientCache.get(apiKey);
  }

  const client = new Anthropic({
    apiKey,
    timeout: 60000,
    maxRetries: 2,
  });

  clientCache.set(apiKey, client);
  return client;
}

export const ClaudeProvider = {
  name: 'Anthropic Claude',
  id: 'claude',

  isConfigured: (customApiKey = '') => {
    return Boolean(getClaudeClient(customApiKey));
  },

  /**
   * Text & Strategic Reasoning Generation
   */
  generateText: async ({
    prompt,
    systemPrompt = '',
    model = 'claude-3-7-sonnet-20250219',
    temperature = 0.7,
    maxTokens = 3000,
    customApiKey = '',
  }) => {
    const client = getClaudeClient(customApiKey);
    if (!client) {
      throw new Error('Claude client unavailable: ANTHROPIC_API_KEY not configured');
    }

    // Try selected model, fall back gracefully to Claude 3.5 Sonnet then Haiku if needed
    const modelsToTry = [
      model || 'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ];

    let lastError = null;

    for (const m of modelsToTry) {
      try {
        const payload = {
          model: m,
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        };

        if (systemPrompt && systemPrompt.trim()) {
          payload.system = systemPrompt.trim();
        }

        const response = await client.messages.create(payload);

        let text = '';
        for (const block of response.content || []) {
          if (block.type === 'text') {
            text += block.text;
          }
        }

        return {
          text,
          content: text,
          model: response.model || m,
          provider: 'claude',
          usage: response.usage || null,
          stopReason: response.stop_reason,
        };
      } catch (err) {
        lastError = err;
        console.warn(`[Claude] Model ${m} attempt failed: ${err.message}`);
        // If not a model-not-found or overloaded error, break and throw
        if (err.status !== 404 && err.status !== 529 && err.status !== 429) {
          throw err;
        }
      }
    }

    throw lastError || new Error('Claude text generation failed across all model endpoints');
  },

  /**
   * Structured JSON Generation
   */
  generateStructuredJson: async ({
    prompt,
    systemPrompt = '',
    model = 'claude-3-7-sonnet-20250219',
    customApiKey = '',
  }) => {
    const sys = `${systemPrompt || 'You are an elite marketing intelligence and brand analysis system.'}\nCRITICAL: Respond ONLY with a valid JSON object. Do NOT wrap in markdown \`\`\`json or include any conversational commentary. Output must be strictly valid JSON parseable by JSON.parse().`;

    const res = await ClaudeProvider.generateText({
      prompt: `${prompt}\n\nRemember: Output ONLY valid JSON with no introductory text or markdown tags.`,
      systemPrompt: sys,
      model,
      temperature: 0.2,
      maxTokens: 3500,
      customApiKey,
    });

    const raw = (res.text || '').trim();
    let data = {};
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      data = JSON.parse(cleaned);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        throw new Error(`Claude response could not be parsed as JSON: ${raw.slice(0, 200)}...`);
      }
    }

    return {
      data,
      rawText: raw,
      model: res.model,
      provider: 'claude',
      usage: res.usage,
    };
  },
};

export default ClaudeProvider;

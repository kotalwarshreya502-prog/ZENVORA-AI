/**
 * ZENVORA AI — Official OpenAI Provider Integration
 * Powered by official 'openai' SDK.
 * Text & Reasoning: GPT-4o, GPT-4o-mini, GPT-4-turbo
 * Image Generation: DALL-E 3 (1024x1024, 1024x1792, 1792x1024)
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postersDir = path.resolve(__dirname, '../../uploads/posters');

// Cache client instances per API key to reuse connections
const clientCache = new Map();

function getOpenAIClient(customApiKey = '') {
  const apiKey = (customApiKey && customApiKey.trim() && customApiKey !== 'your_openai_api_key_here')
    ? customApiKey.trim()
    : (process.env.OPENAI_API_KEY || '').trim();

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return null;
  }

  if (clientCache.has(apiKey)) {
    return clientCache.get(apiKey);
  }

  const client = new OpenAI({
    apiKey,
    timeout: 60000,
    maxRetries: 2,
  });

  clientCache.set(apiKey, client);
  return client;
}

export const OpenAIProvider = {
  name: 'OpenAI',
  id: 'openai',

  isConfigured: (customApiKey = '') => {
    return Boolean(getOpenAIClient(customApiKey));
  },

  /**
   * Text & Marketing Content Generation
   */
  generateText: async ({
    prompt,
    systemPrompt = '',
    model = 'gpt-4o',
    temperature = 0.7,
    maxTokens = 2500,
    customApiKey = '',
  }) => {
    const client = getOpenAIClient(customApiKey);
    if (!client) {
      throw new Error('OpenAI client unavailable: OPENAI_API_KEY not configured');
    }

    const messages = [];
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({ role: 'system', content: systemPrompt.trim() });
    }
    messages.push({ role: 'user', content: prompt });

    // Always prefer gpt-4o-mini as primary when gpt-4o has quota issues;
    // gpt-4o-mini is fast, cheap, and handles all marketing tasks well
    const modelsToTry = model && model !== 'gpt-4o'
      ? [model]
      : ['gpt-4o', 'gpt-4o-mini'];

    let lastErr = null;
    for (const chosenModel of modelsToTry) {
      try {
        const response = await client.chat.completions.create({
          model: chosenModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        });

        const text = response.choices?.[0]?.message?.content || '';
        if (!text) continue;
        return {
          text,
          content: text,
          model: response.model || chosenModel,
          provider: 'openai',
          usage: response.usage || null,
          finishReason: response.choices?.[0]?.finish_reason || 'stop',
        };
      } catch (err) {
        if (err.status === 429 || err.status === 404 || err.status === 503) {
          console.warn(`[OpenAI] ${chosenModel} failed (${err.status}), trying next model...`);
          lastErr = err;
          continue;
        }
        throw err;
      }
    }
    throw lastErr || new Error('All OpenAI models failed');
  },

  /**
   * Structured JSON Extraction with model fallback
   */
  generateStructuredJson: async ({
    prompt,
    systemPrompt = '',
    model = 'gpt-4o',
    customApiKey = '',
  }) => {
    const client = getOpenAIClient(customApiKey);
    if (!client) {
      throw new Error('OpenAI client unavailable: OPENAI_API_KEY not configured');
    }

    const sys = `${systemPrompt || 'You are an expert marketing intelligence assistant.'}\nOutput strictly valid JSON with no markdown fences, no code blocks, and no extra text.`;
    const messages = [
      { role: 'system', content: sys },
      { role: 'user', content: prompt },
    ];

    const modelsToTry = ['gpt-4o', 'gpt-4o-mini'];
    let lastErr = null;

    for (const chosenModel of modelsToTry) {
      try {
        const response = await client.chat.completions.create({
          model: chosenModel,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 3000,
        });

        const raw = response.choices?.[0]?.message?.content || '{}';
        let data = {};
        try {
          data = JSON.parse(raw);
        } catch {
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) data = JSON.parse(match[0]);
        }

        return {
          data,
          rawText: raw,
          model: response.model || chosenModel,
          provider: 'openai',
          usage: response.usage || null,
        };
      } catch (err) {
        if (err.status === 429 || err.status === 404 || err.status === 503) {
          console.warn(`[OpenAI JSON] ${chosenModel} failed (${err.status}), trying next...`);
          lastErr = err;
          continue;
        }
        throw err;
      }
    }

    throw lastErr || new Error('All OpenAI models failed for structured JSON');
  },

  /**
   * Official DALL-E 3 Commercial Image Generation
   */
  generateImage: async ({
    prompt,
    width = 1024,
    height = 1024,
    quality = 'standard', // 'standard' | 'hd'
    style = 'vivid',      // 'vivid' | 'natural'
    customApiKey = '',
  }) => {
    const client = getOpenAIClient(customApiKey);
    if (!client) {
      throw new Error('OpenAI client unavailable: OPENAI_API_KEY not configured');
    }

    if (!fs.existsSync(postersDir)) {
      fs.mkdirSync(postersDir, { recursive: true });
    }

    // Determine DALL-E 3 supported dimensions
    // DALL-E 3 supports: 1024x1024, 1024x1792 (vertical), 1792x1024 (landscape)
    let size = '1024x1024';
    const ratio = width / height;
    if (ratio >= 1.35) {
      size = '1792x1024';
    } else if (ratio <= 0.75) {
      size = '1024x1792';
    }

    // DALL-E 3 prompts must be under 4000 characters
    const cleanPrompt = prompt.trim().substring(0, 3900);

    console.log(`[OpenAI DALL-E 3] Generating visual (${size}, quality: ${quality})...`);

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: cleanPrompt,
      n: 1,
      size,
      quality,
      style,
      response_format: 'b64_json',
    });

    const imageData = response.data?.[0];
    if (!imageData?.b64_json) {
      throw new Error('DALL-E 3 did not return base64 image data');
    }

    const buffer = Buffer.from(imageData.b64_json, 'base64');
    const filename = `poster-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.png`;
    const localPath = path.join(postersDir, filename);
    fs.writeFileSync(localPath, buffer);

    const relativeUrl = `/uploads/posters/${filename}`;

    return {
      imageUrl: relativeUrl,
      localUrl: relativeUrl,
      buffer,
      revisedPrompt: imageData.revised_prompt || cleanPrompt,
      model: 'dall-e-3',
      provider: 'openai',
      size,
      width,
      height,
      generatedAt: new Date().toISOString(),
    };
  },
};

export default OpenAIProvider;

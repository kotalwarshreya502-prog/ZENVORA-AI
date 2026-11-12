/**
 * ZENVORA AI — Modular AI Provider Service
 * Abstracts text generation across providers (Gemini, fallback engine).
 * Each call gets a unique requestId — no result reuse across requests.
 */
import { randomUUID } from 'crypto';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_FALLBACK_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Call Gemini API with automatic model fallback.
 * Returns { text, model, requestId, provider } or null on failure.
 */
export async function callGeminiText(prompt, systemInstruction = '', options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const requestId = randomUUID();

  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const { temperature = 0.75, maxTokens = 4096 } = options;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt }],
      },
    ],
    generationConfig: {
      temperature,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: maxTokens,
    },
  };

  for (const url of [GEMINI_URL, GEMINI_FALLBACK_URL]) {
    try {
      const res = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const modelName = url.includes('gemini-2.0-flash') ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
          console.log(`[AI] ${modelName} responded (requestId: ${requestId})`);
          return { text, model: modelName, requestId, provider: 'google-gemini' };
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`[AI] Gemini ${url.includes('2.0') ? '2.0' : '1.5'} error:`, err?.error?.message || res.status);
      }
    } catch (err) {
      console.warn(`[AI] Gemini request failed: ${err.message}`);
    }
  }

  return null;
}

/**
 * Generate a real image URL using Pollinations.ai (free, no API key needed).
 * Returns a real fetchable image URL.
 */
export async function generateImage({ prompt, width = 1024, height = 1024, model = 'flux' }) {
  const requestId = randomUUID();
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 999999);

  // Pollinations.ai — returns real AI-generated images, free, no key required
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;

  // Verify the image is reachable
  try {
    const check = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    if (check.ok || check.status === 200) {
      return { imageUrl, requestId, provider: 'pollinations-flux', model, width, height };
    }
  } catch {
    // fall through to direct URL return anyway — Pollinations generates on first GET
  }

  // Return URL directly — browser will load it on first access
  return { imageUrl, requestId, provider: 'pollinations-flux', model, width, height };
}

export default { callGeminiText, generateImage };

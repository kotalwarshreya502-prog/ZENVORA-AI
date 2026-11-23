/**
 * ZENVORA AI — OpenAI Service
 * GPT-4o for intelligent text analysis + DALL-E 3 for high-quality image generation.
 * Activated when OPENAI_API_KEY is set in environment.
 */

const OPENAI_API_BASE = 'https://api.openai.com/v1';

/**
 * Call GPT-4o for text generation and campaign analysis.
 * Returns null if no key / call fails (caller handles fallback).
 */
export async function callGPT(prompt, systemPrompt = '', customApiKey = '') {
  const apiKey = (customApiKey && customApiKey.trim() && customApiKey !== 'your_openai_api_key_here')
    ? customApiKey.trim()
    : process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    return null; // No key — caller uses fallback
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // cost-efficient; falls back to gpt-3.5-turbo
        messages,
        max_tokens: 1200,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      const errText = await response.text();
      // Try gpt-3.5-turbo as fallback
      if (response.status === 404 || response.status === 429) {
        const r2 = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(25000),
        });
        if (r2.ok) {
          const d2 = await r2.json();
          return d2.choices?.[0]?.message?.content || null;
        }
      }
      console.warn(`[OpenAI] GPT call failed: ${response.status} — ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('[OpenAI] GPT call error:', err.message);
    return null;
  }
}

/**
 * Generate an image with DALL-E 3.
 * Returns { buffer, model, provider } or throws.
 */
export async function generateWithDallE3(prompt, width = 1024, height = 1024, customApiKey = '') {
  const apiKey = (customApiKey && customApiKey.trim() && customApiKey !== 'your_openai_api_key_here')
    ? customApiKey.trim()
    : process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    throw new Error('No OpenAI API key configured');
  }

  // DALL-E 3 supports: 1024x1024, 1024x1792, 1792x1024
  let size = '1024x1024';
  const ratio = width / height;
  if (ratio >= 1.4) size = '1792x1024';
  else if (ratio <= 0.7) size = '1024x1792';

  // DALL-E 3 prompt must be under 4000 chars
  const cleanPrompt = prompt.substring(0, 3800);

  console.log(`[OpenAI] Calling DALL-E 3 (size: ${size})...`);

  const response = await fetch(`${OPENAI_API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: cleanPrompt,
      n: 1,
      size,
      quality: 'hd',
      style: 'vivid',
      response_format: 'b64_json',
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DALL-E 3 HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('DALL-E 3 returned no image data');

  return {
    buffer: Buffer.from(b64, 'base64'),
    model: 'dall-e-3',
    provider: 'openai-dalle3',
    revisedPrompt: data.data?.[0]?.revised_prompt || cleanPrompt,
  };
}

/**
 * Analyze campaign input using GPT-4o.
 * Returns the same schema as GeminiService analysis (compatible).
 */
export async function analyzeCampaignWithGPT(description, customApiKey = '') {
  const systemPrompt = `You are a world-class creative director and brand strategist at a top advertising agency. 
You analyze marketing campaign briefs and extract precise visual and copywriting specifications.
Always return valid JSON only. Never return markdown or code blocks.`;

  const userPrompt = `Analyze this marketing campaign/product description: "${description}"

Return a JSON object with these exact fields:
{
  "brandName": "exact brand name if mentioned, otherwise derive from context (never empty - create a suitable brand name)",
  "industry": "industry sector in 1-3 words",
  "category": "one of: pizza, burger, coffee, cake, indiansweets, indianfood, food, festive, ecommerce, footwear, smartphone, tech, fashion, healthcare, education, realestate, automotive, travel, beauty, sports, general",
  "headline": "powerful 4-8 word advertising headline (must be specific to this exact product/service)",
  "subheadline": "compelling supporting text in 10-16 words (must mention the specific product or offer)",
  "offer": "exact offer if mentioned (e.g. '50% OFF', 'BUY 2 GET 1', 'ADMISSION OPEN 2025') or empty string",
  "cta": "2-5 word call to action button text",
  "targetAudience": "specific target audience for this campaign",
  "posterType": "one of: product-launch, sale-promotion, event-announcement, brand-awareness, service-promotion, educational, inspirational",
  "heroVisualSubject": "extremely detailed 25-40 word description of the EXACT product/subject to show in the image — be very specific about what this product looks like, its colors, textures, context. This becomes the AI image prompt.",
  "visualSetting": "15-20 word description of the background/environment for the product photo",
  "colorPalette": "3-5 specific hex-free color names that suit this brand perfectly",
  "mood": "2-4 words describing the emotional tone",
  "officialWebsite": "best guess at official website domain if well-known brand, else empty string"
}

CRITICAL: 
- heroVisualSubject must describe the ACTUAL product shown in this campaign, not a generic image
- If input says "samosa 50% off", heroVisualSubject must describe golden crispy samosas specifically
- If input says "Nike shoes", heroVisualSubject must describe the actual sneakers/shoes
- Never describe generic "dark room" or "abstract background" — always describe the real product`;

  const raw = await callGPT(userPrompt, systemPrompt, customApiKey);
  if (!raw) return null;

  try {
    const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[OpenAI] GPT analysis JSON parse failed:', err.message);
    return null;
  }
}

/**
 * Generate marketing content text using GPT-4o.
 * Drop-in replacement for GeminiService.generateMarketingContent
 */
export async function generateMarketingContentWithGPT({
  topic, brandName, industry, platform, tone, objective, keywords,
  targetAudience, contentType = 'social post', customApiKey = ''
}) {
  const systemPrompt = `You are a professional digital marketing copywriter specializing in high-converting social media content. 
Write content that is specific, engaging, and directly relevant to the given brand and topic. 
Never write generic filler content.`;

  const userPrompt = `Write ${contentType} content for:
Brand: ${brandName || 'the brand'}
Industry: ${industry || 'general'}
Topic/Campaign: ${topic}
Platform: ${platform || 'Instagram'}
Tone: ${tone || 'professional'}
Objective: ${objective || 'engagement'}
Target Audience: ${targetAudience || 'general audience'}
Keywords: ${keywords || ''}

Requirements:
- Write content that is 100% specific to this exact topic and brand
- Adapt length and style to the ${platform || 'Instagram'} platform
- Include relevant emojis
- End with 5-8 highly relevant hashtags
- Make it engaging and conversion-focused`;

  const raw = await callGPT(userPrompt, systemPrompt, customApiKey);
  return raw || null;
}

export const OpenAIService = {
  callGPT,
  generateWithDallE3,
  analyzeCampaignWithGPT,
  generateMarketingContentWithGPT,
};

export default OpenAIService;

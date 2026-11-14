/**
 * ZENVORA AI — Search & Research Service
 * Uses Google Custom Search JSON API (if keys configured) or
 * Gemini knowledge synthesis to research brands/topics.
 * Never invents prices, discounts, or unverified claims.
 */

import GeminiService from './geminiService.js';

const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';

/**
 * research(query) — returns brand/topic intelligence
 * @param {string} query - e.g. "Flipkart Diwali Sale", "Nike Running Shoes"
 * @returns {{ brandInfo, officialWebsite, colors, industry, description, sources, researched }}
 */
export async function research(query) {
  const result = {
    brandInfo: '',
    officialWebsite: '',
    colors: '',
    industry: '',
    description: '',
    sources: [],
    researched: false,
  };

  const { GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_ENGINE_ID } = process.env;

  // ── Path A: Real Google Custom Search ──────────────────────────────────────
  if (GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
    try {
      const { default: axios } = await import('axios');
      const searchQuery = `${query} official brand information`;
      const url = `${GOOGLE_SEARCH_URL}?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=5`;

      const { data } = await axios.get(url, { timeout: 10000 });
      const items = data.items || [];

      result.sources = items.map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
      }));

      // Extract official website (first .com/.in result or first result)
      const officialItem = items.find(i => i.link.includes(query.split(' ')[0].toLowerCase())) || items[0];
      if (officialItem) {
        try {
          const url = new URL(officialItem.link);
          result.officialWebsite = `${url.protocol}//${url.hostname}`;
        } catch {}
        result.brandInfo = items.map(i => i.snippet).join(' ').substring(0, 500);
      }

      result.researched = true;
      result.description = result.brandInfo.substring(0, 200);

      console.log(`[SearchService] Google search returned ${items.length} results for: ${query}`);
    } catch (err) {
      console.warn('[SearchService] Google Search failed:', err.message);
    }
  }

  // ── Path B: Gemini Knowledge Synthesis (no search key needed) ──────────────
  if (!result.researched) {
    const synthPrompt = `You are a brand research assistant with knowledge of major brands and businesses worldwide.

For this topic/brand: "${query}"

Provide factual, publicly known information ONLY. Do NOT invent prices, discounts, statistics, or specific offers.

Return a JSON object (no markdown, no code blocks):
{
  "brandInfo": "2-3 sentences of publicly known factual brand/topic information",
  "officialWebsite": "official website domain if well-known brand, else empty string",
  "industry": "industry sector in 1-3 words",
  "targetAudience": "likely target audience",
  "brandColors": "known brand colors if well-known brand, else suggest appropriate colors",
  "description": "1 sentence factual description suitable for a poster"
}

If this is NOT a well-known brand, return empty strings for website and brandInfo. Never invent facts.`;

    try {
      const synthResult = await GeminiService.callGemini(synthPrompt, 'You are a factual brand research assistant. Respond only with valid JSON, no markdown, no code blocks.');
      if (synthResult?.text) {
        const cleaned = synthResult.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        result.brandInfo = parsed.brandInfo || '';
        result.officialWebsite = parsed.officialWebsite || '';
        result.industry = parsed.industry || '';
        result.colors = parsed.brandColors || '';
        result.description = parsed.description || '';
        result.researched = true;
        result.sources = [{ title: 'AI Knowledge Base', url: '', snippet: 'Synthesized from training data' }];
      }
    } catch (err) {
      console.warn('[SearchService] Gemini synthesis failed:', err.message);
    }
  }

  return result;
}

export default { research };

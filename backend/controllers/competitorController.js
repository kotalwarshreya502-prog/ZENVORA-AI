import crypto from 'crypto';
import GeminiService from '../services/geminiService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

async function saveToHistory(userId, module, input, output, model) {
  try {
    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    await GenerationHistory.create({
      userId, requestId: crypto.randomUUID(), module, input, output,
      provider: model?.includes('gemini') ? 'google-gemini' : 'fallback-engine',
      model: model || 'zenvora-engine-v1', status: 'success',
    });
  } catch (e) { console.warn('[History] Save failed:', e.message); }
}

export const analyzeCompetitor = async (req, res) => {
  try {
    const { url, businessContext = '' } = req.body;
    const userId = req.user.id;
    const requestId = crypto.randomUUID();

    if (!url || !url.trim()) {
      return errorResponse(res, 'Competitor website URL is required', 400);
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return errorResponse(res, 'Invalid URL format', 400);
    }

    // Fetch the actual webpage
    let pageContent = '';
    let title = '';
    let metaDescription = '';
    let socialLinks = [];
    let isLiveFetch = false;

    try {
      const response = await fetch(parsedUrl.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZenvoraBot/1.0; +https://zenvora.ai)',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const html = await response.text();
        isLiveFetch = true;

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = titleMatch ? titleMatch[1].trim() : '';

        // Extract meta description
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
        metaDescription = metaMatch ? metaMatch[1].trim() : '';

        // Extract text content (strip HTML tags)
        pageContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 6000);

        // Extract social links
        const socialPatterns = {
          LinkedIn: /linkedin\.com\/[a-zA-Z0-9\-\/]+/,
          Twitter: /twitter\.com\/[a-zA-Z0-9_]+|x\.com\/[a-zA-Z0-9_]+/,
          Instagram: /instagram\.com\/[a-zA-Z0-9_.]+/,
          Facebook: /facebook\.com\/[a-zA-Z0-9.]+/,
          YouTube: /youtube\.com\/[a-zA-Z0-9@\-]+/,
        };
        for (const [platform, pattern] of Object.entries(socialPatterns)) {
          const match = html.match(pattern);
          if (match) socialLinks.push({ platform, url: `https://${match[0]}` });
        }
      }
    } catch (fetchErr) {
      console.warn('[Competitor] Fetch failed:', fetchErr.message);
    }

    // AI analysis
    const contentForAnalysis = isLiveFetch && pageContent
      ? `Page Title: ${title}\nMeta Description: ${metaDescription}\n\nPage Content:\n${pageContent}`
      : `URL: ${parsedUrl.href}\nNote: Could not fetch page content (access blocked or timeout). Provide domain-based analysis only.`;

    const systemInstruction = `You are a senior marketing strategist and competitive intelligence analyst.
Analyze the competitor based on available information.
RULES:
- Only state what you can verify from the provided content
- Clearly mark inferred insights as "Likely:" or "Analysis suggests:"
- Never fabricate specific product names, prices, or claims not in the content
- Structure: 1) Overview, 2) Products/Services, 3) Brand Positioning, 4) Marketing Strategy, 5) SEO Keywords, 6) Strengths, 7) Opportunities for You`;

    const prompt = `Analyze competitor: ${parsedUrl.href}
${businessContext ? `Your business context: ${businessContext}` : ''}

${contentForAnalysis}

Provide actionable competitive intelligence.`;

    const aiResult = await GeminiService.callGemini(prompt, systemInstruction);

    const output = {
      requestId,
      competitorUrl: parsedUrl.href,
      domain: parsedUrl.hostname,
      title,
      metaDescription,
      socialLinks,
      isLiveFetch,
      analysis: aiResult?.text || `Analysis unavailable. Configure GEMINI_API_KEY in Render to enable AI-powered competitor analysis.`,
      model: aiResult?.source || 'zenvora-engine-v1',
      provider: aiResult ? 'google-gemini' : 'fallback-engine',
      limitations: isLiveFetch
        ? 'Analysis based on publicly accessible page content only. Dynamic/authenticated content not analyzed.'
        : 'Could not fetch competitor page. Analysis based on domain knowledge only.',
      analyzedAt: new Date().toISOString(),
    };

    saveToHistory(userId, 'competitor-analysis', { url: parsedUrl.href, businessContext }, output, output.model);

    return successResponse(res, 'Competitor analysis completed', output);
  } catch (err) {
    console.error('[Competitor] Error:', err.message);
    return errorResponse(res, 'Competitor analysis failed. Please try again.', 500, err.message);
  }
};

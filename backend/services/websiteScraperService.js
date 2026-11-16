/**
 * ZENVORA AI — Website Scraper & Intelligence Service
 * Crawls publicly accessible business websites and extracts structured brand
 * intelligence (identity, products, voice, audience, USPs, colors, logo).
 */

import axios from 'axios';
import GeminiService from './geminiService.js';

/**
 * Clean HTML and extract useful metadata and text content
 */
function extractHtmlMetadata(html, baseUrl) {
  const metadata = {
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    favicon: '',
    headings: [],
    bodySnippet: '',
  };

  try {
    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) metadata.title = titleMatch[1].trim();

    // Meta Description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    if (descMatch) metadata.description = descMatch[1].trim();

    // Meta Keywords
    const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
    if (kwMatch) metadata.keywords = kwMatch[1].trim();

    // OG Image / Logo Candidate
    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) ||
                       html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i);
    if (ogImgMatch) {
      let img = ogImgMatch[1].trim();
      if (img.startsWith('//')) img = 'https:' + img;
      else if (img.startsWith('/')) {
        try {
          const u = new URL(baseUrl);
          img = `${u.origin}${img}`;
        } catch {}
      }
      metadata.ogImage = img;
    }

    // Favicon
    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
    if (iconMatch) {
      let icon = iconMatch[1].trim();
      if (icon.startsWith('//')) icon = 'https:' + icon;
      else if (icon.startsWith('/')) {
        try {
          const u = new URL(baseUrl);
          icon = `${u.origin}${icon}`;
        } catch {}
      }
      metadata.favicon = icon;
    }

    // Headings (h1, h2)
    const headingMatches = [...html.matchAll(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/gi)];
    metadata.headings = headingMatches
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(h => h.length > 5 && h.length < 120)
      .slice(0, 8);

    // Clean body text (remove scripts, styles, SVGs, and tags)
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    metadata.bodySnippet = clean.slice(0, 3500);
  } catch (err) {
    console.warn('[WebsiteScraper] Error parsing HTML:', err.message);
  }

  return metadata;
}

/**
 * Scrape website URL and extract deep business profile using Gemini
 */
export async function scrapeAndAnalyzeBusiness(websiteUrl, customApiKey = '') {
  if (!websiteUrl || !websiteUrl.trim()) {
    throw new Error('Website URL is required for AI business analysis');
  }

  let formattedUrl = websiteUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  console.log(`[WebsiteScraper] Fetching site content for: ${formattedUrl}`);

  let htmlData = '';
  let parsedMeta = {
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    favicon: '',
    headings: [],
    bodySnippet: '',
  };

  try {
    const res = await axios.get(formattedUrl, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ZenvoraBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
    });

    htmlData = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    parsedMeta = extractHtmlMetadata(htmlData, formattedUrl);
  } catch (fetchErr) {
    console.warn(`[WebsiteScraper] Direct HTTP fetch failed for ${formattedUrl} (${fetchErr.message}). Proceeding with URL domain knowledge synthesis.`);
  }

  // Derive domain name as fallback brand name
  let domainName = '';
  try {
    const u = new URL(formattedUrl);
    domainName = u.hostname.replace(/^www\./, '').split('.')[0];
    domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  } catch {}

  // Build the intelligence extraction prompt for Gemini
  const prompt = `Analyze the following website data and extract complete, highly accurate business intelligence for marketing operations.

Target Website: ${formattedUrl}
Website Title: ${parsedMeta.title || domainName}
Meta Description: ${parsedMeta.description || 'Not provided'}
Meta Keywords: ${parsedMeta.keywords || 'None'}
Page Headings: ${parsedMeta.headings.join(' | ') || 'None found'}
Website Body Text Content:
${parsedMeta.bodySnippet || `Website URL: ${formattedUrl}. Perform deep contextual brand analysis for this organization.`}

Return ONLY a valid JSON object matching this exact schema (no markdown, no backticks):
{
  "name": "Exact official business name",
  "website": "${formattedUrl}",
  "industry": "Specific industry vertical (e.g. B2B SaaS, Health & Wellness, E-Commerce Apparel, Financial Services)",
  "description": "Comprehensive 2-3 paragraph overview of what the company does, its mission, core value proposition, and customer promise.",
  "brandVoice": "3-5 adjectives and a sentence describing their communication tone (e.g. Authoritative, empathetic, modern, data-driven)",
  "targetAudience": "Detailed description of their primary customer personas, ICP (Ideal Customer Profile), and target demographics",
  "uniqueSellingPoints": [
    "Key USP or differentiator 1",
    "Key USP or differentiator 2",
    "Key USP or differentiator 3",
    "Key USP or differentiator 4"
  ],
  "productsServices": [
    "Primary product or service offering 1",
    "Primary product or service offering 2",
    "Primary product or service offering 3",
    "Primary product or service offering 4"
  ],
  "pricingOverview": "Summary of their pricing model or plans (e.g. Subscription SaaS starting at $49/mo, Free tier available, Custom enterprise quotes)",
  "brandColors": {
    "primary": "#HEX (dominant primary brand color)",
    "secondary": "#HEX (secondary/background dark or light color)",
    "accent": "#HEX (vibrant CTA/highlight color)"
  },
  "logoUrl": "${parsedMeta.ogImage || parsedMeta.favicon || ''}",
  "competitors": [
    "Competitor 1",
    "Competitor 2",
    "Competitor 3"
  ],
  "locations": [
    {
      "name": "Global Headquarters",
      "city": "Detected city or 'Remote / Online'",
      "country": "Detected country or 'Global'",
      "isPrimary": true
    }
  ]
}`;

  const systemInstruction = `You are the Central ZENVORA Business Understanding Agent. Your role is to examine website content and extract comprehensive brand intelligence. Never invent fake claims. Respond with strict valid JSON only.`;

  const aiRes = await GeminiService.callGemini(prompt, systemInstruction, customApiKey);

  if (!aiRes || !aiRes.text) {
    throw new Error('Gemini failed to return business intelligence analysis');
  }

  let cleaned = aiRes.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  let parsedAnalysis;
  try {
    parsedAnalysis = JSON.parse(cleaned);
  } catch (parseErr) {
    throw new Error(`Failed to parse AI business analysis JSON: ${parseErr.message}`);
  }

  // Ensure default fallback structures if missing
  if (!parsedAnalysis.name) parsedAnalysis.name = parsedMeta.title || domainName || 'My Business';
  if (!parsedAnalysis.website) parsedAnalysis.website = formattedUrl;
  if (!parsedAnalysis.brandColors) {
    parsedAnalysis.brandColors = { primary: '#7657F6', secondary: '#11152B', accent: '#3B82F6' };
  }
  if (!parsedAnalysis.logoUrl && (parsedMeta.ogImage || parsedMeta.favicon)) {
    parsedAnalysis.logoUrl = parsedMeta.ogImage || parsedMeta.favicon;
  }

  return {
    ...parsedAnalysis,
    rawMetadata: {
      title: parsedMeta.title,
      description: parsedMeta.description,
      detectedFavicon: parsedMeta.favicon,
      detectedOgImage: parsedMeta.ogImage,
    },
    analyzedAt: new Date().toISOString(),
  };
}

export default {
  scrapeAndAnalyzeBusiness,
};

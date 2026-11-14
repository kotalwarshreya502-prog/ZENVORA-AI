/**
 * ZENVORA AI — Poster Intelligence Service
 * Analyzes user description, detects brand/topic, builds design spec,
 * crafts an AI-optimized image prompt for Pollinations.ai.
 * Works for ANY brand, ANY industry, ANY topic — no hardcoded brands.
 */

import GeminiService from './geminiService.js';

// ─── Category detection config ───────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  ecommerce:   ['sale', 'deal', 'offer', 'discount', 'flipkart', 'amazon', 'meesho', 'shopping', 'buy', 'shop', 'store'],
  food:        ['restaurant', 'food', 'cafe', 'cuisine', 'recipe', 'menu', 'chef', 'eat', 'dining', 'pizza', 'burger', 'zomato', 'swiggy'],
  fashion:     ['fashion', 'clothing', 'apparel', 'style', 'outfit', 'wear', 'shoes', 'sneakers', 'nike', 'adidas', 'zara'],
  tech:        ['technology', 'tech', 'software', 'app', 'saas', 'startup', 'ai', 'digital', 'gadget', 'smartphone', 'samsung', 'apple', 'iphone', 'galaxy'],
  healthcare:  ['health', 'medical', 'hospital', 'wellness', 'clinic', 'doctor', 'pharmacy', 'fitness', 'gym', 'yoga'],
  education:   ['education', 'coaching', 'classes', 'institute', 'school', 'college', 'university', 'admission', 'course', 'training', 'learn'],
  realestate:  ['real estate', 'property', 'apartment', 'villa', 'flat', 'housing', 'builder', 'plot', 'residence'],
  event:       ['festival', 'event', 'concert', 'celebration', 'diwali', 'christmas', 'independence', 'republic', 'holi', 'eid', 'wedding', 'annual'],
  automotive:  ['car', 'vehicle', 'automobile', 'bike', 'motorcycle', 'electric vehicle', 'ev', 'suv'],
  travel:      ['travel', 'tourism', 'hotel', 'resort', 'holiday', 'vacation', 'tour', 'destination'],
  finance:     ['finance', 'bank', 'insurance', 'investment', 'loan', 'mutual fund', 'trading', 'fintech'],
  beauty:      ['beauty', 'skincare', 'cosmetics', 'makeup', 'salon', 'hair', 'grooming', 'organic'],
  awareness:   ['environment', 'earth', 'climate', 'green', 'sustainability', 'awareness', 'ngo', 'charity', 'donate', 'social'],
  sports:      ['sports', 'cricket', 'football', 'ipl', 'match', 'team', 'tournament', 'player'],
};

const CATEGORY_STYLES = {
  ecommerce:  { style: 'bold festive sale poster', colors: 'vibrant red orange yellow', mood: 'exciting celebratory' },
  food:       { style: 'warm appetizing food photography poster', colors: 'warm orange red cream', mood: 'delicious inviting' },
  fashion:    { style: 'sleek high fashion editorial poster', colors: 'neutral black white gold', mood: 'stylish sophisticated' },
  tech:       { style: 'futuristic tech product launch poster', colors: 'electric blue purple dark', mood: 'innovative cutting-edge' },
  healthcare: { style: 'clean medical professional wellness poster', colors: 'blue green white teal', mood: 'trustworthy caring' },
  education:  { style: 'bright inspiring academic poster', colors: 'blue yellow green white', mood: 'motivational welcoming' },
  realestate: { style: 'luxury real estate property poster', colors: 'gold navy cream white', mood: 'premium prestigious' },
  event:      { style: 'colorful festive event celebration poster', colors: 'vibrant multi-color gold', mood: 'joyful festive' },
  automotive: { style: 'dramatic automotive cinematic poster', colors: 'dark charcoal silver red', mood: 'powerful dynamic' },
  travel:     { style: 'stunning travel destination photography poster', colors: 'blue turquoise green golden', mood: 'adventurous inspiring' },
  finance:    { style: 'professional corporate finance poster', colors: 'navy blue gold white', mood: 'trustworthy professional' },
  beauty:     { style: 'elegant beauty skincare poster', colors: 'rose gold pink cream white', mood: 'luxurious radiant' },
  awareness:  { style: 'impactful social awareness campaign poster', colors: 'green earth tones blue', mood: 'meaningful inspiring' },
  sports:     { style: 'energetic sports action poster', colors: 'bold red black white gold', mood: 'thrilling powerful' },
  default:    { style: 'modern professional marketing poster', colors: 'brand-appropriate vibrant', mood: 'engaging impactful' },
};

// ─── Clearbit + favicon logo lookup ──────────────────────────────────────────
export async function fetchBrandLogo(brandName, officialWebsite = '') {
  if (!brandName) return null;

  const domainGuesses = [];

  if (officialWebsite) {
    try {
      const url = new URL(officialWebsite.startsWith('http') ? officialWebsite : `https://${officialWebsite}`);
      domainGuesses.push(url.hostname.replace(/^www\./, ''));
    } catch {}
  }

  // Common brand → domain guesses
  const slug = brandName.toLowerCase().replace(/\s+/g, '');
  domainGuesses.push(`${slug}.com`, `${slug}.in`, `${slug}.co`);

  for (const domain of domainGuesses) {
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    try {
      const { default: axios } = await import('axios');
      const res = await axios.head(logoUrl, { timeout: 5000 });
      if (res.status === 200) {
        return { logoUrl, domain, source: 'clearbit' };
      }
    } catch {}
  }

  // Fallback: Google favicon (always available)
  const domain = domainGuesses[0];
  return {
    logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    domain,
    source: 'favicon',
  };
}

// ─── Category detection (pure JS, no AI needed) ──────────────────────────────
function detectCategory(description) {
  const lower = description.toLowerCase();
  let best = { category: 'default', score: 0 };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > best.score) best = { category, score };
  }

  return best.category;
}

// ─── Main analysis via Gemini ─────────────────────────────────────────────────
export async function analyzeInput(description) {
  const category = detectCategory(description);
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;

  // Try Gemini for rich understanding
  const prompt = `You are a creative director and brand analyst. 
Analyze this poster request: "${description}"

Return a JSON object (no markdown, no code blocks, just raw JSON) with these exact fields:
{
  "brandName": "exact brand name if mentioned, otherwise derive from context or leave empty",
  "industry": "industry/sector in 1-3 words",
  "category": "one of: ecommerce, food, fashion, tech, healthcare, education, realestate, event, automotive, travel, finance, beauty, awareness, sports, general",
  "headline": "powerful 3-7 word headline for the poster",
  "subheadline": "supporting text in 8-15 words",
  "cta": "call to action in 2-5 words",
  "targetAudience": "target audience description",
  "posterType": "one of: product-launch, sale-promotion, event-announcement, brand-awareness, service-promotion, educational, inspirational",
  "visualStyle": "describe the ideal visual style for this poster in 15-20 words",
  "colorPalette": "3-5 colors that suit this brand/category",
  "mood": "2-3 words describing the emotional tone",
  "officialWebsite": "best guess at official website domain if brand is known, else empty string",
  "keyVisualElements": "comma-separated list of 3-5 key visual elements to include in the image"
}`;

  let analysis = null;

  const systemInstruction = `You are an expert creative director and brand analyst. 
You analyze marketing and advertising requests and extract structured data as clean JSON.
Always respond with ONLY valid JSON — no markdown, no code fences, no explanation.`;

  try {
    const result = await GeminiService.callGemini(prompt, systemInstruction);
    if (result?.text) {
      // Strip any accidental markdown code fences
      const cleaned = result.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      analysis = JSON.parse(cleaned);
    }
  } catch (err) {
    console.warn('[PosterIntelligence] Gemini analysis failed or bad JSON:', err.message);
  }

  // Fallback: build from local category detection
  if (!analysis) {
    const words = description.split(' ');
    const potentialBrand = words.find(w => w.length > 3 && /^[A-Z]/.test(w)) || words[0];
    analysis = {
      brandName: potentialBrand || '',
      industry: category,
      category,
      headline: description.length < 40 ? description : description.substring(0, 40),
      subheadline: `Discover what ${potentialBrand || 'we'} has to offer`,
      cta: 'Learn More',
      targetAudience: 'General audience',
      posterType: 'brand-awareness',
      visualStyle: categoryStyle.style,
      colorPalette: categoryStyle.colors,
      mood: categoryStyle.mood,
      officialWebsite: '',
      keyVisualElements: 'professional design, vibrant colors, clean layout',
    };
  }

  // Always enforce detected category from local heuristic (more reliable than Gemini for this)
  if (category !== 'default') {
    analysis.category = category;
    analysis.visualStyle = analysis.visualStyle || categoryStyle.style;
    analysis.colorPalette = analysis.colorPalette || categoryStyle.colors;
    analysis.mood = analysis.mood || categoryStyle.mood;
  }

  return analysis;
}

// ─── Craft the Pollinations.ai image generation prompt ───────────────────────
export function generatePosterPrompt(analysis, researchData = {}) {
  const {
    brandName = '',
    headline = '',
    category = 'default',
    visualStyle = '',
    colorPalette = '',
    mood = '',
    posterType = 'brand-awareness',
    keyVisualElements = '',
  } = analysis;

  const { industry = '', description: researchDesc = '' } = researchData;

  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
  const baseStyle = visualStyle || catStyle.style;
  const colors = colorPalette || catStyle.colors;
  const moodDesc = mood || catStyle.mood;

  const parts = [
    `${baseStyle}`,
    brandName ? `for brand "${brandName}"` : '',
    headline ? `theme: "${headline}"` : '',
    `color palette: ${colors}`,
    `mood: ${moodDesc}`,
    keyVisualElements ? `visual elements: ${keyVisualElements}` : '',
    researchDesc ? `context: ${researchDesc.substring(0, 100)}` : '',
    `professional graphic design`,
    `high quality commercial photography`,
    `clean composition with strong visual hierarchy`,
    `4K ultra-detailed render`,
    `no watermarks, no text overlay`,
    `award-winning advertising poster`,
  ].filter(Boolean);

  return parts.join(', ');
}

// ─── Build the complete design specification ─────────────────────────────────
export function buildDesignSpec(analysis, research = {}) {
  return {
    detectedCategory: analysis.category,
    brandName: analysis.brandName,
    industry: analysis.industry || research.industry || '',
    headline: analysis.headline,
    subheadline: analysis.subheadline,
    cta: analysis.cta,
    targetAudience: analysis.targetAudience,
    colorPalette: analysis.colorPalette,
    mood: analysis.mood,
    visualStyle: analysis.visualStyle,
    posterType: analysis.posterType,
    keyVisualElements: analysis.keyVisualElements,
    officialWebsite: analysis.officialWebsite || research.officialWebsite || '',
  };
}

export default {
  analyzeInput,
  generatePosterPrompt,
  buildDesignSpec,
  fetchBrandLogo,
  detectCategory,
};

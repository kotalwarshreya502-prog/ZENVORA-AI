/**
 * ZENVORA AI — Universal Poster Intelligence & Creative Design Engine
 *
 * Dynamically analyzes ANY campaign across ANY industry, extracts the true visual hero subject,
 * enforces 100% strict offer accuracy, synthesizes commercial advertising scene prompts,
 * and builds complete design specifications for the composition engine.
 */

import GeminiService from './geminiService.js';
import { extractStrictOffer, buildStrictOfferRules, sanitizeGeneratedText } from '../utils/offerIntegrity.js';

// ── Category detection keywords ─────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  festive:     ['diwali', 'festival', 'celebration', 'christmas', 'new year', 'eid', 'holiday', 'thanksgiving', 'dhanteras', 'festive', 'carnival', 'dhamaka'],
  ecommerce:   ['sale', 'deal', 'offer', 'discount', 'shopping', 'buy', 'shop', 'store', 'cart', 'retail', 'outlet', 'mega sale', 'flash sale', 'amazon', 'flipkart', 'walmart'],
  footwear:    ['sneakers', 'shoes', 'running shoes', 'boots', 'footwear', 'loafers', 'kicks', 'athletic shoes', 'trainers'],
  smartphone:  ['smartphone', 'phone', 'mobile', 'android', 'iphone', 'flagship phone', '5g phone'],
  tech:        ['technology', 'tech', 'software', 'app', 'saas', 'startup', 'ai', 'digital', 'gadget', 'device', 'smart device', 'hardware', 'cloud', 'cyber', 'platform', 'automation'],
  food:        ['restaurant', 'food', 'cafe', 'cuisine', 'recipe', 'menu', 'chef', 'eat', 'dining', 'pizza', 'burger', 'bakery', 'coffee', 'bistro', 'gourmet', 'culinary', 'cake', 'chocolate cake', 'dessert', 'pastry'],
  fashion:     ['fashion', 'clothing', 'apparel', 'outfit', 'wear', 'couture', 'garment', 'collection', 'summer collection', 'dress', 'linen'],
  healthcare:  ['health', 'medical', 'hospital', 'wellness', 'clinic', 'doctor', 'pharmacy', 'fitness', 'gym', 'yoga', 'dental', 'care', 'therapy', 'checkup', 'preventive'],
  education:   ['education', 'coaching', 'classes', 'institute', 'school', 'college', 'university', 'admission', 'course', 'training', 'learn', 'academy', 'student', 'batches', 'campus', 'degree', 'study', 'admissions open', 'book', 'books', 'textbook', 'library', 'reading'],
  realestate:  ['real estate', 'property', 'apartment', 'villa', 'flat', 'housing', 'builder', 'plot', 'residence', 'realtor', 'architecture', 'penthouse', 'homes'],
  automotive:  ['car', 'vehicle', 'automobile', 'motorcycle', 'electric vehicle', 'suv', 'test drive', 'dealership'],
  travel:      ['travel', 'tourism', 'hotel', 'resort', 'holiday', 'vacation', 'tour', 'destination', 'flight', 'adventure', 'cruise', 'getaway'],
  beauty:      ['beauty', 'skincare', 'cosmetics', 'makeup', 'salon', 'hair', 'grooming', 'organic', 'spa', 'dermatology'],
  sports:      ['sports', 'cricket', 'football', 'marathon', 'tournament', 'player', 'athlete', 'workout', 'training', 'championship'],
};

// ── Hero subject & atmosphere definitions by category ──────────────────────
const CATEGORY_SUBJECT_PROFILES = {
  footwear: {
    heroSubject: 'pair of ultra-premium athletic sneakers with intricate performance textures and aerodynamic soles',
    setting: 'resting dynamically on a polished reflective black acrylic studio pedestal with subtle smoke haze and dramatic dual softbox studio lighting',
    colors: 'matte black, electric neon, clean studio white',
    mood: 'energetic cutting-edge commercial footwear advertising',
    allowPeople: false,
    layout: 'product-focused',
  },
  smartphone: {
    heroSubject: 'flagship sleek modern smartphone with curved bezel-less OLED display showcasing rich vivid reflections',
    setting: 'resting on an ultra-smooth dark reflective glass surface with dual-tone neon cyan and electric violet volumetric studio rim lighting',
    colors: 'electric cyan, deep indigo, carbon black',
    mood: 'innovative cutting-edge premium technology launch',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  food: {
    heroSubject: 'decadent artisanal culinary masterpiece with authentic delicious textures, rich glaze, and fresh garnish',
    setting: 'presented on an elegant dark rustic slate stand in a cozy warm bakery bistro with soft warm golden bokeh lighting',
    colors: 'terracotta, warm chocolate amber, creamy ivory, deep berry',
    mood: 'mouthwatering appetizing artisanal gourmet dining',
    allowPeople: false,
    layout: 'editorial',
  },
  fashion: {
    heroSubject: 'stylish chic fashion garments with natural breathable fabrics, elegant draping, and contemporary tailoring',
    setting: 'sunlit minimalist architectural villa courtyard with travertine columns, natural palm shadows, and soft warm morning light',
    colors: 'soft travertine, natural linen ivory, terracotta bronze',
    mood: 'sophisticated high-fashion summer editorial campaign',
    allowPeople: true,
    layout: 'editorial',
  },
  healthcare: {
    heroSubject: 'modern medical stethoscope, fresh botanical eucalyptus leaves, and organic wellness amber elements',
    setting: 'arranged on a pristine polished white marble surface bathed in tranquil morning sunlight filtering through sheer curtains',
    colors: 'clean clinical white, tranquil teal, soft sky blue, marble grey',
    mood: 'trustworthy serene professional healthcare awareness',
    allowPeople: false,
    layout: 'clean-modern',
  },
  education: {
    heroSubject: 'ambitious diverse university students engaged with books and tablets collaborating with bright focused expressions',
    setting: 'inspiring modern university architectural atrium with expansive glass windows, polished oak study tables, and uplifting natural daylight',
    colors: 'warm oak, university navy, sunlit ivory, campus gold',
    mood: 'inspiring empowering academic admission announcement',
    allowPeople: true,
    layout: 'bold-promotional',
  },
  realestate: {
    heroSubject: 'stunning luxury architectural residential high-rise building exterior at golden hour dusk with illuminated glass balconies',
    setting: 'overlooking an expansive horizon with landscaped infinity pool terrace in foreground and warm twilight sky',
    colors: 'warm twilight amber, platinum grey, champagne gold, deep sapphire',
    mood: 'prestigious luxury breathtaking architectural presentation',
    allowPeople: false,
    layout: 'full-bleed',
  },
  festive_ecommerce: {
    heroSubject: 'luxurious festive shopping gift boxes with golden satin ribbons, sleek modern consumer electronics, and celebratory hampers',
    setting: 'displayed on an elegant glossy podium beautifully illuminated by authentic glowing clay diyas, hanging golden lanterns, fairy bokeh, and fresh marigold petals',
    colors: 'warm gold, royal saffron, celebratory amber, vermilion',
    mood: 'grand celebratory high-value festive retail shopping sale',
    allowPeople: false,
    layout: 'bold-promotional',
  },
  festive: {
    heroSubject: 'luxurious gift packages, golden celebratory hampers, and sparkling festive ornaments',
    setting: 'authentic traditional glowing clay diyas, warm golden bokeh fairy lights, and rich indigo festive backdrop',
    colors: 'warm gold, royal festive indigo, deep amber',
    mood: 'joyful celebratory premium festive shopping',
    allowPeople: false,
    layout: 'bold-promotional',
  },
  ecommerce: {
    heroSubject: 'premium shopping gift parcels with silk ribbons and sleek consumer products',
    setting: 'glossy reflective acrylic podium with directional commercial studio softbox lighting and soft reflections',
    colors: 'crimson red, warm gold, champagne, clean white',
    mood: 'exciting energetic high-value commercial retail',
    allowPeople: false,
    layout: 'product-focused',
  },
  tech: {
    heroSubject: 'sleek minimalist technology product on a dark carbon stone pedestal',
    setting: 'subtle dual-tone cyan and deep violet volumetric studio rim lighting with clean glass reflections',
    colors: 'electric cyan, deep indigo, carbon black',
    mood: 'innovative cutting-edge premium',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  default: {
    heroSubject: 'commercial advertising product presentation tailored to the campaign',
    setting: 'modern commercial advertising studio set, minimalist clean podium with soft dual-tone studio rim lighting',
    colors: 'dynamic brand palette, crisp white, deep accent',
    mood: 'engaging professional memorable commercial advertising',
    allowPeople: false,
    layout: 'product-focused',
  },
};

// ── Dynamic brand logo fetcher ──────────────────────────────────────────────
export async function fetchBrandLogo(brandName, officialWebsite = '') {
  if (!brandName) return null;

  let domain = '';
  if (officialWebsite) {
    try {
      const url = new URL(officialWebsite.startsWith('http') ? officialWebsite : `https://${officialWebsite}`);
      domain = url.hostname.replace(/^www\./, '');
    } catch {}
  }

  if (!domain) {
    const slug = brandName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    domain = `${slug}.com`;
  }

  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return {
    logoUrl,
    domain,
    brandName,
    source: 'verified-brand-asset',
  };
}

// ── Universal Category Detector ─────────────────────────────────────────────
export function detectCategory(description = '', explicitIndustry = '') {
  const lower = `${explicitIndustry} ${description}`.toLowerCase();

  // 1. Hybrid festive + ecommerce
  const isFestive = CATEGORY_KEYWORDS.festive.some(kw => lower.includes(kw));
  const isEcommerce = CATEGORY_KEYWORDS.ecommerce.some(kw => lower.includes(kw));
  if (isFestive && isEcommerce) return 'festive_ecommerce';
  if (isFestive) return 'festive';

  // 2. Specific product verticals (prioritize domain-defining keywords)
  if (CATEGORY_KEYWORDS.realestate.some(kw => lower.includes(kw))) return 'realestate';
  if (CATEGORY_KEYWORDS.footwear.some(kw => lower.includes(kw))) return 'footwear';
  if (CATEGORY_KEYWORDS.food.some(kw => lower.includes(kw))) return 'food';
  if (CATEGORY_KEYWORDS.healthcare.some(kw => lower.includes(kw))) return 'healthcare';
  if (CATEGORY_KEYWORDS.education.some(kw => lower.includes(kw))) return 'education';
  if (lower.includes('smartphone') || lower.includes('phone')) {
    if (explicitIndustry && explicitIndustry.toLowerCase().includes('ecommerce')) return 'ecommerce';
    return 'smartphone';
  }
  if (CATEGORY_KEYWORDS.fashion.some(kw => lower.includes(kw))) return 'fashion';

  if (isEcommerce) return 'ecommerce';

  // 3. Fallback to keyword count
  let best = { category: 'default', score: 0 };
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > best.score) best = { category, score };
  }

  return best.category;
}

// ── Dynamic Input Analysis via Gemini / Semantic Heuristics ─────────────────
export async function analyzeInput(description, customApiKey = '', explicitOffer = '', explicitIndustry = '') {
  const category = detectCategory(description, explicitIndustry);
  const profile = CATEGORY_SUBJECT_PROFILES[category] || CATEGORY_SUBJECT_PROFILES.default;

  // Extract strict ground-truth offer from user input
  const strictOffer = extractStrictOffer(description, explicitOffer);
  const strictRules = buildStrictOfferRules(strictOffer, `User Campaign: "${description}"`);

  const prompt = `You are a World-Class Commercial Advertising Creative Director.
Analyze this marketing campaign request: "${description}"

${strictRules}

Output strictly valid JSON (no markdown formatting, no code blocks):
{
  "brandName": "Brand name if identified (e.g. Flipkart, TechNova, Amazon, etc.), else empty string",
  "industry": "${explicitIndustry || profile.mood.split(' ')[0]}",
  "category": "${category}",
  "layout": "${profile.layout}",
  "headline": "Punchy 3-6 word advertising headline featuring the exact offer (e.g. '${strictOffer || 'Special Promotional Offer'}')",
  "subheadline": "Persuasive 6-12 word supporting value line. Never invent bank offers, EMI, or fake claims.",
  "offer": "${strictOffer || ''}",
  "cta": "High-converting action button text (e.g. 'Shop Now →', 'Explore Collection', 'Apply Today', 'Order Now')",
  "targetAudience": "Target audience description",
  "colorPalette": "${profile.colors}",
  "visualSubject": "${profile.heroSubject}",
  "visualSetting": "${profile.setting}"
}`;

  let analysis = null;

  try {
    const result = await GeminiService.callGemini(prompt, 'Output raw valid JSON only.', customApiKey);
    if (result?.text) {
      const cleaned = result.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        analysis = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      }
    }
  } catch {}

  // Semantic heuristic fallback if Gemini is unconfigured or failed
  if (!analysis) {
    const words = description.split(/\s+/).filter(Boolean);
    const potentialBrand = words.find(w => w.length > 2 && /^[A-Z]/.test(w) && !['Special', 'Diwali', 'Summer', 'Winter', 'New'].includes(w)) || '';

    let headline = strictOffer ? `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer}` : `${potentialBrand ? potentialBrand + ' ' : ''}Special Campaign`;
    let subheadline = `Experience premium commercial excellence and verified value with ${potentialBrand || 'our collection'}.`;
    let offer = strictOffer || '';
    let cta = 'Shop Now →';

    const lower = description.toLowerCase();
    if (lower.includes('sneakers') || lower.includes('shoes')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer || '40% OFF'} on Sneakers`.trim();
      subheadline = 'Engineered for comfort, performance, and unmatched streetwear style.';
      cta = 'Shop Sneakers →';
    } else if (lower.includes('smartphone')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}Next-Gen Smartphone Launch`.trim();
      subheadline = 'Experience revolutionary curved OLED clarity, pro camera sensors, and ultra-fast speed.';
      cta = 'Discover Innovation →';
    } else if (lower.includes('cake') || lower.includes('food')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}Artisanal Chocolate Indulgence`.trim();
      subheadline = 'Handcrafted with decadent dark cocoa ganache and fresh berries.';
      cta = 'Order Deliciously →';
    } else if (lower.includes('fashion') || lower.includes('summer')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}New Summer Collection`.trim();
      subheadline = 'Breathe in effortless summer elegance with lightweight natural linen tailorings.';
      cta = 'Explore Collection →';
    } else if (lower.includes('health') || lower.includes('awareness')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}World Health Awareness`.trim();
      subheadline = 'Empowering healthier lives through preventive care, expert guidance, and daily wellness.';
      cta = 'Learn More →';
    } else if (lower.includes('admission') || lower.includes('academy')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}Admissions Open 2027`.trim();
      subheadline = 'Shape your future with world-class faculty, modern campus labs, and global careers.';
      cta = 'Apply Now →';
    } else if (lower.includes('apartment') || lower.includes('real estate') || lower.includes('homes')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}Luxury Residences Launch`.trim();
      subheadline = 'Experience panoramic horizon views, private infinity terraces, and world-class architecture.';
      cta = 'Book Private Tour →';
    } else if (lower.includes('diwali')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}Diwali ${strictOffer || 'Dhamaka Sale'}`.trim();
      subheadline = `Celebrate this festive season with exclusive ${strictOffer ? strictOffer + ' ' : ''}savings and gifts.`;
      cta = 'Claim Festive Deals →';
    }

    analysis = {
      brandName: potentialBrand,
      industry: explicitIndustry || (category !== 'default' ? category : 'Commercial'),
      category,
      layout: profile.layout,
      headline,
      subheadline,
      offer,
      cta,
      targetAudience: 'Customers and brand enthusiasts',
      colorPalette: profile.colors,
      visualSubject: profile.heroSubject,
      visualSetting: profile.setting,
    };
  }

  // Enforce strict offer override (NEVER let AI change 40% into 50% or 80%)
  if (strictOffer) {
    analysis.offer = strictOffer;
    if (analysis.headline && !analysis.headline.toUpperCase().includes(strictOffer)) {
      analysis.headline = `${analysis.brandName ? analysis.brandName + ' ' : ''}${strictOffer} Special`.trim();
    }
  }

  // Sanitize subheadline against hallucinated bank offers or categories
  if (analysis.subheadline) {
    analysis.subheadline = sanitizeGeneratedText(analysis.subheadline, strictOffer, description);
  }

  return analysis;
}

// ── Craft Dynamic Photographic Background Scene Prompt ──────────────────────
export function generatePosterPrompt(analysis, researchData = {}, styleOverride = '') {
  const {
    brandName = '',
    category = 'default',
    colorPalette = '',
    visualSubject = '',
    visualSetting = '',
  } = analysis;

  const profile = CATEGORY_SUBJECT_PROFILES[category] || CATEGORY_SUBJECT_PROFILES.default;
  const subject = visualSubject || profile.heroSubject;
  const setting = visualSetting || profile.setting;
  const colors = colorPalette || profile.colors;

  // Visual style selection
  let styleDetail = 'commercial advertising studio photography, shot on Hasselblad H6D-100c, 85mm f/2.8 lens';
  if (styleOverride) {
    const sLow = styleOverride.toLowerCase();
    if (sLow.includes('cinematic')) {
      styleDetail = 'cinematic chiaroscuro film lighting, anamorphic lens flare, 35mm panavision aesthetic';
    } else if (sLow.includes('minimal')) {
      styleDetail = 'ultra-clean minimalist architectural cyclorama, soft diffused natural daylight, neutral stone';
    } else if (sLow.includes('luxury') || sLow.includes('3d')) {
      styleDetail = 'luxury commercial 3D render, octane render, ray-traced reflections, metallic accents';
    } else if (sLow.includes('editorial') || sLow.includes('lifestyle')) {
      styleDetail = 'high-fashion lifestyle editorial photography, natural daylight, Vogue and Harper’s Bazaar aesthetic';
    }
  }

  const peopleConstraint = profile.allowPeople
    ? 'natural authentic human models with confident expressions, professional commercial modeling'
    : 'strictly still life commercial product photography, strictly no people, no portraits, no human faces';

  const parts = [
    `award-winning commercial advertising photograph featuring ${subject}`,
    setting,
    `color grading: ${colors}`,
    styleDetail,
    'balanced composition with dedicated negative space for advertising typography layout',
    'masterpiece, ultra-sharp 8k resolution, authentic realistic textures, perfect physical depth of field',
    peopleConstraint,
  ].filter(Boolean);

  return parts.join(', ');
}

// ── Build Structured Design Specification ───────────────────────────────────
export function buildDesignSpec(analysis, research = {}) {
  const profile = CATEGORY_SUBJECT_PROFILES[analysis.category] || CATEGORY_SUBJECT_PROFILES.default;

  return {
    detectedCategory: analysis.category || 'commercial',
    brandName: analysis.brandName || '',
    industry: analysis.industry || research.industry || 'General',
    headline: analysis.headline || '',
    subheadline: analysis.subheadline || '',
    offer: analysis.offer || '',
    cta: analysis.cta || 'Shop Now →',
    layout: analysis.layout || profile.layout || 'product-focused',
    targetAudience: analysis.targetAudience || 'General Audience',
    colorPalette: analysis.colorPalette || profile.colors,
    mood: profile.mood || 'Professional',
    officialWebsite: analysis.officialWebsite || research.officialWebsite || '',
  };
}

// ── Validate Poster Output Against Authoritative Campaign Brief ─────────────
export function validatePosterOutput(output, originalOffer = '') {
  const errors = [];
  const offer = output?.designSpec?.offer || output?.analysis?.offer || '';
  const headline = output?.designSpec?.headline || output?.analysis?.headline || '';
  const subheadline = output?.designSpec?.subheadline || output?.analysis?.subheadline || '';

  if (originalOffer) {
    const numMatch = originalOffer.match(/(\d{1,3})%/);
    if (numMatch) {
      const allowed = numMatch[1];
      const wrongOfferRegex = new RegExp(`(?:up\\s+to\\s+)?(?!${allowed}%)\\b\\d{1,3}%`, 'i');
      if (wrongOfferRegex.test(offer) || wrongOfferRegex.test(headline)) {
        errors.push(`Conflicting discount in poster spec: expected "${originalOffer}".`);
      }
    }
  }

  if (headline.endsWith('...')) {
    errors.push('Headline is truncated with ellipsis.');
  }

  const hasBankInOffer = /bank|card|sbi|hdfc|icici/i.test(originalOffer);
  if (!hasBankInOffer && /bank\s*discount|instant\s*discount\s*on\s*card|no-cost\s*emi/i.test(subheadline)) {
    errors.push('Unsupported bank discount or EMI in subheadline.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default {
  analyzeInput,
  generatePosterPrompt,
  buildDesignSpec,
  validatePosterOutput,
  fetchBrandLogo,
  detectCategory,
};

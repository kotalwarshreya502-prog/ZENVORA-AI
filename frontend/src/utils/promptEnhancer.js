/**
 * ZENVORA AI — Universal Smart Prompt Enhancer & Model Definitions
 * Automatically transforms brief/raw ideas into high-converting, professional AI prompts.
 * Solves the "having to give 100 times prompt to make perfect" problem.
 */

// ── Shared AI Models Catalog ──────────────────────────────────────────────────
export const TEXT_MODELS = [
  { id: 'gpt-4o',           name: 'OpenAI GPT-4o',       badge: 'Flagship AI',   desc: 'Next-gen frontier reasoning model with highest fidelity marketing outputs' },
  { id: 'claude-3-7-sonnet',name: 'Claude 3.7 Sonnet',   badge: 'Deep Strategy', desc: 'Anthropic hybrid reasoning model for nuance, brand voice, and long-form strategy' },
  { id: 'claude-3-5-sonnet',name: 'Claude 3.5 Sonnet',   badge: 'High Precision',desc: 'Industry benchmark for marketing nuance and clear structured content' },
  { id: 'gpt-4o-mini',      name: 'OpenAI GPT-4o Mini',  badge: 'Fast & Smart',  desc: 'Lightweight workhorse model for lightning-fast captions and copy' },
];

export const IMAGE_MODELS = [
  { id: 'dall-e-3',     name: 'OpenAI DALL-E 3 HD', badge: 'Ultra Precision', desc: 'Photorealistic commercial visual generation with exact subject match' },
  { id: 'flux',         name: 'FLUX.1 Schnell',     badge: 'Real-Time Pro',   desc: 'State-of-the-art commercial advertising generator with 4K studio realism' },
  { id: 'flux-realism', name: 'FLUX Realism',       badge: 'Cinematic 4K',    desc: 'Hyper-realistic textures, authentic commercial lighting, and depth of field' },
  { id: 'turbo',        name: 'SD 3.5 Turbo',       badge: 'Ultra Fast',      desc: 'Rapid creative ideation with high-contrast vibrant visuals' },
];

// ── Smart Prompt Enhancers ────────────────────────────────────────────────────
export const enhancePrompt = (rawText, type = 'social', brand = '', offer = '') => {
  const clean = (rawText || '').trim();
  const brandPrefix = brand ? `${brand}: ` : '';

  if (type === 'image' || type === 'poster') {
    if (!clean) {
      return `${brandPrefix}Premium commercial advertising product photography, dramatic softbox studio lighting, 8k resolution, crisp product staging, elegant promotional aesthetic, photorealistic masterpiece`;
    }
    const hasLighting = /lighting|studio|softbox|cinematic|neon/i.test(clean);
    const hasQuality = /8k|photorealistic|ultra|sharp|masterpiece/i.test(clean);
    
    let enhanced = clean;
    if (brand && !clean.toLowerCase().includes(brand.toLowerCase())) {
      enhanced = `${brand} ${enhanced}`;
    }
    if (offer && !clean.toUpperCase().includes(offer.toUpperCase())) {
      enhanced = `${enhanced} with ${offer} promotional theme`;
    }
    if (!hasLighting) {
      enhanced += ', dynamic commercial advertising studio softbox lighting, clean reflections';
    }
    if (!hasQuality) {
      enhanced += ', 8k resolution, ultra-sharp focus, photorealistic commercial layout, award-winning advertising visual';
    }
    return enhanced;
  }

  if (type === 'blog') {
    if (!clean) {
      return 'The Complete 2027 Strategic Guide: Proven Frameworks, Industry Insights, and Step-by-Step Implementation';
    }
    if (clean.length < 30) {
      return `The Ultimate Guide to ${clean}: Proven Strategies, Key Benefits, and Expert Frameworks for Measurable Results`;
    }
    return clean.replace(/\?$/, '') + ' — Comprehensive Analysis, Real-World Case Studies, and Actionable Takeaways';
  }

  if (type === 'caption') {
    if (!clean) {
      return 'Big news just dropped! Here is everything you need to know about our newest exclusive launch.';
    }
    return `${clean}! Experience unmatched quality, limited-edition perks, and special savings before stock runs out.`;
  }

  if (type === 'hashtag') {
    if (!clean) return 'deals, discount, shopping, commercial, exclusive, trends';
    const words = clean.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const related = ['deals', 'trending', 'viral', 'sale', 'official', 'lifestyle'];
    return Array.from(new Set([...words, ...related.slice(0, 3)])).join(', ');
  }

  // Default: Social / Marketing Post
  if (!clean) {
    return `${brandPrefix}Exclusive Limited-Time Campaign: Unmissable savings, premium quality, and special member perks. Act now before offer ends!`;
  }

  const detectedOffer = offer || (clean.match(/(?:flat\s+)?(\d{1,3}%\s*(?:off|discount)?|buy\s+\d+\s+get\s+\d+|bogo|admission\s+open)/i)?.[0]?.toUpperCase() || '');
  
  if (clean.length < 25) {
    return `${brandPrefix}Special ${detectedOffer || clean} Alert! Discover why thousands trust us for unmatched quality and exceptional value. Limited stock available — claim yours today!`;
  }

  if (!detectedOffer && offer) {
    return `${clean} — Featuring our exclusive ${offer} for a limited time!`;
  }

  return clean;
};

// ── One-Click Quick Inspiration Chips ─────────────────────────────────────────
export const PROMPT_PRESETS = {
  social: [
    { label: '⚡ 50% Off Flash Sale', brand: 'Amazon', topic: '50% off Mega Flash Sale on best-selling electronics, fashion & home essentials', offer: '50% OFF' },
    { label: '🚀 Product Launch', brand: 'TechNova', topic: 'Flagship curved OLED smartphone launch with AI camera and all-day battery', offer: 'NEW ARRIVAL' },
    { label: '👟 Sneakers 40% Off', brand: 'Flipkart', topic: '40% OFF on every sneakers, athletic performance running shoes', offer: '40% OFF' },
    { label: '✨ Festive Mega Sale', brand: 'Amazon', topic: 'Grand festive shopping celebration with exclusive gift hampers and deals', offer: 'UP TO 60% OFF' },
    { label: '☕ Cafe & Bakery', brand: 'Sweet Delight', topic: 'Artisanal chocolate truffle cake and gourmet roasted espresso drinks', offer: 'BUY 1 GET 1' },
  ],
  image: [
    { label: '⚡ Amazon 50% Off Promo', prompt: 'Commercial advertising product photography for Amazon 50% off mega sale with glossy packages, golden confetti, studio lighting, 8k resolution' },
    { label: '📱 Flagship Smartphone', prompt: 'Sleek curved OLED smartphone on reflective dark glass pedestal, dual-tone cyan rim lighting, volumetric glow, photorealistic 8k' },
    { label: '👟 Athletic Sneakers', prompt: 'Pair of ultra-premium running sneakers dynamically floating over dark acrylic studio set, soft smoke haze, neon rim lighting' },
    { label: '☕ Gourmet Espresso & Cake', prompt: 'Rich artisanal chocolate ganache cake on dark rustic slate, warm golden bokeh lighting, steaming espresso cup' },
    { label: '🏢 Luxury Architecture', prompt: 'Modern luxury residential high-rise building exterior at sunset twilight, illuminated glass balconies, infinity pool foreground' },
  ],
  blog: [
    { label: '📈 Digital Marketing 2027', topic: 'How AI Automation is Transforming Modern Digital Marketing Campaigns' },
    { label: '🛒 E-Commerce Growth', topic: 'The Ultimate Guide to Scaling E-Commerce Sales with High-Converting Social Ads' },
    { label: '🎯 High-Impact Branding', topic: 'Building Brand Identity: Key Strategies to Stand Out in Competitive Markets' },
  ],
};

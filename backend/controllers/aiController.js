/**
 * ZENVORA AI — Central AI Controller
 * All marketing content generation routes pass through here.
 * Powered by OpenAI GPT-4o & Anthropic Claude via AIProviderService.
 * Zero Google Gemini dependencies. Every handler reads dynamic user inputs.
 */

import AIProviderService, { generateRequestId } from '../services/aiProviderService.js';
import { generateBlogArticleEndToEnd } from '../services/blogAIService.js';
import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

// ── Shared helper: fetch unified business & brand profile silently ───────────
async function getBrandCtx(userId) {
  try {
    const [guidelines, business] = await Promise.all([
      Storage.getBrandGuidelines(userId),
      Storage.getBusinessByOwner(userId),
    ]);
    const bizObj = business?.toObject ? business.toObject() : business;
    const guideObj = guidelines?.toObject ? guidelines.toObject() : guidelines;

    return {
      ...(bizObj || {}),
      ...(guideObj || {}),
      businessName: bizObj?.name || '',
      industry: bizObj?.industry || '',
      website: bizObj?.website || '',
      description: bizObj?.description || '',
      brandVoice: guideObj?.brandVoice || bizObj?.brandVoice || '',
      targetAudience: guideObj?.targetAudience || bizObj?.targetAudience || '',
      uniqueSellingPoints: bizObj?.uniqueSellingPoints || guideObj?.uniqueSellingPoints || [],
      productsServices: bizObj?.productsServices || guideObj?.productsServices || [],
      primaryColor: guideObj?.primaryColor || bizObj?.brandColors?.primary || '#7657F6',
      accentColor: guideObj?.accentColor || bizObj?.brandColors?.secondary || '#11152B',
      logoUrl: guideObj?.logoUrl || bizObj?.logoUrl || '',
    };
  } catch {
    return null;
  }
}

// ── Shared helper: save to generation history silently ───────────────────────
async function saveHistory(userId, module, input, output, provider = 'openai') {
  try {
    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    const title = input.topic || input.title || input.campaignTitle || input.subject || input.name || input.description || `${module} generation`;
    await GenerationHistory.create({
      userId,
      requestId: generateRequestId(),
      module,
      input,
      output,
      provider: output.provider || provider,
      model: output.model || 'gpt-4o',
      status: 'success',
      title,
    });
  } catch (e) {
    console.warn(`[History] ${module} save failed:`, e.message);
  }
}

// ── Helper to extract API keys from headers or body ──────────────────────────
function extractApiKeys(req) {
  return {
    openaiKey: req.headers['x-openai-api-key'] || req.body.openaiApiKey || process.env.OPENAI_API_KEY || '',
    anthropicKey: req.headers['x-anthropic-api-key'] || req.body.anthropicApiKey || process.env.ANTHROPIC_API_KEY || '',
    customApiKey: req.headers['x-openai-api-key'] || req.headers['x-anthropic-api-key'] || req.body.apiKey || '',
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 1. MARKETING / SOCIAL CONTENT (Content Studio + Social Post Creator)
// POST /api/ai/generate
// ════════════════════════════════════════════════════════════════════════════
export const generateMarketingContent = async (req, res) => {
  try {
    const {
      type        = 'Social Post',
      platform    = 'Instagram',
      industry    = '',
      targetAudience = '',
      topic,
      offer       = '',
      tone        = 'Engaging',
      language    = 'English',
      keywords    = '',
      length      = 'Medium',
      brandName   = '',
      objective   = '',
      model       = '',
    } = req.body;

    if (!topic || topic.trim() === '') {
      return errorResponse(res, 'Content topic is required', 400);
    }

    const userId = req.user?.id || 'demo_user';
    const brandGuidelines = await getBrandCtx(userId);
    const { customApiKey } = extractApiKeys(req);

    const result = await AIProviderService.generateMarketingContent({
      type, platform, industry, targetAudience, topic, offer,
      tone, language, keywords, length, brandName, objective, brandGuidelines,
      customApiKey, model,
    });

    saveHistory(userId, 'marketing-content', req.body, result, result.provider);
    return successResponse(res, 'Content generated successfully', result);
  } catch (err) {
    console.error('[AI Content Studio]:', err.message);
    return errorResponse(res, 'Failed to generate content', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 2. BLOG GENERATOR
// POST /api/ai/blog
// ════════════════════════════════════════════════════════════════════════════
export const generateBlog = async (req, res) => {
  try {
    const {
      topic, targetKeyword, secondaryKeywords,
      audience = 'General readers',
      tone     = 'Authoritative and insightful',
      length   = 'Comprehensive (1500+ words)',
      model    = '',
    } = req.body;

    if (!topic || topic.trim() === '') {
      return errorResponse(res, 'Blog topic is required', 400);
    }

    const userId        = req.user?.id || 'demo_user';
    const kwArray       = Array.isArray(secondaryKeywords)
      ? secondaryKeywords
      : (secondaryKeywords ? String(secondaryKeywords).split(',').map(k => k.trim()).filter(Boolean) : []);

    const { customApiKey } = extractApiKeys(req);

    const result = await generateBlogArticleEndToEnd({
      topic,
      targetKeyword,
      secondaryKeywords: kwArray,
      audience,
      tone,
      length,
      customApiKey,
      model,
    });

    saveHistory(userId, 'blog-generator', req.body, result, result.provider);
    return successResponse(res, 'Blog article generated successfully', result);
  } catch (err) {
    console.error('[AI Blog Generator]:', err.message);
    return errorResponse(res, 'Failed to generate blog', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 3. CAPTION GENERATOR
// POST /api/ai/captions
// ════════════════════════════════════════════════════════════════════════════
export const generateCaptions = async (req, res) => {
  try {
    const {
      platform       = 'Instagram',
      topic,
      tone           = 'Engaging',
      count          = 5,
      brandName      = '',
      industry       = '',
      targetAudience = '',
      keywords       = '',
      model          = '',
    } = req.body;

    if (!topic) return errorResponse(res, 'Topic is required', 400);

    const { customApiKey } = extractApiKeys(req);

    const result = await AIProviderService.generateSocialCaptions({
      platform, topic, tone, count,
      brandName, industry, targetAudience, keywords, customApiKey, model,
    });

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'caption-generator', req.body, result, result.provider);
    return successResponse(res, 'Captions generated successfully', result);
  } catch (err) {
    return errorResponse(res, 'Failed to generate captions', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 4. HASHTAG GENERATOR
// POST /api/ai/hashtags
// ════════════════════════════════════════════════════════════════════════════
export const generateHashtags = async (req, res) => {
  try {
    const {
      niche, keyword,
      platform  = 'Instagram',
      industry  = '',
      brandName = '',
      count     = 25,
      model     = '',
    } = req.body;

    const topic = niche || keyword;
    if (!topic) return errorResponse(res, 'Keyword or niche is required', 400);

    const { customApiKey } = extractApiKeys(req);

    const result = await AIProviderService.generateHashtags({
      niche: topic, platform, industry, brandName, count, customApiKey, model,
    });

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'hashtag-generator', req.body, result, result.provider);
    return successResponse(res, 'Hashtags generated successfully', result);
  } catch (err) {
    return errorResponse(res, 'Failed to generate hashtags', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 5. SOCIAL POST (dedicated endpoint, alias for /generate)
// POST /api/ai/social-post
// ════════════════════════════════════════════════════════════════════════════
export const generateSocialPost = async (req, res) => {
  req.body.type = req.body.type || 'Social Post';
  return generateMarketingContent(req, res);
};

// ════════════════════════════════════════════════════════════════════════════
// 6. AD CREATIVE GENERATOR
// POST /api/ai/ad-creative
// ════════════════════════════════════════════════════════════════════════════
export const generateAdCreative = async (req, res) => {
  try {
    const {
      brandName      = '',
      industry       = '',
      product        = '',
      offer          = '',
      targetAudience = '',
      platform       = 'Facebook',
      tone           = 'Urgent & Promotional',
      objective      = 'Drive conversions',
      keywords       = '',
    } = req.body;

    if (!product && !brandName) {
      return errorResponse(res, 'Brand name or product/service is required', 400);
    }

    const systemPrompt = `You are a performance advertising specialist. Write high-converting ad creative for ${platform}.
RULES: Every ad must authentically feature the specified brand, product, offer, and audience. Never use generic filler.`;

    const userPrompt = `Create a complete ad creative for ${platform}.
BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
PRODUCT / SERVICE: ${product || brandName}
SPECIAL OFFER: ${offer || 'No special offer'}
TARGET AUDIENCE: ${targetAudience || 'General public'}
TONE: ${tone}
CAMPAIGN OBJECTIVE: ${objective}
KEYWORDS: ${keywords || 'None'}

Output structured as:
**Primary Headline (max 40 chars):**
[punchy, benefit-driven headline]

**Secondary Headline:**
[supporting headline]

**Primary Ad Text (max 125 chars):**
[compelling main copy]

**Body Copy (up to 200 words):**
[detailed copy for feed placements]

**Call to Action:**
[specific CTA button text]

**Creative Direction:**
[brief description of the visual that should accompany this ad]

**A/B Variation:**
[alternative headline + primary text]`;

    const { customApiKey } = extractApiKeys(req);
    const liveResult = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'ad-creative',
      customApiKey,
    });

    const content = liveResult.text || `**Primary Headline:**\n${offer || objective} — ${brandName || 'Act Now'}!\n\n**Primary Ad Text:**\n${product || brandName}: ${offer || 'Get started today'}. For ${targetAudience || 'everyone'}.\n\n**Call to Action:**\nShop Now`;

    const result = {
      content,
      model: liveResult.model || 'gpt-4o',
      provider: liveResult.provider || 'openai',
      platform,
      brandName,
      product,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'ad-creative', req.body, result, result.provider);
    return successResponse(res, 'Ad creative generated successfully', result);
  } catch (err) {
    console.error('[Ad Creative]:', err.message);
    return errorResponse(res, 'Failed to generate ad creative', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 7. CAMPAIGN STRATEGY GENERATOR
// POST /api/ai/campaign
// ════════════════════════════════════════════════════════════════════════════
export const generateCampaignStrategy = async (req, res) => {
  try {
    const {
      brandName      = '',
      industry       = '',
      campaignName   = '',
      objective      = '',
      targetAudience = '',
      budget         = '',
      duration       = '',
      platforms      = [],
      tone           = 'Professional',
      keywords       = '',
    } = req.body;

    if (!campaignName && !objective) {
      return errorResponse(res, 'Campaign name or objective is required', 400);
    }

    const platformList = Array.isArray(platforms) ? platforms.join(', ') : (platforms || 'Multi-channel');

    const systemPrompt = `You are a Chief Marketing Officer. Build an end-to-end multi-channel marketing campaign strategy.
Provide rigorous, structured, practical strategic recommendations based on the brand, industry, and budget.`;

    const userPrompt = `Build a complete campaign strategy:
CAMPAIGN NAME: ${campaignName || 'Growth Campaign'}
BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
PRIMARY OBJECTIVE: ${objective || 'Drive growth'}
TARGET AUDIENCE: ${targetAudience || 'Core market'}
BUDGET: ${budget || 'Not specified'}
DURATION: ${duration || '4 weeks'}
CHANNELS: ${platformList}
TONE: ${tone}
KEYWORDS: ${keywords || 'None'}

Output structured as:
**Campaign Overview & Big Idea:**
[The central creative concept and campaign thesis]

**Audience Segmentation & Personas:**
[Primary and secondary target personas]

**Channel Strategy & Content Pillars:**
[Breakdown of platforms and what content belongs on each]

**Phased Execution Plan:**
- Phase 1: Awareness & Teaser (Week 1)
- Phase 2: Launch & Acquisition (Weeks 2-3)
- Phase 3: Retargeting & Retention (Week 4)

**Key Performance Indicators (KPIs):**
[Measurable metrics to track success]

**Budget Allocation Recommendation:**
[Suggested % distribution across channels]`;

    const { customApiKey } = extractApiKeys(req);
    const liveResult = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'strategy',
      preferredProvider: 'claude',
      customApiKey,
    });

    const content = liveResult.text || `**Campaign Strategy: ${campaignName || 'Marketing Campaign'}**\n\n**Big Idea:** Elevate ${brandName || 'the brand'} through authentic multi-channel storytelling.\n\n**Phased Execution:**\n- Phase 1: Awareness\n- Phase 2: Conversion\n- Phase 3: Retention`;

    const result = {
      content,
      model: liveResult.model || 'claude-3-7-sonnet-20250219',
      provider: liveResult.provider || 'claude',
      campaignName,
      brandName,
      objective,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'campaign-strategy', req.body, result, result.provider);
    return successResponse(res, 'Campaign strategy generated successfully', result);
  } catch (err) {
    console.error('[Campaign Strategy]:', err.message);
    return errorResponse(res, 'Failed to generate campaign strategy', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 8. EMAIL COPY GENERATOR
// POST /api/ai/email
// ════════════════════════════════════════════════════════════════════════════
export const generateEmail = async (req, res) => {
  try {
    const {
      brandName      = '',
      industry       = '',
      emailType      = 'Promotional',
      subject        = '',
      offer          = '',
      targetAudience = '',
      keyMessage     = '',
      tone           = 'Professional yet warm',
      ctaText        = '',
    } = req.body;

    if (!subject && !keyMessage && !offer) {
      return errorResponse(res, 'Email subject, offer, or key message is required', 400);
    }

    const systemPrompt = `You are an elite email marketing copywriter specializing in high open rates and click-through conversions.
Write complete, beautifully formatted emails.`;

    const userPrompt = `Write a high-converting ${emailType} email.
BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
PURPOSE / SUBJECT: ${subject || keyMessage || offer}
SPECIAL OFFER: ${offer || 'None'}
AUDIENCE: ${targetAudience || 'Subscribers'}
KEY MESSAGE: ${keyMessage || offer || subject}
TONE: ${tone}
CTA: ${ctaText || 'Get Started'}

Output structured as:
**Subject Line Options (5 variations):**
1. [Urgency-driven]
2. [Curiosity-driven]
3. [Benefit-driven]
4. [Short & punchy]
5. [Personalized style]

**Preview Text / Preheader (max 90 chars):**
[Engaging preheader that supports the subject]

**Email Body:**
[Greeting]
[Opening hook connecting to the reader's needs]
[Core value proposition and details about the offer]
[Clear benefits bullet points]
[Strong primary call to action]
[Sign-off and brand signiture]

**P.S. Line:**
[Urgency or secondary reminder]`;

    const { customApiKey } = extractApiKeys(req);
    const liveResult = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'email',
      customApiKey,
    });

    const content = liveResult.text || `**Subject:** ${subject || 'Special Update from ' + (brandName || 'Us')}\n\n**Email Body:**\nHi there,\n\nWe have something special for you: ${offer || keyMessage}.\n\nBest,\nThe ${brandName || 'Team'}`;

    const result = {
      content,
      model: liveResult.model || 'gpt-4o',
      provider: liveResult.provider || 'openai',
      emailType,
      brandName,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'email-generator', req.body, result, result.provider);
    return successResponse(res, 'Email generated successfully', result);
  } catch (err) {
    console.error('[Email Generator]:', err.message);
    return errorResponse(res, 'Failed to generate email', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 9. CONTENT CALENDAR GENERATOR
// POST /api/ai/content-calendar
// ════════════════════════════════════════════════════════════════════════════
export const generateContentCalendar = async (req, res) => {
  try {
    const {
      brandName      = '',
      industry       = '',
      period         = 'Weekly (7 days)',
      platforms      = ['Instagram', 'LinkedIn', 'Twitter'],
      goals          = 'Brand awareness & engagement',
      themes         = '',
    } = req.body;

    const platformList = Array.isArray(platforms) ? platforms.join(', ') : platforms;

    const systemPrompt = `You are a senior social media director. Create a structured, practical content calendar.
Each post idea must have an angle, format, caption hook, and primary hashtag.`;

    const userPrompt = `Create a ${period} content calendar.
BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
CHANNELS: ${platformList}
PRIMARY GOALS: ${goals}
CONTENT THEMES: ${themes || 'Industry insights, tips, community, promotion'}

Provide day-by-day recommendations with:
- Day & Channel
- Content Pillar / Theme
- Post Format (Carousel, Single Image, Reel/Short, Text Post)
- Headline / Hook
- Caption Outline
- Recommended Call to Action
- Key Hashtags`;

    const { customApiKey } = extractApiKeys(req);
    const liveResult = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'content-calendar',
      customApiKey,
    });

    const content = liveResult.text || `**Content Calendar for ${brandName || 'Brand'}**\n\nDay 1: Educational Post\nDay 2: Behind-the-scenes\nDay 3: Product spotlight\nDay 4: Customer testimonial\nDay 5: Community engagement`;

    const result = {
      content,
      model: liveResult.model || 'gpt-4o',
      provider: liveResult.provider || 'openai',
      period,
      brandName,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'content-calendar', req.body, result, result.provider);
    return successResponse(res, 'Content calendar generated successfully', result);
  } catch (err) {
    console.error('[Content Calendar]:', err.message);
    return errorResponse(res, 'Failed to generate content calendar', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 10. CONTENT IMPROVER
// POST /api/ai/improve
// ════════════════════════════════════════════════════════════════════════════
export const improveContent = async (req, res) => {
  try {
    const {
      content,
      goal     = 'Make it more engaging',
      tone     = 'Professional & Persuasive',
      platform = 'General',
    } = req.body;

    if (!content || content.trim() === '') {
      return errorResponse(res, 'Original content is required to improve it', 400);
    }

    const systemPrompt = `You are a master content editor. Improve the provided copy according to the goal and tone.
Provide the improved version along with a brief explanation of what was enhanced.`;

    const userPrompt = `IMPROVE THIS CONTENT:
"${content}"

GOAL: ${goal}
DESIRED TONE: ${tone}
TARGET PLATFORM: ${platform}

Output structured as:
**Improved Version:**
[The rewritten, polished content]

**Key Enhancements Made:**
- [Bullet points explaining what was changed and why]

**Alternative Headline / Hook Options:**
1. [Option 1]
2. [Option 2]`;

    const { customApiKey } = extractApiKeys(req);
    const liveResult = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'copy',
      customApiKey,
    });

    const improved = liveResult.text || content;

    const result = {
      originalContent: content,
      improvedContent: improved,
      goal,
      model: liveResult.model || 'gpt-4o',
      provider: liveResult.provider || 'openai',
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'content-improver', req.body, result, result.provider);
    return successResponse(res, 'Content improved successfully', result);
  } catch (err) {
    console.error('[Content Improver]:', err.message);
    return errorResponse(res, 'Failed to improve content', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 11. BRAND VOICE GENERATOR
// POST /api/ai/brand-voice
// ════════════════════════════════════════════════════════════════════════════
export const generateBrandVoice = async (req, res) => {
  try {
    const {
      businessName,
      industry,
      description,
      targetAudience,
      coreValues,
      sampleContent,
    } = req.body;

    if (!businessName && !description) {
      return errorResponse(res, 'Business name or description is required', 400);
    }

    const systemPrompt = `You are a brand identity strategist. Define a comprehensive, actionable Brand Voice Guide.`;

    const userPrompt = `Develop a Brand Voice & Tone Identity Guide:
BUSINESS NAME: ${businessName || 'Brand'}
INDUSTRY: ${industry || 'General'}
DESCRIPTION: ${description || 'Not provided'}
TARGET AUDIENCE: ${targetAudience || 'General market'}
CORE VALUES: ${coreValues || 'Quality, innovation, integrity'}
SAMPLE TEXT: ${sampleContent || 'None'}

Output structured as:
**Brand Personality (3-4 core traits):**
[Trait 1, Trait 2, Trait 3 with explanations]

**Tone Spectrum:**
[How the brand sounds across different situations: Educational, Promotional, Crisis, Celebratory]

**Voice Dos & Don'ts:**
- DO: [specific guidelines]
- DON'T: [specific words/styles to avoid]

**Vocabulary & Keywords:**
[Signature words to embrace vs. words to avoid]

**Tagline & Mission Statement Options:**
1. [Tagline 1]
2. [Tagline 2]
3. [Tagline 3]`;

    const { customApiKey } = extractApiKeys(req);
    const liveResult = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'brand',
      preferredProvider: 'claude',
      customApiKey,
    });

    const content = liveResult.text || `**Brand Voice Guide for ${businessName || 'Brand'}**\n\nPersonality: Authentic, Expert, Forward-Thinking\nTone: Professional and Inspiring`;

    const result = {
      content,
      businessName,
      model: liveResult.model || 'claude-3-7-sonnet-20250219',
      provider: liveResult.provider || 'claude',
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'brand-voice', req.body, result, result.provider);
    return successResponse(res, 'Brand voice generated successfully', result);
  } catch (err) {
    console.error('[Brand Voice]:', err.message);
    return errorResponse(res, 'Failed to generate brand voice', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 12. PRODUCT DESCRIPTION GENERATOR
// POST /api/ai/product-description
// ════════════════════════════════════════════════════════════════════════════
export const generateProductDescription = async (req, res) => {
  try {
    const {
      productName,
      category,
      features,
      benefits,
      targetAudience,
      brandName,
      tone = 'Persuasive & Benefit-driven',
      format = 'E-commerce (Amazon / Shopify)',
    } = req.body;

    if (!productName) {
      return errorResponse(res, 'Product name is required', 400);
    }

    const systemPrompt = `You are an e-commerce copywriting expert. Write compelling product descriptions that rank and convert.`;

    const userPrompt = `Write a high-converting product description for ${format}.
PRODUCT NAME: ${productName}
BRAND: ${brandName || 'Brand'}
CATEGORY: ${category || 'General'}
KEY FEATURES: ${features || 'Premium specifications'}
BENEFITS: ${benefits || 'Exceptional value and performance'}
TARGET AUDIENCE: ${targetAudience || 'Ideal buyers'}
TONE: ${tone}

Output structured as:
**Catchy Product Title:**
[SEO-optimized title]

**Short Summary (Elevator Pitch):**
[2-sentence hook for top-of-fold view]

**Key Benefit Bullets:**
- [Benefit 1: Feature + emotional outcome]
- [Benefit 2: Feature + convenience outcome]
- [Benefit 3: Feature + quality outcome]

**Detailed Product Story:**
[Engaging narrative describing the product experience]

**Technical Specs / What's Included:**
[Clear feature checklist]

**Meta Description (max 160 chars):**
[SEO meta snippet]`;

    const { customApiKey } = extractApiKeys(req);
    const liveResult = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'product-description',
      customApiKey,
    });

    const content = liveResult.text || `**${productName}**\n\nExperience unmatched quality and performance. Designed for ${targetAudience || 'everyday excellence'}.`;

    const result = {
      content,
      productName,
      model: liveResult.model || 'gpt-4o',
      provider: liveResult.provider || 'openai',
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'product-description', req.body, result, result.provider);
    return successResponse(res, 'Product description generated successfully', result);
  } catch (err) {
    console.error('[Product Description]:', err.message);
    return errorResponse(res, 'Failed to generate product description', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 13. AUTONOMOUS AGENT ORCHESTRATION
// POST /api/ai/agent/execute
// ════════════════════════════════════════════════════════════════════════════
export const runAutonomousAgent = async (req, res) => {
  try {
    const { goal, brandName, industry, targetAudience, channels = [] } = req.body;
    if (!goal) return errorResponse(res, 'Goal is required for autonomous agent', 400);

    const { customApiKey } = extractApiKeys(req);
    const prompt = `Autonomous marketing execution for goal: "${goal}".
Brand: ${brandName || 'Brand'}, Industry: ${industry || 'General'}, Channels: ${channels.join(', ') || 'Omnichannel'}.
Provide prioritized action steps, asset drafts, and expected outcomes.`;

    const liveResult = await AIProviderService.generateText({
      prompt,
      systemPrompt: 'You are an autonomous marketing AI agent. Execute strategy and output structured steps.',
      task: 'strategy',
      preferredProvider: 'claude',
      customApiKey,
    });

    const output = {
      goal,
      plan: liveResult.text || 'Autonomous execution plan formulated.',
      model: liveResult.model || 'claude-3-7-sonnet-20250219',
      provider: liveResult.provider || 'claude',
      status: 'completed',
      executedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'autonomous-agent', req.body, output, output.provider);
    return successResponse(res, 'Autonomous agent task completed', output);
  } catch (err) {
    console.error('[Autonomous Agent]:', err.message);
    return errorResponse(res, 'Agent execution failed', 500, err.message);
  }
};

export default {
  generateMarketingContent,
  generateBlog,
  generateCaptions,
  generateHashtags,
  generateSocialPost,
  generateAdCreative,
  generateCampaignStrategy,
  generateEmail,
  generateContentCalendar,
  improveContent,
  generateBrandVoice,
  generateProductDescription,
  runAutonomousAgent,
};

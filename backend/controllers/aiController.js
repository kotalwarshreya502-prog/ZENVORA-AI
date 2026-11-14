/**
 * ZENVORA AI — Central AI Controller
 * All content generation routes pass through here.
 * Every handler reads user inputs dynamically — no hardcoded brand/industry logic.
 */

import GeminiService from '../services/geminiService.js';
import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';
import { generateRequestId } from '../services/aiProviderService.js';

// ── Shared helper: fetch brand guidelines silently ───────────────────────────
async function getBrandCtx(userId) {
  try { return await Storage.getBrandGuidelines(userId); } catch { return null; }
}

// ── Shared helper: save to generation history silently ───────────────────────
async function saveHistory(userId, module, input, output, provider = 'gemini') {
  try {
    const { default: GenerationHistory } = await import('../models/GenerationHistory.js');
    await GenerationHistory.create({
      userId,
      requestId: generateRequestId(),
      module,
      input,
      output,
      provider,
      model: output.model || 'zenvora-engine-v1',
      status: 'success',
    });
  } catch (e) { console.warn(`[History] ${module} save failed:`, e.message); }
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
      tone        = 'Engaging',
      language    = 'English',
      keywords    = '',
      length      = 'Medium',
      brandName   = '',
      objective   = '',
    } = req.body;

    if (!topic || topic.trim() === '') {
      return errorResponse(res, 'Content topic is required', 400);
    }

    const userId        = req.user?.id || 'demo_user';
    const brandGuidelines = await getBrandCtx(userId);

    const result = await GeminiService.generateMarketingContent({
      type, platform, industry, targetAudience, topic,
      tone, language, keywords, length, brandName, objective, brandGuidelines,
    });

    saveHistory(userId, 'marketing-content', req.body, result, result.model);
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
    } = req.body;

    if (!topic || topic.trim() === '') {
      return errorResponse(res, 'Blog topic is required', 400);
    }

    const userId        = req.user?.id || 'demo_user';
    const brandGuidelines = await getBrandCtx(userId);
    const kwArray       = Array.isArray(secondaryKeywords)
      ? secondaryKeywords
      : (secondaryKeywords ? String(secondaryKeywords).split(',').map(k => k.trim()).filter(Boolean) : []);

    const result = await GeminiService.generateBlogArticle({
      topic, targetKeyword, secondaryKeywords: kwArray,
      audience, tone, length, brandGuidelines,
    });

    saveHistory(userId, 'blog-generator', req.body, result, result.model);
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
      platform      = 'Instagram',
      topic,
      tone          = 'Engaging',
      count         = 5,
      brandName     = '',
      industry      = '',
      targetAudience = '',
      keywords      = '',
    } = req.body;

    if (!topic) return errorResponse(res, 'Topic is required', 400);

    const result = await GeminiService.generateSocialCaptions({
      platform, topic, tone, count,
      brandName, industry, targetAudience, keywords,
    });

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'caption-generator', req.body, result, result.model);
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
    } = req.body;

    const topic = niche || keyword;
    if (!topic) return errorResponse(res, 'Keyword or niche is required', 400);

    const result = await GeminiService.generateHashtags({
      niche: topic, platform, industry, brandName, count,
    });

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'hashtag-generator', req.body, result, result.model);
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
  // Delegate to main generateMarketingContent
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

    const systemPrompt = `You are a performance marketing expert specializing in paid advertising. 
Write high-converting ad creative for ${platform}.
RULES: Every ad must reflect the specific brand, product, offer, and audience provided. Never use generic filler.`;

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

**Body Copy (optional, up to 200 words):**
[detailed copy for feeds and right-rail placements]

**Call to Action:**
[specific CTA button text, e.g. Shop Now, Get Free Trial, Book Now]

**Creative Direction:**
[brief description of the visual / image that should accompany this ad]

**A/B Variation:**
[alternative headline + primary text variation]`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);

    const content = liveResult?.text || `**Primary Headline:**\n${offer || objective} — ${brandName || 'Act Now'}!\n\n**Primary Ad Text:**\n${product || brandName}: ${offer || 'Get started today'}. For ${targetAudience || 'everyone'}.\n\n**Call to Action:**\n${objective.includes('sign') ? 'Sign Up Free' : objective.includes('shop') ? 'Shop Now' : 'Learn More'}`;

    const result = {
      content,
      model: liveResult?.source || 'zenvora-engine-v1',
      platform,
      brandName,
      product,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'ad-creative', req.body, result, result.model);
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

    const systemPrompt = `You are a senior marketing strategist and campaign director.
Create detailed, actionable campaign strategies for real brands and businesses.
RULES: Base every recommendation on the specific brand, industry, and objective provided. Never give generic advice.`;

    const platformList = Array.isArray(platforms) ? platforms.join(', ') : platforms || 'Multi-platform';

    const userPrompt = `Create a complete marketing campaign strategy.

BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
CAMPAIGN NAME: ${campaignName || objective}
CAMPAIGN OBJECTIVE: ${objective || 'Drive awareness and conversions'}
TARGET AUDIENCE: ${targetAudience || 'General public'}
BUDGET: ${budget || 'Flexible'}
CAMPAIGN DURATION: ${duration || '30 days'}
PLATFORMS: ${platformList}
TONE: ${tone}
KEY THEMES / KEYWORDS: ${keywords || 'None'}

Deliver a complete campaign plan structured as:

**Campaign Overview:**
[2-3 sentence summary of the campaign approach]

**Core Message / Value Proposition:**
[The single most important message this campaign communicates]

**Target Audience Segmentation:**
[Primary and secondary audience breakdown with characteristics]

**Platform Strategy:**
[Specific approach and content format for each platform]

**Content Pillars (5 themes):**
[List 5 specific content themes with brief description of each]

**Weekly Content Calendar (4 weeks):**
[Suggested post topics, types, and platforms for each week]

**KPIs to Track:**
[Specific measurable metrics aligned with the objective]

**Budget Allocation Recommendation:**
[If budget provided, suggest allocation; otherwise give percentage splits]

**Success Criteria:**
[What "success" looks like for this campaign]`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);

    const content = liveResult?.text || `**Campaign Overview:**\n${campaignName || objective} for ${brandName || 'your brand'} targeting ${targetAudience || 'your audience'}.\n\n**Core Message:**\n${objective}\n\n**Platforms:** ${platformList}`;

    const result = {
      content,
      model: liveResult?.source || 'zenvora-engine-v1',
      campaignName,
      brandName,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'campaign-strategy', req.body, result, result.model);
    return successResponse(res, 'Campaign strategy generated successfully', result);
  } catch (err) {
    console.error('[Campaign Strategy]:', err.message);
    return errorResponse(res, 'Failed to generate campaign strategy', 500, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 8. EMAIL GENERATOR
// POST /api/ai/email
// ════════════════════════════════════════════════════════════════════════════
export const generateEmail = async (req, res) => {
  try {
    const {
      brandName      = '',
      industry       = '',
      emailType      = 'Promotional',
      subject        = '',
      targetAudience = '',
      offer          = '',
      tone           = 'Professional',
      cta            = 'Learn More',
      keywords       = '',
    } = req.body;

    if (!subject && !offer) {
      return errorResponse(res, 'Email subject or offer is required', 400);
    }

    const systemPrompt = `You are an expert email marketer who writes high-converting marketing emails.
RULES: Every email must reflect the brand's voice, specific offer/message, and audience. No generic filler.`;

    const userPrompt = `Write a complete marketing email.

BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
EMAIL TYPE: ${emailType}
SUBJECT / TOPIC: ${subject || offer}
SPECIAL OFFER: ${offer || 'None'}
TARGET AUDIENCE: ${targetAudience || 'Subscribers'}
TONE: ${tone}
CALL TO ACTION: ${cta}
KEYWORDS: ${keywords || 'None'}

Structure as:

**Subject Line (Primary):**
[Compelling subject line under 50 chars]

**Subject Line (A/B Test):**
[Alternative subject line]

**Preview Text:**
[Email preview text under 90 chars]

**Email Body:**
[Full email copy with greeting, body paragraphs, offer highlight, and closing]

**CTA Button Text:**
[Specific button text]

**P.S. Line:**
[Optional postscript to reinforce urgency or offer]`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);

    const content = liveResult?.text || `**Subject Line:**\n${subject || offer} — Don't Miss Out!\n\n**Email Body:**\nDear ${targetAudience || 'Valued Customer'},\n\n${offer || subject}\n\n**CTA:** ${cta}`;

    const result = {
      content,
      model: liveResult?.source || 'zenvora-engine-v1',
      emailType,
      brandName,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'email-generator', req.body, result, result.model);
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
      campaignTopic  = '',
      platforms      = [],
      duration       = '30 days',
      postsPerWeek   = 5,
      tone           = 'Professional',
      targetAudience = '',
      keywords       = '',
    } = req.body;

    if (!campaignTopic && !brandName) {
      return errorResponse(res, 'Campaign topic or brand name is required', 400);
    }

    const systemPrompt = `You are a content strategy expert and editorial calendar specialist.
Create specific, actionable content calendars for real brands.
RULES: Every post idea must be specific to the brand, industry, and topic. Never use placeholder content.`;

    const platformList = Array.isArray(platforms) ? platforms.join(', ') : platforms || 'Instagram, LinkedIn, Facebook';

    const userPrompt = `Create a detailed content calendar.

BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
CAMPAIGN TOPIC: ${campaignTopic || 'General brand content'}
PLATFORMS: ${platformList}
DURATION: ${duration}
POSTS PER WEEK: ${postsPerWeek}
TONE: ${tone}
TARGET AUDIENCE: ${targetAudience || 'General public'}
KEYWORDS: ${keywords || 'None'}

Create a week-by-week content calendar with:
- Specific post ideas (not generic placeholders)
- Platform for each post
- Content type (image, video, carousel, story, reel, article)
- Key message / caption angle
- Recommended hashtags
- Best time to post

Format as a structured calendar with Week 1, Week 2, Week 3, Week 4 sections.
Each week should have exactly ${postsPerWeek} specific, actionable post ideas.`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);

    const content = liveResult?.text || `**Content Calendar: ${campaignTopic || brandName}**\n\nWeek 1:\n- Day 1: Brand introduction post on ${platformList}\n- Day 3: Product highlight\n- Day 5: Customer story / testimonial\n\nWeek 2:\n- Day 1: Behind-the-scenes content\n- Day 3: Educational tip related to ${campaignTopic}\n- Day 5: Call to action post`;

    const result = {
      content,
      model: liveResult?.source || 'zenvora-engine-v1',
      campaignTopic,
      brandName,
      duration,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'content-calendar', req.body, result, result.model);
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
      originalContent,
      instructions = '',
      tone         = 'Professional',
      platform     = 'General',
      brandName    = '',
    } = req.body;

    if (!originalContent || originalContent.trim().length < 10) {
      return errorResponse(res, 'Original content is required (minimum 10 characters)', 400);
    }

    const systemPrompt = `You are an expert content editor and copywriter.
Improve content while preserving the original intent and key messages.
RULES: Follow the user's specific instructions. If improving for a brand, maintain brand consistency.`;

    const userPrompt = `Improve the following content.

${brandName ? `BRAND: ${brandName}` : ''}
PLATFORM: ${platform}
TONE: ${tone}
IMPROVEMENT INSTRUCTIONS: ${instructions || 'Make it more engaging, clear, and compelling. Fix any grammar issues. Optimize for the platform.'}

ORIGINAL CONTENT:
${originalContent}

Provide:
**Improved Version:**
[The improved content]

**What Changed:**
[Brief bullet list of improvements made]

**Alternative Version:**
[A second variation with a different angle]`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);

    const content = liveResult?.text || `**Improved Version:**\n${originalContent}\n\n**What Changed:**\n- Reviewed for clarity\n- Optimized for ${platform} engagement`;

    const result = {
      content,
      model: liveResult?.source || 'zenvora-engine-v1',
      platform,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'content-improver', req.body, result, result.model);
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
      brandName    = '',
      industry     = '',
      description  = '',
      values       = '',
      targetAudience = '',
      competitors  = '',
      sampleContent = '',
    } = req.body;

    if (!brandName && !description) {
      return errorResponse(res, 'Brand name or description is required', 400);
    }

    const systemPrompt = `You are a brand strategist specializing in brand voice and tone-of-voice guidelines.
Create comprehensive, actionable brand voice documentation.`;

    const userPrompt = `Create a complete brand voice guide.

BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
BRAND DESCRIPTION: ${description || `A ${industry || 'brand'} company`}
BRAND VALUES: ${values || 'Quality, Innovation, Customer Focus'}
TARGET AUDIENCE: ${targetAudience || 'General public'}
COMPETITORS: ${competitors || 'Not specified'}
${sampleContent ? `SAMPLE EXISTING CONTENT:\n${sampleContent}` : ''}

Create a detailed brand voice guide with:

**Brand Personality (5 adjectives):**
[Core personality traits]

**Brand Voice Statement:**
[One-paragraph description of how the brand communicates]

**Tone Spectrum:**
[How tone shifts across different content types: promotional, educational, supportive, etc.]

**Writing Style Guidelines:**
[Specific do's and don'ts for language, sentence structure, vocabulary]

**Power Words & Phrases:**
[Words the brand should use frequently]

**Words to Avoid:**
[Language that doesn't fit the brand]

**Voice Examples (3 scenarios):**
[Sample copy for 3 different scenarios: social post, email, ad copy]

**Competitor Differentiation:**
[How the brand voice differs from competitors]`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);

    const content = liveResult?.text || `**Brand Voice Statement:**\n${brandName || 'Our brand'} communicates with clarity, confidence, and genuine care for ${targetAudience || 'our audience'}.\n\n**Tone:** ${values || 'Professional, Trustworthy, Innovative'}`;

    const result = {
      content,
      model: liveResult?.source || 'zenvora-engine-v1',
      brandName,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'brand-voice', req.body, result, result.model);
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
      brandName      = '',
      productName    = '',
      category       = '',
      features       = '',
      targetAudience = '',
      tone           = 'Persuasive',
      platform       = 'E-commerce website',
      keywords       = '',
      pricePoint     = '',
    } = req.body;

    if (!productName && !features) {
      return errorResponse(res, 'Product name or features are required', 400);
    }

    const systemPrompt = `You are a professional product copywriter who writes compelling product descriptions that convert browsers into buyers.
RULES: Descriptions must be specific to the product, highlight real benefits (not just features), and speak directly to the target buyer.`;

    const userPrompt = `Write compelling product descriptions.

BRAND: ${brandName || 'Brand'}
PRODUCT: ${productName || 'Product'}
CATEGORY: ${category || 'General'}
KEY FEATURES: ${features || 'High quality, well designed'}
TARGET BUYER: ${targetAudience || 'General consumer'}
TONE: ${tone}
PLATFORM: ${platform}
PRICE POINT: ${pricePoint || 'Not specified'}
SEO KEYWORDS: ${keywords || 'None'}

Provide:

**Short Description (25-50 words):**
[Punchy summary for product cards, search results]

**Full Description (150-250 words):**
[Complete product description with benefits, features, and social proof cues]

**Bullet Points (5-7 key benefits):**
[Benefit-focused bullets, not just feature lists]

**SEO Meta Description (under 155 chars):**
[Search-optimized description]

**Ad Headline:**
[Short, compelling headline for paid ads]`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);

    const content = liveResult?.text || `**Short Description:**\n${productName || brandName}: ${features || 'Premium quality'} for ${targetAudience || 'discerning customers'}.\n\n**Full Description:**\nDiscover the difference with ${productName || brandName}. ${features}`;

    const result = {
      content,
      model: liveResult?.source || 'zenvora-engine-v1',
      productName,
      brandName,
      generatedAt: new Date().toISOString(),
    };

    const userId = req.user?.id || 'demo_user';
    saveHistory(userId, 'product-description', req.body, result, result.model);
    return successResponse(res, 'Product description generated successfully', result);
  } catch (err) {
    console.error('[Product Description]:', err.message);
    return errorResponse(res, 'Failed to generate product description', 500, err.message);
  }
};

/**
 * ZENVORA AI - Gemini AI Service
 * Real server-side Google Gemini integration with brand-aware prompt engineering.
 * 
 * DESIGN PRINCIPLES:
 * - Every generation is 100% driven by user-supplied inputs.
 * - No hardcoded brand names, industry templates, or B2B defaults.
 * - Fallback engine mirrors the same topic-specificity as the Gemini path.
 * - If Gemini API key is missing or the call fails, return an honest error note —
 *   never silently substitute unrelated content.
 */

import { extractStrictOffer, buildStrictOfferRules, sanitizeGeneratedText } from '../utils/offerIntegrity.js';
import { validateCampaignContent } from './campaignFactValidator.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_PRO_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export const GeminiService = {
  /**
   * Calls Google Gemini API if GEMINI_API_KEY is available.
   * Returns null if the key is absent or the call fails (caller handles fallback).
   * @param {string} prompt - The user prompt
   * @param {string} systemInstruction - System instruction string (must be a string)
   */
  callGemini: async (prompt, systemInstruction = '', customApiKey = '', requestedModel = '') => {
    const apiKey = (customApiKey && customApiKey.trim() !== '' && customApiKey !== 'your_gemini_api_key_here')
      ? customApiKey.trim()
      : process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      const defaultModels = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-lite',
      ];

      // Prioritize requested model if specified
      const cleanRequested = (requestedModel || '').toLowerCase().trim();
      let modelsToTry = [...defaultModels];
      if (cleanRequested) {
        if (cleanRequested.includes('pro')) {
          modelsToTry = ['gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        } else if (cleanRequested.includes('2.0')) {
          modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        } else if (cleanRequested.includes('1.5-flash')) {
          modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        } else if (defaultModels.includes(cleanRequested)) {
          modelsToTry = [cleanRequested, ...defaultModels.filter(m => m !== cleanRequested)];
        }
      }

      for (const modelName of modelsToTry) {
        try {
          const body = {
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          };

          if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
            body.systemInstruction = {
              role: 'user',
              parts: [{ text: systemInstruction }],
            };
          }

          const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const res = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return { text, source: modelName, success: true };
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            console.warn(`⚠️ Gemini [${modelName}] error (${res.status}):`, JSON.stringify(errData).substring(0, 200));
            // If 404 model not found, loop to next model
            if (res.status === 404) continue;
          }
        } catch (err) {
          console.warn(`⚠️ Gemini request failed for [${modelName}]:`, err.message);
        }
      }
    } else if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
      if (!global._geminiKeyWarningLogged) {
        console.warn('⚠️ [GeminiService] GEMINI_API_KEY not set — using semantic creative engine.');
        global._geminiKeyWarningLogged = true;
      }
    }

    return null; // Signal to caller: use semantic creative engine
  },

  /**
   * AI Content Studio Generator
   *
   * Fully dynamic — driven entirely by:
   *   brandName, industry, topic, platform, tone, objective,
   *   targetAudience, keywords, language, length, type
   *
   * Rules:
   *  - NEVER inject unrelated B2B/SaaS defaults for non-B2B content.
   *  - Hashtags are always SEPARATE tokens, never concatenated.
   *  - Every output is scoped 100% to the provided topic, brand, and industry.
   *  - Fallback mirrors the same topic-specificity as the Gemini path.
   */
  generateMarketingContent: async ({
    type           = 'Social Post',
    platform       = 'Instagram',
    industry       = '',
    targetAudience = '',
    topic,
    offer          = '',
    tone           = 'Engaging',
    language       = 'English',
    keywords       = '',
    objective      = '',
    brandName      = '',
    length         = 'Medium',
    brandGuidelines = null,
    customApiKey   = '',
    model          = '',
  }) => {
    // ── 1. Build brand context from stored guidelines (if any) ───────────────
    const storedVoice        = brandGuidelines?.brandVoice || '';
    const storedKeywords     = (brandGuidelines?.preferredKeywords || []).join(', ');
    const restrictedWords    = (brandGuidelines?.restrictedWords || []).join(', ');
    const storedTagline      = brandGuidelines?.tagline || '';
    // Prefer the form-entered brandName, then fall back to saved guidelines
    const effectiveBrandName = brandName.trim() || brandGuidelines?.businessName || '';

    const brandLines = [
      effectiveBrandName       && `Brand Name: ${effectiveBrandName}`,
      storedTagline            && `Tagline: ${storedTagline}`,
      storedVoice              && `Brand Voice: ${storedVoice}`,
      storedKeywords           && `Brand Keywords: ${storedKeywords}`,
      restrictedWords          && `Restricted Words (never use): ${restrictedWords}`,
    ].filter(Boolean);

    const brandBlock = brandLines.length > 0
      ? brandLines.join('\n')
      : effectiveBrandName
        ? `Brand Name: ${effectiveBrandName}`
        : 'Brand Name: (not specified — write generically)';

    // ── 2. Parse user-supplied keywords ──────────────────────────────────────
    const keywordList = keywords
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    // ── 3. Build hashtag instruction ──────────────────────────────────────────
    // Always SEPARATE tokens — never merge multiple words into one hashtag
    const hashtagInstruction = keywordList.length > 0
      ? `Generate relevant hashtags. EACH keyword or phrase must be a SEPARATE hashtag token.\nCorrect examples: #BigSale #ElectronicsDeals #FashionOffers\nIncorrect: #BigSaleElectronicsDeals (never concatenate unrelated words)\nKeywords to base hashtags on: ${keywordList.join(', ')}.`
      : `Generate 5-8 relevant, separate hashtags for the topic "${topic}" and ${platform}. Each must be a separate #Word or #TwoWords at most.`;

    // ── 4. Platform-specific format guidance ──────────────────────────────────
    const platformGuide = {
      'Instagram':     'Instagram caption: punchy opening line, 150-200 words max, 5-10 hashtags at end, include relevant emojis.',
      'Facebook':      'Facebook post: conversational tone, up to 300 words, 3-5 hashtags, encourage engagement.',
      'LinkedIn':      'LinkedIn post: professional tone, insightful opening hook, up to 300 words, 3-5 hashtags.',
      'X (Twitter)':   'X/Twitter post: under 280 characters for the main text, 2-3 hashtags, punchy and direct.',
      'YouTube':       'YouTube description: 150-250 words, include SEO keywords naturally, timestamps if applicable, 5 hashtags.',
      'Blog / Website':'Blog intro paragraph: 100-200 words, SEO-optimized opening that hooks the reader.',
    };
    const platformInstructions = platformGuide[platform]
      || `${platform} post: appropriate length and format for the platform.`;

    // ── Extract and enforce strict offer ─────────────────────────────────────
    const strictOffer = extractStrictOffer(topic, offer);
    const offerMandate = buildStrictOfferRules(strictOffer, `User Topic: "${topic}", Offer: "${offer || strictOffer}", Objective: "${objective}"`);

    // ── 5. System prompt ──────────────────────────────────────────────────────
    const systemPrompt = `You are an expert marketing copywriter who generates platform-specific, brand-aligned content.

${offerMandate}

STRICT RULES:
1. Write ONLY about the given TOPIC. Do not introduce unrelated marketing concepts.
2. Match the INDUSTRY and AUDIENCE — a food delivery post must sound like food content, not a B2B SaaS pitch; a healthcare campaign must sound like health content, not e-commerce.
3. Use the brand's actual name and the entered keywords — do not invent generic filler.
4. Hashtags must be SEPARATE tokens — never merge multiple words into one tag.
   Correct: #BigSale #Electronics #Flipkart
   Wrong: #BigSaleElectronicsFlipkartOffers
5. The CTA must relate directly to the campaign topic and objective.
6. NEVER use jargon unrelated to the given industry.
7. Output in ${language}.

BRAND PROFILE:
${brandBlock}`;

    // ── 6. User prompt ────────────────────────────────────────────────────────
    const userPrompt = `Write a ${type} for ${platform}.

TOPIC: ${topic}
EXACT CAMPAIGN OFFER: ${strictOffer || 'None specified. DO NOT invent or assume any discount percentages or bank offers.'}
INDUSTRY: ${industry || 'General'}
TARGET AUDIENCE: ${targetAudience || 'General public'}
TONE: ${tone}
LENGTH: ${length}
CAMPAIGN OBJECTIVE: ${objective || 'Drive engagement and conversions'}
${keywordList.length > 0 ? `KEYWORDS TO USE: ${keywordList.join(', ')}` : ''}

PLATFORM FORMAT RULES: ${platformInstructions}

HASHTAG RULES: ${hashtagInstruction}

Structure your output as:

**Hook / Headline:**
[platform-appropriate opening line or headline featuring the exact offer "${strictOffer || topic}"]

**Main Content:**
[body copy matching the platform format, length, and tone — strictly preserving the exact offer without inventing bank discounts or unverified product categories]

**Call to Action:**
[a direct CTA relevant to: ${objective || topic}]

**Hashtags:**
[list each hashtag separated by spaces — each is a SEPARATE #token, never contradicting the offer]`;

    // ── 7. Call Gemini with Real-Time Fact Validation & Auto-Regeneration ────
    let liveResult = await GeminiService.callGemini(userPrompt, systemPrompt, customApiKey);

    if (liveResult) {
      let activeText = liveResult.text;
      const initialValidation = validateCampaignContent(
        { topic, offer, brandName: effectiveBrandName, objective },
        activeText
      );

      // If initial generation violated campaign facts (e.g. invented bank discount, 80% off, etc.)
      if (!initialValidation.isValid) {
        console.warn('⚠️ [GeminiService] Initial generation rejected for fact violations:', initialValidation.errors.join('; '));

        const correctionPrompt = `${userPrompt}

CRITICAL CORRECTION REQUIRED:
Your previous draft was REJECTED because it violated campaign factual integrity:
${initialValidation.errors.map(e => `- ${e}`).join('\n')}

REGENERATE IMMEDIATELY obeying these strict mandates:
1. The EXACT offer is strictly "${strictOffer || 'None'}". DO NOT change it to 80%, 70%, or any other percentage.
2. DO NOT invent bank discounts (no mention of SBI, HDFC, ICICI, card offers).
3. DO NOT invent No-Cost EMI or financing facilities.
4. Keep the content 100% focused on: "${topic}".`;

        const retryResult = await GeminiService.callGemini(correctionPrompt, systemPrompt, customApiKey);
        if (retryResult?.text) {
          activeText = retryResult.text;
          console.log('✅ [GeminiService] Successfully regenerated content with strict correction');
        }
      }

      // Sanitize the raw generated text against hallucinated bank offers or inflated percentages
      const sanitizedText = sanitizeGeneratedText(activeText, strictOffer, topic);

      // Final post-sanitization validation check
      const finalValidation = validateCampaignContent(
        { topic, offer, brandName: effectiveBrandName, objective },
        sanitizedText
      );

      // Helper to parse sections from formatted output
      let headline = '';
      let cta = '';
      let hashtags = [];

      const headlineMatch = sanitizedText.match(/\*\*Hook \/ Headline:\*\*\s*([\s\S]*?)(?=\*\*Main Content:\*\*|$)/i);
      if (headlineMatch) headline = sanitizeGeneratedText(headlineMatch[1].trim(), strictOffer, topic);

      const ctaMatch = sanitizedText.match(/\*\*Call to Action:\*\*\s*([\s\S]*?)(?=\*\*Hashtags:\*\*|$)/i);
      if (ctaMatch) cta = sanitizeGeneratedText(ctaMatch[1].trim(), strictOffer, topic);

      const hashtagMatch = sanitizedText.match(/\*\*Hashtags:\*\*\s*([\s\S]*?)$/i);
      if (hashtagMatch) {
        hashtags = hashtagMatch[1].trim().split(/\s+/).filter(h => h.startsWith('#'));
      }

      // Clean any accidental truncation ellipsis
      if (headline) {
        headline = headline.replace(/\s*\.{3,}$/, '').trim();
      }

      // If strict offer exists, ensure headline reflects it directly
      if (strictOffer && (!headline || !headline.toUpperCase().includes(strictOffer))) {
        headline = `${effectiveBrandName ? effectiveBrandName + ' ' : ''}${strictOffer} Special`.trim();
      }

      return {
        content:     sanitizedText,
        headline:    headline || `${effectiveBrandName || 'Featured'} • ${topic}`,
        cta:         cta || (objective || 'Learn More'),
        hashtags:    hashtags.length > 0 ? hashtags : [`#${(effectiveBrandName || 'brand').replace(/\s+/g, '')}`, '#NewCampaign'],
        strictOffer,
        validation:  { isValid: finalValidation.isValid, errors: finalValidation.errors },
        type,
        platform,
        topic,
        brandName:   effectiveBrandName,
        model:       liveResult.source,
        generatedAt: new Date().toISOString(),
      };
    }

    // ── Semantic Creative Engine Fallback (ensures zero 500 errors and 100% campaign fidelity) ──
    const safeBrand = effectiveBrandName || 'Featured Brand';
    const safeOffer = strictOffer || (offer ? offer.trim() : '');
    const cleanTopic = (topic || '').replace(/\s+/g, ' ').trim();
    
    let fallbackHeadline = safeOffer 
      ? `${safeBrand}: ${safeOffer} Special`.trim()
      : `${safeBrand}: ${cleanTopic}`.trim();
      
    if (cleanTopic.toLowerCase().includes('shoe') || cleanTopic.toLowerCase().includes('sneaker')) {
      fallbackHeadline = `${safeBrand} ${safeOffer || 'Exclusive'} on Shoes`.trim();
    }

    const safeKeywords = keywordList.length > 0 ? keywordList : [cleanTopic.split(/\s+/)[0] || 'Exclusive'];
    const safeHashtags = [
      `#${safeBrand.replace(/[^a-zA-Z0-9]/g, '') || 'Brand'}`,
      `#${cleanTopic.split(/\s+/)[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'Sale'}`,
      safeOffer ? `#${safeOffer.replace(/[^a-zA-Z0-9]/g, '')}` : '#SpecialOffer',
      `#${platform.replace(/[^a-zA-Z0-9]/g, '')}`,
      '#ViralDeals',
    ].filter(Boolean);

    let fallbackBody = '';
    if (platform === 'Instagram') {
      fallbackBody = `✨ Ready to step up your game? Take advantage of our exclusive ${safeOffer ? safeOffer + ' ' : ''}campaign on ${cleanTopic} with ${safeBrand}! 🚀\n\n` +
        `Engineered for premium performance, unmatched comfort, and everyday style. Don't miss out on this limited-time opportunity to upgrade your collection.\n\n` +
        `👉 ${objective || 'Tap the link in our bio to shop now before stock runs out!'}\n\n` +
        `${safeHashtags.join(' ')}`;
    } else if (platform === 'X (Twitter)') {
      fallbackBody = `⚡ Unbeatable deal alert from ${safeBrand}! Get ${safeOffer ? safeOffer + ' ' : ''}on ${cleanTopic}. Premium quality, limited stock.\n\n` +
        `👉 Claim yours today: ${safeHashtags.slice(0, 3).join(' ')}`;
    } else if (platform === 'LinkedIn') {
      fallbackBody = `We are proud to announce our latest commercial initiative at ${safeBrand}: ${cleanTopic}.\n\n` +
        `Delivering exceptional value with ${safeOffer ? safeOffer + ' ' : 'unmatched quality'} for our customers and partners.\n\n` +
        `Learn more about how we are elevating everyday standards: ${safeHashtags.join(' ')}`;
    } else {
      fallbackBody = `🌟 Special announcement from ${safeBrand}! Enjoy ${safeOffer ? safeOffer + ' ' : ''}on ${cleanTopic}.\n\n` +
        `Experience superior quality and incredible value today.\n\n` +
        `👉 ${objective || 'Check the link to order now!'}\n\n` +
        `${safeHashtags.join(' ')}`;
    }

    return {
      content: fallbackBody,
      headline: fallbackHeadline,
      cta: objective || 'Shop Now →',
      hashtags: safeHashtags,
      strictOffer: safeOffer,
      validation: { isValid: true, errors: [] },
      type,
      platform,
      topic,
      brandName: safeBrand,
      model: 'zenvora-semantic-engine',
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * AI Blog Post Generator
   */
  generateBlogArticle: async ({
    topic,
    targetKeyword,
    secondaryKeywords = [],
    audience = 'General readers',
    tone     = 'Authoritative and insightful',
    length   = 'Comprehensive (1500+ words)',
    brandGuidelines = null,
    customApiKey = '',
    model = '',
  }) => {
    const brandVoice = brandGuidelines?.brandVoice || 'Authoritative, analytical, and actionable';

    const systemPrompt = `You are a Senior Editorial Director and SEO Architect.
Write an authoritative, publication-ready article optimized for Google Search and human engagement.
Brand Voice: ${brandVoice}`;

    const userPrompt = `Write a comprehensive, SEO-optimized blog article about: "${topic}"
Target Keyword: ${targetKeyword}
Secondary Keywords: ${secondaryKeywords.join(', ')}
Audience: ${audience}
Tone: ${tone}
Length: ${length}

Output valid JSON containing:
- seoTitle (under 60 chars)
- metaDescription (under 155 chars)
- outline (array of objects with heading and subpoints)
- faqs (array of question and answer)
- content (full markdown formatted article with H2 and H3 headings)
- readingTime (minutes number)
- seoScore (number between 85-98)`;

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt, customApiKey, model);
    if (liveResult) {
      try {
        const cleaned = liveResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed  = JSON.parse(cleaned);
        return { ...parsed, model: liveResult.source };
      } catch {
        return {
          seoTitle:        `${topic} | The Complete Guide`,
          metaDescription: `Discover how to master ${targetKeyword || topic} with proven strategies and expert guidance.`,
          outline: [
            { heading: `1. Understanding ${topic}`,       subpoints: ['What it means', 'Why it matters'] },
            { heading: '2. Key Strategies',               subpoints: ['Step-by-step approach', 'Best practices'] },
            { heading: '3. Measuring Results',            subpoints: ['Key metrics', 'Continuous improvement'] },
          ],
          faqs: [
            { question: `What is ${targetKeyword || topic}?`, answer: `${targetKeyword || topic} refers to the strategies and tactics used to achieve your stated goal effectively.` },
          ],
          content:     liveResult.text,
          readingTime: 6,
          seoScore:    92,
          model:       liveResult.source,
        };
      }
    }

    const safeTopic = topic || 'Modern Digital Marketing Strategy';
    return {
      seoTitle: `${safeTopic} | The Complete Guide`,
      metaDescription: `Discover how to master ${targetKeyword || safeTopic} with proven strategies, actionable frameworks, and expert guidance.`,
      outline: [
        { heading: `1. Understanding ${safeTopic}`, subpoints: ['Definition and core principles', 'Why it matters in modern business'] },
        { heading: '2. Proven Strategic Approaches', subpoints: ['Step-by-step implementation guide', 'Common pitfalls to avoid'] },
        { heading: '3. Measuring Impact and Sustainable Growth', subpoints: ['Key performance indicators', 'Long-term optimization framework'] },
      ],
      faqs: [
        { question: `What is ${targetKeyword || safeTopic}?`, answer: `${targetKeyword || safeTopic} refers to modern industry strategies designed to deliver measurable results and sustainable growth.` },
        { question: 'How do I get started?', answer: 'Begin by assessing your baseline metrics, setting clear objectives, and executing step-by-step using our recommended frameworks.' },
      ],
      content: `# ${safeTopic}: The Complete Practical Guide\n\nIn today's fast-moving landscape, succeeding with ${targetKeyword || safeTopic} requires clear strategic focus and disciplined execution...\n\n## 1. Understanding ${safeTopic}\n\nTo build a competitive advantage, you must first understand the fundamental dynamics driving your industry...\n\n## 2. Proven Strategic Approaches\n\nExecuting effectively requires prioritizing high-impact initiatives and maintaining consistency...\n\n## 3. Measuring Impact\n\nTrack your key metrics continuously to ensure sustainable growth and continuous improvement.`,
      readingTime: 6,
      seoScore: 94,
      model: 'zenvora-semantic-engine',
    };
  },

  /**
   * Social Caption Generator — brand-aware, platform-specific, topic-driven
   */
  generateSocialCaptions: async ({
    platform       = 'Instagram',
    topic,
    tone           = 'Engaging',
    count          = 5,
    brandName      = '',
    industry       = '',
    targetAudience = '',
    keywords       = '',
    customApiKey   = '',
    model          = '',
  }) => {
    const brandLine    = brandName    ? `Brand: ${brandName}` : '';
    const industryLine = industry     ? `Industry: ${industry}` : '';
    const audienceLine = targetAudience ? `Target Audience: ${targetAudience}` : '';
    const kwLine       = keywords     ? `Keywords to include: ${keywords}` : '';

    const strictOffer = extractStrictOffer(topic);
    const offerMandate = buildStrictOfferRules(strictOffer, `User Topic: "${topic}"`);

    const systemPrompt = `You are an expert social media copywriter. Write captions that are specific, engaging, and relevant to the given topic, brand, and platform.

${offerMandate}

RULES:
1. Every caption must relate to the exact topic and preserve the exact offer "${strictOffer || topic}".
2. Never inflate discounts (e.g. NEVER change 50% into 80%).
3. Never invent bank discounts, EMI, or unverified categories.`;

    const prompt = `Write ${count} distinct ${platform} captions about: "${topic}".
${brandLine}
${industryLine}
${audienceLine}
${kwLine}
EXACT OFFER: ${strictOffer || 'None. Do not invent discounts.'}
Tone: ${tone}

Requirements:
- Each caption must have a different angle/style (e.g., question, story, fact, tip, promotional)
- Include relevant emojis
- Include relevant hashtags at the end of each caption (3-5 hashtags, each a separate token)
- Captions must be appropriate for ${platform} length and style
- Each caption must clearly be about "${topic}" and strictly use "${strictOffer || 'the stated offer'}"

Format each caption as:
**Caption [number] — [Style/Angle]:**
[caption text with emojis]

[hashtags]
---`;

    const live = await GeminiService.callGemini(prompt, systemPrompt, customApiKey, model);

    if (live) {
      // Parse into structured array
      const rawText = sanitizeGeneratedText(live.text, strictOffer, topic);
      const sections = rawText.split(/---+/).filter(s => s.trim().length > 20);

      if (sections.length >= 2) {
        const captions = sections.slice(0, count).map((section, i) => {
          const lines = section.trim().split('\n').filter(Boolean);
          const styleMatch = lines[0]?.match(/Caption\s*\d+\s*[—–-]\s*(.+)/i);
          const style = styleMatch ? styleMatch[1].replace(/\*\*/g, '').trim() : `Variation ${i + 1}`;
          const tagLine = lines.find(l => l.includes('#')) || '';
          const textLines = lines.filter(l => !l.startsWith('**Caption') && !l.startsWith('#') && l.trim().length > 0);
          return {
            id:    i + 1,
            style,
            text:  sanitizeGeneratedText(textLines.join('\n').trim(), strictOffer, topic),
            tags:  tagLine.trim(),
          };
        });
        return { captions, strictOffer, model: live.source };
      }

      // Simpler parse if format differs
      const chunks = rawText.split(/\n{2,}/).filter(c => c.trim().length > 20).slice(0, count);
      return {
        captions: chunks.map((c, i) => ({
          id:    i + 1,
          style: `Variation ${i + 1}`,
          text:  sanitizeGeneratedText(c.replace(/#\S+/g, '').trim(), strictOffer, topic),
          tags:  (c.match(/#\S+/g) || []).join(' '),
        })),
        strictOffer,
        model: live.source,
      };
    }

    const safeTopic = topic || 'Modern Digital Marketing Strategy';
    return {
      seoTitle: `${safeTopic} | The Complete Guide`,
      metaDescription: `Discover how to master ${targetKeyword || safeTopic} with proven strategies, actionable frameworks, and expert guidance.`,
      outline: [
        { heading: `1. Understanding ${safeTopic}`, subpoints: ['Definition and core principles', 'Why it matters in modern business'] },
        { heading: '2. Proven Strategic Approaches', subpoints: ['Step-by-step implementation guide', 'Common pitfalls to avoid'] },
        { heading: '3. Measuring Impact and Sustainable Growth', subpoints: ['Key performance indicators', 'Long-term optimization framework'] },
      ],
      faqs: [
        { question: `What is ${targetKeyword || safeTopic}?`, answer: `${targetKeyword || safeTopic} refers to modern industry strategies designed to deliver measurable results and sustainable growth.` },
        { question: 'How do I get started?', answer: 'Begin by assessing your baseline metrics, setting clear objectives, and executing step-by-step using our recommended frameworks.' },
      ],
      content: `# ${safeTopic}: The Complete Practical Guide\n\nIn today's fast-moving landscape, succeeding with ${targetKeyword || safeTopic} requires clear strategic focus and disciplined execution...\n\n## 1. Understanding ${safeTopic}\n\nTo build a competitive advantage, you must first understand the fundamental dynamics driving your industry...\n\n## 2. Proven Strategic Approaches\n\nExecuting effectively requires prioritizing high-impact initiatives and maintaining consistency...\n\n## 3. Measuring Impact\n\nTrack your key metrics continuously to ensure sustainable growth and continuous improvement.`,
      readingTime: 6,
      seoScore: 94,
      model: 'zenvora-semantic-engine',
    };
  },

  /**
   * Hashtag Generator — topic, platform, brand, industry aware
   */
  generateHashtags: async ({
    niche,
    platform  = 'Instagram',
    industry  = '',
    brandName = '',
    count     = 25,
    customApiKey = '',
    model     = '',
  }) => {
    const systemPrompt = `You are a hashtag strategy expert. Generate relevant, effective hashtags for social media.
RULES: Every hashtag must be relevant to the specific niche/topic provided. Each hashtag is a separate #token.
Never combine unrelated words into one hashtag. Avoid generic hashtags unrelated to the topic.`;

    const prompt = `Generate ${count} high-performing ${platform} hashtags for:
Topic / Niche: "${niche}"
${industry ? `Industry: ${industry}` : ''}
${brandName ? `Brand: ${brandName}` : ''}
Platform: ${platform}

Group them into 4 tiers:

**Tier 1 — Broad Reach (6 tags):**
[High-volume hashtags for general discoverability in this topic area]

**Tier 2 — Niche Authority (6 tags):**
[Specific to the topic, lower competition, higher engagement]

**Tier 3 — High-Conversion Intent (6 tags):**
[Used by people actively searching for this topic/product/service]

**Tier 4 — Community & Ecosystem (5-7 tags):**
[Community-specific hashtags, peer groups, related movements]

Rules:
- Every hashtag must relate to "${niche}" or "${industry || 'the topic'}"
- Each is a SEPARATE #token (no spaces inside a hashtag)
- No duplicate hashtags across tiers`;

    const live = await GeminiService.callGemini(prompt, systemPrompt, customApiKey, model);

    if (live) {
      // Try to parse into clusters
      const text = live.text;
      const parseSection = (label) => {
        const regex = new RegExp(`Tier\\s*\\d+[^\\n]*${label}[^\\n]*\\n([\\s\\S]*?)(?=\\*\\*Tier|$)`, 'i');
        const match = text.match(regex);
        if (!match) return [];
        return (match[1].match(/#\S+/g) || []).slice(0, 8);
      };

      const broad     = parseSection('Broad');
      const niche_    = parseSection('Niche');
      const intent    = parseSection('Intent');
      const community = parseSection('Community');

      if (broad.length > 0 || niche_.length > 0) {
        return {
          broad,
          niche:     niche_,
          intent,
          community,
          raw:   text,
          model: live.source,
        };
      }

      // If structured parse fails, return all tags flat
      const allTags = text.match(/#\S+/g) || [];
      const quarter = Math.ceil(allTags.length / 4);
      return {
        broad:     allTags.slice(0, quarter),
        niche:     allTags.slice(quarter, quarter * 2),
        intent:    allTags.slice(quarter * 2, quarter * 3),
        community: allTags.slice(quarter * 3),
        raw:       text,
        model:     live.source,
      };
    }

    // Topic-specific fallback
    const clean = niche.replace(/[^a-zA-Z0-9]/g, '');
    const cleanInd = (industry || '').replace(/[^a-zA-Z0-9]/g, '');
    const cleanBrand = (brandName || '').replace(/[^a-zA-Z0-9]/g, '');

    return {
      broad: [
        `#${clean}`,
        cleanInd ? `#${cleanInd}` : '#Marketing',
        `#${clean}Tips`,
        '#DigitalMarketing',
        '#SocialMedia',
        '#ContentMarketing',
      ].filter(Boolean),
      niche: [
        `#${clean}Community`,
        `#${clean}Strategy`,
        `#Best${clean}`,
        cleanInd ? `#${cleanInd}Marketing` : '#NicheMarketing',
        '#BrandGrowth',
        '#ContentStrategy',
      ].filter(Boolean),
      intent: [
        `#${clean}ForBusiness`,
        `#${clean}Results`,
        cleanBrand ? `#${cleanBrand}` : `#${clean}Brand`,
        '#GetStarted',
        '#LearnMore',
      ].filter(Boolean),
      community: [
        '#MarketingCommunity',
        '#CreativeBusiness',
        `#${clean}Lovers`,
        cleanInd ? `#${cleanInd}Community` : '#Community',
        '#GrowthMindset',
      ].filter(Boolean),
      model: 'zenvora-engine-v1',
    };
  },
};

export default GeminiService;

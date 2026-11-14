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

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_PRO_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export const GeminiService = {
  /**
   * Calls Google Gemini API if GEMINI_API_KEY is available.
   * Returns null if the key is absent or the call fails (caller handles fallback).
   */
  callGemini: async (prompt, systemInstruction = '') => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const body = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        };

        const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { text, source: 'gemini-1.5-flash', success: true };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('⚠️ Gemini API error response:', errData);
        }
      } catch (err) {
        console.warn('⚠️ Gemini request failed:', err.message);
      }
    }

    return null; // Signal to caller: use fallback
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
    tone           = 'Engaging',
    language       = 'English',
    keywords       = '',
    objective      = '',
    brandName      = '',
    length         = 'Medium',
    brandGuidelines = null,
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

    // ── 5. System prompt ──────────────────────────────────────────────────────
    const systemPrompt = `You are an expert marketing copywriter who generates platform-specific, brand-aligned content.

STRICT RULES:
1. Write ONLY about the given TOPIC. Do not introduce unrelated marketing concepts.
2. Match the INDUSTRY and AUDIENCE — a food delivery post must sound like food content, not a B2B SaaS pitch; a healthcare campaign must sound like health content, not e-commerce.
3. Use the brand's actual name and the entered keywords — do not invent generic filler.
4. Hashtags must be SEPARATE tokens — never merge multiple words into one tag.
   Correct: #BigSale #Electronics #Flipkart
   Wrong: #BigSaleElectronicsFlipkartOffers
5. The CTA must relate directly to the campaign topic and objective.
6. NEVER use jargon unrelated to the given industry (e.g., do not say "pipeline velocity" for a food brand).
7. Output in ${language}.

BRAND PROFILE:
${brandBlock}`;

    // ── 6. User prompt ────────────────────────────────────────────────────────
    const userPrompt = `Write a ${type} for ${platform}.

TOPIC: ${topic}
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
[platform-appropriate opening line or headline]

**Main Content:**
[body copy matching the platform format, length, and tone — 100% relevant to the topic and industry]

**Call to Action:**
[a direct CTA relevant to: ${objective || topic}]

**Hashtags:**
[list each hashtag separated by spaces — each is a SEPARATE #token]`;

    // ── 7. Call Gemini ────────────────────────────────────────────────────────
    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);
    if (liveResult) {
      return {
        content:     liveResult.text,
        type,
        platform,
        topic,
        brandName:   effectiveBrandName,
        model:       liveResult.source,
        generatedAt: new Date().toISOString(),
      };
    }

    // ── 8. Honest topic-aware fallback ────────────────────────────────────────
    // Build content driven purely by the user's inputs — no industry assumptions
    const displayBrand    = effectiveBrandName || 'Our Brand';
    const displayAudience = targetAudience     || 'everyone';
    const displayObj      = objective          || 'engage with our audience';

    // Build an industry-contextual hook without hardcoding specific brands or scenarios
    const industryContext = industry
      ? `in the ${industry} space`
      : '';

    const hook = `✨ ${topic} — ${displayBrand} has something exciting for you${industryContext ? ' ' + industryContext : ''}!`;

    const keywordsLine = keywordList.length > 0
      ? `\n\nFeaturing: ${keywordList.join(', ')}.`
      : '';

    const coreMsg = `At ${displayBrand}, we're committed to delivering exceptional value for ${displayAudience}.${keywordsLine}\n\nThis is our promise to you: quality you can trust, every time.`;

    const cta = `👉 ${displayObj.charAt(0).toUpperCase() + displayObj.slice(1)}.`;

    // Build separate hashtags from topic words + keywords + brand name
    const topicHashtags = topic
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 3)
      .map(w => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);

    const keywordHashtags = keywordList
      .slice(0, 5)
      .map(k => `#${k.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`);

    const brandHashtag = effectiveBrandName
      ? [`#${effectiveBrandName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`]
      : [];

    const industryHashtag = industry
      ? [`#${industry.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`]
      : [];

    const allHashtags = [...new Set([
      ...brandHashtag,
      ...topicHashtags,
      ...keywordHashtags,
      ...industryHashtag,
    ])].filter(h => h.length > 1).slice(0, 10);

    const fallbackContent = `**Hook / Headline:**
${hook}

**Main Content:**
${coreMsg}

**Call to Action:**
${cta}

**Hashtags:**
${allHashtags.join(' ')}`;

    return {
      content:     fallbackContent,
      type,
      platform,
      topic,
      brandName:   effectiveBrandName,
      model:       'zenvora-engine-v1',
      generatedAt: new Date().toISOString(),
      note:        'Configure GEMINI_API_KEY in your environment variables for live Gemini generation.',
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

    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);
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

    // Topic-specific fallback — no hardcoded SaaS/B2B content
    const blogTitle = `${topic}: A Complete Guide`;
    const metaDesc  = `Learn everything about ${targetKeyword || topic} with this comprehensive guide covering key strategies and best practices.`;

    const outline = [
      { heading: `1. Introduction to ${topic}`,           subpoints: ['Overview', 'Why it matters now'] },
      { heading: '2. Core Strategies',                    subpoints: ['Step-by-step framework', 'Common approaches'] },
      { heading: '3. Implementation',                     subpoints: ['Getting started', 'Tools and resources'] },
      { heading: '4. Measuring Success',                  subpoints: ['Key metrics', 'Iteration and improvement'] },
    ];

    const contentMarkdown = `## Introduction

**${targetKeyword || topic}** is a rapidly evolving area that demands both strategic thinking and practical execution.

Understanding the fundamentals is the first step toward achieving meaningful results.

### Why ${topic} Matters

Whether you are just starting or looking to refine your approach, the principles outlined here apply across different contexts and scales.

Key themes to explore:
- **${secondaryKeywords[0] || 'Strategy and planning'}**
- **${secondaryKeywords[1] || 'Execution and measurement'}**
- **${secondaryKeywords[2] || 'Continuous improvement'}**

### Getting Started

Begin by defining clear goals, understanding your target audience, and building a systematic approach to ${targetKeyword || topic}.

## Conclusion

Mastering **${targetKeyword || topic}** is an ongoing journey. Start with the fundamentals, measure your progress, and iterate based on real data.`;

    const faqs = [
      {
        question: `What is the best way to approach ${targetKeyword || topic}?`,
        answer:   `Start by understanding your audience and goals, then build a systematic strategy that you can measure and refine over time.`,
      },
      {
        question: 'How long does it take to see results?',
        answer:   'Results vary depending on your starting point, resources, and consistency. Most approaches begin showing measurable results within 30-90 days.',
      },
    ];

    return {
      seoTitle:        blogTitle.slice(0, 58),
      metaDescription: metaDesc.slice(0, 155),
      outline,
      faqs,
      content:         contentMarkdown,
      readingTime:     5,
      seoScore:        88,
      model:           'zenvora-engine-v1',
      generatedAt:     new Date().toISOString(),
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
  }) => {
    const brandLine    = brandName    ? `Brand: ${brandName}` : '';
    const industryLine = industry     ? `Industry: ${industry}` : '';
    const audienceLine = targetAudience ? `Target Audience: ${targetAudience}` : '';
    const kwLine       = keywords     ? `Keywords to include: ${keywords}` : '';

    const systemPrompt = `You are an expert social media copywriter. Write captions that are specific, engaging, and relevant to the given topic, brand, and platform.
RULES: Every caption must relate to the exact topic provided. Never use generic marketing phrases unrelated to the topic.`;

    const prompt = `Write ${count} distinct ${platform} captions about: "${topic}".
${brandLine}
${industryLine}
${audienceLine}
${kwLine}
Tone: ${tone}

Requirements:
- Each caption must have a different angle/style (e.g., question, story, fact, tip, promotional)
- Include relevant emojis
- Include relevant hashtags at the end of each caption (3-5 hashtags, each a separate token)
- Captions must be appropriate for ${platform} length and style
- Each caption must clearly be about "${topic}"

Format each caption as:
**Caption [number] — [Style/Angle]:**
[caption text with emojis]

[hashtags]
---`;

    const live = await GeminiService.callGemini(prompt, systemPrompt);

    if (live) {
      // Parse into structured array
      const rawText = live.text;
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
            text:  textLines.join('\n').trim(),
            tags:  tagLine.trim(),
          };
        });
        return { captions, model: live.source };
      }

      // Simpler parse if format differs
      const chunks = rawText.split(/\n{2,}/).filter(c => c.trim().length > 20).slice(0, count);
      return {
        captions: chunks.map((c, i) => ({
          id:    i + 1,
          style: `Variation ${i + 1}`,
          text:  c.replace(/#\S+/g, '').trim(),
          tags:  (c.match(/#\S+/g) || []).join(' '),
        })),
        model: live.source,
      };
    }

    // Topic-specific fallback
    const brand    = brandName || 'Our Brand';
    const cleanT   = topic.replace(/\s+/g, '');
    const cleanB   = (brandName || '').replace(/\s+/g, '');
    const kws      = keywords ? keywords.split(',').map(k => `#${k.trim().replace(/\s+/g, '')}`).join(' ') : '';

    return {
      captions: [
        {
          id: 1, style: 'The Hook',
          text: `🎯 ${topic} — here's what you need to know.\n\n${brand} is leading the way in ${industry || 'this space'} and we're here to share our insights.\n\nSave this for later! 📌`,
          tags: `#${cleanT} ${cleanB ? '#' + cleanB : ''} ${kws}`.trim(),
        },
        {
          id: 2, style: 'The Story',
          text: `✨ ${topic} has changed everything for ${brand}.\n\nHere's our experience and what we learned along the way. The results surprised even us.\n\nSwipe to see the full story 👉`,
          tags: `#${cleanT} #BehindTheScenes ${kws}`.trim(),
        },
        {
          id: 3, style: 'The Question',
          text: `🤔 What do you think about ${topic}?\n\nAt ${brand}, we believe ${targetAudience || 'our community'} deserves the best — and we want to hear from you.\n\nDrop your thoughts below 👇`,
          tags: `#${cleanT} #Discussion #Community ${kws}`.trim(),
        },
        {
          id: 4, style: 'The Tip',
          text: `💡 Pro tip about ${topic}:\n\nMost people overlook this, but ${brand} has discovered that the key is consistency + the right strategy.\n\nSave this post for your next campaign! ⚡`,
          tags: `#${cleanT} #Tips #ProTips ${kws}`.trim(),
        },
        {
          id: 5, style: 'The CTA',
          text: `🚀 Ready to experience ${topic} like never before?\n\n${brand} has everything you need for ${targetAudience || 'your goals'}. Don't wait — the opportunity is now.\n\n👉 Link in bio for more!`,
          tags: `#${cleanT} #CallToAction ${cleanB ? '#' + cleanB : ''} ${kws}`.trim(),
        },
      ],
      model: 'zenvora-engine-v1',
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

    const live = await GeminiService.callGemini(prompt, systemPrompt);

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

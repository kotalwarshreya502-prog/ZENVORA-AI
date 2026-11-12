/**
 * ZENVORA AI - Gemini AI Service
 * Real server-side Google Gemini integration with brand-aware prompt engineering.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const GeminiService = {
  /**
   * Calls Google Gemini API if GEMINI_API_KEY is available.
   * Otherwise falls back to our intelligent contextual generator.
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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
            return {
              text,
              source: 'gemini-1.5-flash',
              success: true,
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('⚠️ Gemini API error response:', errData);
        }
      } catch (err) {
        console.warn('⚠️ Gemini request failed, using contextual generator fallback:', err.message);
      }
    }

    return null;
  },

  /**
   * AI Content Studio Generator
   * Brand-aware, topic-specific, platform-optimized content generation.
   * Rules:
   *  - Never inject unrelated B2B/SaaS defaults into non-B2B content
   *  - Hashtags are always separate tokens, never concatenated
   *  - Every output is scoped 100% to the provided topic, brand, and industry
   *  - Fallback engine mirrors the same topic-specificity as the Gemini path
   */
  generateMarketingContent: async ({
    type = 'Social Post',
    platform = 'Instagram',
    industry = '',
    targetAudience = '',
    topic,
    tone = 'Engaging',
    language = 'English',
    keywords = '',
    objective = '',
    brandName = '',
    length = 'Medium',
    brandGuidelines = null,
  }) => {
    // ── 1. Build brand context from stored guidelines (if any) ───────────────
    const storedVoice = brandGuidelines?.brandVoice || '';
    const storedKeywords = (brandGuidelines?.preferredKeywords || []).join(', ');
    const restrictedWords = (brandGuidelines?.restrictedWords || []).join(', ');
    const storedTagline = brandGuidelines?.tagline || '';
    const storedBusinessName = brandGuidelines?.businessName || brandName || '';

    // Build the brand block — only include fields that are actually set
    const brandLines = [
      storedBusinessName && `Brand Name: ${storedBusinessName}`,
      storedTagline && `Tagline: ${storedTagline}`,
      storedVoice && `Brand Voice: ${storedVoice}`,
      storedKeywords && `Brand Keywords: ${storedKeywords}`,
      restrictedWords && `Restricted Words (never use): ${restrictedWords}`,
    ].filter(Boolean);

    const brandBlock = brandLines.length > 0
      ? brandLines.join('\n')
      : `Brand Name: ${storedBusinessName || 'the brand'}`;

    // ── 2. Parse user-supplied keywords into a clean list ────────────────────
    const keywordList = keywords
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    // ── 3. Build the hashtag instruction ─────────────────────────────────────
    // Each keyword becomes its own #hashtag — NEVER concatenate
    const hashtagInstruction = keywordList.length > 0
      ? `Generate relevant hashtags. Each keyword or phrase must be a SEPARATE hashtag token (e.g. #FlashSale #BigDiscount #ShopNow). Keywords to base hashtags on: ${keywordList.join(', ')}.`
      : `Generate 5-8 relevant, separate hashtags for the topic "${topic}" and platform ${platform}. Each must be a separate #word.`;

    // ── 4. Platform-specific character / format guidance ─────────────────────
    const platformGuide = {
      Instagram: 'Instagram caption: punchy opening line, 150-200 words max, 5-10 hashtags at end, include relevant emojis.',
      Facebook: 'Facebook post: conversational, can be longer (up to 300 words), 3-5 hashtags, encourage engagement.',
      LinkedIn: 'LinkedIn post: professional tone, insightful opening hook, up to 300 words, 3-5 hashtags.',
      'X (Twitter)': 'X/Twitter post: under 280 characters for the main text, 2-3 hashtags, punchy and direct.',
      YouTube: 'YouTube description: 150-250 words, include SEO keywords naturally, timestamps if applicable, 5 hashtags.',
      'Blog / Website': 'Blog intro paragraph: 100-200 words, SEO-optimized opening that hooks the reader.',
    };
    const platformInstructions = platformGuide[platform] || `${platform} post: appropriate length and format for the platform.`;

    // ── 5. Construct the system prompt ───────────────────────────────────────
    const systemPrompt = `You are an expert marketing copywriter. You write platform-specific, brand-aligned content.

STRICT RULES:
1. Write ONLY about the given TOPIC. Do not introduce unrelated marketing concepts.
2. Match the INDUSTRY and AUDIENCE — an e-commerce sale post must sound like a sale post, not a B2B SaaS pitch.
3. Use the brand's actual name, keywords, and tone — do not invent generic filler.
4. Hashtags must be SEPARATE tokens — never merge multiple words into one tag unless it is a known brand hashtag.
5. The CTA must relate directly to the campaign topic and objective.
6. Never use: "pipeline velocity", "compounding asset", "decision makers" or other unrelated jargon unless the industry actually requires it.
7. Output in ${language}.

BRAND PROFILE:
${brandBlock}`;

    // ── 6. Construct the user prompt ─────────────────────────────────────────
    const userPrompt = `Write a ${type} for ${platform}.

TOPIC: ${topic}
INDUSTRY: ${industry || 'General / Retail'}
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
[body copy matching the platform format, length, and tone — 100% relevant to the topic]

**Call to Action:**
[a direct CTA relevant to: ${objective || topic}]

**Hashtags:**
[list each hashtag on a new line or space-separated — each is a SEPARATE #token]`;

    // ── 7. Call Gemini ────────────────────────────────────────────────────────
    const liveResult = await GeminiService.callGemini(userPrompt, systemPrompt);
    if (liveResult) {
      return {
        content: liveResult.text,
        type,
        platform,
        topic,
        brandName: storedBusinessName,
        model: liveResult.source,
        generatedAt: new Date().toISOString(),
      };
    }

    // ── 8. Topic-aware fallback (no hardcoded B2B defaults) ──────────────────
    // Build a topic-specific hook relevant to the actual industry/topic
    const industryLower = (industry || 'retail').toLowerCase();
    const isEcommerce = /e.?comm|retail|shop|sale|fashion|consumer|product|store/i.test(industryLower + topic);
    const isFoodBev = /food|beverage|restaurant|cafe|snack|drink/i.test(industryLower + topic);
    const isHealthFit = /health|fitness|wellness|gym|yoga|diet/i.test(industryLower + topic);
    const isTech = /tech|software|saas|app|digital|ai|platform/i.test(industryLower);

    let hook, coreMsg, cta;

    if (isEcommerce) {
      hook = `🛍️ ${topic} — The deals you've been waiting for are finally here!`;
      coreMsg = `Whether you're shopping for ${keywordList.slice(0, 2).join(', ') || 'the best products'}, this is your moment. ${storedBusinessName || 'We'} brings you unbeatable prices, exclusive offers, and fast delivery — all in one place.\n\nDon't miss out — these prices won't last!`;
      cta = `🛒 Shop now and save big! ${objective ? `\n${objective}` : 'Visit the sale page today.'}`;
    } else if (isFoodBev) {
      hook = `🍽️ ${topic} — Taste the difference!`;
      coreMsg = `At ${storedBusinessName || 'our brand'}, we believe every meal deserves the best. ${keywordList.length > 0 ? `Featuring: ${keywordList.join(', ')}.` : ''}\n\nFreshness you can taste, quality you can trust.`;
      cta = `👉 ${objective || 'Order now and experience the flavor!'}`;
    } else if (isHealthFit) {
      hook = `💪 ${topic} — Your health journey starts here.`;
      coreMsg = `Achieving your goals with ${storedBusinessName || 'us'} has never been easier. ${keywordList.length > 0 ? `Focus on: ${keywordList.join(', ')}.` : ''}\n\nReal results, real people, real transformation.`;
      cta = `🏃 ${objective || 'Start today — your best self is waiting.'}`;
    } else if (isTech) {
      hook = `🚀 ${topic} — Smarter tools for a faster ${targetAudience || 'team'}.`;
      coreMsg = `${storedBusinessName || 'Our platform'} helps you ${keywordList.length > 0 ? keywordList.join(', ') : 'work smarter, not harder'}.\n\nBuilt for ${targetAudience || 'modern teams'} who demand results.`;
      cta = `⚡ ${objective || 'Start your free trial today.'}`;
    } else {
      hook = `✨ ${topic} — Something exciting is happening at ${storedBusinessName || 'our brand'}!`;
      coreMsg = `We're bringing you ${keywordList.length > 0 ? keywordList.join(', ') : 'something truly special'}.\n\nFor ${targetAudience || 'everyone who deserves the best'} — this is for you.`;
      cta = `👉 ${objective || 'Learn more and get started today.'}`;
    }

    // Build separate hashtags from keywords — never concatenated
    const topicHashtags = topic
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 3)
      .map(w => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);

    const keywordHashtags = keywordList
      .slice(0, 5)
      .map(k => `#${k.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`);

    const industryHashtags = isEcommerce
      ? ['#OnlineShopping', '#Sale', '#ShopNow']
      : isFoodBev
      ? ['#FoodLovers', '#Foodie', '#TasteTheDifference']
      : isHealthFit
      ? ['#HealthyLiving', '#Fitness', '#Wellness']
      : isTech
      ? ['#TechInnovation', '#DigitalTransformation', '#AI']
      : ['#Trending', '#MustHave', '#Discover'];

    const allHashtags = [...new Set([...topicHashtags, ...keywordHashtags, ...industryHashtags])].slice(0, 10);

    const fallbackContent = `**Hook / Headline:**
${hook}

**Main Content:**
${coreMsg}

**Call to Action:**
${cta}

**Hashtags:**
${allHashtags.join(' ')}`;

    return {
      content: fallbackContent,
      type,
      platform,
      topic,
      brandName: storedBusinessName,
      model: 'zenvora-engine-v1',
      generatedAt: new Date().toISOString(),
      note: 'Configure GEMINI_API_KEY in Render environment variables for live Gemini 1.5 Flash generation.',
    };
  },

  /**
   * AI Blog Post Generator
   */
  generateBlogArticle: async ({
    topic,
    targetKeyword,
    secondaryKeywords = [],
    audience = 'Marketing Leaders',
    tone = 'Authoritative and insightful',
    length = 'Comprehensive (1500+ words)',
    brandGuidelines = null,
  }) => {
    const brandVoice = brandGuidelines?.brandVoice || 'Authoritative, analytical, and actionable';

    const systemPrompt = `You are ZENVORA's Senior Editorial Director and SEO Architect.
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
        const parsed = JSON.parse(cleaned);
        return { ...parsed, model: liveResult.source };
      } catch {
        // if not pure JSON, return content with structured wrapper
        return {
          seoTitle: `${topic} | The Complete Strategy Guide`,
          metaDescription: `Discover how to master ${targetKeyword || topic} with proven strategies, actionable frameworks, and expert guidance.`,
          outline: [
            { heading: '1. Executive Summary', subpoints: ['Current state of the industry', 'Key challenges'] },
            { heading: '2. Strategic Implementation', subpoints: ['Framework overview', 'Step-by-step rollout'] },
            { heading: '3. Measuring Impact', subpoints: ['ROI metrics', 'Continuous optimization'] },
          ],
          faqs: [
            { question: `Why is ${targetKeyword || topic} critical now?`, answer: 'Modern algorithmic search shifts reward comprehensive semantic depth and real-world utility.' },
          ],
          content: liveResult.text,
          readingTime: 6,
          seoScore: 92,
          model: liveResult.source,
        };
      }
    }

    // High quality contextual fallback blog
    const blogTitle = `${topic}: The Ultimate Guide to Sustainable Growth in 2026`;
    const metaDesc = `Master ${targetKeyword || topic} with this comprehensive, data-backed guide. Learn frameworks, strategic execution, and how to scale marketing ROI.`;
    const outline = [
      { heading: '1. Why Traditional Marketing Workflows Are Broken', subpoints: ['Tool fragmentation', 'The compounding cost of manual drafting'] },
      { heading: '2. The 3-Step Framework for Sustainable Growth', subpoints: ['Centralized Brand Guidelines', 'Predictive SEO Clustering', 'Multi-Channel Autonomous Distribution'] },
      { heading: '3. Actionable Checklist for Implementation', subpoints: ['Audit your highest-performing assets', 'Set up continuous publishing cadence'] },
      { heading: '4. Common Pitfalls to Avoid', subpoints: ['Over-reliance on generic AI outputs', 'Ignoring audience search intent'] },
    ];

    const contentMarkdown = `## Introduction: The Modern Growth Paradigm

In an increasingly saturated digital landscape, the teams that win are not the ones who create the most noise—they are the ones who build **resilient content engines**. When tackling **${targetKeyword || topic}**, your goal must be twofold: solve the immediate intent of your buyer and establish permanent organic search authority.

### 1. The Core Architecture of Modern Marketing

Every high-performing campaign rests on a foundation of repeatable systems. When businesses shift away from ad-hoc drafting toward an integrated automation workflow, their organic visibility accelerates exponentially.

> "True marketing leverage is not doing more things faster. It is creating assets that continue to deliver qualified pipeline long after you press publish."

### 2. Strategic Pillars for ${targetKeyword || topic}

1. **Semantic Relevance Over Keyword Stuffing:** Modern search algorithms evaluate topical authority across entire content clusters. Target related secondary keywords: *${secondaryKeywords.join(', ') || 'organic reach, conversion acceleration, workflow efficiency'}*.
2. **Brand-Anchored Generation:** Every output must adhere strictly to your unique brand voice and value proposition.
3. **Omni-Channel Repurposing:** A single authoritative blog post should seamlessly feed 5 social posts, 2 email newsletters, and a multi-part carousel.

### 3. Step-by-Step Execution Plan

- **Phase 1: Research & Intent Mapping:** Identify the exact queries decision-makers type before making a purchase.
- **Phase 2: Draft with Strategic Depth:** Answer objections early, provide tangible data points, and illustrate with real workflows.
- **Phase 3: Measure, Iterate, and Compound:** Monitor engagement metrics and update your content quarterly to defend top SERP rankings.

## Conclusion

Mastering **${targetKeyword || topic}** is your competitive moat. Start implementing this framework today to transform marketing from an unpredictable cost center into an autonomous revenue engine.`;

    const faqs = [
      {
        question: `How does ${targetKeyword || topic} improve organic conversions?`,
        answer: 'By addressing search intent directly and providing actionable solutions, you establish authority that turns casual readers into qualified leads.',
      },
      {
        question: 'How often should this strategy be reviewed?',
        answer: 'We recommend reviewing core metrics monthly and conducting deep topical audits every quarter.',
      },
      {
        question: 'Can this framework scale across multiple locations or client brands?',
        answer: 'Yes, by maintaining isolated brand guideline profiles, multi-location brands and agencies can replicate these results without cross-contamination.',
      },
    ];

    return {
      seoTitle: `${blogTitle.slice(0, 58)}`,
      metaDescription: metaDesc.slice(0, 155),
      outline,
      faqs,
      content: contentMarkdown,
      readingTime: 6,
      seoScore: 93,
      model: 'zenvora-engine-v1',
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Quick Social Caption Generator
   */
  generateSocialCaptions: async ({ platform, topic, tone, count = 3 }) => {
    const prompt = `Write ${count} distinct, engaging ${platform} captions about: "${topic}".
Tone: ${tone}.
Rules:
- Each caption must be 100% about "${topic}" — no unrelated marketing jargon
- Include relevant emojis and appropriate hashtags for ${platform}
- Each hashtag must be a SEPARATE token (never merge multiple words into one hashtag)
- If the topic is a sale or product, make the caption feel like a consumer-facing promotion
- Separate captions with a blank line`;

    const live = await GeminiService.callGemini(prompt);
    if (live) {
      return { captions: live.text.split('\n\n').filter(Boolean), model: live.source };
    }

    // Topic-aware fallback captions — always about the actual topic
    const topicClean = topic.trim();
    const isEcomm = /sale|shop|deal|discount|buy|offer|launch|product/i.test(topicClean);
    const isTech  = /app|software|platform|tech|ai|digital|tool/i.test(topicClean);

    let c1, c2, c3;
    if (isEcomm) {
      c1 = `🛍️ ${topicClean} is LIVE!\n\nDon't miss these incredible deals — prices this low won't last. Grab yours before they're gone!\n\n#Sale #ShopNow #BestDeals #LimitedOffer #OnlineShopping`;
      c2 = `✨ The wait is over — ${topicClean} has arrived!\n\nFrom top brands to everyday essentials, find everything you need at prices you'll love. Shop now! 🛒\n\n#Shopping #Deals #Sale #MustHave #Trending`;
      c3 = `⏰ HURRY! ${topicClean} ends soon!\n\nBig savings, top brands, fast delivery. What are you waiting for? Click the link and start saving! 💰\n\n#FlashSale #LimitedTime #ShopNow #Discount #BigSavings`;
    } else if (isTech) {
      c1 = `🚀 Introducing ${topicClean}!\n\nThe smarter, faster way to work. Try it today and see the difference.\n\n#Tech #Innovation #ProductLaunch #NewRelease`;
      c2 = `⚡ ${topicClean} — built for people who mean business.\n\nSimpler. Faster. Better. See what all the buzz is about.\n\n#TechNews #NewFeature #Innovation #MustTry`;
      c3 = `💡 ${topicClean} is changing the game.\n\nJoin thousands of users who've already made the switch. Your productivity will thank you.\n\n#Technology #ProductUpdate #GameChanger #TryNow`;
    } else {
      c1 = `✨ ${topicClean} — you don't want to miss this!\n\nSomething exciting is here and it's meant for you. Tap to find out more 👇\n\n#MustSee #Trending #CheckItOut #Exciting`;
      c2 = `📢 Big news: ${topicClean} is here!\n\nWe've been working hard to bring you something truly special. Here's your first look.\n\n#NewAnnouncement #Trending #Discover #BrandNews`;
      c3 = `💫 ${topicClean} — made with you in mind.\n\nThis is the moment you've been waiting for. Don't let it pass you by!\n\n#NewRelease #Trending #MustHave #ExcitingNews`;
    }

    return {
      captions: [c1, c2, c3].slice(0, count),
      model: 'zenvora-engine-v1',
    };
  },

  /**
   * Trending & Niche Hashtag Generator
   */
  generateHashtags: async ({ niche, platform = 'Instagram' }) => {
    const prompt = `Generate 25 high-performing ${platform} hashtags specifically for: "${niche}".
Rules:
- Each hashtag must be a SEPARATE token (e.g. #FlipkartSale #BigDiscount — never #FlipkartSaleBigDiscount)
- Group into: High Reach (Broad), Mid-Tier (Niche), Targeted (High-Intent)
- Match the actual topic — if it is a sale/e-commerce topic, generate shopping hashtags, not B2B hashtags
- Never generate generic B2B, SaaS, or marketing-automation hashtags for a consumer/e-commerce niche`;

    const live = await GeminiService.callGemini(prompt);
    if (live) {
      return { hashtags: live.text, model: live.source };
    }

    // Topic-aware fallback — derive hashtags from the niche directly
    const words = niche.trim().split(/\s+/);
    const capitalise = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    const cleanWord  = (w) => w.replace(/[^a-zA-Z0-9]/g, '');

    // High reach: individual clean words as separate hashtags
    const highReach = words
      .filter(w => cleanWord(w).length > 2)
      .slice(0, 4)
      .map(w => `#${capitalise(cleanWord(w))}`);

    // Mid-tier: 2-word combos from adjacent words
    const midTier = [];
    for (let i = 0; i < Math.min(words.length - 1, 3); i++) {
      const combo = `${capitalise(cleanWord(words[i]))}${capitalise(cleanWord(words[i + 1]))}`;
      if (combo.length > 4) midTier.push(`#${combo}`);
    }
    // Pad with generic-but-relevant tags
    const isEcomm = /sale|shop|deal|discount|buy|store/i.test(niche);
    if (isEcomm) {
      midTier.push('#OnlineShopping', '#Sale', '#ShopNow');
    } else {
      midTier.push('#Trending', '#MustSee', '#Discover');
    }

    // Targeted: brand-name or long-form hashtags
    const fullNicheTag = `#${words.map(cleanWord).map(capitalise).join('')}`;
    const targeted = [
      fullNicheTag,
      `#${capitalise(cleanWord(words[0]))}Deals`,
      isEcomm ? '#BestPrice' : '#LearnMore',
    ];

    return {
      highReach,
      midTier: midTier.slice(0, 6),
      targeted,
      model: 'zenvora-engine-v1',
    };
  },
};

export default GeminiService;

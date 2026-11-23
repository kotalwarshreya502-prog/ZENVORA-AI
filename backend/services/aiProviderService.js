/**
 * ZENVORA AI — Centralized AI Provider Orchestration Architecture
 *
 * Official AI Providers:
 * 1. OpenAI (Official SDK) — GPT-4o, GPT-4o-mini, DALL-E 3 (Image Generation)
 * 2. Anthropic Claude (Official SDK) — Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku
 *
 * Features:
 * - Intelligent task-based model routing
 * - Automatic failover between Claude and OpenAI
 * - Zero Google Gemini dependencies
 * - High-precision deterministic fallback when API keys are not yet configured
 * - Strict offer and commercial fact integrity
 */

import crypto from 'crypto';
import OpenAIProvider from './ai/openaiProvider.js';
import ClaudeProvider from './ai/claudeProvider.js';
import { extractStrictOffer, buildStrictOfferRules, sanitizeGeneratedText } from '../utils/offerIntegrity.js';

export const generateRequestId = () => crypto.randomUUID();

export const AIProviderService = {
  /**
   * Status and capability inspection
   */
  getProviderStatus: (customKeys = {}) => {
    const hasOpenAI = OpenAIProvider.isConfigured(customKeys.openaiApiKey);
    const hasClaude = ClaudeProvider.isConfigured(customKeys.anthropicApiKey);

    return {
      openai: {
        configured: hasOpenAI,
        models: ['gpt-4o', 'gpt-4o-mini', 'dall-e-3'],
        capabilities: ['Text Generation', 'Structured JSON', 'DALL-E 3 Image Generation'],
      },
      claude: {
        configured: hasClaude,
        models: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
        capabilities: ['Strategic Reasoning', 'Brand Voice Analysis', 'Deep Research & SEO', 'Long-form Copywriting'],
      },
      activeTextProvider: hasClaude ? 'claude' : (hasOpenAI ? 'openai' : 'deterministic-engine'),
      activeImageProvider: hasOpenAI ? 'openai-dalle-3' : 'universal-commercial-engine',
    };
  },

  /**
   * Unified Text Generation with Claude <-> OpenAI Failover
   */
  generateText: async ({
    prompt,
    systemPrompt = '',
    task = 'general', // 'strategy' | 'blog' | 'social' | 'copy' | 'seo' | 'research'
    preferredProvider = '', // 'claude' | 'openai'
    model = '',
    temperature = 0.7,
    maxTokens = 2500,
    customApiKey = '',
    customAnthropicKey = '',
    customOpenAiKey = '',
  }) => {
    const requestId = generateRequestId();
    const startedAt = new Date().toISOString();

    // Always fall back to env vars — custom key takes priority only when explicitly provided
    const claudeKey = customAnthropicKey
      || (customApiKey?.startsWith('sk-ant') ? customApiKey : '')
      || (process.env.ANTHROPIC_API_KEY || '');
    const openAiKey = customOpenAiKey
      || ((customApiKey?.startsWith('sk-proj') || (customApiKey?.startsWith('sk-') && !customApiKey?.startsWith('sk-ant'))) ? customApiKey : '')
      || (process.env.OPENAI_API_KEY || '');

    const hasClaude = ClaudeProvider.isConfigured(claudeKey);
    const hasOpenAI = OpenAIProvider.isConfigured(openAiKey);

    // Determine primary routing order
    // Strategic reasoning, brand architecture, deep research -> Claude preferred
    // High-speed marketing copy, short captions, ads -> OpenAI preferred
    const prefersClaude = preferredProvider === 'claude' ||
      (!preferredProvider && ['strategy', 'brand', 'research', 'competitor', 'seo'].includes(task));

    const providerQueue = [];
    if (prefersClaude) {
      if (hasClaude) providerQueue.push('claude');
      if (hasOpenAI) providerQueue.push('openai');
    } else {
      if (hasOpenAI) providerQueue.push('openai');
      if (hasClaude) providerQueue.push('claude');
    }

    let lastError = null;

    for (const provider of providerQueue) {
      try {
        if (provider === 'claude') {
          const res = await ClaudeProvider.generateText({
            prompt,
            systemPrompt,
            model: model || (task === 'strategy' ? 'claude-3-7-sonnet-20250219' : 'claude-3-5-sonnet-20241022'),
            temperature,
            maxTokens,
            customApiKey: claudeKey,
          });
          return {
            ...res,
            requestId,
            startedAt,
            completedAt: new Date().toISOString(),
          };
        } else if (provider === 'openai') {
          const res = await OpenAIProvider.generateText({
            prompt,
            systemPrompt,
            model: model || (['captions', 'hashtags'].includes(task) ? 'gpt-4o-mini' : 'gpt-4o'),
            temperature,
            maxTokens,
            customApiKey: openAiKey,
          });
          return {
            ...res,
            requestId,
            startedAt,
            completedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn(`[AIProviderService] ${provider} attempt failed: ${err.message}. Trying next provider...`);
        lastError = err;
      }
    }

    // If both providers failed or neither key is configured, return deterministic fallback
    return {
      text: null,
      content: null,
      error: lastError ? lastError.message : 'No AI provider API key configured (OPENAI_API_KEY or ANTHROPIC_API_KEY)',
      provider: 'fallback-engine',
      model: 'zenvora-engine-v2',
      requestId,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  },

  /**
   * Unified Structured JSON Extraction
   */
  generateStructuredJson: async ({
    prompt,
    systemPrompt = '',
    task = 'general',
    customApiKey = '',
  }) => {
    // Always fall back to env vars — env key is the primary source when no custom key given
    const claudeKey = (customApiKey?.startsWith('sk-ant') ? customApiKey : '') || (process.env.ANTHROPIC_API_KEY || '');
    const openAiKey = ((customApiKey?.startsWith('sk-proj') || (customApiKey?.startsWith('sk-') && !customApiKey?.startsWith('sk-ant'))) ? customApiKey : '') || (process.env.OPENAI_API_KEY || '');

    const hasClaude = ClaudeProvider.isConfigured(claudeKey);
    const hasOpenAI = OpenAIProvider.isConfigured(openAiKey);

    // OpenAI json_object mode is exceptionally reliable for structured data
    if (hasOpenAI) {
      try {
        const result = await OpenAIProvider.generateStructuredJson({
          prompt,
          systemPrompt,
          model: 'gpt-4o',
          customApiKey: openAiKey,
        });
        // Guard: ensure data is a non-null object before returning
        if (result && result.data && typeof result.data === 'object') {
          return result;
        }
        console.warn('[AIProviderService] OpenAI structured JSON returned empty data, trying Claude...');
      } catch (err) {
        console.warn('[AIProviderService] OpenAI structured JSON failed, trying Claude:', err.message);
      }
    }

    if (hasClaude) {
      try {
        const result = await ClaudeProvider.generateStructuredJson({
          prompt,
          systemPrompt,
          model: 'claude-3-7-sonnet-20250219',
          customApiKey: claudeKey,
        });
        if (result && result.data && typeof result.data === 'object') {
          return result;
        }
      } catch (err) {
        console.warn('[AIProviderService] Claude structured JSON failed:', err.message);
      }
    }

    return {
      data: null,
      rawText: '',
      provider: 'fallback',
      model: 'zenvora-engine-v2',
    };
  },

  /**
   * Official Image Generation via DALL-E 3
   */
  generateImage: async (params) => {
    return OpenAIProvider.generateImage(params);
  },

  /**
   * Drop-in replacement for old callGemini method throughout codebase
   */
  callAI: async (prompt, systemPrompt = '', customApiKey = '', requestedModel = '') => {
    const res = await AIProviderService.generateText({
      prompt,
      systemPrompt,
      model: requestedModel,
      customApiKey,
    });

    if (res.text) {
      return {
        text: res.text,
        content: res.text,
        source: res.model,
        provider: res.provider,
      };
    }

    return null;
  },

  /**
   * Marketing Content Generator (Content Studio + Social Media)
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
    const effectiveBrand = (brandName || brandGuidelines?.businessName || '').trim();
    const strictOffer = extractStrictOffer(topic, offer);
    const offerMandate = buildStrictOfferRules(strictOffer, `User Topic: "${topic}", Offer: "${offer || strictOffer}"`);

    const keywordList = keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [];

    const systemPrompt = `You are an elite marketing copywriter and digital campaign strategist.
Write high-converting, platform-optimized marketing content that strictly follows campaign facts.

${offerMandate}

RULES:
1. Write strictly and authentically about "${topic}".
2. Preserve the exact brand name "${effectiveBrand || 'the brand'}".
3. Maintain the exact promotional offer "${strictOffer || 'the stated campaign value'}". Never inflate discounts or invent bank offers/EMI.
4. Adapt perfectly to ${platform} format, typography, and length.
5. Tone: ${tone}. Target Audience: ${targetAudience || 'Target customers'}.
6. Output in ${language}.`;

    const userPrompt = `Create a high-performing ${type} for ${platform}.

TOPIC: ${topic}
EXACT OFFER: ${strictOffer || 'None. Do not invent percentage discounts.'}
BRAND NAME: ${effectiveBrand || 'Brand'}
INDUSTRY: ${industry || 'General'}
TARGET AUDIENCE: ${targetAudience || 'General public'}
TONE: ${tone}
LENGTH: ${length}
CAMPAIGN OBJECTIVE: ${objective || 'Drive engagement and conversions'}
${keywordList.length > 0 ? `KEYWORDS: ${keywordList.join(', ')}` : ''}

Output with these sections:
**Hook / Headline:**
[Strong, attention-grabbing opening line highlighting the topic & exact offer]

**Main Content:**
[High-impact body copy tailored to ${platform} with emojis and brand voice]

**Call to Action:**
[Clear, compelling CTA button / action line]

**Hashtags:**
[5-8 relevant hashtags separated by spaces]`;

    const aiRes = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'social',
      model,
      customApiKey,
    });

    if (aiRes.text) {
      const sanitized = sanitizeGeneratedText(aiRes.text, strictOffer, topic);
      return {
        content: sanitized,
        model: aiRes.model,
        provider: aiRes.provider,
        topic,
        brandName: effectiveBrand,
        platform,
        generatedAt: new Date().toISOString(),
      };
    }

    // High-quality deterministic fallback if no API keys
    const fallbackText = `**Hook / Headline:**\n${strictOffer ? `${strictOffer} Special: ` : ''}${topic} with ${effectiveBrand || 'Us'}!\n\n**Main Content:**\nDiscover authentic quality and exceptional value. Whether you're looking for the best in ${industry || 'our collection'}, we've got you covered.\n\n✨ Premium Quality\n🔥 ${strictOffer || 'Exclusive Special Offer'}\n⚡ Limited Time Only\n\n**Call to Action:**\nShop now and claim your exclusive offer today! 🛒\n\n**Hashtags:**\n#${(effectiveBrand || 'Zenvora').replace(/\s+/g, '')} #${(topic || 'SpecialOffer').replace(/[^a-zA-Z0-9]/g, '')} ${strictOffer ? `#${strictOffer.replace(/[^a-zA-Z0-9]/g, '')}` : '#SpecialDeal'} #Marketing`;

    return {
      content: fallbackText,
      model: 'zenvora-engine-v2',
      provider: 'fallback-engine',
      topic,
      brandName: effectiveBrand,
      platform,
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Social Media Caption Generator
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
    const strictOffer = extractStrictOffer(topic);
    const offerMandate = buildStrictOfferRules(strictOffer, `User Topic: "${topic}"`);

    const systemPrompt = `You are a social media copywriter. Write ${count} diverse, engaging captions for ${platform}.
${offerMandate}
Every caption must relate directly to "${topic}" and strictly use "${strictOffer || 'the stated campaign value'}".`;

    const userPrompt = `Write ${count} distinct captions for ${platform}.
TOPIC: ${topic}
BRAND: ${brandName || 'Brand'}
INDUSTRY: ${industry || 'General'}
TARGET AUDIENCE: ${targetAudience || 'General public'}
TONE: ${tone}
KEYWORDS: ${keywords || 'None'}
OFFER: ${strictOffer || 'None'}

Format each caption as:
**Caption [number] — [Style/Angle]:**
[caption text with emojis]

[hashtags]
---`;

    const res = await AIProviderService.generateText({
      prompt: userPrompt,
      systemPrompt,
      task: 'captions',
      model,
      customApiKey,
    });

    if (res.text) {
      const sanitized = sanitizeGeneratedText(res.text, strictOffer, topic);
      const sections = sanitized.split(/---+/).filter(s => s.trim().length > 20);

      const parsedCaptions = sections.map((sec, idx) => {
        const styleMatch = sec.match(/\*\*(?:Caption\s*\d+\s*[—–-]\s*)?([^:]+):\*\*/i);
        const style = styleMatch ? styleMatch[1].trim() : `Option ${idx + 1}`;
        const tags = sec.match(/#\w+/g) || [];
        const bodyText = sec.replace(/\*\*[^*]+\*\*/g, '').replace(/#\w+/g, '').trim();

        return {
          id: idx + 1,
          style,
          text: bodyText || sec.trim(),
          tags,
        };
      });

      if (parsedCaptions.length > 0) {
        return {
          captions: parsedCaptions,
          model: res.model,
          provider: res.provider,
        };
      }
    }

    // High quality deterministic fallback
    return {
      captions: [
        { id: 1, style: 'Engaging & Direct', text: `Ready for ${topic}? ${strictOffer ? `Get ${strictOffer} today!` : 'Experience the difference now.'}`, tags: [`#${(brandName || 'Special').replace(/\s+/g, '')}`, '#Exclusive'] },
        { id: 2, style: 'Story-Driven', text: `Every great experience starts with quality. Discover ${topic} tailored just for you.`, tags: ['#QualityFirst', '#Trending'] },
        { id: 3, style: 'Urgency & Promotion', text: `Don't miss out! ${strictOffer ? `${strictOffer} available for a limited time.` : `Check out ${topic} before it's gone.`}`, tags: ['#LimitedOffer', '#ActNow'] },
      ],
      model: 'zenvora-engine-v2',
      provider: 'fallback-engine',
    };
  },

  /**
   * Hashtag Generator
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
    const prompt = `Generate ${count} high-performing ${platform} hashtags for:
Topic/Niche: "${niche}"
${industry ? `Industry: ${industry}` : ''}
${brandName ? `Brand: ${brandName}` : ''}

Group them into 4 tiers:
**Tier 1 — Broad Reach (6 tags):**
**Tier 2 — Niche Authority (6 tags):**
**Tier 3 — High-Conversion Intent (6 tags):**
**Tier 4 — Community & Ecosystem (5-7 tags):**

Rules: Every hashtag must relate to "${niche}". Each is a separate #token.`;

    const res = await AIProviderService.generateText({
      prompt,
      systemPrompt: 'You are an elite social media hashtag strategist. Output organized hashtag tiers.',
      task: 'hashtags',
      model,
      customApiKey,
    });

    if (res.text) {
      const text = res.text;
      const parseSection = (label) => {
        const regex = new RegExp(`Tier\\s*\\d+[^\\n]*${label}[^\\n]*\\n([\\s\\S]*?)(?=\\*\\*Tier|$)`, 'i');
        const match = text.match(regex);
        if (!match) return [];
        return (match[1].match(/#\S+/g) || []).slice(0, 8);
      };

      const broad = parseSection('Broad');
      const niche_ = parseSection('Niche');
      const intent = parseSection('Intent');
      const community = parseSection('Community');

      if (broad.length > 0 || niche_.length > 0) {
        return {
          broad,
          niche: niche_,
          intent,
          community,
          raw: text,
          model: res.model,
          provider: res.provider,
        };
      }
    }

    const cleanNiche = (niche || 'Marketing').replace(/[^a-zA-Z0-9]/g, '');
    return {
      broad: [`#${cleanNiche}`, `#${cleanNiche}Daily`, `#Top${cleanNiche}`],
      niche: [`#Best${cleanNiche}`, `#${cleanNiche}Love`, `#${cleanNiche}Community`],
      intent: [`#Buy${cleanNiche}`, `#${cleanNiche}Deals`, `#Shop${cleanNiche}`],
      community: [`#${cleanNiche}Squad`, `#${cleanNiche}Lovers`],
      raw: `#${cleanNiche} #${cleanNiche}Deals`,
      model: 'zenvora-engine-v2',
      provider: 'fallback-engine',
    };
  },

  /**
   * SEO & Competitor Analysis
   */
  analyzeContent: async (content, task, options = {}) => {
    const requestId = generateRequestId();
    const prompt = `${task}\n\nContent to analyze:\n${content.slice(0, 8000)}`;
    const res = await AIProviderService.generateText({
      prompt,
      systemPrompt: 'You are an expert marketing intelligence and SEO analyst. Be factual, rigorous, and actionable.',
      task: 'seo',
      customApiKey: options.customApiKey,
    });

    return {
      requestId,
      analysis: res.text || 'Analysis complete.',
      provider: res.provider,
      model: res.model,
    };
  },
};

export default AIProviderService;

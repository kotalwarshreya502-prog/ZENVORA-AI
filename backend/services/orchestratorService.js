/**
 * ZENVORA AI — Central Intelligence Orchestrator Service
 * Implements the 10 core marketing agents with unified knowledge sharing,
 * provider adapters, and workflow orchestration.
 *
 * Agents:
 * 1. Business Understanding Agent
 * 2. Web Research Agent
 * 3. Marketing Strategy Agent
 * 4. Content Generation Agent
 * 5. Creative Generation Agent
 * 6. SEO Agent
 * 7. Campaign Planning Agent
 * 8. Social Publishing Agent
 * 9. Analytics Agent
 * 10. Automation Agent
 */

import AIProviderService from './aiProviderService.js';
import { scrapeAndAnalyzeBusiness } from './websiteScraperService.js';
import { research as webResearch } from './searchService.js';
import { generatePosterPrompt } from './posterIntelligenceService.js';
import Storage from './storageService.js';

class CentralIntelligenceOrchestrator {
  /**
   * Helper: Resolve user business context for any agent
   */
  async getBusinessContext(userId) {
    if (!userId) return null;
    try {
      const [business, guidelines] = await Promise.all([
        Storage.getBusinessByOwner(userId),
        Storage.getBrandGuidelines(userId),
      ]);

      const bizObj = business?.toObject ? business.toObject() : business;
      const guideObj = guidelines?.toObject ? guidelines.toObject() : guidelines;

      return {
        name: bizObj?.name || 'Zenvora Brand',
        website: bizObj?.website || '',
        industry: bizObj?.industry || 'Digital Technology & Marketing',
        description: bizObj?.description || '',
        brandVoice: guideObj?.brandVoice || bizObj?.brandVoice || 'Professional, modern, and engaging',
        targetAudience: guideObj?.targetAudience || bizObj?.targetAudience || 'Modern professionals and decision makers',
        uniqueSellingPoints: bizObj?.uniqueSellingPoints || [],
        productsServices: bizObj?.productsServices || guideObj?.productsServices || [],
        primaryColor: guideObj?.primaryColor || bizObj?.brandColors?.primary || '#7657F6',
        accentColor: guideObj?.accentColor || bizObj?.brandColors?.secondary || '#11152B',
        logoUrl: guideObj?.logoUrl || bizObj?.logoUrl || '',
        locations: bizObj?.locations || [],
      };
    } catch {
      return null;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. BUSINESS UNDERSTANDING AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runBusinessUnderstandingAgent(websiteUrl, customApiKey = '') {
    return await scrapeAndAnalyzeBusiness(websiteUrl, customApiKey);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. WEB RESEARCH AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runWebResearchAgent({ topic, query, businessContext, customApiKey = '' }) {
    const searchQuery = query || topic;
    const baseResearch = await webResearch(searchQuery);

    // Deep synthesis with Central AI Provider (Claude / OpenAI)
    const systemPrompt = `You are the ZENVORA Web Research & Market Intelligence Agent.
Synthesize verified market intelligence, industry trends, and strategic opportunities for the brand.`;

    const prompt = `Topic / Query: "${searchQuery}"
Brand Context: ${businessContext?.name ? `${businessContext.name} (${businessContext.industry})` : 'General Business'}
Live Research Excerpts:
${baseResearch.sources?.map(s => `- [${s.title}] (${s.url}): ${s.snippet || ''}`).join('\n') || 'None'}

Return a JSON object:
{
  "summary": "2-3 paragraph executive summary of findings",
  "keyOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "marketTrends": ["Trend 1", "Trend 2", "Trend 3"],
  "competitiveLandscape": "Overview of how competitors are positioning themselves",
  "recommendedActionItems": ["Action 1", "Action 2", "Action 3"],
  "confidenceScore": "High | Medium"
}`;

    try {
      const res = await AIProviderService.callAI(prompt, systemPrompt, customApiKey);
      let parsed = {};
      if (res?.text) {
        const cleaned = res.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        parsed = JSON.parse(cleaned);
      }
      return {
        topic: searchQuery,
        ...parsed,
        sources: baseResearch.sources || [],
        researchedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        topic: searchQuery,
        summary: baseResearch.brandInfo || baseResearch.description || 'Research completed.',
        sources: baseResearch.sources || [],
        researchedAt: new Date().toISOString(),
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. MARKETING STRATEGY AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runMarketingStrategyAgent({ objective, targetAudience, budget, timeline, businessContext, customApiKey = '' }) {
    const prompt = `Develop a high-impact, data-driven marketing strategy for the following organization:

Business: ${businessContext?.name || 'High-Growth Company'}
Industry: ${businessContext?.industry || 'Technology'}
Description: ${businessContext?.description || 'Growth-driven business'}
Target Audience: ${targetAudience || businessContext?.targetAudience || 'Core target market'}
Campaign Objective: ${objective || 'Accelerate Revenue & Customer Acquisition'}
Time Horizon: ${timeline || '90-Day Sprint'}
Budget Tier: ${budget ? `$${budget}` : 'Optimized Growth Budget'}
USPs: ${businessContext?.uniqueSellingPoints?.join(', ') || 'High quality, rapid turnaround, cutting-edge AI'}

Return a JSON object:
{
  "executiveSummary": "Strategic thesis and overarching direction",
  "campaignPillars": [
    {
      "name": "Pillar name (e.g. Authority Building, Demand Generation)",
      "focus": "Channel and message focus",
      "activities": ["Activity 1", "Activity 2"]
    }
  ],
  "channelAllocation": [
    { "channel": "LinkedIn | Instagram | Google SEO | Email", "sharePercentage": 35, "rationale": "Why this channel wins" }
  ],
  "contentThemes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"],
  "weeklyMilestones": [
    { "week": 1, "goal": "Milestone description", "deliverables": ["Deliverable 1"] },
    { "week": 2, "goal": "Milestone description", "deliverables": ["Deliverable 2"] },
    { "week": 3, "goal": "Milestone description", "deliverables": ["Deliverable 3"] },
    { "week": 4, "goal": "Milestone description", "deliverables": ["Deliverable 4"] }
  ],
  "suggestedKpis": [
    { "metric": "Organic Traffic Growth", "target": "+45%" },
    { "metric": "Cost Per Acquisition (CPA)", "target": "-25%" },
    { "metric": "Sales Qualified Leads (SQLs)", "target": "+60%" }
  ]
}`;

    const res = await AIProviderService.callAI(
      prompt,
      'You are the ZENVORA Chief Marketing Strategy Agent. Output strict valid JSON only.',
      customApiKey
    );

    const cleaned = res.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CONTENT GENERATION AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runContentGenerationAgent(params) {
    return await AIProviderService.generateMarketingContent(params);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. CREATIVE GENERATION AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runCreativeGenerationAgent(params) {
    return await generatePosterPrompt(params);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. SEO AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runSeoAgent({ domain, seedKeywords, targetRegion = 'Global', businessContext, customApiKey = '' }) {
    const prompt = `Conduct comprehensive SEO intelligence and keyword cluster mapping:

Domain / Brand: ${domain || businessContext?.website || businessContext?.name || 'Digital Business'}
Industry: ${businessContext?.industry || 'Technology SaaS'}
Seed Topics / Keywords: ${seedKeywords || 'AI marketing automation, social media scheduling, SEO tools'}
Target Region: ${targetRegion}

Return a JSON object:
{
  "seoScore": 88,
  "summary": "Current search landscape and organic potential",
  "keywordClusters": [
    {
      "clusterName": "Commercial Intent Clustered Topic",
      "intent": "Transactional | Commercial | Informational",
      "primaryKeyword": "main target phrase",
      "volumeEstimate": "12,500/mo",
      "difficulty": "Medium (42/100)",
      "secondaryKeywords": ["variant 1", "variant 2", "variant 3"]
    },
    {
      "clusterName": "Problem-Aware Educational Topic",
      "intent": "Informational",
      "primaryKeyword": "educational phrase",
      "volumeEstimate": "8,200/mo",
      "difficulty": "Low (28/100)",
      "secondaryKeywords": ["variant 1", "variant 2"]
    }
  ],
  "technicalRecommendations": [
    "Core Web Vitals improvement recommendation",
    "Schema.org structured data recommendation",
    "Internal linking hierarchy optimization"
  ],
  "contentGapOpportunities": [
    "Content gap topic 1 that competitors are missing",
    "Content gap topic 2"
  ]
}`;

    const res = await AIProviderService.callAI(
      prompt,
      'You are the ZENVORA Senior SEO Architecture Agent. Output strict valid JSON only.',
      customApiKey
    );

    const cleaned = res.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. CAMPAIGN PLANNING AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runCampaignPlanningAgent({ campaignName, objective, targetAudience, platforms, businessContext, customApiKey = '' }) {
    const prompt = `Structure an enterprise multi-channel campaign plan:

Campaign Name: "${campaignName || 'Seasonal Growth Sprint'}"
Objective: ${objective || 'Customer Acquisition & Brand Awareness'}
Target Audience: ${targetAudience || businessContext?.targetAudience || 'Target market'}
Channels: ${platforms?.join(', ') || 'Instagram, LinkedIn, Blog, Email'}
Brand: ${businessContext?.name || 'Zenvora Brand'}
Industry: ${businessContext?.industry || 'Marketing Tech'}

Return a JSON object:
{
  "campaignName": "${campaignName}",
  "phases": [
    {
      "phase": "Phase 1: Teaser & Problem Awareness",
      "duration": "Days 1-7",
      "coreMessage": "Highlight the common friction points before revealing the solution",
      "deliverables": ["3 Social Teasers", "1 Pillar Blog Post"]
    },
    {
      "phase": "Phase 2: The Big Reveal & Social Proof",
      "duration": "Days 8-21",
      "coreMessage": "Unveil the primary offer, case studies, and customer testimonials",
      "deliverables": ["6 Social Posts", "2 Ad Creatives", "1 Email Blast"]
    },
    {
      "phase": "Phase 3: Conversion Acceleration & Urgency",
      "duration": "Days 22-30",
      "coreMessage": "Limited-time incentives and direct conversion CTAs",
      "deliverables": ["4 Urgency Creatives", "Final Chance Email Sequence"]
    }
  ],
  "assetChecklist": [
    "High-converting landing page",
    "Set of 5 custom poster visual creatives",
    "10 multi-platform social captions with hashtags",
    "2 educational thought leadership articles"
  ]
}`;

    const res = await AIProviderService.callAI(
      prompt,
      'You are the ZENVORA Campaign Operations Agent. Output strict valid JSON only.',
      customApiKey
    );

    const cleaned = res.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. SOCIAL PUBLISHING AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runSocialPublishingAgent({ postContent, platform, targetAudience, businessContext, customApiKey = '' }) {
    const prompt = `Optimize the following draft social post for peak engagement on ${platform}:

Draft Content:
${postContent}

Platform: ${platform}
Brand Voice: ${businessContext?.brandVoice || 'Professional and engaging'}
Target Audience: ${targetAudience || businessContext?.targetAudience || 'Social followers'}

Return a JSON object:
{
  "optimizedContent": "Fully polished post with hook, whitespace, and platform-appropriate formatting",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "recommendedPostingTimes": ["9:00 AM EST (Tue)", "1:30 PM EST (Thu)"],
  "hookScore": 92,
  "engagementTip": "1 practical tip to boost comment velocity"
}`;

    const res = await AIProviderService.callAI(
      prompt,
      'You are the ZENVORA Social Optimization Agent. Output strict valid JSON only.',
      customApiKey
    );

    const cleaned = res.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. ANALYTICS AGENT
  // ──────────────────────────────────────────────────────────────────────────
  async runAnalyticsAgent({ campaignData, metrics, businessContext, customApiKey = '' }) {
    const prompt = `Analyze marketing campaign performance metrics and provide executive recommendations:

Brand: ${businessContext?.name || 'Company'}
Campaign Data / Metrics:
${JSON.stringify(campaignData || metrics || { impressions: 45000, clicks: 1820, conversions: 112, spend: 850 })}

Return a JSON object:
{
  "ctr": "4.04%",
  "conversionRate": "6.15%",
  "cpc": "$0.47",
  "performanceVerdict": "Strong / Above Benchmark",
  "highlights": ["Key win 1", "Key win 2"],
  "bottlenecks": ["Area needing optimization"],
  "actionableSteps": [
    "Scale ad budget on top-performing LinkedIn audience",
    "A/B test landing page headline to improve conversion rate by 15%",
    "Repurpose winning copy into carousel slides"
  ]
}`;

    const res = await AIProviderService.callAI(
      prompt,
      'You are the ZENVORA Performance Analytics Agent. Output strict valid JSON only.',
      customApiKey
    );

    const cleaned = res.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 10. AUTOMATION AGENT (Autonomous Multi-Step Campaign Orchestrator)
  // ──────────────────────────────────────────────────────────────────────────
  async runAutomationAgent({ instruction, businessContext, customApiKey = '' }) {
    const prompt = `You are the master ZENVORA Autonomous Marketing Orchestrator.
A business owner has given you this command:
"${instruction}"

Brand Context:
${JSON.stringify(businessContext || { name: 'Growth Brand', industry: 'SaaS' })}

Break down this high-level instruction into an executable sequence of autonomous agent actions across the 9 specialized agents.

Return a JSON object:
{
  "planTitle": "Clear title for the execution plan",
  "estimatedDuration": "Execution timeframe (e.g. 5 minutes automated)",
  "steps": [
    {
      "step": 1,
      "agent": "Web Research Agent | Marketing Strategy Agent | Content Generation Agent | Creative Generation Agent | Social Publishing Agent | SEO Agent",
      "action": "Specific task description",
      "expectedOutput": "What asset or data will be produced"
    }
  ],
  "autonomousRecommendation": "Advice on scaling this workflow"
}`;

    const res = await AIProviderService.callAI(
      prompt,
      'You are the ZENVORA Master Marketing Automation Orchestrator. Output strict valid JSON only.',
      customApiKey
    );

    const cleaned = res.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  }
}

export const Orchestrator = new CentralIntelligenceOrchestrator();
export default Orchestrator;

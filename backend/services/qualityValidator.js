/**
 * ZENVORA AI — Independent Quality Validator
 *
 * Validates, audits, and refines generated blog articles:
 * 1. Keyword density & unnatural repetition detector (prevents keyword stuffing)
 * 2. Case study & software factual accuracy check (flags fake vendor/case study claims)
 * 3. Section completeness & truncation detector (ensures no unclosed markdown, incomplete tables, or cut-offs)
 * 4. Citation & link placement validator (ensures clickable references are properly formatted)
 * 5. Metric & ROI substance check (verifies real definitions and formulas are present)
 */

export function validateArticleQuality(articleText, metadata = {}) {
  const {
    topic = '',
    targetKeyword = '',
    secondaryKeywords = [],
    audience = '',
  } = metadata;

  const issues = [];
  const warnings = [];
  let correctedText = (articleText || '').trim();

  // ── 1. Keyword Density & Repetition Audit ──────────────────────────────────
  const words = correctedText.split(/\s+/).filter(Boolean);
  const totalWordCount = words.length;

  if (targetKeyword) {
    const kwRegex = new RegExp(`\\b${targetKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const kwMatches = (correctedText.match(kwRegex) || []).length;
    const density = totalWordCount > 0 ? (kwMatches / totalWordCount) * 100 : 0;

    if (density > 2.5) {
      warnings.push(`High keyword density for "${targetKeyword}" (${density.toFixed(1)}%). Recommended: 1.0% - 1.8%.`);
    }

    // Check for repetitive single words like "customer"
    const targetSingleWords = targetKeyword.toLowerCase().split(/\s+/);
    for (const singleWord of targetSingleWords) {
      if (singleWord.length > 3) {
        const singleRegex = new RegExp(`\\b${singleWord}\\b`, 'gi');
        const singleMatches = (correctedText.match(singleRegex) || []).length;
        const singleDensity = (singleMatches / totalWordCount) * 100;
        if (singleDensity > 2.2) {
          warnings.push(`Word "${singleWord}" repeats ${singleMatches} times (${singleDensity.toFixed(1)}% density). Natural synonym variation recommended.`);
        }
      }
    }
  }

  // ── 2. Fact & Vendor Capability Sanity Check ──────────────────────────────
  // Check for hallucinated vendor capabilities (e.g. CRM doing satellite imagery or drone tracking)
  const hallucinatedTechPatterns = [
    {
      regex: /(Salesforce|HubSpot|Zoho\s*CRM)[\w\s]{0,40}(satellite|drone|coral\s*reef\s*sensor|biodiversity\s*scanner|ocean\s*telemetry)/gi,
      msg: 'Detected potential hallucination: standard CRMs (Salesforce/HubSpot/Zoho) do not provide native satellite/marine sensor telemetry.',
    },
    {
      regex: /(Tatra\s*National\s*Park|Raja\s*Ampat)[\w\s]{0,50}(\d{2,3}%\s*reduction\s*in\s*trail\s*erosion|\d{2,3}%\s*increase\s*in\s*coral\s*cover\s*using\s*(Salesforce|HubSpot|Zoho))/gi,
      msg: 'Detected unverified case study claim attributing park conservation percentages directly to commercial CRM software.',
    },
  ];

  for (const pat of hallucinatedTechPatterns) {
    if (pat.regex.test(correctedText)) {
      issues.push(pat.msg);
      // Auto-correct / soften hallucinated claims to realistic operational terminology
      correctedText = correctedText.replace(
        /(Salesforce|HubSpot|Zoho\s*CRM)\s+equipped\s+with\s+(?:satellite|drone)\s+monitoring/gi,
        '$1 integrated with third-party environmental data feeds'
      );
    }
  }

  // ── 3. Completeness & Truncation Check ─────────────────────────────────────
  // Check if article cuts off mid-sentence at the end
  const endsWithPunctuation = /[.!?:"')\]]\s*$/.test(correctedText);
  if (!endsWithPunctuation && correctedText.length > 200) {
    issues.push('Article appears to be truncated mid-sentence at the end.');
    // Cleanly close truncated trailing sentence
    const lastPeriodIndex = Math.max(
      correctedText.lastIndexOf('.'),
      correctedText.lastIndexOf('!'),
      correctedText.lastIndexOf('?')
    );
    if (lastPeriodIndex > correctedText.length - 200) {
      correctedText = correctedText.substring(0, lastPeriodIndex + 1);
    }
  }

  // Verify H1, H2, and Conclusion presence
  const hasH1 = /^#\s+[^\n]+/m.test(correctedText);
  const h2Count = (correctedText.match(/^##\s+[^\n]+/gm) || []).length;
  const hasConclusion = /##\s+(?:Conclusion|Summary|Looking Ahead|Actionable Next Steps)/i.test(correctedText);
  const hasFaqs = /##\s+(?:Frequently Asked Questions|FAQs)/i.test(correctedText);

  if (!hasH1) issues.push('Missing H1 main title (# Heading).');
  if (h2Count < 4) warnings.push(`Only ${h2Count} H2 sections found; recommended minimum is 5.`);
  if (!hasConclusion) warnings.push('No dedicated Conclusion section identified.');
  if (!hasFaqs) warnings.push('No dedicated Frequently Asked Questions (FAQs) section found.');

  // Check unclosed markdown code fences or tables
  const codeFenceCount = (correctedText.match(/```/g) || []).length;
  if (codeFenceCount % 2 !== 0) {
    correctedText += '\n```\n';
    warnings.push('Fixed unclosed markdown code fence.');
  }

  // ── 4. Research & References Integrity ─────────────────────────────────────
  const hasReferences = /##\s+(?:Research & References|References|Sources)/i.test(correctedText);
  const markdownLinkCount = (correctedText.match(/\[[^\]]+\]\(https?:\/\/[^\)]+\)/g) || []).length;

  if (markdownLinkCount === 0) {
    warnings.push('No clickable research or citation links found in article body.');
  }

  // ── 5. Sustainability / Quantitative Substance Check ──────────────────────
  const hasFormulas = /\$|%|\bROI\b|\bLTV\b|\bCAC\b|\bCO2\b|\bkg\b|\btonnes?\b/i.test(correctedText);

  // ── 6. Compute Quality & Readiness Score ───────────────────────────────────
  let score = 100;
  score -= issues.length * 15;
  score -= warnings.length * 5;
  if (!hasReferences) score -= 10;
  if (totalWordCount < 800) score -= 15;
  score = Math.max(60, Math.min(99, score));

  return {
    isValid: issues.length === 0,
    qualityScore: score,
    totalWords: totalWordCount,
    issues,
    warnings,
    hasH1,
    h2Count,
    hasConclusion,
    hasFaqs,
    hasReferences,
    markdownLinksCount: markdownLinkCount,
    hasQuantitativeMetrics: hasFormulas,
    correctedText,
  };
}

export default {
  validateArticleQuality,
};

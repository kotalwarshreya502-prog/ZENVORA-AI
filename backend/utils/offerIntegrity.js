/**
 * ZENVORA AI — Strict Offer and Fact Accuracy Utility
 * Enforces absolute factual fidelity across all AI generators, captions,
 * posters, headlines, and social posts.
 *
 * Rules:
 * - If user provides "50% OFF", output must say "50% OFF" everywhere.
 * - Never convert 50% into 80%, 70%, or any other discount.
 * - Never invent bank discounts, no-cost EMI, free delivery, or unverified categories.
 * - Omit missing details; never fill gaps with assumptions.
 */

/**
 * Extract the exact user-specified offer from text or parameters
 * Prioritizes valid explicit offer, then parses the text.
 */
export function extractStrictOffer(text = '', explicitOffer = '') {
  // Check explicit offer first, but only if it actually represents an offer
  if (explicitOffer && typeof explicitOffer === 'string') {
    const trimmed = explicitOffer.trim();
    if (/\d{1,3}%|bogo|buy\s+\d+|[$€£₹]\s*\d+|admission\s+open|flat\s+\d+|discount|off\b/i.test(trimmed)) {
      // Normalize percentage
      const pMatch = trimmed.match(/(?:flat\s+)?(\d{1,3}%\s*(?:off|discount)?)/i);
      if (pMatch) {
        let p = pMatch[1].trim().toUpperCase();
        if (!p.includes('OFF') && !p.includes('DISCOUNT')) p = `${p} OFF`;
        return p;
      }
      return trimmed.toUpperCase();
    }
  }

  if (!text || typeof text !== 'string') return '';

  const clean = text.trim();

  // 1. Percentage discounts: "50% off", "50% discount", "flat 50% off", "50%"
  const percentMatch = clean.match(/(?:flat\s+)?(\d{1,3}%\s*(?:off|discount)?)/i);
  if (percentMatch) {
    let p = percentMatch[1].trim().toUpperCase();
    if (!p.includes('OFF') && !p.includes('DISCOUNT')) {
      p = `${p} OFF`;
    }
    return p;
  }

  // 2. Buy X Get Y deals: "Buy 1 Get 1", "Buy 2 Get 1 Free", "BOGO"
  const bogoMatch = clean.match(/buy\s+(\d+)\s+get\s+(\d+)(?:\s+free)?/i);
  if (bogoMatch) {
    return `BUY ${bogoMatch[1]} GET ${bogoMatch[2]} FREE`;
  }
  if (/\bbogo\b/i.test(clean)) {
    return 'BUY 1 GET 1 FREE';
  }

  // 3. Monetary discounts: "$50 off", "₹500 off"
  const moneyMatch = clean.match(/([$€£₹]\s*\d+(?:\.\d+)?\s*(?:off|discount)?)/i);
  if (moneyMatch) {
    let m = moneyMatch[1].trim().toUpperCase();
    if (!m.includes('OFF') && !m.includes('DISCOUNT')) m = `${m} OFF`;
    return m;
  }

  // 4. Special status offers: "Admission Open", "Free Consultation", "New Launch"
  if (/admission\s+open/i.test(clean)) return 'ADMISSION OPEN';
  if (/free\s+(?:trial|consultation|shipping|demo)/i.test(clean)) {
    const fMatch = clean.match(/free\s+(trial|consultation|shipping|demo)/i);
    return `FREE ${fMatch[1].toUpperCase()}`;
  }

  return '';
}

/**
 * Build rigorous system prompt instructions to forbid AI offer inflation or hallucination
 */
export function buildStrictOfferRules(strictOffer = '', userSuppliedDetails = '') {
  return `
CRITICAL OFFER & FACT ACCURACY MANDATE (NON-NEGOTIABLE):
1. SOURCE OF TRUTH: The user's input is the absolute ground truth.
${strictOffer ? `2. EXACT OFFER: The campaign offer is strictly "${strictOffer}".
   - You MUST use "${strictOffer}" in the headline, body text, and CTA.
   - NEVER alter, inflate, or round this offer (e.g. NEVER change ${strictOffer} into "Up to 80% off", "Up to 70% off", or any other percentage).
   - NEVER add "Up to" unless the user explicitly wrote "Up to".` : '2. No percentage discount was specified. DO NOT invent or assume any discount percentages.'}
3. ZERO INVENTED PROMOTIONS:
   - NEVER invent bank discounts (e.g. DO NOT mention "10% instant bank discount on SBI/HDFC/ICICI cards" or any bank offer).
   - NEVER invent No-cost EMI, free delivery, cashback, warranties, or lucky draw claims unless explicitly provided in user input.
4. ZERO UNVERIFIED PRODUCT CATEGORIES:
   - Do NOT invent unverified product lists (e.g. DO NOT list "smartphones, laptops, home appliances, footwear" unless explicitly specified).
   - If promoting a brand or festival sale without specific categories, speak to the brand and occasion directly without hallucinating item catalogs.
5. NO FILLER ASSUMPTIONS:
   - If any campaign detail is missing, OMIT it. Never fill gaps with assumptions or standard retail advertising tropes.
${userSuppliedDetails ? `User Provided Context: ${userSuppliedDetails}` : ''}
`;
}

/**
 * Post-generation sanitization: verifies and cleans AI output to ensure compliance
 */
export function sanitizeGeneratedText(content, strictOffer = '', userInput = '') {
  if (!content || typeof content !== 'string') return content;

  let cleaned = content;

  // 1. Remove invented bank discount tropes:
  // e.g. "10% instant discount on bank cards", "Additional 10% off with SBI/HDFC", etc.
  if (!/bank|card|sbi|hdfc|icici|axis/i.test(userInput)) {
    cleaned = cleaned.replace(/(?:\+?\s*(?:extra\s*)?(?:additional\s*)?\d{1,2}%\s*(?:instant\s*)?(?:bank|card)\s*discount(?:\s*on\s*[^.\n]+)?)/gi, '');
    cleaned = cleaned.replace(/.*(?:instant\s*bank\s*discount|no-cost\s*emi|bank\s*offers? available).*/gi, '');
  }

  // 2. If a strict offer exists (e.g. "50% OFF"):
  // Enforce absolute fidelity — replace ANY hallucinated percentages (e.g. "80% off", "up to 80%", "70% discount")
  if (strictOffer) {
    const offerNumMatch = strictOffer.match(/(\d{1,3})%/);
    if (offerNumMatch) {
      const allowedNum = offerNumMatch[1];
      // Match (up to)? <other-percent>% (off|discount|savings)?
      const wrongPercentRegex = new RegExp(`(?:up\\s+to\\s+)?(?!${allowedNum}%)\\b\\d{1,3}%(?:\\s*(?:off|discount|savings))?`, 'gi');
      cleaned = cleaned.replace(wrongPercentRegex, ` ${strictOffer} `);
    }

    // Ensure "Up to" is removed if user simply said "50% off"
    if (!/up\s+to/i.test(strictOffer)) {
      cleaned = cleaned.replace(new RegExp(`up\\s+to\\s+(${strictOffer})`, 'gi'), '$1');
    }
  }

  // 3. Remove invented free delivery if user didn't mention it
  if (!/free\s*delivery|free\s*shipping/i.test(userInput)) {
    cleaned = cleaned.replace(/\s*\+?\s*free\s*(?:delivery|shipping)\b/gi, '');
  }

  // 4. Never end important headlines or lines with silent truncation "..."
  cleaned = cleaned.replace(/\s*\.{3,}$/g, '');

  // Clean double spaces or orphaned punctuation
  cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

export default {
  extractStrictOffer,
  buildStrictOfferRules,
  sanitizeGeneratedText,
};

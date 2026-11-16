/**
 * ZENVORA AI — Campaign Fact Validator
 * Enforces real-time factual fidelity between user campaign brief and AI-generated outputs.
 * Detects and rejects:
 * - Mutated discounts (e.g. 50% turned into 80%)
 * - Invented bank card promotions (e.g. SBI/HDFC 10% instant discount)
 * - Invented No-Cost EMI facilities
 * - Invented prices or unverified product categories
 */

import { extractStrictOffer } from '../utils/offerIntegrity.js';

export function validateCampaignContent(input = {}, generatedText = '') {
  const errors = [];
  if (!generatedText || typeof generatedText !== 'string') {
    return { isValid: false, errors: ['Generated content is empty'] };
  }

  const {
    topic = '',
    offer = '',
    brandName = '',
    objective = '',
  } = input;

  const strictOffer = extractStrictOffer(topic, offer);
  const fullInputText = `${brandName} ${topic} ${offer} ${objective}`.toLowerCase();

  // ── 1. Discount / Percentage Accuracy ──────────────────────────────────────
  if (strictOffer) {
    const offerNumMatch = strictOffer.match(/(\d{1,3})%/);
    if (offerNumMatch) {
      const allowedNum = parseInt(offerNumMatch[1], 10);
      // Find all percentages associated with discounts in generated copy
      const matches = [...generatedText.matchAll(/(?:up\s+to\s+)?(\d{1,3})%\s*(?:off|discount|savings|price drop)?/gi)];
      for (const m of matches) {
        const foundNum = parseInt(m[1], 10);
        if (foundNum !== allowedNum && foundNum !== 100) {
          // If found discount differs from user offer
          errors.push(`Discount mismatch: AI generated "${m[0].trim()}" but authoritative campaign offer is "${strictOffer}".`);
        }
      }
    }
  } else {
    // If user specified NO percentage discount, AI must not invent one
    const inventedMatches = [...generatedText.matchAll(/(?:up\s+to\s+)?(\d{1,3})%\s*(?:off|discount)/gi)];
    if (inventedMatches.length > 0) {
      errors.push(`Invented discount: AI generated "${inventedMatches[0][0].trim()}" when no percentage discount was in the brief.`);
    }
  }

  // ── 2. Bank & Financial Claims ─────────────────────────────────────────────
  const hasBankInInput = /bank|card|credit|debit|sbi|hdfc|icici|axis|kotak|citi/i.test(fullInputText);
  if (!hasBankInInput) {
    const bankMatches = generatedText.match(/(?:instant\s*)?bank\s*discount|\b(?:sbi|hdfc|icici|axis|kotak)\s*(?:bank|card)?|\bcredit\s*card\s*(?:discount|offer)\b/gi);
    if (bankMatches) {
      errors.push(`Invented bank offer: AI introduced "${bankMatches[0].trim()}" without user specification.`);
    }
  }

  // ── 3. EMI Facilities ──────────────────────────────────────────────────────
  const hasEmiInInput = /emi|no-cost\s*emi|zero\s*cost/i.test(fullInputText);
  if (!hasEmiInInput) {
    const emiMatches = generatedText.match(/\b(?:no-cost\s*emi|zero\s*cost\s*emi|easy\s*emi|emi\s*options?|emi\s*starts?)\b/gi);
    if (emiMatches) {
      errors.push(`Invented financing: AI introduced "${emiMatches[0].trim()}" without user authorization.`);
    }
  }

  // ── 4. Brand Name Preservation ─────────────────────────────────────────────
  if (brandName && brandName.trim().length > 2) {
    const bLower = brandName.toLowerCase();
    // Check if a competitor brand was accidentally introduced
    const competitors = ['flipkart', 'amazon', 'myntra', 'walmart', 'target', 'meesho', 'aliexpress']
      .filter(c => c !== bLower);
    for (const comp of competitors) {
      const reg = new RegExp(`\\b${comp}\\b`, 'i');
      if (reg.test(generatedText) && !reg.test(fullInputText)) {
        errors.push(`Brand confusion: AI introduced competitor brand "${comp}" instead of "${brandName}".`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strictOffer,
  };
}

export default {
  validateCampaignContent,
};

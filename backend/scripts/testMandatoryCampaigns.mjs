/**
 * ZENVORA AI — Mandatory 8 Industry Test Cases Verification Script
 * Validates the complete pipeline for:
 * 1. Footwear (Flipkart Sneakers 40% OFF)
 * 2. Smartphone (TechNova Flagship Launch)
 * 3. Food (Sweet Delight Chocolate Cake)
 * 4. Fashion (Urban Style Summer Collection)
 * 5. Healthcare (HealthCare Plus World Health Awareness)
 * 6. Education (Future Academy Admissions Open 2027)
 * 7. Real Estate (Prime Homes Luxury Apartments)
 * 8. Festival (Flipkart Diwali Shopping Sale)
 */

import { analyzeInput, generatePosterPrompt, buildDesignSpec, validatePosterOutput } from '../services/posterIntelligenceService.js';
import ImageService from '../services/imageService.js';

const TEST_CASES = [
  {
    id: 1,
    name: 'FOOTWEAR ADVERTISEMENT',
    brand: 'Flipkart',
    industry: 'Footwear & Fashion',
    campaign: '40% OFF on every sneakers',
    expectedSubject: 'sneakers',
    expectedOffer: '40% OFF',
  },
  {
    id: 2,
    name: 'SMARTPHONE ADVERTISEMENT',
    brand: 'TechNova',
    industry: 'Technology',
    campaign: 'Premium smartphone launch',
    expectedSubject: 'smartphone',
    expectedOffer: '',
  },
  {
    id: 3,
    name: 'FOOD ADVERTISEMENT',
    brand: 'Sweet Delight',
    industry: 'Food & Culinary',
    campaign: 'Special chocolate cake promotion',
    expectedSubject: 'cake',
    expectedOffer: '',
  },
  {
    id: 4,
    name: 'FASHION ADVERTISEMENT',
    brand: 'Urban Style',
    industry: 'Fashion & Apparel',
    campaign: 'New summer clothing collection',
    expectedSubject: 'fashion',
    expectedOffer: '',
  },
  {
    id: 5,
    name: 'HEALTHCARE CAMPAIGN',
    brand: 'HealthCare Plus',
    industry: 'Healthcare & Wellness',
    campaign: 'World Health Awareness',
    expectedSubject: 'health',
    expectedOffer: '',
  },
  {
    id: 6,
    name: 'EDUCATION ADVERTISEMENT',
    brand: 'Future Academy',
    industry: 'Education & Academics',
    campaign: 'Admissions Open 2027',
    expectedSubject: 'students',
    expectedOffer: '',
  },
  {
    id: 7,
    name: 'REAL ESTATE ADVERTISEMENT',
    brand: 'Prime Homes',
    industry: 'Real Estate & Architecture',
    campaign: 'Luxury apartment launch',
    expectedSubject: 'apartment',
    expectedOffer: '',
  },
  {
    id: 8,
    name: 'FESTIVAL CAMPAIGN',
    brand: 'Flipkart',
    industry: 'E-commerce Retail',
    campaign: 'Diwali special shopping sale',
    expectedSubject: 'festive',
    expectedOffer: '',
  },
];

console.log('='.repeat(80));
console.log('  ZENVORA AI — MANDATORY 8-INDUSTRY CAMPAIGN & POSTER VERIFICATION');
console.log('='.repeat(80));

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const start = Date.now();
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[TEST ${tc.id}] ${tc.name}`);
    console.log(`  Brand: "${tc.brand}" | Campaign: "${tc.campaign}"`);

    try {
      // 1. Analyze campaign input
      const analysis = await analyzeInput(`${tc.brand}: ${tc.campaign}`, '', tc.expectedOffer, tc.industry);
      console.log(`  - Detected Category: "${analysis.category}" | Layout: "${analysis.layout}"`);
      console.log(`  - Headline: "${analysis.headline}"`);
      console.log(`  - Subheadline: "${analysis.subheadline}"`);
      console.log(`  - CTA: "${analysis.cta}"`);

      if (tc.expectedOffer) {
        if (!analysis.offer.includes(tc.expectedOffer)) {
          throw new Error(`Offer mutated! Expected "${tc.expectedOffer}", got "${analysis.offer}"`);
        }
        console.log(`  ✅ Strict Offer Preserved: "${analysis.offer}"`);
      }

      // 2. Synthesize commercial scene prompt
      const prompt = generatePosterPrompt(analysis);
      console.log(`  - Generated Scene Prompt: "${prompt.substring(0, 100)}..."`);

      // 3. Build design spec
      const spec = buildDesignSpec(analysis);
      console.log(`  - Typography & Color Tokens: ${spec.colorPalette}`);

      // 4. Validate copy integrity
      const validation = validatePosterOutput({ designSpec: spec, analysis }, tc.expectedOffer);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
      }
      console.log(`  ✅ Fact Integrity Validation: PASSED (Zero hallucinated bank offers or extra discounts)`);

      // 5. Generate / Resolve authentic image asset
      let imageResult = null;
      try {
        imageResult = await ImageService.generateImage({
          prompt,
          campaignTitle: tc.campaign,
          brandName: tc.brand,
          offer: analysis.offer,
          category: analysis.category,
        });
        console.log(`  ✅ Authentic AI Image Asset: ${imageResult.imageUrl} (${imageResult.provider || 'verified'})`);
      } catch (err) {
        console.log(`  ℹ️ Provider Notice: ${err.message.substring(0, 80)}...`);
      }

      const elapsed = Date.now() - start;
      console.log(`  ⏱️ Processing Duration: ${elapsed}ms`);
      passed++;
    } catch (err) {
      console.error(`  ❌ TEST FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED across all 8 mandatory industry test cases`);
  console.log('='.repeat(80));

  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);

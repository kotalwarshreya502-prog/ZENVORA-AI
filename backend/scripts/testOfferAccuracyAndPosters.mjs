/**
 * ZENVORA AI — Test Suite: Offer Accuracy & Real AI Poster Generation
 * Tests all 5 mandatory user test cases:
 * A. Amazon Diwali — 50% OFF
 * B. Fashion brand — 30% OFF
 * C. Restaurant campaign — Buy 1 Get 1
 * D. Education campaign — Admission Open
 * E. Technology product launch
 */

import { extractStrictOffer, sanitizeGeneratedText } from '../utils/offerIntegrity.js';
import { analyzeInput, generatePosterPrompt } from '../services/posterIntelligenceService.js';
import { ImageService } from '../services/imageService.js';
import GeminiService from '../services/geminiService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('  ZENVORA AI — Comprehensive Offer Accuracy & Poster Test Suite');
  console.log('='.repeat(70));

  // ──────────────────────────────────────────────────────────────────────────
  // TEST CASE A: Amazon Diwali — 50% OFF
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST A] Amazon Diwali — 50% OFF');
  const inputA = 'Amazon: 50% off Diwali Dhamaka';
  const offerA = extractStrictOffer(inputA);
  assert(offerA === '50% OFF', `Offer extraction: expected "50% OFF", got "${offerA}"`);

  const analysisA = await analyzeInput(inputA);
  assert(analysisA.offer === '50% OFF', `Analysis offer must be "50% OFF" (got: "${analysisA.offer}")`);
  assert(!analysisA.offer.includes('80%'), 'Analysis offer must NOT contain 80%');
  assert(!analysisA.subheadline.toLowerCase().includes('bank'), 'Subheadline must NOT invent bank discounts');
  assert(!analysisA.subheadline.toLowerCase().includes('emi'), 'Subheadline must NOT invent no-cost EMI');

  const promptA = generatePosterPrompt(analysisA);
  assert(promptA.includes('festive') || promptA.includes('diwali') || promptA.includes('celebrat'), 'Poster prompt must be festive-themed');
  assert(promptA.includes('negative space'), 'Poster prompt must enforce negative space');
  assert(promptA.includes('no watermarks') && promptA.includes('no coding screens'), 'Poster prompt must forbid watermarks and coding screens');

  // Test real image generation
  const imgA = await ImageService.generateImage({
    prompt: promptA,
    campaignTitle: 'Amazon Diwali Dhamaka',
    brandName: 'Amazon',
    offer: '50% OFF',
  });
  assert(imgA.imageUrl && imgA.imageUrl.startsWith('/uploads/posters/'), `Image generated and cached locally: ${imgA.imageUrl}`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST CASE B: Fashion brand — 30% OFF
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST B] Fashion brand — 30% OFF');
  const inputB = 'Zara Summer Couture runway collection with 30% off';
  const offerB = extractStrictOffer(inputB);
  assert(offerB === '30% OFF', `Offer extraction: expected "30% OFF", got "${offerB}"`);

  const analysisB = await analyzeInput(inputB);
  assert(analysisB.offer === '30% OFF', `Analysis offer must be "30% OFF" (got: "${analysisB.offer}")`);
  assert(!analysisB.offer.includes('80%') && !analysisB.offer.includes('50%'), 'Offer must not be mutated');

  const promptB = generatePosterPrompt(analysisB);
  assert(promptB.includes('fashion') || promptB.includes('couture') || promptB.includes('travertine') || promptB.includes('silk'), 'Poster prompt must be fashion-relevant');

  const imgB = await ImageService.generateImage({
    prompt: promptB,
    campaignTitle: 'Summer Couture',
    brandName: 'Zara',
    offer: '30% OFF',
  });
  assert(imgB.imageUrl && imgB.imageUrl.startsWith('/uploads/posters/'), `Fashion image generated and cached locally: ${imgB.imageUrl}`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST CASE C: Restaurant campaign — Buy 1 Get 1
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST C] Restaurant campaign — Buy 1 Get 1');
  const inputC = 'Artisan Sourdough Pizza Special: Buy 1 Get 1 Free';
  const offerC = extractStrictOffer(inputC);
  assert(offerC === 'BUY 1 GET 1 FREE', `Offer extraction: expected "BUY 1 GET 1 FREE", got "${offerC}"`);

  const analysisC = await analyzeInput(inputC);
  assert(analysisC.offer === 'BUY 1 GET 1 FREE', `Analysis offer must be "BUY 1 GET 1 FREE" (got: "${analysisC.offer}")`);

  const promptC = generatePosterPrompt(analysisC);
  assert(promptC.includes('culinary') || promptC.includes('chef') || promptC.includes('gourmet') || promptC.includes('food'), 'Poster prompt must be culinary/food-relevant');

  const imgC = await ImageService.generateImage({
    prompt: promptC,
    campaignTitle: 'Artisan Pizza',
    brandName: 'Artisan Sourdough',
    offer: 'BUY 1 GET 1 FREE',
  });
  assert(imgC.imageUrl && imgC.imageUrl.startsWith('/uploads/posters/'), `Restaurant image generated and cached locally: ${imgC.imageUrl}`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST CASE D: Education campaign — Admission Open
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST D] Education campaign — Admission Open');
  const inputD = 'Excel Academy Science & Tech Batch — Admission Open for 2026';
  const offerD = extractStrictOffer(inputD);
  assert(offerD === 'ADMISSION OPEN', `Offer extraction: expected "ADMISSION OPEN", got "${offerD}"`);

  const analysisD = await analyzeInput(inputD);
  assert(analysisD.offer === 'ADMISSION OPEN', `Analysis offer must be "ADMISSION OPEN" (got: "${analysisD.offer}")`);
  assert(!analysisD.subheadline.toLowerCase().includes('100% placement guarantee'), 'Must not invent placement guarantees');

  const promptD = generatePosterPrompt(analysisD);
  assert(promptD.includes('university') || promptD.includes('study') || promptD.includes('architectur') || promptD.includes('education'), 'Poster prompt must be education-relevant');

  const imgD = await ImageService.generateImage({
    prompt: promptD,
    campaignTitle: 'Science & Tech Batch',
    brandName: 'Excel Academy',
    offer: 'ADMISSION OPEN',
  });
  assert(imgD.imageUrl && imgD.imageUrl.startsWith('/uploads/posters/'), `Education image generated and cached locally: ${imgD.imageUrl}`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST CASE E: Technology product launch
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST E] Technology product launch');
  const inputE = 'Next-Gen Quantum X Pro Smart Device global launch';
  const analysisE = await analyzeInput(inputE);
  assert(analysisE.category === 'tech', `Detected category must be tech (got: "${analysisE.category}")`);

  const promptE = generatePosterPrompt(analysisE);
  assert(promptE.includes('modern minimalist') || promptE.includes('carbon') || promptE.includes('pedestal') || promptE.includes('showroom'), 'Poster prompt must be tech-relevant');
  assert(promptE.includes('no coding screens') && promptE.includes('no computer monitors') && promptE.includes('no music players'), 'Must explicitly forbid coding screens and music players');

  const imgE = await ImageService.generateImage({
    prompt: promptE,
    campaignTitle: 'Quantum X Pro',
    brandName: 'Quantum',
    offer: 'NEW LAUNCH',
  });
  assert(imgE.imageUrl && imgE.imageUrl.startsWith('/uploads/posters/'), `Tech image generated and cached locally: ${imgE.imageUrl}`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST CASE F: Sanitization against Hallucinated 80% & Bank Discounts
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST F] Text Sanitization against 80% and Bank Tropes');
  const dirtyText = `Get ready for Amazon Diwali Dhamaka! Enjoy Up to 80% off across electronics and smartphones + 10% instant bank discount on SBI cards. No-cost EMI available!`;
  const sanitized = sanitizeGeneratedText(dirtyText, '50% OFF', '50% off Diwali Dhamaka');

  assert(!sanitized.includes('80%'), 'Sanitization must remove 80% discount');
  assert(sanitized.includes('50% OFF'), 'Sanitization must enforce 50% OFF');
  assert(!sanitized.toLowerCase().includes('sbi cards') && !sanitized.toLowerCase().includes('bank discount'), 'Sanitization must strip invented bank cards');
  assert(!sanitized.toLowerCase().includes('no-cost emi'), 'Sanitization must strip invented EMI claims');

  console.log('\n' + '='.repeat(70));
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('\n❌ Uncaught error during test suite:', err);
  process.exit(1);
});

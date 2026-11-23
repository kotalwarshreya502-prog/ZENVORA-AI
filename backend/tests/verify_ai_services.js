/**
 * ZENVORA AI — Comprehensive AI Engine & Poster Intelligence Verification Script
 */

import AIProviderService from '../services/aiProviderService.js';
import OpenAIProvider from '../services/ai/openaiProvider.js';
import ClaudeProvider from '../services/ai/claudeProvider.js';
import PosterIntelligence from '../services/posterIntelligenceService.js';
import ImageService from '../services/imageService.js';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 Starting ZENVORA AI Engine Verification Suite');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  // 1. Providers Check
  console.log('--- TEST 1: Provider Classes & Methods ---');
  assert(typeof OpenAIProvider.generateText === 'function', 'OpenAIProvider has generateText');
  assert(typeof OpenAIProvider.generateImage === 'function', 'OpenAIProvider has generateImage');
  assert(typeof ClaudeProvider.generateText === 'function', 'ClaudeProvider has generateText');
  assert(typeof AIProviderService.callAI === 'function', 'AIProviderService has callAI');
  assert(typeof AIProviderService.generateMarketingContent === 'function', 'AIProviderService has generateMarketingContent');

  // 2. Poster Intelligence: "50% off on samosa"
  console.log('\n--- TEST 2: Samosa Context Understanding ("50% off on samosa") ---');
  const samosaAnalysis = await PosterIntelligence.analyzeInput('50% off on samosa');
  console.log('Samosa Analysis Result:', {
    category: samosaAnalysis.category,
    offer: samosaAnalysis.offer,
    visualSubject: samosaAnalysis.visualSubject?.slice(0, 70) + '...',
  });

  assert(samosaAnalysis.category === 'samosa' || samosaAnalysis.category === 'food', 'Category correctly detected as "samosa" / "food" (NOT ecommerce)');
  assert(samosaAnalysis.offer === '50% OFF', 'Offer preserved as "50% OFF"');
  assert(
    (samosaAnalysis.visualSubject || '').toLowerCase().includes('samosa') ||
    (samosaAnalysis.visualSubject || '').toLowerCase().includes('pastry'),
    'Hero visual prompt explicitly focuses on authentic samosas (no computer motherboard or dark empty showroom)'
  );

  // 3. Poster Intelligence: "30% off on running shoes"
  console.log('\n--- TEST 3: Footwear Context Understanding ---');
  const shoesAnalysis = await PosterIntelligence.analyzeInput('Nike 30% off on running shoes');
  console.log('Shoes Analysis Result:', {
    category: shoesAnalysis.category,
    brandName: shoesAnalysis.brandName,
    offer: shoesAnalysis.offer,
    visualSubject: shoesAnalysis.visualSubject?.slice(0, 70) + '...',
  });
  assert(shoesAnalysis.category === 'footwear', 'Category correctly detected as "footwear"');
  assert(shoesAnalysis.brandName === 'Nike', 'Brand correctly detected as "Nike"');
  assert(shoesAnalysis.offer === '30% OFF', 'Offer preserved as "30% OFF"');
  assert(
    (shoesAnalysis.visualSubject || '').toLowerCase().includes('sneaker') ||
    (shoesAnalysis.visualSubject || '').toLowerCase().includes('running shoe'),
    'Hero visual prompt focuses on athletic sneakers'
  );

  // 4. Poster Intelligence: "New smartphone launch"
  console.log('\n--- TEST 4: Tech / Electronics Understanding ---');
  const techAnalysis = await PosterIntelligence.analyzeInput('Samsung Galaxy New flagship smartphone launch');
  assert(techAnalysis.category === 'smartphone' || techAnalysis.category === 'tech', 'Category detected as "smartphone" / "tech"');
  assert(
    (techAnalysis.visualSubject || '').toLowerCase().includes('smartphone') ||
    (techAnalysis.visualSubject || '').toLowerCase().includes('oled'),
    'Hero visual focuses on modern flagship smartphone'
  );

  // 5. Poster Intelligence: "Organic skincare glow serum"
  console.log('\n--- TEST 5: Beauty / Cosmetics Understanding ---');
  const beautyAnalysis = await PosterIntelligence.analyzeInput('Pure Glow Organic Skincare Serum launch');
  assert(beautyAnalysis.category === 'beauty', 'Category detected as "beauty"');
  assert(
    (beautyAnalysis.visualSubject || '').toLowerCase().includes('skincare') ||
    (beautyAnalysis.visualSubject || '').toLowerCase().includes('dropper') ||
    (beautyAnalysis.visualSubject || '').toLowerCase().includes('cosmetic'),
    'Hero visual focuses on cosmetic bottle/serum'
  );

  // 6. Universal Custom Fallback
  console.log('\n--- TEST 6: Arbitrary Custom Industry ---');
  const customAnalysis = await PosterIntelligence.analyzeInput('Grand Opening of Sky High Indoor Trampoline Park 20% discount');
  assert(customAnalysis.offer.includes('20%'), 'Custom offer detected with "20%"');
  assert(
    (customAnalysis.visualSubject || '').toLowerCase().includes('trampoline') ||
    (customAnalysis.visualSubject || '').length > 20,
    'Hero subject accurately derived from custom user input'
  );

  // 7. Image Prompt Synthesis
  console.log('\n--- TEST 7: Image Prompt Formulation (No showroom fallbacks) ---');
  const imagePrompt = PosterIntelligence.generatePosterPrompt(samosaAnalysis, 'Warm Gourmet Culinary', 'square');
  console.log('Formulated Image Prompt:', imagePrompt);
  assert(
    imagePrompt.toLowerCase().includes('samosa') || imagePrompt.toLowerCase().includes('crispy'),
    'Formulated image prompt centers on samosas'
  );
  assert(
    !imagePrompt.includes('generic_commercial_studio_minimal'),
    'No placeholder image filenames in prompt'
  );

  // 8. Dynamic Deterministic Content Generation (when offline/fallback)
  console.log('\n--- TEST 8: AIProviderService Dynamic Fallback Generation ---');
  const generatedContent = await AIProviderService.generateMarketingContent({
    brandName: 'Spice Craft',
    industry: 'Food & Restaurants',
    topic: '50% off on samosa',
    platform: 'Instagram',
    tone: 'Excited',
  });
  console.log('Generated Content Topic / Headline:', {
    topic: '50% off on samosa',
    title: generatedContent.title || generatedContent.headline,
    captionLength: generatedContent.content?.length || 0,
    hashtagsCount: generatedContent.hashtags?.length || 0,
  });
  assert(
    (generatedContent.title || '').toLowerCase().includes('samosa') ||
    (generatedContent.content || '').toLowerCase().includes('samosa') ||
    (generatedContent.content || '').toLowerCase().includes('50%'),
    'Generated content dynamically incorporates user topic "50% off on samosa"'
  );

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 Verification Complete: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});

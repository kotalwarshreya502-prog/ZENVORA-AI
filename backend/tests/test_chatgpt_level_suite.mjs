/**
 * ZENVORA AI — ChatGPT-Level AI Integration Test Suite
 * Tests every AI feature across multiple industries, brands, and inputs.
 */

import dotenv from 'dotenv';
dotenv.config();

import AIProviderService from '../services/aiProviderService.js';
import { analyzeInput, generatePosterPrompt } from '../services/posterIntelligenceService.js';
import ImageService from '../services/imageService.js';
import { generateBlogArticleEndToEnd } from '../services/blogAIService.js';

let passed = 0;
let failed = 0;

function assert(condition, label, detail = '') {
  if (condition) {
    console.log(`✅ [PASS] ${label}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

console.log('\n=============================================================');
console.log('  ZENVORA AI — CHATGPT-GRADE FULL AI VERIFICATION SUITE');
console.log('=============================================================\n');

// ── TEST 1: Social Post Content Creation (Different Industries) ──────────────
console.log('--- TEST 1: Social Post Content Creation (Food: Samosa) ---');
try {
  const foodPost = await AIProviderService.generateMarketingContent({
    type: 'Social Post',
    platform: 'Instagram',
    industry: 'Food & Dining',
    topic: '50% off on crispy golden samosas with fresh mint chutney',
    offer: '50% OFF',
    brandName: 'Samosa Express',
    tone: 'Appetizing & Urgent',
  });

  assert(foodPost.content && foodPost.content.length > 50, 'Food post generated');
  assert(!foodPost.content.includes('Experience premium commercial excellence'), 'Food post is NOT a static template');
  assert(foodPost.content.toLowerCase().includes('samosa'), 'Food post mentions samosa', foodPost.content.slice(0, 100));
  console.log('  Preview:\n', foodPost.content.slice(0, 180), '\n');
} catch (e) {
  assert(false, 'Food post error: ' + e.message);
}

console.log('--- TEST 2: Social Post Content Creation (Tech: Smartphone) ---');
try {
  const techPost = await AIProviderService.generateMarketingContent({
    type: 'Social Post',
    platform: 'LinkedIn',
    industry: 'Consumer Technology',
    topic: 'TechNova flagship smartphone launch with curved 120Hz OLED display',
    brandName: 'TechNova',
    tone: 'Innovative & Visionary',
  });

  assert(techPost.content && techPost.content.length > 50, 'Tech post generated');
  assert(techPost.content.toLowerCase().includes('technova'), 'Tech post mentions TechNova');
  console.log('  Preview:\n', techPost.content.slice(0, 180), '\n');
} catch (e) {
  assert(false, 'Tech post error: ' + e.message);
}

// ── TEST 3: Social Captions (Multiple Angles) ──────────────────────────────
console.log('--- TEST 3: Social Media Caption Generator ---');
try {
  const captionsRes = await AIProviderService.generateSocialCaptions({
    platform: 'Instagram',
    topic: 'Nike Air Zoom Running Shoes Summer Flash Sale',
    tone: 'Energetic',
    count: 3,
    brandName: 'Nike',
  });

  assert(Array.isArray(captionsRes.captions) && captionsRes.captions.length >= 2, 'Multiple captions generated');
  assert(captionsRes.captions[0].text && captionsRes.captions[0].text.length > 15, 'Caption 1 is populated');
  console.log('  Caption 1:', captionsRes.captions[0].text.slice(0, 120));
  console.log('  Caption 2:', captionsRes.captions[1].text.slice(0, 120), '\n');
} catch (e) {
  assert(false, 'Captions error: ' + e.message);
}

// ── TEST 4: Tiered Hashtag Generation ──────────────────────────────────────
console.log('--- TEST 4: Tiered Hashtag Generator ---');
try {
  const tagsRes = await AIProviderService.generateHashtags({
    niche: 'Organic Skincare Serum',
    platform: 'Instagram',
    brandName: 'Lumière Botanicals',
    count: 15,
  });

  assert(tagsRes.broad?.length > 0 || tagsRes.niche?.length > 0, 'Tiered hashtags generated');
  console.log('  Broad tags:', tagsRes.broad?.slice(0, 4).join(' '));
  console.log('  Niche tags:', tagsRes.niche?.slice(0, 4).join(' '), '\n');
} catch (e) {
  assert(false, 'Hashtags error: ' + e.message);
}

// ── TEST 5: Universal Poster Intelligence (Any Industry) ───────────────────
console.log('--- TEST 5: Poster Intelligence (Pune Coaching Classes Admission Open) ---');
try {
  const analysis = await analyzeInput('Pune Coaching Classes Admission Open for IIT JEE 2026', '', '', 'Education');
  assert(analysis.headline && analysis.headline.length > 3, 'Coaching headline generated', analysis.headline);
  assert(analysis.category === 'education', 'Category correctly detected as education', analysis.category);
  assert(!analysis.subheadline?.includes('commercial excellence'), 'Subheadline is dynamic and contextual', analysis.subheadline);
  console.log('  Headline:', analysis.headline);
  console.log('  Subheadline:', analysis.subheadline);
  console.log('  Visual Subject:', analysis.visualSubject?.slice(0, 80));
  console.log('  AI Provider:', analysis._aiProvider, '\n');
} catch (e) {
  assert(false, 'Coaching poster intelligence error: ' + e.message);
}

// ── TEST 6: Real Image Generation & Asset Serving ──────────────────────────
console.log('--- TEST 6: Real Image Generation (Samosa crispy food photography) ---');
try {
  const imgRes = await ImageService.generateImage({
    campaignTitle: '50% off on crispy samosas',
    brandName: 'Samosa Express',
    category: 'samosa',
    width: 1024,
    height: 1024,
  });

  assert(imgRes.imageUrl && imgRes.imageUrl.length > 5, 'Image URL returned');
  assert(imgRes.imageUrl.startsWith('/uploads/') || imgRes.imageUrl.startsWith('http') || imgRes.imageUrl.startsWith('data:'), 'Valid image path', imgRes.imageUrl.slice(0, 30));
  console.log('  Image URL:', imgRes.imageUrl.slice(0, 45) + '...');
  console.log('  Provider:', imgRes.provider);
  console.log('  Model:', imgRes.model, '\n');
} catch (e) {
  assert(false, 'Image generation error: ' + e.message);
}

// ── TEST 7: Long-Form Blog Article Synthesis ──────────────────────────────
console.log('--- TEST 7: Long-Form Blog Article Synthesis ---');
try {
  const blogRes = await generateBlogArticleEndToEnd({
    topic: 'How Generative AI is Transforming Digital Marketing in 2026',
    targetKeyword: 'Generative AI Marketing',
    secondaryKeywords: ['Automation', 'ROI', 'Content Strategy'],
    audience: 'Marketing Directors and Business Owners',
    tone: 'Insightful and Forward-Looking',
    length: 'Concise (800+ words)',
  });

  const articleBody = blogRes.content || blogRes.article || '';
  assert(articleBody && articleBody.length > 300, 'Comprehensive blog article generated', `${articleBody.length} chars`);
  assert(blogRes.title && blogRes.title.length > 10, 'Blog title generated', blogRes.title);
  assert(Array.isArray(blogRes.citations) && blogRes.citations.length > 0, 'Live research citations attached', `${blogRes.citations?.length} sources`);
  console.log('  Title:', blogRes.title);
  console.log('  Word Count:', blogRes.wordCount);
  console.log('  Citations Count:', blogRes.citations?.length);
  console.log('  Excerpt:\n', articleBody.slice(0, 200), '\n');
} catch (e) {
  assert(false, 'Blog generation error: ' + e.message);
}

console.log('=============================================================');
console.log(`  VERIFICATION RESULTS: ${passed} PASSED / ${failed} FAILED`);
console.log('=============================================================\n');

process.exit(failed > 0 ? 1 : 0);

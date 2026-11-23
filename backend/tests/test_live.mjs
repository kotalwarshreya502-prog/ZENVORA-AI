/**
 * ZENVORA AI — Live OpenAI Integration Test
 * Tests all major AI tools with real API calls
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import OpenAIProvider from '../services/ai/openaiProvider.js';
import AIProviderService from '../services/aiProviderService.js';

const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
let passed = 0;
let failed = 0;

function assert(condition, label, details = '') {
  if (condition) {
    console.log(`${PASS} ${label}`);
    passed++;
  } else {
    console.error(`${FAIL} ${label}${details ? ': ' + details : ''}`);
    failed++;
  }
}

console.log('\n═══════════════════════════════════════════════════');
console.log('  ZENVORA AI — Live OpenAI Integration Test Suite');
console.log('═══════════════════════════════════════════════════\n');

console.log('OpenAI Key present:', Boolean(process.env.OPENAI_API_KEY));
console.log('Claude Key present:', Boolean(process.env.ANTHROPIC_API_KEY));
console.log('');

// ── TEST 1: OpenAI isConfigured (env key) ──────────────────────────────────
console.log('─── Test 1: OpenAI Provider Configuration ───');
const configured = OpenAIProvider.isConfigured();
assert(configured, 'OpenAI isConfigured() reads OPENAI_API_KEY from env');

// ── TEST 2: AI Provider Service — no key fallback ─────────────────────────
console.log('\n─── Test 2: AIProviderService.generateText (OpenAI via env key) ───');
try {
  const res = await AIProviderService.generateText({
    prompt: 'Write one single sentence: "Hello from ZENVORA AI powered by OpenAI GPT-4o!"',
    systemPrompt: 'You are a helpful assistant. Respond concisely.',
    task: 'copy',
    // No customApiKey — must use env
  });
  assert(res.text && res.text.length > 10, 'generateText returned real content', res.text?.slice(0, 80));
  assert(res.provider === 'openai', 'Provider is openai', res.provider);
  assert(res.model?.includes('gpt'), 'Model is GPT', res.model);
  console.log('  → Response:', res.text?.slice(0, 100));
} catch (e) {
  assert(false, 'generateText threw: ' + e.message);
}

// ── TEST 3: generateStructuredJson ────────────────────────────────────────
console.log('\n─── Test 3: generateStructuredJson (Poster Analysis) ───');
try {
  const res = await AIProviderService.generateStructuredJson({
    prompt: `Analyze this campaign: "50% off on Samosa". Output JSON with keys: headline, offer, cta, category`,
    systemPrompt: 'Output only valid JSON.',
    task: 'strategy',
    // No customApiKey — must use env
  });
  assert(res.data && typeof res.data === 'object', 'Returned structured JSON object');
  assert(res.data.headline || res.data.offer, 'JSON has headline or offer', JSON.stringify(res.data).slice(0, 100));
  assert(res.provider === 'openai', 'Provider is openai', res.provider);
  console.log('  → JSON data:', JSON.stringify(res.data).slice(0, 150));
} catch (e) {
  assert(false, 'generateStructuredJson threw: ' + e.message);
}

// ── TEST 4: Marketing Content (Social Post) ────────────────────────────────
console.log('\n─── Test 4: generateMarketingContent (Social Post) ───');
try {
  const res = await AIProviderService.generateMarketingContent({
    type: 'Social Post',
    platform: 'Instagram',
    topic: 'Nike Running Shoes 30% OFF Summer Sale',
    offer: '30% OFF',
    tone: 'Energetic',
    brandName: 'Nike',
    industry: 'Footwear',
    // No customApiKey — env key
  });
  assert(res.content && res.content.length > 50, 'Marketing content generated', res.content?.slice(0, 80));
  assert(res.provider === 'openai', 'Provider is openai', res.provider);
  console.log('  → Content preview:', res.content?.slice(0, 120));
} catch (e) {
  assert(false, 'generateMarketingContent threw: ' + e.message);
}

// ── TEST 5: Caption Generator ─────────────────────────────────────────────
console.log('\n─── Test 5: generateSocialCaptions ───');
try {
  const res = await AIProviderService.generateSocialCaptions({
    platform: 'Instagram',
    topic: 'Diwali Special Sweets Sale',
    tone: 'Festive',
    count: 2,
    brandName: 'Mithai House',
  });
  assert(res.captions && res.captions.length >= 1, 'Captions generated', `count: ${res.captions?.length}`);
  assert(res.provider === 'openai', 'Provider is openai', res.provider);
  console.log('  → Caption 1:', res.captions?.[0]?.text?.slice(0, 100));
} catch (e) {
  assert(false, 'generateSocialCaptions threw: ' + e.message);
}

// ── TEST 6: Hashtag Generator ─────────────────────────────────────────────
console.log('\n─── Test 6: generateHashtags ───');
try {
  const res = await AIProviderService.generateHashtags({
    niche: 'Organic Skincare',
    platform: 'Instagram',
    brandName: 'GlowNaturals',
    count: 10,
  });
  assert(res.broad && res.broad.length > 0, 'Hashtags returned', `${res.broad?.length} broad tags`);
  assert(res.provider === 'openai', 'Provider is openai', res.provider);
  console.log('  → Broad tags:', res.broad?.slice(0, 4).join(' '));
} catch (e) {
  assert(false, 'generateHashtags threw: ' + e.message);
}

// ── TEST 7: Poster Intelligence — analyzeInput ────────────────────────────
console.log('\n─── Test 7: Poster Intelligence — analyzeInput ───');
try {
  const { analyzeInput } = await import('../services/posterIntelligenceService.js');
  const analysis = await analyzeInput('50% off on samosa', '', '', '');
  assert(analysis.headline && analysis.headline.length > 3, 'Poster headline generated', analysis.headline);
  assert(analysis.offer?.includes('50%'), 'Offer preserved correctly', analysis.offer);
  assert(analysis.category === 'samosa', 'Category detected as samosa', analysis.category);
  assert(!analysis.subheadline?.toLowerCase().includes('commercial excellence'), 
    'NOT generic fallback subheadline', analysis.subheadline?.slice(0, 60));
  console.log('  → Headline:', analysis.headline);
  console.log('  → Subheadline:', analysis.subheadline?.slice(0, 80));
  console.log('  → Offer:', analysis.offer);
  console.log('  → AI Provider:', analysis._aiProvider);
} catch (e) {
  assert(false, 'posterIntelligenceService.analyzeInput threw: ' + e.message);
}

// ── TEST 8: Claude is optional (no error when missing) ────────────────────
console.log('\n─── Test 8: Claude Optional — no error when missing ───');
const claudeKey = (process.env.ANTHROPIC_API_KEY || '').trim();
if (!claudeKey) {
  try {
    const res = await AIProviderService.generateText({
      prompt: 'Say hello.',
      task: 'strategy', // Claude-preferred task
    });
    // Should fall back to OpenAI, NOT throw
    assert(res.text || res.provider, 'Strategy task works without Claude key (fallback to OpenAI)', res.provider);
    assert(res.provider !== 'error', 'No error thrown for missing Claude key', res.provider);
    console.log('  → Fell back to:', res.provider);
  } catch (e) {
    assert(false, 'Strategy task threw when Claude missing: ' + e.message);
  }
} else {
  console.log('  (Claude key IS configured — skipping optional test)');
  passed++;
}

// ── SUMMARY ───────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════');
console.log(`  Results: ${passed} PASSED / ${failed} FAILED`);
console.log('═══════════════════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);

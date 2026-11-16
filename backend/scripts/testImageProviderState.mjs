/**
 * ZENVORA AI — Test Script: Image Generation Provider State Audit
 * Verifies:
 * 1. ImageService explicitly throws when provider is unconfigured
 * 2. Error message strictly matches: "Image generation is temporarily unavailable. Please configure an image-generation provider."
 * 3. Zero external silent fallbacks (no stock images, no third-party services)
 */

import ImageService from '../services/imageService.js';

console.log('='.repeat(75));
console.log('  ZENVORA AI — IMAGE GENERATION PROVIDER AUDIT');
console.log('='.repeat(75));

async function run() {
  console.log('\n[1] Verifying ImageService Provider Status:');
  try {
    await ImageService.generateImage({
      prompt: 'commercial festive diwali shopping gift boxes on polished pedestal',
      campaignTitle: 'Flipkart Diwali Sale',
      brandName: 'Flipkart',
      offer: '50% OFF',
    });
    console.error('  ❌ FAILED: Should have rejected unconfigured provider');
    process.exit(1);
  } catch (err) {
    const expected = 'Image generation is temporarily unavailable. Please configure an image-generation provider.';
    if (err.message === expected) {
      console.log(`  ✅ Successfully returned required notice: "${err.message}"`);
    } else {
      console.error(`  ❌ Mismatch: Expected "${expected}", got: "${err.message}"`);
      process.exit(1);
    }
  }

  console.log('\n[2] Verifying Social Graphic Generation Provider Status:');
  try {
    await ImageService.generateSocialGraphic({
      topic: 'Flipkart Diwali Sale',
      platform: 'Instagram',
    });
    console.error('  ❌ FAILED: Should have rejected unconfigured provider');
    process.exit(1);
  } catch (err) {
    const expected = 'Image generation is temporarily unavailable. Please configure an image-generation provider.';
    if (err.message === expected) {
      console.log(`  ✅ Successfully returned required notice: "${err.message}"`);
    } else {
      console.error(`  ❌ Mismatch: Expected "${expected}", got: "${err.message}"`);
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(75));
  console.log('  IMAGE SERVICE AUDIT: ALL CHECKS PASSED');
  console.log('='.repeat(75));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * ZENVORA AI — Image Generation Service
 * Uses Pollinations.ai for real AI image generation (free tier, no key needed).
 * Docs: https://image.pollinations.ai/prompt/{encoded_prompt}
 */

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

export const ImageService = {
  /**
   * Generate a marketing poster/image using Pollinations.ai
   * Returns: { imageUrl, prompt, width, height, model, generatedAt }
   */
  generateImage: async ({
    campaignTitle = '',
    brandName = '',
    productService = '',
    offer = '',
    style = 'modern professional',
    width = 1024,
    height = 1024,
    seed = null,
  }) => {
    // Build a detailed, marketing-focused prompt
    const marketingPrompt = [
      `professional marketing poster`,
      campaignTitle ? `for "${campaignTitle}"` : '',
      brandName ? `brand: ${brandName}` : '',
      productService ? `promoting: ${productService}` : '',
      offer ? `special offer: ${offer}` : '',
      `style: ${style}`,
      `high quality, commercial design, vibrant colors, clean typography`,
      `no text overlay, visual impact, 4k render`,
    ].filter(Boolean).join(', ');

    const encodedPrompt = encodeURIComponent(marketingPrompt);
    const useSeed = seed || Math.floor(Math.random() * 999999);
    const imageUrl = `${POLLINATIONS_BASE}/${encodedPrompt}?width=${width}&height=${height}&seed=${useSeed}&nologo=true&enhance=true`;

    // Verify the URL is reachable (HEAD request with timeout)
    try {
      const check = await fetch(imageUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      });
      if (!check.ok && check.status !== 200) {
        throw new Error(`Pollinations returned ${check.status}`);
      }
    } catch (err) {
      console.warn('[ImageService] Pollinations check failed:', err.message);
      // Still return the URL — browsers can load it even if HEAD is blocked
    }

    return {
      imageUrl,
      prompt: marketingPrompt,
      width,
      height,
      seed: useSeed,
      model: 'pollinations-flux',
      provider: 'pollinations-ai',
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Generate a social media graphic
   */
  generateSocialGraphic: async ({ topic, platform = 'Instagram', style = 'modern', width = 1080, height = 1080 }) => {
    const dimensions = {
      Instagram: { width: 1080, height: 1080 },
      LinkedIn: { width: 1200, height: 627 },
      Facebook: { width: 1200, height: 630 },
      Twitter: { width: 1600, height: 900 },
      YouTube: { width: 1280, height: 720 },
    };
    const dim = dimensions[platform] || { width, height };

    const prompt = `${platform} social media graphic for "${topic}", ${style} design, professional marketing visual, vibrant, high resolution, no text`;
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `${POLLINATIONS_BASE}/${encodedPrompt}?width=${dim.width}&height=${dim.height}&seed=${seed}&nologo=true`;

    return {
      imageUrl,
      prompt,
      width: dim.width,
      height: dim.height,
      seed,
      model: 'pollinations-flux',
      provider: 'pollinations-ai',
      generatedAt: new Date().toISOString(),
    };
  },
};

export default ImageService;

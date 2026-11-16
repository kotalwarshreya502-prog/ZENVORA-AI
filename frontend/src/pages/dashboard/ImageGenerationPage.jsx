/**
 * ZENVORA AI — Universal Commercial Advertising Poster & Image Engine
 *
 * Two-Stage Architecture:
 * STAGE A: Pure AI Visual / Hero Subject Generation (Google Imagen 3 / FLUX.1)
 * STAGE B: High-Precision Commercial Typography & Brand Composition Engine
 *
 * Supports 8 dynamic advertising layouts, live editable copy,
 * strict offer preservation, and high-resolution Canvas HD export.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Download,
  RefreshCw,
  Edit3,
  Image as ImageIcon,
  AlertTriangle,
  ExternalLink,
  Bot,
  Search,
  CheckCircle2,
  Sliders,
  Type,
  Layout,
  Share2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

// ── Size & Aspect Ratio Presets ───────────────────────────────────────────────
export const SIZE_PRESETS = [
  { key: 'square',    label: 'Square 1:1',    sub: '1080×1080', icon: '⬜', hint: 'Instagram / Feed',    width: 1080, height: 1080, aspect: 'aspect-square' },
  { key: 'portrait',  label: 'Portrait 4:5',  sub: '1080×1350', icon: '📱', hint: 'Instagram Portrait',width: 1080, height: 1350, aspect: 'aspect-[4/5]' },
  { key: 'story',     label: 'Story 9:16',    sub: '1080×1920', icon: '📲', hint: 'Stories / Reels',   width: 1080, height: 1920, aspect: 'aspect-[9/16]' },
  { key: 'landscape', label: 'Landscape 16:9',sub: '1200×675',  icon: '🖥️',  hint: 'LinkedIn / Banner',  width: 1200, height: 675,  aspect: 'aspect-[16/9]' },
];

// ── Commercial Visual Styles ──────────────────────────────────────────────────
export const DESIGN_STYLES = [
  'Modern Commercial Studio',
  'Photorealistic Product',
  'Luxury Gold & Velvet',
  'Dark Cinematic Chiaroscuro',
  'High-Fashion Editorial',
  'Warm Gourmet Culinary',
  'Clean Minimalist Architectural',
  'Vibrant Festive Celebration',
  'Cyber Neon Glow',
  'Lifestyle Advertising',
];

// ── Flexible Advertising Poster Layouts ───────────────────────────────────────
export const POSTER_LAYOUTS = [
  { id: 'product-focused', label: 'Product Focused', icon: '🎯' },
  { id: 'full-bleed',       label: 'Full Bleed',      icon: '🖼️' },
  { id: 'split-screen',     label: 'Split Screen',    icon: '⚡' },
  { id: 'minimal-luxury',   label: 'Minimal Luxury',  icon: '✨' },
  { id: 'bold-promotional', label: 'Bold Promo',      icon: '💥' },
  { id: 'editorial',        label: 'Editorial',       icon: '📰' },
  { id: 'lifestyle',        label: 'Lifestyle',       icon: '🌿' },
  { id: 'modern-gradient',  label: 'Gradient Glow',   icon: '🌈' },
];

// ── Mandatory Test & Demo Prompts ─────────────────────────────────────────────
const EXAMPLE_PROMPTS = [
  { label: 'Footwear: 40% OFF Sneakers', brand: 'Flipkart', desc: 'Flipkart: 40% OFF on every sneakers, athletic running shoes' },
  { label: 'Tech: Smartphone Launch', brand: 'TechNova', desc: 'TechNova: Premium smartphone launch with curved OLED display' },
  { label: 'Food: Chocolate Cake', brand: 'Sweet Delight', desc: 'Sweet Delight: Special chocolate cake promotion, rich dark ganache' },
  { label: 'Fashion: Summer Collection', brand: 'Urban Style', desc: 'Urban Style: New summer clothing collection with lightweight linen' },
  { label: 'Health: World Health Awareness', brand: 'HealthCare Plus', desc: 'HealthCare Plus: World Health Awareness preventive care checkup' },
  { label: 'Education: Admissions Open', brand: 'Future Academy', desc: 'Future Academy: Admissions Open 2027 university degree batches' },
  { label: 'Real Estate: Luxury Apartments', brand: 'Prime Homes', desc: 'Prime Homes: Luxury apartment launch with private terrace' },
  { label: 'Festival: Diwali Special Sale', brand: 'Flipkart', desc: 'Flipkart: Diwali special shopping sale with festive hampers and clay diyas' },
];

// ── Pipeline Stages ───────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { id: 'understand', icon: Bot,      label: 'Analyzing campaign context & extracting hero visual...' },
  { id: 'research',   icon: Search,   label: 'Synthesizing brand palette & typography hierarchy...' },
  { id: 'generate',   icon: Sparkles, label: 'Generating authentic commercial advertising scene...' },
  { id: 'compose',    icon: Layers,   label: 'Compositing high-impact marketing typography & logo...' },
];

// Helper: draw rounded rectangles on canvas
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper: word-wrapped text on canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
  return curY + lineHeight;
}

export const ImageGenerationPage = () => {
  // Campaign inputs
  const [description, setDescription] = useState('');
  const [sizeKey, setSizeKey]         = useState('square');
  const [style, setStyle]             = useState('Modern Commercial Studio');
  const [layout, setLayout]           = useState('product-focused');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Editable Poster Text & Branding
  const [headline, setHeadline]       = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [offer, setOffer]             = useState('');
  const [cta, setCta]                 = useState('Shop Now →');
  const [brandName, setBrandName]     = useState('');
  const [website, setWebsite]         = useState('');
  const [logoUrl, setLogoUrl]         = useState('');

  // Execution states
  const [pipelineStage, setPipelineStage] = useState(-1);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const [imgLoaded, setImgLoaded]         = useState(false);
  const [activeTab, setActiveTab]         = useState('preview'); // 'preview' | 'edit' | 'specs'
  const [downloading, setDownloading]     = useState(false);

  const selectedSize = SIZE_PRESETS.find(s => s.key === sizeKey) || SIZE_PRESETS[0];

  // ── Unified Poster Generation Handler ───────────────────────────────────────
  const handleGenerate = async (overrides = {}) => {
    const desc = (overrides.description !== undefined ? overrides.description : description).trim();
    if (!desc) {
      setError('Please describe your campaign or marketing offer.');
      return;
    }

    setLoading(true);
    setError(null);
    setImgLoaded(false);
    setPipelineStage(0);

    try {
      setPipelineStage(1);

      const targetStyle = overrides.style || style;
      const targetSize = overrides.sizeKey || sizeKey;

      const payload = {
        description: desc,
        style: targetStyle,
        size: targetSize,
        additionalInstructions,
        customHeadline: overrides.headline || headline,
        customSubtext: overrides.subheadline || subheadline,
        customOffer: overrides.offer || offer,
        customCta: overrides.cta || cta,
        seed: overrides.seed || Math.floor(Math.random() * 999999),
      };

      setPipelineStage(2);

      // Call backend poster engine
      const res = await api.generateIntelligentPoster(payload);
      const data = res?.data ?? res;

      if (!data?.imageUrl) {
        throw new Error('Image generator returned no visual output. Please check provider configuration.');
      }

      setPipelineStage(3);

      const resolvedData = {
        ...data,
        imageUrl: api.resolveImageUrl(data.fullImageUrl || data.imageUrl),
      };

      setResult(resolvedData);

      // Synchronize editable copy from authoritative AI analysis
      if (data.designSpec) {
        setHeadline((data.designSpec.headline || overrides.headline || headline || '').replace(/\s*\.{3,}$/, ''));
        setSubheadline((data.designSpec.subheadline || overrides.subheadline || subheadline || '').replace(/\s*\.{3,}$/, ''));
        setOffer(data.designSpec.offer || overrides.offer || offer || '');
        setCta(data.designSpec.cta || overrides.cta || cta || 'Shop Now →');
        setBrandName(data.designSpec.brandName || overrides.brandName || brandName || '');
        setWebsite(data.designSpec.officialWebsite || website || '');
        if (data.designSpec.layout) setLayout(data.designSpec.layout);
      }
      if (data.logoResult?.logoUrl) {
        setLogoUrl(data.logoResult.logoUrl);
      }

    } catch (err) {
      console.error('[PosterEngine] Generation error:', err);
      const msg = err?.data?.message || err?.message || 'Failed to generate visual. Please configure an image provider.';
      setError(msg);
    } finally {
      setLoading(false);
      setPipelineStage(-1);
    }
  };

  // ── Regenerate with New Variation Seed ──────────────────────────────────────
  const handleRegenerateBackground = () => {
    const newSeed = Math.floor(Math.random() * 999999);
    handleGenerate({ seed: newSeed });
  };

  // ── Download Pure AI Hero Visual (Original) ─────────────────────────────────
  const handleDownloadOriginalVisual = async () => {
    if (!result?.imageUrl) return;
    try {
      const a = document.createElement('a');
      a.href = result.imageUrl;
      a.download = `${(brandName || 'zenvora').toLowerCase().replace(/[^a-z0-9]/g, '-')}-hero-visual.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(result.imageUrl, '_blank');
    }
  };

  // ── Download Full Composed HD Poster via Canvas ─────────────────────────────
  const handleDownloadHDPoster = async () => {
    if (!result?.imageUrl) return;
    setDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = selectedSize.width;
      const height = selectedSize.height;

      canvas.width = width;
      canvas.height = height;

      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = () => {
          bgImg.crossOrigin = null;
          bgImg.src = result.imageUrl;
          bgImg.onload = resolve;
          bgImg.onerror = reject;
        };
        bgImg.src = result.imageUrl;
      });

      // 1. Draw Background
      ctx.drawImage(bgImg, 0, 0, width, height);

      // 2. High-Contrast Gradient Scrims
      const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
      topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      topGrad.addColorStop(0.6, 'rgba(0,0,0,0.4)');
      topGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, height * 0.35);

      const botGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
      botGrad.addColorStop(0, 'rgba(0,0,0,0)');
      botGrad.addColorStop(0.4, 'rgba(0,0,0,0.75)');
      botGrad.addColorStop(0.8, 'rgba(0,0,0,0.95)');
      botGrad.addColorStop(1, 'rgba(0,0,0,0.98)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);

      const pad = width * 0.06;
      const effectiveBrand = brandName || result.designSpec?.brandName || 'BRAND';

      // 3. Brand Pill (Top Left)
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(width * 0.038)}px "Inter", sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(effectiveBrand.toUpperCase(), pad, pad + 15);

      // 4. Offer Pill (Top Right)
      const effectiveOffer = offer || result.designSpec?.offer;
      if (effectiveOffer) {
        ctx.font = `bold ${Math.round(width * 0.026)}px "Inter", sans-serif`;
        const textWidth = ctx.measureText(effectiveOffer.toUpperCase()).width;
        const bX = width - pad - textWidth - 36;
        const bY = pad;
        ctx.fillStyle = '#F59E0B'; // Amber Gold
        roundRect(ctx, bX, bY, textWidth + 36, 36, 8);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.fillText(effectiveOffer.toUpperCase(), bX + 18, bY + 18);
      }

      // 5. Headline (Bottom Section)
      const displayHeadline = headline || result.designSpec?.headline || description;
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(width * 0.062)}px "Inter", sans-serif`;
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      const headlineY = height * 0.65;
      wrapText(ctx, displayHeadline.toUpperCase(), pad, headlineY, width - pad * 2, Math.round(width * 0.075));

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 6. Subheadline
      const displaySub = subheadline || result.designSpec?.subheadline;
      if (displaySub) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = `500 ${Math.round(width * 0.03)}px "Inter", sans-serif`;
        wrapText(ctx, displaySub, pad, height * 0.79, width - pad * 2, Math.round(width * 0.042));
      }

      // 7. CTA Button (Bottom Left)
      const displayCta = cta || result.designSpec?.cta || 'Shop Now →';
      ctx.font = `bold ${Math.round(width * 0.03)}px "Inter", sans-serif`;
      const ctaWidth = ctx.measureText(displayCta).width;
      const ctaBtnW = ctaWidth + 40;
      const ctaBtnH = 48;
      const ctaBtnY = height - pad - ctaBtnH;

      ctx.fillStyle = '#7657F6'; // Brand Electric Violet
      roundRect(ctx, pad, ctaBtnY, ctaBtnW, ctaBtnH, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayCta, pad + 20, ctaBtnY + 24);

      // 8. Website (Bottom Right)
      const displayWeb = website || result.designSpec?.officialWebsite || 'zenvora.ai';
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = `600 ${Math.round(width * 0.024)}px "Inter", sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(displayWeb, width - pad, ctaBtnY + 24);
      ctx.textAlign = 'left';

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `${effectiveBrand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-campaign-poster.png`;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err) {
      console.error('HD Poster Download Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="text-brand-violet" size={24} />
            AI Poster &amp; Creative Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate authentic commercial advertising imagery and composite professional brand posters in real time.
          </p>
        </div>

        {/* Model Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Google Imagen 3 &amp; FLUX.1 Engine
          </span>
        </div>
      </div>

      {/* Error Notice */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Creative Generation Notice</p>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}

      {/* Main Grid: Control Form (5 cols) + Poster Preview & Layouts (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: Campaign Generator Controls ── */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4 shadow-2xs border border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-brand-violet" />
              Campaign Configuration
            </h2>

            {/* Campaign Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Campaign Description / Message Hook <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Flipkart: 40% OFF on every sneakers, premium streetwear footwear launch"
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Aspect Ratio / Size Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Aspect Ratio &amp; Target Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {SIZE_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setSizeKey(p.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      sizeKey === p.key
                        ? 'border-brand-violet bg-brand-violet/5 ring-1 ring-brand-violet shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Commercial Visual Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              >
                {DESIGN_STYLES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Additional Creative Direction */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lighting &amp; Composition Notes <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. dramatic rim lighting, soft smoke haze, vibrant colors"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet placeholder:text-slate-400"
              />
            </div>

            {/* Generate Action Button */}
            <Button
              onClick={() => handleGenerate()}
              disabled={loading || !description.trim()}
              className="w-full justify-center py-3 text-xs font-bold shadow-md shadow-brand-violet/25"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin mr-2" />
                  Generating Commercial Creative...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="mr-2" />
                  Generate AI Poster &amp; Visual
                </>
              )}
            </Button>
          </Card>

          {/* Quick Demo Prompts */}
          <Card className="p-4 space-y-2.5 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click Industry Test Cases:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => {
                    setDescription(ex.desc);
                    handleGenerate({ description: ex.desc, brandName: ex.brand });
                  }}
                  className="text-[11px] bg-slate-100 hover:bg-brand-violet/10 hover:text-brand-violet hover:border-brand-violet/30 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg transition-colors font-medium"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Live Composition Canvas & User Controls ── */}
        <div className="lg:col-span-7 space-y-4">

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'preview' ? 'bg-brand-violet text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Poster Preview
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'edit' ? 'bg-brand-violet text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Edit3 size={13} />
                Edit Poster Copy
              </button>
            </div>

            {/* Interactive User Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerateBackground}
                disabled={loading || !result}
                title="Regenerate background with fresh AI variation"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Regenerate</span>
              </button>

              <button
                onClick={handleDownloadOriginalVisual}
                disabled={!result || downloading}
                title="Download original hero image"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                <Download size={13} />
                <span>Original</span>
              </button>

              <button
                onClick={handleDownloadHDPoster}
                disabled={!result || downloading}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90 transition-all shadow-xs disabled:opacity-40"
              >
                {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                <span>Download HD Poster</span>
              </button>
            </div>
          </div>

          {/* Flexible Layout Selector Bar */}
          {result && (
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-2xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
                <Layout size={12} /> Layout:
              </span>
              {POSTER_LAYOUTS.map((ly) => (
                <button
                  key={ly.id}
                  type="button"
                  onClick={() => setLayout(ly.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                    layout === ly.id
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium'
                  }`}
                >
                  <span>{ly.icon}</span>
                  <span>{ly.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Pipeline Loading State */}
          {loading && (
            <Card className="p-8 text-center space-y-4 border border-slate-200">
              <RefreshCw size={32} className="animate-spin text-brand-violet mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {PIPELINE_STAGES[pipelineStage]?.label || 'Generating AI Advertising Poster...'}
                </p>
                <p className="text-xs text-slate-400">
                  Synthesizing genuine commercial photography and compositing high-impact typography.
                </p>
              </div>
            </Card>
          )}

          {/* TAB 1: Live Composited Advertising Poster */}
          {!loading && activeTab === 'preview' && (
            <div className="flex justify-center bg-slate-900/5 p-4 sm:p-6 rounded-2xl border border-slate-200">
              {result?.imageUrl ? (
                <div
                  className={`w-full max-w-md ${selectedSize.aspect} relative rounded-2xl overflow-hidden shadow-2xl border border-slate-300 bg-slate-950 flex flex-col justify-between select-none group`}
                >
                  {/* Real AI Visual Image */}
                  <img
                    src={result.imageUrl}
                    alt={description}
                    onLoad={() => setImgLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      imgLoaded ? 'opacity-100' : 'opacity-30'
                    }`}
                  />

                  {/* Gradient Scrims for Guaranteed Readability */}
                  <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10 pointer-events-none" />

                  {/* Top Section: Brand Pill & Offer */}
                  <div className="relative z-20 p-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-lg">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt=""
                          className="w-4 h-4 rounded-full bg-white p-0.5 object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-brand-violet text-white text-[9px] flex items-center justify-center font-bold">
                          {(brandName || 'B').charAt(0)}
                        </span>
                      )}
                      <span className="text-xs font-bold tracking-wide">
                        {brandName || 'ZENVORA'}
                      </span>
                    </div>

                    {offer && (
                      <div className="px-3.5 py-1 rounded-md bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md">
                        {offer}
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: Headline, Subheadline & CTA */}
                  <div className="relative z-20 p-6 space-y-2.5 pt-12">
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                      {headline || description}
                    </h3>

                    {subheadline && (
                      <p className="text-xs text-white/90 font-medium leading-relaxed drop-shadow-sm line-clamp-2">
                        {subheadline}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-violet text-white font-bold text-xs shadow-md shadow-brand-violet/40">
                        {cta || 'Shop Now →'}
                      </span>

                      <span className="text-[11px] text-white/60 font-mono font-semibold tracking-wide">
                        {website || 'zenvora.ai'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center space-y-3 text-slate-400">
                  <ImageIcon size={44} className="mx-auto opacity-30 text-brand-violet" />
                  <p className="text-sm font-bold text-slate-700">No Creative Generated Yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select an industry test case on the left or enter your campaign description to generate authentic commercial posters.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Live Copy & Branding Editor */}
          {!loading && activeTab === 'edit' && (
            <Card className="p-5 space-y-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Edit3 size={14} className="text-brand-violet" />
                Customize Poster Typography &amp; Badges (Live Update)
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Promotional Offer Badge</label>
                  <input
                    type="text"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-amber-600 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Main Advertising Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subheadline / Value Proposition</label>
                  <textarea
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Call-To-Action (CTA)</label>
                    <input
                      type="text"
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPage;

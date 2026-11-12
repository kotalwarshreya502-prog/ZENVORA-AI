import {
  AlertTriangle, Bot, Check, Download, ExternalLink,
  Image, RefreshCw, Sparkles, X
} from 'lucide-react';
import React, { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

const STYLES = [
  'Modern Professional',
  'Bold & Vibrant',
  'Minimal Clean',
  'Luxury Premium',
  'Playful Creative',
  'Corporate Blue',
];

const DIMENSION_PRESETS = [
  { label: 'Square 1024×1024 (Instagram)', width: 1024, height: 1024 },
  { label: 'Landscape 1200×627 (LinkedIn)', width: 1200, height: 627 },
  { label: 'Portrait 1080×1350 (Instagram Story)', width: 1080, height: 1350 },
  { label: 'Wide 1600×900 (Twitter/YouTube)', width: 1600, height: 900 },
];

export const ImageGenerationPage = () => {
  // FRESH empty state — no pre-filled content
  const [formData, setFormData] = useState({
    campaignTitle: '',
    brandName: '',
    productService: '',
    targetAudience: '',
    offer: '',
    keywords: '',
    style: 'Modern Professional',
    dimensionPreset: 'Square 1024×1024 (Instagram)',
    width: 1024,
    height: 1024,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);       // null = no generation yet
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [history, setHistory] = useState([]);       // session-only history

  const handleDimensionChange = (e) => {
    const preset = DIMENSION_PRESETS.find(d => d.label === e.target.value);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        dimensionPreset: preset.label,
        width: preset.width,
        height: preset.height,
      }));
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!formData.campaignTitle.trim() && !formData.productService.trim()) {
      setError('Please enter at least a Campaign Title or Product / Service to generate an image.');
      return;
    }
    setError(null);
    setImgError(false);
    setLoading(true);

    try {
      const res = await api.generatePosterImage({
        campaignTitle: formData.campaignTitle,
        brandName: formData.brandName,
        productService: formData.productService,
        targetAudience: formData.targetAudience,
        offer: formData.offer,
        keywords: formData.keywords,
        style: formData.style,
        width: formData.width,
        height: formData.height,
      });
      setResult(res);
      // Prepend to session history (keep last 12)
      setHistory(prev => [
        { ...res, label: formData.campaignTitle || formData.productService || 'Untitled', id: Date.now() },
        ...prev,
      ].slice(0, 12));
    } catch (err) {
      setError(err?.message || 'Image generation failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, children) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      {children}
    </div>
  );

  const selectClass = "w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet";
  const inputClass = "w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="teal" size="sm">AI Image Generation</Badge>
          <span className="text-xs text-slate-400">• Using Pollinations.ai free image generation</span>
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight mt-1">Poster Generator</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Create real AI-generated marketing images and posters. Powered by Pollinations.ai — no credits needed.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 hover:text-rose-900">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            {field('Campaign Title',
              <input
                type="text"
                value={formData.campaignTitle}
                onChange={e => setFormData({ ...formData, campaignTitle: e.target.value })}
                placeholder="e.g. Summer Sale 2025, Grand Opening..."
                className={inputClass}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              {field('Brand Name',
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="e.g. ZENVORA"
                  className={inputClass}
                />
              )}
              {field('Product / Service *',
                <input
                  type="text"
                  value={formData.productService}
                  onChange={e => setFormData({ ...formData, productService: e.target.value })}
                  placeholder="e.g. AI Marketing Suite"
                  className={inputClass}
                />
              )}
            </div>

            {field('Target Audience',
              <input
                type="text"
                value={formData.targetAudience}
                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g. Entrepreneurs, 25-40, tech-savvy"
                className={inputClass}
              />
            )}

            {field('Special Offer / Tagline',
              <input
                type="text"
                value={formData.offer}
                onChange={e => setFormData({ ...formData, offer: e.target.value })}
                placeholder="e.g. 50% off, Free trial, Limited time"
                className={inputClass}
              />
            )}

            {field('Keywords (comma separated)',
              <input
                type="text"
                value={formData.keywords}
                onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="e.g. bold, modern, tech, blue"
                className={inputClass}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              {field('Visual Style',
                <select
                  value={formData.style}
                  onChange={e => setFormData({ ...formData, style: e.target.value })}
                  className={selectClass}
                >
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              )}
              {field('Dimensions',
                <select
                  value={formData.dimensionPreset}
                  onChange={handleDimensionChange}
                  className={selectClass}
                >
                  {DIMENSION_PRESETS.map(d => <option key={d.label}>{d.label}</option>)}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              <span className="font-bold text-slate-500">Size:</span>
              <span>{formData.width} × {formData.height}px</span>
              <span className="ml-auto text-slate-300">•</span>
              <a
                href="https://image.pollinations.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-brand-teal hover:underline"
              >
                Pollinations.ai <ExternalLink size={9} />
              </a>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1 font-bold shadow-md shadow-brand-violet/25"
              >
                {loading
                  ? <><RefreshCw size={14} className="animate-spin" /><span>Generating...</span></>
                  : <><Sparkles size={14} className="text-brand-teal" /><span>Generate Image</span></>
                }
              </Button>
              {result && !loading && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleGenerate}
                  title="Regenerate with same params"
                  className="px-3"
                >
                  <RefreshCw size={14} />
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Right: Output */}
        <Card className="lg:col-span-7 p-6 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-brand-violet" />
              <span className="font-bold text-sm text-brand-navy">Generated Image</span>
              {result?.model && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                  {result.model}
                </span>
              )}
            </div>
            {result?.imageUrl && !imgError && (
              <div className="flex items-center gap-1.5">
                <a
                  href={result.imageUrl}
                  download="zenvora-poster.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1 transition-colors"
                >
                  <Download size={13} />
                  <span className="text-[11px]">Download</span>
                </a>
                <a
                  href={result.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span className="text-[11px]">Open</span>
                </a>
              </div>
            )}
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                {/* Loading skeleton */}
                <div className="w-full max-w-sm aspect-square bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center">
                  <Image size={48} className="text-slate-200" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-xs text-slate-500">
                    Rendering your poster via Pollinations.ai…
                  </p>
                  <p className="text-[10px] text-slate-400">This may take 10–30 seconds for high-res images</p>
                </div>
              </div>
            ) : result ? (
              <>
                {imgError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-400">
                    <AlertTriangle size={32} className="text-amber-400" />
                    <p className="text-xs text-slate-500 text-center max-w-xs">
                      The image could not be loaded. This can happen with cross-origin restrictions.
                      Try opening the image directly.
                    </p>
                    <a
                      href={result.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-violet hover:underline flex items-center gap-1"
                    >
                      Open image URL <ExternalLink size={11} />
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                      <img
                        src={result.imageUrl}
                        alt={formData.campaignTitle || 'Generated marketing poster'}
                        className="w-full h-auto object-contain max-h-[420px]"
                        onError={() => setImgError(true)}
                      />
                    </div>
                    <div className="w-full text-[10px] text-slate-400 flex items-center justify-between">
                      <span>
                        Generated {result.generatedAt ? new Date(result.generatedAt).toLocaleTimeString() : 'just now'}
                        {result.width && result.height && ` • ${result.width}×${result.height}px`}
                      </span>
                      {result.model && <span>via {result.model}</span>}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
                <Image size={40} className="opacity-30" />
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Fill in your campaign details and click Generate Image to create a real AI poster.
                </p>
                <span className="text-[10px] text-slate-300 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                  Powered by Pollinations.ai — free & real AI generation
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Session History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-brand-navy">Session History</h2>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {history.length} image{history.length !== 1 ? 's' : ''} this session
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.map(item => (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square cursor-pointer hover:border-brand-violet/40 transition-colors"
              >
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <a
                    href={item.imageUrl}
                    download={`zenvora-poster-${item.id}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] text-white bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition-colors"
                  >
                    <Download size={10} /> Download
                  </a>
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] text-white bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition-colors"
                  >
                    <ExternalLink size={10} /> View
                  </a>
                </div>
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-brand-navy/70 to-transparent">
                  <p className="text-[9px] text-white truncate font-medium">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Session history is temporary and will clear on page refresh.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerationPage;

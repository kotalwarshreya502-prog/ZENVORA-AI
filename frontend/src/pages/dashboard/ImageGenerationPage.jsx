/**
 * ZENVORA AI — Universal Intelligent Poster Generation Engine
 * User enters any description → AI researches → generates professional poster.
 * Works for ANY brand, ANY industry, ANY topic, ANY event.
 */

import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Layers,
  Palette,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

// ── Size presets ──────────────────────────────────────────────────────────────
const SIZE_PRESETS = [
  { key: 'square',    label: 'Square',    sub: '1024×1024',  icon: '⬜', hint: 'Instagram, Facebook' },
  { key: 'portrait',  label: 'Portrait',  sub: '1080×1350',  icon: '📱', hint: 'Instagram Story-style' },
  { key: 'landscape', label: 'Landscape', sub: '1200×627',   icon: '🖥️',  hint: 'LinkedIn, Twitter' },
  { key: 'story',     label: 'Story',     sub: '1080×1920',  icon: '📲', hint: 'Stories / Reels' },
  { key: 'wide',      label: 'Wide',      sub: '1600×900',   icon: '🖼️',  hint: 'YouTube, Twitter' },
  { key: 'a4',        label: 'A4',        sub: '794×1123',   icon: '📄', hint: 'Print / PDF' },
];

// ── Design styles ─────────────────────────────────────────────────────────────
const DESIGN_STYLES = [
  'Modern Professional',
  'Bold & Vibrant',
  'Minimal Clean',
  'Luxury Premium',
  'Playful Creative',
  'Festive & Colorful',
  'Dark & Dramatic',
  'Pastel Soft',
  'Corporate Blue',
  'Nature & Earth',
];

// ── Example prompts ───────────────────────────────────────────────────────────
const EXAMPLE_PROMPTS = [
  'Flipkart Diwali Sale',
  'Nike Running Shoes Launch',
  'Samsung Galaxy New Product Launch',
  'Pune Coaching Classes Admission Open',
  'Organic Skincare Product Launch',
  'Restaurant Weekend Special Offer',
  'World Environment Day',
  'Real Estate Luxury Apartments',
  'College Annual Tech Festival',
  'New Technology Startup Launch',
  'Independence Day Celebration',
  'Apple iPhone Advertisement',
];

// ── Pipeline stage definitions ────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { id: 'analyze',   icon: Bot,    label: 'Understanding your request...' },
  { id: 'research',  icon: Search, label: 'Researching brand & topic...' },
  { id: 'design',    icon: Layers, label: 'Designing poster layout...' },
  { id: 'generate',  icon: Sparkles, label: 'Generating AI visuals...' },
  { id: 'finalize',  icon: Zap,    label: 'Finalizing poster...' },
];

// ── Design Spec Card ──────────────────────────────────────────────────────────
function DesignSpecCard({ designSpec, analysis }) {
  if (!designSpec && !analysis) return null;
  const spec = designSpec || {};
  const an   = analysis || {};

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
        <Layers size={15} />
        Design Intelligence
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {(an.brandName || spec.brandName) && (
          <InfoRow icon={<Tag size={13} />} label="Brand" value={an.brandName || spec.brandName} />
        )}
        {(an.industry || spec.industry) && (
          <InfoRow icon={<Globe size={13} />} label="Industry" value={an.industry || spec.industry} />
        )}
        {(an.category || spec.detectedCategory) && (
          <InfoRow icon={<Layers size={13} />} label="Category" value={an.category || spec.detectedCategory} />
        )}
        {(an.mood || spec.mood) && (
          <InfoRow icon={<Palette size={13} />} label="Mood" value={an.mood || spec.mood} />
        )}
        {(an.targetAudience || spec.targetAudience) && (
          <InfoRow icon={<Users size={13} />} label="Audience" value={an.targetAudience || spec.targetAudience} />
        )}
        {(an.posterType || spec.posterType) && (
          <InfoRow icon={<Target size={13} />} label="Poster Type" value={(an.posterType || spec.posterType).replace(/-/g, ' ')} />
        )}
      </div>
      {(an.headline || spec.headline) && (
        <div className="rounded-lg bg-white/5 p-3 space-y-1">
          <p className="text-xs text-white/50 uppercase tracking-wider">AI Generated Copy</p>
          <p className="text-white font-semibold">"{an.headline || spec.headline}"</p>
          {(an.subheadline || spec.subheadline) && (
            <p className="text-white/60 text-sm">{an.subheadline || spec.subheadline}</p>
          )}
          {(an.cta || spec.cta) && (
            <span className="inline-block mt-1 bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full border border-indigo-400/30">
              CTA: {an.cta || spec.cta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-white/40 mt-0.5">{icon}</span>
      <div>
        <p className="text-white/40 text-xs">{label}</p>
        <p className="text-white/80 capitalize">{value}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export const ImageGenerationPage = () => {
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('square');
  const [style, setStyle] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [pipelineStage, setPipelineStage] = useState(-1); // -1 = idle
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Edit panel state
  const [editHeadline, setEditHeadline] = useState('');
  const [editSubtext, setEditSubtext] = useState('');
  const [editCta, setEditCta] = useState('');
  const [editMode, setEditMode] = useState(false);

  // History (session-only)
  const [history, setHistory] = useState([]);

  const imgRef = useRef(null);

  const selectExample = (prompt) => {
    setDescription(prompt);
    setResult(null);
    setError(null);
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const handleGenerate = async (overrides = {}) => {
    const desc = overrides.description || description;
    if (!desc.trim()) {
      setError('Please describe what you want to generate.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setImgLoaded(false);
    setImgError(false);
    setPipelineStage(0); // "Understanding..."

    try {
      await sleep(400);
      setPipelineStage(1); // "Researching..."

      const payload = {
        description: desc.trim(),
        style: overrides.style || style,
        size: overrides.size || size,
        additionalInstructions,
        customHeadline: overrides.customHeadline || editHeadline || '',
        customSubtext: overrides.customSubtext || editSubtext || '',
        customCta: overrides.customCta || editCta || '',
      };

      await sleep(500);
      setPipelineStage(2); // "Designing..."

      // Call the intelligent poster endpoint
      const res = await api.generateIntelligentPoster(payload);

      setPipelineStage(3); // "Generating AI visuals..."

      const data = res.data || res;
      if (!data.imageUrl) throw new Error('No image URL returned from server');

      // Set initial edit values from AI analysis
      if (data.analysis) {
        setEditHeadline(data.analysis.headline || '');
        setEditSubtext(data.analysis.subheadline || '');
        setEditCta(data.analysis.cta || '');
      }

      setPipelineStage(4); // "Finalizing..."
      await sleep(300);

      setResult(data);

      // Add to session history
      setHistory(prev => [
        { id: Date.now(), description: desc, imageUrl: data.imageUrl, thumb: data.imageUrl },
        ...prev.slice(0, 11),
      ]);
    } catch (err) {
      console.error('[PosterGen] Error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Generation failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
      setPipelineStage(-1);
    }
  };

  const handleRegenerate = () => {
    handleGenerate({
      customHeadline: editHeadline,
      customSubtext: editSubtext,
      customCta: editCta,
    });
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    window.open(result.imageUrl, '_blank');
  };

  const currentStage = pipelineStage >= 0 ? PIPELINE_STAGES[pipelineStage] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-4 py-2 rounded-full text-indigo-300 text-sm">
            <Sparkles size={15} />
            Universal AI Poster Generator
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Describe anything.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Get a stunning poster.
            </span>
          </h1>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Works for any brand, product, event, campaign or idea. AI researches the topic and designs a professional poster automatically.
          </p>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT — Input Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5 space-y-4">
              {/* Main description textarea */}
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Describe your poster
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Flipkart Diwali Sale, Nike Running Shoes Launch, Pune Coaching Classes Admission Open, World Environment Day..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60 resize-y text-sm"
                  onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleGenerate()}
                />
                <p className="text-xs text-white/30 mt-1">Ctrl+Enter to generate</p>
              </div>

              {/* Size selector */}
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Poster Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {SIZE_PRESETS.map(preset => (
                    <button
                      key={preset.key}
                      onClick={() => setSize(preset.key)}
                      className={`p-2 rounded-lg border text-center transition-all text-xs ${
                        size === preset.key
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                          : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'
                      }`}
                    >
                      <div className="text-base mb-0.5">{preset.icon}</div>
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-white/40">{preset.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced options */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Design Style (optional)</label>
                      <select
                        value={style}
                        onChange={e => setStyle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-400/60"
                      >
                        <option value="">Auto (AI chooses best style)</option>
                        {DESIGN_STYLES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Additional Instructions (optional)</label>
                      <input
                        type="text"
                        value={additionalInstructions}
                        onChange={e => setAdditionalInstructions(e.target.value)}
                        placeholder="e.g. include Indian festival elements, blue color scheme..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-400/60"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Generate button */}
              <Button
                onClick={() => handleGenerate()}
                disabled={loading || !description.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    {currentStage?.label || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Research &amp; Generate Poster
                  </>
                )}
              </Button>
            </Card>

            {/* Example prompts */}
            <Card className="p-4">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Try an example</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map(ex => (
                  <button
                    key={ex}
                    onClick={() => selectExample(ex)}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/90 px-3 py-1.5 rounded-full transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT — Output Panel */}
          <div className="lg:col-span-3 space-y-4">

            {/* Loading pipeline */}
            {loading && (
              <Card className="p-6">
                <div className="space-y-3">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const isDone    = i < pipelineStage;
                    const isActive  = i === pipelineStage;
                    const isPending = i > pipelineStage;
                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isActive  ? 'bg-indigo-500/20 border border-indigo-400/30' :
                          isDone    ? 'bg-green-500/10 border border-green-500/20' :
                                      'opacity-30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-indigo-500/30' :
                          isDone   ? 'bg-green-500/20'  : 'bg-white/5'
                        }`}>
                          {isDone ? (
                            <span className="text-green-400 text-sm">✓</span>
                          ) : (
                            <Icon size={15} className={isActive ? 'text-indigo-300 animate-pulse' : 'text-white/40'} />
                          )}
                        </div>
                        <span className={`text-sm ${
                          isActive ? 'text-indigo-200 font-medium' :
                          isDone   ? 'text-green-300'              : 'text-white/40'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-white/30 text-center mt-4">
                  AI is researching and generating your poster. This takes 10–30 seconds.
                </p>
              </Card>
            )}

            {/* Error state */}
            {error && !loading && (
              <Card className="p-6">
                <div className="flex items-start gap-3 text-red-300">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Generation Failed</p>
                    <p className="text-sm text-white/50 mt-1">{error}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleGenerate()}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <RefreshCw size={14} className="mr-2" /> Try Again
                </Button>
              </Card>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="space-y-4">

                {/* Poster image */}
                <Card className="p-4">
                  <div className="relative rounded-xl overflow-hidden bg-black/30 min-h-64 flex items-center justify-center">
                    {!imgLoaded && !imgError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40">
                        <ImageIcon size={32} className="animate-pulse" />
                        <span className="text-sm">Loading image from AI...</span>
                        <p className="text-xs text-white/25">Pollinations.ai can take 15–30s to render</p>
                      </div>
                    )}
                    {imgError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40 p-6 text-center">
                        <AlertTriangle size={28} />
                        <p className="text-sm">Image preview blocked by browser security.</p>
                        <a
                          href={result.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 underline text-sm flex items-center gap-1 hover:text-indigo-300"
                        >
                          Open full image in new tab <ExternalLink size={13} />
                        </a>
                      </div>
                    )}
                    <img
                      ref={imgRef}
                      src={result.imageUrl}
                      alt={description}
                      onLoad={() => setImgLoaded(true)}
                      onError={() => setImgError(true)}
                      className={`w-full max-h-[600px] object-contain rounded-lg transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download size={14} className="mr-2" /> Download / Open
                    </Button>
                    <a
                      href={result.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 rounded-lg px-3 py-2 transition-all"
                    >
                      <ExternalLink size={13} /> Full Size
                    </a>
                    <Button onClick={handleRegenerate} variant="outline" size="sm">
                      <RefreshCw size={14} className="mr-2" /> Regenerate
                    </Button>
                  </div>
                </Card>

                {/* Design spec */}
                <DesignSpecCard designSpec={result.designSpec} analysis={result.analysis} />

                {/* Edit & Regenerate panel */}
                <Card className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/80">Edit Copy & Regenerate</span>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      {editMode ? 'Hide' : 'Edit'}
                    </button>
                  </div>
                  {editMode && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editHeadline}
                        onChange={e => setEditHeadline(e.target.value)}
                        placeholder="Custom headline..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-400/60"
                      />
                      <input
                        type="text"
                        value={editSubtext}
                        onChange={e => setEditSubtext(e.target.value)}
                        placeholder="Custom subheadline..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-400/60"
                      />
                      <input
                        type="text"
                        value={editCta}
                        onChange={e => setEditCta(e.target.value)}
                        placeholder="Custom CTA (e.g. Shop Now, Learn More)..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-400/60"
                      />
                      <Button onClick={handleRegenerate} size="sm" disabled={loading}>
                        <Sparkles size={14} className="mr-2" /> Regenerate with Edits
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Research info */}
                {result.research && (result.research.brandInfo || result.research.sources?.length > 0) && (
                  <Card className="p-4 space-y-2">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <Search size={12} /> Research Data
                    </p>
                    {result.research.brandInfo && (
                      <p className="text-sm text-white/60">{result.research.brandInfo}</p>
                    )}
                    {result.research.officialWebsite && (
                      <a
                        href={result.research.officialWebsite.startsWith('http') ? result.research.officialWebsite : `https://${result.research.officialWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        <ExternalLink size={11} /> {result.research.officialWebsite}
                      </a>
                    )}
                    {result.research.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.research.sources.slice(0, 3).map((s, i) => (
                          s.url ? (
                            <a
                              key={i}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/70 px-2 py-1 rounded-md transition-all"
                            >
                              {s.title?.substring(0, 30) || 'Source'}
                            </a>
                          ) : (
                            <span key={i} className="text-xs text-white/30 italic">{s.title}</span>
                          )
                        ))}
                      </div>
                    )}
                    {result.logoResult && (
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={result.logoResult.logoUrl}
                          alt="Brand logo"
                          className="w-6 h-6 rounded object-contain bg-white p-0.5"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-xs text-white/40">
                          Logo via {result.logoResult.source}
                        </span>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
              <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
                  <Sparkles size={36} className="text-indigo-400/60" />
                </div>
                <div>
                  <h3 className="text-white/70 font-semibold text-lg">Your poster will appear here</h3>
                  <p className="text-white/40 text-sm mt-1 max-w-xs">
                    Type any description in the left panel. The AI will research the topic and generate a professional poster.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EXAMPLE_PROMPTS.slice(0, 4).map(ex => (
                    <button
                      key={ex}
                      onClick={() => selectExample(ex)}
                      className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 hover:text-indigo-200 px-3 py-1.5 rounded-full transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ── Session History Grid ── */}
        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              Session History ({history.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDescription(item.description);
                    setResult({ imageUrl: item.imageUrl });
                    setImgLoaded(false);
                    setImgError(false);
                  }}
                  className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-indigo-400/40 transition-all aspect-square bg-black/20"
                >
                  <img
                    src={item.thumb}
                    alt={item.description}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationPage;

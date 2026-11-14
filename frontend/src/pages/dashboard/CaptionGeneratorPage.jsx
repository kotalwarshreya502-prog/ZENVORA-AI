import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

const PLATFORMS = ['Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'Facebook', 'X (Twitter)'];
const TONES     = [
  'Conversational & Engaging',
  'Direct & High Energy',
  'Executive & Thoughtful',
  'Witty & Relatable',
  'Promotional & High Urgency',
  'Educational & Informative',
  'Inspiring & Motivational',
];

export const CaptionGeneratorPage = () => {
  const [topic,          setTopic]          = useState('');
  const [brandName,      setBrandName]      = useState('');
  const [industry,       setIndustry]       = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords,       setKeywords]       = useState('');
  const [tone,           setTone]           = useState('Conversational & Engaging');
  const [length,         setLength]         = useState('medium');
  const [platform,       setPlatform]       = useState('Instagram');
  const [loading,        setLoading]        = useState(false);
  const [copiedIndex,    setCopiedIndex]    = useState(null);
  const [error,          setError]          = useState(null);
  const [captions,       setCaptions]       = useState([]);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a post topic or description.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await api.generateCaptions({
        topic,
        platform,
        tone: tone + (length === 'short' ? ' (keep very brief)' : length === 'long' ? ' (write longer, detailed caption)' : ''),
        count: 5,
        brandName:      brandName.trim(),
        industry:       industry.trim(),
        targetAudience: targetAudience.trim(),
        keywords:       keywords.trim(),
      });

      // response is already response.data thanks to axios interceptor
      const payload = response?.data ?? response;
      const caps    = payload?.captions ?? [];

      if (Array.isArray(caps) && caps.length > 0) {
        // Handle both structured {id, style, text, tags} and plain string arrays
        const normalized = caps.map((c, i) => {
          if (typeof c === 'string') {
            const tagMatch = c.match(/#\S+(\s+#\S+)*/);
            const tags     = tagMatch ? tagMatch[0].trim() : '';
            const text     = c.replace(tags, '').trim();
            return { id: i + 1, style: `Variation ${i + 1}`, text, tags };
          }
          return { id: c.id || i + 1, style: c.style || `Variation ${i + 1}`, text: c.text || c, tags: c.tags || '' };
        });
        setCaptions(normalized);
      } else if (payload?.content) {
        // If returned as single content string
        const chunks = payload.content.split(/\n{2,}/).filter(Boolean);
        setCaptions(chunks.slice(0, 5).map((c, i) => ({
          id: i + 1, style: `Variation ${i + 1}`,
          text: c.replace(/#\S+/g, '').trim(),
          tags: (c.match(/#\S+/g) || []).join(' '),
        })));
      } else {
        setError('No captions were generated. Please try again.');
      }
    } catch (err) {
      console.error('Caption generation error:', err);
      setError(err?.message || 'Caption generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, tags, index) => {
    const full = tags ? `${text}\n\n${tags}` : text;
    navigator.clipboard.writeText(full);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const inputCls = 'w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet bg-white';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="text-brand-violet" size={24} />
          Multi-Angle Caption Studio
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate 5 distinct caption styles for any brand, topic, and platform.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs h-fit space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Post Topic or Visual Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. New product launch, Summer sale announcement, Behind-the-scenes at our bakery..."
                rows={3}
                required
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Flipkart, Zomato, Nike"
                className={inputCls}
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. E-commerce, Healthcare, Fashion"
                className={inputCls}
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Young professionals 25-35"
                className={inputCls}
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. sale, discount, limited time"
                className={inputCls}
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputCls}>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Length</label>
              <div className="grid grid-cols-3 gap-2">
                {['short', 'medium', 'long'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`py-2 text-xs font-medium rounded-lg border text-center capitalize transition-all ${
                      length === l
                        ? 'border-brand-violet bg-brand-violet/10 text-brand-violet font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full py-3 px-4 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md shadow-brand-violet/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><RefreshCw className="animate-spin" size={16} /> Generating 5 Captions...</>
              ) : (
                <><Sparkles size={16} /> Generate 5 Captions</>
              )}
            </button>
          </form>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {captions.length > 0 ? `Generated Variations (${captions.length})` : 'Caption Variations will appear here'}
            </span>
            {captions.length > 0 && (
              <span className="text-xs text-slate-400">Click any card to copy with hashtags</span>
            )}
          </div>

          {/* Empty state */}
          {!loading && captions.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center gap-3 text-slate-300">
              <MessageSquare size={36} className="opacity-30" />
              <p className="text-xs text-slate-400 text-center max-w-xs">
                Enter your topic, brand, and platform — then click Generate to create 5 unique caption variations.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center gap-3">
              <RefreshCw size={28} className="animate-spin text-brand-violet" />
              <p className="text-xs text-slate-500">Generating 5 unique caption angles for &ldquo;{topic}&rdquo;...</p>
            </div>
          )}

          {/* Captions */}
          {!loading && captions.map((c, idx) => (
            <div
              key={c.id || idx}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-violet/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-brand-violet uppercase tracking-wider bg-brand-violet/5 px-2.5 py-0.5 rounded-full border border-brand-violet/10">
                  {c.style || `Angle ${idx + 1}`}
                </span>
                <button
                  onClick={() => handleCopy(c.text, c.tags, idx)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-slate-100 group-hover:bg-brand-violet group-hover:text-white text-slate-700 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <><Check size={13} className="text-emerald-500 group-hover:text-white" /> Copied!</>
                  ) : (
                    <><Copy size={13} /> Copy Caption</>
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3">{c.text}</p>

              {c.tags && (
                <div className="text-xs font-mono text-brand-teal bg-teal-50/50 p-2 rounded-lg border border-teal-100">
                  {c.tags}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaptionGeneratorPage;

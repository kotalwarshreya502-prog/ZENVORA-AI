import {
  Bot, Check, Copy, Download, Edit3,
  RefreshCw, Save, Sparkles, X,
} from 'lucide-react';
import React, { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORMS = [
  'Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)',
  'YouTube', 'Blog / Website',
];

const CONTENT_TYPES = [
  'Social Post', 'Ad Copy', 'Caption', 'Headline',
  'Blog Intro', 'YouTube Description', 'Newsletter Snippet', 'Call to Action',
];

const INDUSTRIES = [
  'E-commerce / Retail',
  'Fashion & Apparel',
  'Food & Beverage',
  'Health & Fitness',
  'Technology / SaaS',
  'Education',
  'Travel & Hospitality',
  'Finance & Banking',
  'Real Estate',
  'Beauty & Personal Care',
  'Automotive',
  'Entertainment & Media',
  'Non-Profit / NGO',
  'B2B / Professional Services',
  'Other',
];

const TONES = [
  'Exciting & Energetic',
  'Professional',
  'Casual & Friendly',
  'Authoritative',
  'Inspirational',
  'Humorous',
  'Educational',
  'Urgent & Direct',
];

const LENGTHS = [
  'Short (under 100 words)',
  'Medium (100-250 words)',
  'Long (250+ words)',
];

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French',
  'German', 'Portuguese', 'Arabic',
];

// ── Component ─────────────────────────────────────────────────────────────────
export const ContentStudioPage = () => {
  // Every field starts EMPTY — no demo/pre-filled data
  const [formData, setFormData] = useState({
    brandName:      '',   // e.g. "Flipkart"
    industry:       'E-commerce / Retail',
    topic:          '',   // e.g. "Big Shopping Days Sale — up to 80% off"
    platform:       'Instagram',
    type:           'Social Post',
    targetAudience: '',   // e.g. "Online shoppers aged 18-45 in India"
    tone:           'Exciting & Energetic',
    language:       'English',
    keywords:       '',   // e.g. "Big Sale, Huge Discounts, Limited Offer, Shop Now"
    objective:      '',   // e.g. "Drive traffic to Flipkart sale page and boost purchases"
    length:         'Medium (100-250 words)',
  });

  const [loading, setLoading]           = useState(false);
  const [output, setOutput]             = useState(null);   // null = nothing generated yet
  const [error, setError]               = useState(null);
  const [copied, setCopied]             = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!formData.topic.trim()) {
      setError('Please enter a campaign topic or subject.');
      return;
    }
    setError(null);
    setLoading(true);
    setIsEditing(false);
    setOutput(null); // always clear previous output before new generation

    try {
      const res = await api.generateContent({ ...formData });
      setOutput(res);
      setEditedContent(res.content || '');
    } catch (err) {
      setError(err?.message || 'Content generation failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => handleGenerate(null);

  const handleCopy = () => {
    const text = isEditing ? editedContent : output?.content;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDraft = async () => {
    const content = isEditing ? editedContent : output?.content;
    if (!content) return;
    try {
      await api.createPost({
        title: `${formData.brandName ? formData.brandName + ' — ' : ''}${formData.type}: ${formData.topic.slice(0, 50)}`,
        content,
        type: formData.type,
        platform: formData.platform,
        status: 'Draft',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(`Save failed: ${err?.message}`);
    }
  };

  const handleDownload = () => {
    const content = isEditing ? editedContent : output?.content;
    if (!content) return;
    const slug = (formData.brandName || formData.topic).slice(0, 30).replace(/\s+/g, '_');
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${slug}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  // ── Shared style tokens ────────────────────────────────────────────────────
  const sel = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet';
  const inp = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet';

  const Field = ({ label, required, children }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="violet" size="sm">AI Content Studio</Badge>
          <span className="text-xs text-slate-400">• Powered by Google Gemini</span>
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight mt-1">Content Creator</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Every generation is fresh and brand-specific — enter your brand name and topic to get content that actually matches.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 hover:text-rose-900">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left: Input Form ── */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">

            {/* ── BRAND IDENTITY SECTION ── */}
            <div className="pb-1 border-b border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                Brand Identity
              </p>
              <div className="space-y-3">
                <Field label="Brand / Organisation Name">
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={set('brandName')}
                    placeholder="e.g. Flipkart, Samsung, Nike, Your Business"
                    className={inp}
                  />
                </Field>

                <Field label="Industry">
                  <select value={formData.industry} onChange={set('industry')} className={sel}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* ── CAMPAIGN SECTION ── */}
            <div className="pb-1 border-b border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                Campaign Details
              </p>
              <div className="space-y-3">
                <Field label="Campaign Topic / Subject" required>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={set('topic')}
                    placeholder="e.g. Big Shopping Days — up to 80% off electronics"
                    className={inp}
                  />
                </Field>

                <Field label="Campaign Objective">
                  <input
                    type="text"
                    value={formData.objective}
                    onChange={set('objective')}
                    placeholder="e.g. Drive traffic to sale page, increase app downloads"
                    className={inp}
                  />
                </Field>

                <Field label="Target Audience">
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={set('targetAudience')}
                    placeholder="e.g. Online shoppers aged 18-45 in India"
                    className={inp}
                  />
                </Field>

                <Field label="Keywords (comma-separated)">
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={set('keywords')}
                    placeholder="e.g. Big Sale, Huge Discounts, Limited Offer, Shop Now"
                    className={inp}
                  />
                  <p className="text-[10px] text-slate-400 pl-0.5 mt-0.5">
                    Each keyword becomes a separate #hashtag — never merged into one tag.
                  </p>
                </Field>
              </div>
            </div>

            {/* ── CONTENT OPTIONS SECTION ── */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                Content Options
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Platform">
                    <select value={formData.platform} onChange={set('platform')} className={sel}>
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Content Type">
                    <select value={formData.type} onChange={set('type')} className={sel}>
                      {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tone">
                    <select value={formData.tone} onChange={set('tone')} className={sel}>
                      {TONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Language">
                    <select value={formData.language} onChange={set('language')} className={sel}>
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Output Length">
                  <select value={formData.length} onChange={set('length')} className={sel}>
                    {LENGTHS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Generate Buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1 font-bold shadow-md shadow-brand-violet/25"
              >
                {loading
                  ? <><RefreshCw size={14} className="animate-spin" /><span>Generating…</span></>
                  : <><Sparkles size={14} className="text-brand-teal" /><span>Generate Content</span></>
                }
              </Button>
              {output && !loading && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleRegenerate}
                  title="Regenerate with same inputs"
                  className="px-3"
                >
                  <RefreshCw size={14} />
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* ── Right: Output Panel ── */}
        <Card className="lg:col-span-7 p-6 min-h-[560px] flex flex-col">

          {/* Output Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-brand-violet" />
              <span className="font-bold text-sm text-brand-navy">Generated Output</span>
              {output?.model && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                  {output.model}
                </span>
              )}
              {output?.brandName && (
                <span className="text-[10px] bg-brand-violet/10 text-brand-violet px-2 py-0.5 rounded-md font-semibold">
                  {output.brandName}
                </span>
              )}
            </div>

            {/* Action buttons — only shown when there's output */}
            {output && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setIsEditing(!isEditing); setEditedContent(output.content || ''); }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1 transition-colors"
                  title={isEditing ? 'Preview' : 'Edit'}
                >
                  <Edit3 size={13} />
                  <span className="text-[11px]">{isEditing ? 'View' : 'Edit'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1 transition-colors"
                >
                  {copied
                    ? <Check size={13} className="text-emerald-600" />
                    : <Copy size={13} />
                  }
                  <span className="text-[11px]">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleSaveDraft}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    savedSuccess
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:text-brand-violet'
                  }`}
                >
                  <Save size={13} />
                  <span className="text-[11px]">{savedSuccess ? 'Saved!' : 'Save Draft'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1 transition-colors"
                >
                  <Download size={13} />
                  <span className="text-[11px]">Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Output Body */}
          <div className="flex-1">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 py-16">
                <RefreshCw size={28} className="animate-spin text-brand-violet" />
                <p className="text-xs text-slate-500 text-center">
                  Generating content for
                  {formData.brandName && <strong> {formData.brandName}</strong>}
                  {formData.topic && <> — &ldquo;{formData.topic}&rdquo;</>}
                </p>
                <p className="text-[10px] text-slate-400">Fresh generation, no cached results reused.</p>
              </div>

            ) : output ? (
              <>
                {/* Content: edit mode or view mode */}
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    className="w-full h-72 p-4 rounded-xl border border-brand-violet/30 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-brand-violet resize-none font-sans"
                  />
                ) : (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[200px] select-text font-sans">
                    {output.content}
                  </div>
                )}

                {/* Generation metadata */}
                <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                  <span>
                    Generated {output.generatedAt
                      ? new Date(output.generatedAt).toLocaleTimeString()
                      : 'just now'}
                    {output.brandName && ` · Brand: ${output.brandName}`}
                    {` · Platform: ${output.platform}`}
                  </span>
                  {output.model && <span className="font-mono">Model: {output.model}</span>}
                </div>

                {/* Fallback note if no Gemini key */}
                {output.note && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-700">
                    ⚡ {output.note}
                  </div>
                )}
              </>

            ) : (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center gap-4 py-16 text-slate-300">
                <Sparkles size={36} className="opacity-30" />
                <div className="text-center space-y-1.5">
                  <p className="text-xs text-slate-400 font-semibold">Start by entering your brand details</p>
                  <div className="text-[11px] text-slate-400 space-y-0.5 max-w-xs mx-auto">
                    <p>1. Enter brand name <span className="text-slate-500 font-medium">(e.g. Flipkart)</span></p>
                    <p>2. Select industry <span className="text-slate-500 font-medium">(e.g. E-commerce)</span></p>
                    <p>3. Enter campaign topic <span className="text-slate-500 font-medium">(e.g. Big Shopping Days Sale)</span></p>
                    <p>4. Add keywords &amp; click <strong className="text-brand-violet">Generate Content</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default ContentStudioPage;

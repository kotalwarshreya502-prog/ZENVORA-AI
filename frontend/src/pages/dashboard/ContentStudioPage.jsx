import {
  Bot, Check, Copy, Download, Edit3,
  RefreshCw, Save, Sparkles, X,
} from 'lucide-react';
import React, { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

const PLATFORMS     = ['Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)', 'YouTube', 'Blog / Website'];
const CONTENT_TYPES = ['Social Post', 'Ad Copy', 'Caption', 'Headline', 'Blog Intro', 'YouTube Description', 'Newsletter Snippet', 'Call to Action'];
const TONES         = ['Professional', 'Casual & Friendly', 'Authoritative', 'Inspirational', 'Humorous', 'Educational', 'Urgent'];
const LENGTHS       = ['Short (under 100 words)', 'Medium (100-250 words)', 'Long (250+ words)'];
const LANGUAGES     = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Portuguese', 'Arabic'];

const INDUSTRIES = [
  '',
  'E-commerce & Retail',
  'Food & Restaurants',
  'Healthcare',
  'Education',
  'Technology',
  'SaaS',
  'Finance & Banking',
  'Fashion & Beauty',
  'Travel & Tourism',
  'Real Estate',
  'Automotive',
  'Fitness & Sports',
  'Entertainment',
  'Government & Public Services',
  'Startup',
  'Personal Brand',
  'NGO / Non-profit',
  '__custom__',
];

const INDUSTRY_LABELS = {
  '': 'Select Industry',
  '__custom__': 'Custom (type below)',
};

const selectClass = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet';
const inputClass  = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet';

export const ContentStudioPage = () => {
  // Independent controlled state variables for clean, lag-free input handling
  const [brandName, setBrandName]           = useState('');
  const [industry, setIndustry]             = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [topic, setTopic]                   = useState('');
  const [platform, setPlatform]             = useState('LinkedIn');
  const [type, setType]                     = useState('Social Post');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone]                     = useState('Professional');
  const [language, setLanguage]             = useState('English');
  const [keywords, setKeywords]             = useState('');
  const [objective, setObjective]           = useState('');
  const [length, setLength]                 = useState('Medium (100-250 words)');

  const [loading, setLoading]               = useState(false);
  const [output, setOutput]                 = useState(null);       // null = no generation yet
  const [error, setError]                   = useState(null);
  const [copied, setCopied]                 = useState(false);
  const [savedSuccess, setSavedSuccess]     = useState(false);
  const [isEditing, setIsEditing]           = useState(false);
  const [editedContent, setEditedContent]   = useState('');

  const resolvedIndustry = industry === '__custom__'
    ? customIndustry.trim()
    : industry;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic or subject to generate content.');
      return;
    }
    setError(null);
    setLoading(true);
    setIsEditing(false);

    try {
      const res = await api.generateContent({
        brandName: brandName.trim(),
        industry: resolvedIndustry || 'General',
        topic: topic.trim(),
        platform,
        type,
        targetAudience: targetAudience.trim(),
        tone,
        language,
        keywords: keywords.trim(),
        objective: objective.trim(),
        length,
      });
      setOutput(res);
      setEditedContent(res.content || res?.data?.content || '');
    } catch (err) {
      setError(err?.message || 'Content generation failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = isEditing ? editedContent : (output?.content || output?.data?.content);
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDraft = async () => {
    const content = isEditing ? editedContent : (output?.content || output?.data?.content);
    if (!content) return;
    try {
      await api.createPost({
        title:    `${type}: ${topic.slice(0, 50)}`,
        content,
        type,
        platform,
        status:   'Draft',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(`Save failed: ${err?.message}`);
    }
  };

  const handleDownload = () => {
    const content = isEditing ? editedContent : (output?.content || output?.data?.content);
    if (!content) return;
    const filename = `${topic.slice(0, 30).replace(/\s+/g, '_')}_${Date.now()}.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const outputContent = isEditing ? editedContent : (output?.content || output?.data?.content);
  const outputModel   = output?.model || output?.data?.model;
  const outputAt      = output?.generatedAt || output?.data?.generatedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="violet" size="sm">AI Content Studio</Badge>
          <span className="text-xs text-slate-400">• Powered by Google Gemini</span>
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight mt-1">Content Creator</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate fresh, brand-aligned content for <strong>any brand, any industry, any platform</strong>. Every generation starts clean.
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

            {/* Brand Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Flipkart, Zomato, Nike, Zenvora AI"
                className={inputClass}
              />
            </div>

            {/* Industry */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={selectClass}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{INDUSTRY_LABELS[ind] ?? ind}</option>
                ))}
              </select>
              {industry === '__custom__' && (
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Enter your industry"
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>

            {/* Campaign Topic / Subject — Textarea for continuous sentences and multi-paragraph typing */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Campaign Topic / Subject <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Create a Diwali promotional campaign for Flipkart with attractive festive offers."
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </div>

            {/* Platform & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className={selectClass}
                >
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Content Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={selectClass}
                >
                  {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Online shoppers aged 18-35, Health-conscious adults"
                className={inputClass}
              />
            </div>

            {/* Tone & Language */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={selectClass}
                >
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={selectClass}
                >
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Keywords (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. sale, electronics, discount, fashion"
                className={inputClass}
              />
            </div>

            {/* Campaign Objective */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Campaign Objective</label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Drive sales, Increase awareness, Get sign-ups"
                className={inputClass}
              />
            </div>

            {/* Length */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={selectClass}
              >
                {LENGTHS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1 font-bold shadow-md shadow-brand-violet/25"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-brand-teal" />
                    <span>Generate Content</span>
                  </>
                )}
              </Button>
              {output && !loading && (
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
              <span className="font-bold text-sm text-brand-navy">Generated Output</span>
              {outputModel && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                  {outputModel}
                </span>
              )}
            </div>
            {outputContent && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setIsEditing(!isEditing); setEditedContent(output?.content || output?.data?.content || ''); }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={13} />
                  <span className="text-[11px]">{isEditing ? 'View' : 'Edit'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
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

          <div className="flex-1">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 py-16">
                <RefreshCw size={28} className="animate-spin text-brand-violet" />
                <p className="text-xs text-slate-500">
                  Generating with AI — building fresh content for &ldquo;{topic}&rdquo;
                  {brandName ? ` for ${brandName}` : ''}
                </p>
              </div>
            ) : outputContent ? (
              <>
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    className="w-full h-72 p-4 rounded-xl border border-brand-violet/30 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-brand-violet resize-none font-sans"
                  />
                ) : (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[200px] select-text font-sans">
                    {outputContent}
                  </div>
                )}
                <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>
                    Generated {outputAt ? new Date(outputAt).toLocaleTimeString() : 'just now'}
                  </span>
                  {outputModel && <span>Model: {outputModel}</span>}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
                <Sparkles size={36} className="opacity-30" />
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Enter a brand name, industry, and topic — then click Generate Content to create your first piece.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContentStudioPage;

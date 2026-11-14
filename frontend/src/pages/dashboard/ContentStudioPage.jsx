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

export const ContentStudioPage = () => {
  // FRESH empty state — no pre-filled content
  const [formData, setFormData] = useState({
    brandName:      '',
    industry:       '',
    customIndustry: '',
    topic:          '',
    platform:       'LinkedIn',
    type:           'Social Post',
    targetAudience: '',
    tone:           'Professional',
    language:       'English',
    keywords:       '',
    objective:      '',
    length:         'Medium (100-250 words)',
  });

  const [loading, setLoading]         = useState(false);
  const [output, setOutput]           = useState(null);       // null = no generation yet
  const [error, setError]             = useState(null);
  const [copied, setCopied]           = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const resolvedIndustry = formData.industry === '__custom__'
    ? formData.customIndustry.trim()
    : formData.industry;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!formData.topic.trim()) {
      setError('Please enter a topic or subject to generate content.');
      return;
    }
    setError(null);
    setLoading(true);
    setIsEditing(false);

    try {
      // Send all context fields including brandName and resolved industry
      const res = await api.generateContent({
        ...formData,
        industry: resolvedIndustry || 'General',
        // Remove customIndustry from the payload (backend doesn't need it)
        customIndustry: undefined,
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
        title:    `${formData.type}: ${formData.topic.slice(0, 50)}`,
        content,
        type:     formData.type,
        platform: formData.platform,
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
    const filename = `${formData.topic.slice(0, 30).replace(/\s+/g, '_')}_${Date.now()}.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const field = (label, children) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      {children}
    </div>
  );

  const selectClass = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet';
  const inputClass  = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet';

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
            {field('Brand Name',
              <input
                type="text"
                value={formData.brandName}
                onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. Flipkart, Zomato, Nike, Zenvora AI"
                className={inputClass}
              />
            )}

            {/* Industry */}
            {field('Industry',
              <>
                <select
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className={selectClass}
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{INDUSTRY_LABELS[ind] ?? ind}</option>
                  ))}
                </select>
                {formData.industry === '__custom__' && (
                  <input
                    type="text"
                    value={formData.customIndustry}
                    onChange={e => setFormData({ ...formData, customIndustry: e.target.value })}
                    placeholder="Enter your industry"
                    className={`${inputClass} mt-2`}
                  />
                )}
              </>
            )}

            {/* Topic */}
            {field('Topic / Subject *',
              <input
                type="text"
                required
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Big Shopping Sale, New Smartphone Launch, Health Awareness..."
                className={inputClass}
              />
            )}

            {/* Platform & Type */}
            <div className="grid grid-cols-2 gap-3">
              {field('Platform',
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  className={selectClass}
                >
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              )}
              {field('Content Type',
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className={selectClass}
                >
                  {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              )}
            </div>

            {/* Target Audience */}
            {field('Target Audience',
              <input
                type="text"
                value={formData.targetAudience}
                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g. Online shoppers aged 18-35, Health-conscious adults"
                className={inputClass}
              />
            )}

            {/* Tone & Language */}
            <div className="grid grid-cols-2 gap-3">
              {field('Tone',
                <select
                  value={formData.tone}
                  onChange={e => setFormData({ ...formData, tone: e.target.value })}
                  className={selectClass}
                >
                  {TONES.map(t => <option key={t}>{t}</option>)}
                </select>
              )}
              {field('Language',
                <select
                  value={formData.language}
                  onChange={e => setFormData({ ...formData, language: e.target.value })}
                  className={selectClass}
                >
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              )}
            </div>

            {/* Keywords */}
            {field('Keywords (comma separated)',
              <input
                type="text"
                value={formData.keywords}
                onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="e.g. sale, electronics, discount, fashion"
                className={inputClass}
              />
            )}

            {/* Campaign Objective */}
            {field('Campaign Objective',
              <input
                type="text"
                value={formData.objective}
                onChange={e => setFormData({ ...formData, objective: e.target.value })}
                placeholder="e.g. Drive sales, Increase awareness, Get sign-ups"
                className={inputClass}
              />
            )}

            {/* Length */}
            {field('Length',
              <select
                value={formData.length}
                onChange={e => setFormData({ ...formData, length: e.target.value })}
                className={selectClass}
              >
                {LENGTHS.map(l => <option key={l}>{l}</option>)}
              </select>
            )}

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
                  : <><Sparkles size={14} className="text-brand-teal" /><span>Generate Content</span></>
                }
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
                  Generating with AI — building fresh content for &ldquo;{formData.topic}&rdquo;
                  {formData.brandName ? ` for ${formData.brandName}` : ''}
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

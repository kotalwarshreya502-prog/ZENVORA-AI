import {
  ArrowRight,
  Bot,
  Calendar,
  Check,
  Copy,
  Hash,
  Layers,
  MessageSquare,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

export const ContentStudioPage = () => {
  const [formData, setFormData] = useState({
    type: 'Social Post',
    platform: 'LinkedIn',
    industry: 'Software / Technology',
    targetAudience: 'B2B Founders & Marketing Leaders',
    topic: 'How autonomous marketing automation solves team burnout',
    tone: 'Authoritative yet accessible',
    language: 'English',
    keywords: 'sustainable growth, marketing automation, ROI',
    length: 'Medium',
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCopied(false);
    setSavedSuccess(false);

    try {
      const res = await api.generateContent(formData);
      setOutput(res);
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (output?.content) {
      navigator.clipboard.writeText(output.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDraft = async () => {
    if (!output?.content) return;
    try {
      await api.createPost({
        title: `${formData.type}: ${formData.topic.slice(0, 35)}...`,
        content: output.content,
        type: formData.type,
        platform: formData.platform,
        status: 'Draft',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save draft: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="violet" size="sm">AI Generation Engine</Badge>
          <span className="text-xs text-slate-500">• Google Gemini 1.5</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
          AI Content Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Generate brand-aligned ad copy, social posts, captions, and marketing concepts engineered for high conversion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Parameters Form */}
        <Card className="lg:col-span-5 p-6 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Content Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="Social Post">Social Post</option>
                  <option value="Ad Copy">High-Converting Ad Copy</option>
                  <option value="Caption">Social Caption</option>
                  <option value="Product Description">Product Description</option>
                  <option value="Marketing Idea">Campaign Concept</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">X (Twitter)</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="All Platforms">Omni-Channel</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Topic or Core Proposition *</label>
              <textarea
                rows={3}
                required
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. 5 steps to scaling organic pipeline in 2026..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tone of Voice</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="Authoritative yet accessible">Authoritative & Clear</option>
                  <option value="Conversational and friendly">Conversational</option>
                  <option value="Bold and provocative">Bold & Disruptive</option>
                  <option value="Analytical and data-backed">Analytical & Data-backed</option>
                  <option value="Urgent and persuasive">Direct & Persuasive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Output Length</label>
                <select
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="Short">Short & Punchy</option>
                  <option value="Medium">Medium (Balanced)</option>
                  <option value="Long">In-Depth Carousel / Thread</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Include Keywords</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="e.g. organic traffic, customer retention"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full shadow-md shadow-brand-violet/25 font-bold"
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Synthesizing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-brand-teal" />
                  <span>Generate Content</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Output Display & Actions */}
        <Card className="lg:col-span-7 p-6 space-y-4 min-h-[460px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-brand-violet" />
                <span className="font-bold text-sm text-brand-navy">Synthesized Output</span>
                {output?.model && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    {output.model}
                  </span>
                )}
              </div>

              {output && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-violet text-xs flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="p-1.5 rounded-lg bg-slate-100 text-brand-navy hover:bg-brand-violet hover:text-white text-xs flex items-center gap-1 transition-colors"
                  >
                    <Save size={14} />
                    <span className="text-[11px]">{savedSuccess ? 'Saved!' : 'Save Draft'}</span>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <RefreshCw size={28} className="animate-spin text-brand-violet mx-auto" />
                <p className="text-xs text-slate-500">Injecting Brand Guidelines & running Gemini reasoning...</p>
              </div>
            ) : output ? (
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
                {output.content}
              </div>
            ) : (
              <div className="py-24 text-center space-y-3 text-slate-400">
                <Sparkles size={32} className="mx-auto opacity-30" />
                <p className="text-xs">Configure your parameters on the left and click Generate Content.</p>
              </div>
            )}
          </div>

          {output?.note && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <span>💡 {output.note}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContentStudioPage;

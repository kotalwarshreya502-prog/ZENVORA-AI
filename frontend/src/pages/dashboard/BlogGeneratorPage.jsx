import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

export const BlogGeneratorPage = () => {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'history'
  const [formData, setFormData] = useState({
    topic: 'How Generative AI is Reshaping B2B Content Marketing in 2026',
    targetKeyword: 'AI content marketing strategy',
    secondaryKeywords: 'organic traffic, content automation, brand voice',
    audience: 'CMOs, Founders, and Agency Leaders',
    tone: 'Authoritative, analytical, and actionable',
    length: 'Comprehensive (1500+ words)',
  });

  const [loading, setLoading] = useState(false);
  const [blogOutput, setBlogOutput] = useState(null);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSavedBlogs();
  }, []);

  const loadSavedBlogs = async () => {
    try {
      const res = await api.getBlogs();
      setSavedBlogs(res?.blogs || []);
    } catch (err) {
      console.warn('Could not load blogs:', err.message);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCopied(false);
    setSaveSuccess(false);

    try {
      const keywordsArray = formData.secondaryKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await api.generateBlog({
        ...formData,
        secondaryKeywords: keywordsArray,
      });

      setBlogOutput(res);
    } catch (err) {
      alert(`Blog generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!blogOutput) return;
    try {
      await api.createBlog({
        title: blogOutput.seoTitle || formData.topic,
        topic: formData.topic,
        targetKeyword: formData.targetKeyword,
        secondaryKeywords: formData.secondaryKeywords.split(',').map((k) => k.trim()),
        seoTitle: blogOutput.seoTitle,
        metaDescription: blogOutput.metaDescription,
        content: blogOutput.content,
        outline: blogOutput.outline,
        faqs: blogOutput.faqs,
        readingTime: blogOutput.readingTime,
        seoScore: blogOutput.seoScore,
        status: 'Draft',
      });
      setSaveSuccess(true);
      loadSavedBlogs();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save blog: ${err.message}`);
    }
  };

  const handleCopyMarkdown = () => {
    if (!blogOutput?.content) return;
    navigator.clipboard.writeText(blogOutput.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFile = () => {
    if (!blogOutput?.content) return;
    const blob = new Blob([blogOutput.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(formData.targetKeyword || 'blog').replace(/\s+/g, '-')}.md`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="sm">Editorial Engine</Badge>
            <span className="text-xs text-slate-500">• 1,500+ Word Semantic Articles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
            AI Blog & SEO Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Generate research-backed, structured long-form content engineered to win top SERP rankings.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'generator' ? 'bg-white text-brand-navy shadow-xs' : 'hover:text-brand-navy'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-brand-navy shadow-xs' : 'hover:text-brand-navy'
            }`}
          >
            Saved Drafts ({savedBlogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form */}
          <Card className="lg:col-span-5 p-6 space-y-4">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Article Topic *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Complete Guide to Marketing Automation in 2026..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Primary Target Keyword *</label>
                <input
                  type="text"
                  required
                  value={formData.targetKeyword}
                  onChange={(e) => setFormData({ ...formData, targetKeyword: e.target.value })}
                  placeholder="e.g. AI marketing automation platform"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Secondary Semantic Keywords</label>
                <input
                  type="text"
                  value={formData.secondaryKeywords}
                  onChange={(e) => setFormData({ ...formData, secondaryKeywords: e.target.value })}
                  placeholder="e.g. organic traffic, conversion rate, B2B pipeline"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Audience</label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Article Depth</label>
                  <select
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
                  >
                    <option value="Pillar Guide (1800+ words)">Pillar Guide (1800+ words)</option>
                    <option value="Comprehensive (1500+ words)">Comprehensive (1500+ words)</option>
                    <option value="Standard Article (1000 words)">Standard Article (1000 words)</option>
                  </select>
                </div>
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
                    <span>Structuring Outline & Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-brand-teal" />
                    <span>Generate Full SEO Blog</span>
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Structured Output & Editor */}
          <Card className="lg:col-span-7 p-6 space-y-6 min-h-[500px]">
            {loading ? (
              <div className="py-32 text-center space-y-3">
                <RefreshCw size={32} className="animate-spin text-brand-violet mx-auto" />
                <p className="text-xs text-slate-500">Conducting semantic intent mapping & drafting article...</p>
              </div>
            ) : blogOutput ? (
              <div className="space-y-6">
                {/* Meta summary card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" size="sm">
                      SEO Score: {blogOutput.seoScore || 93}/100
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      Est. {blogOutput.readingTime || 6} min read
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">SEO Meta Title</div>
                    <div className="text-sm font-bold text-brand-navy">{blogOutput.seoTitle}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Meta Description</div>
                    <div className="text-xs text-slate-600 leading-relaxed">{blogOutput.metaDescription}</div>
                  </div>
                </div>

                {/* Outline summary */}
                {blogOutput.outline && blogOutput.outline.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Generated Outline</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {blogOutput.outline.map((o, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-white shadow-2xs">
                          <span className="font-bold text-brand-navy">{o.heading}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Markdown content preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Article Content</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyMarkdown}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 hover:text-brand-navy flex items-center gap-1"
                      >
                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copied ? 'Copied' : 'Copy MD'}</span>
                      </button>
                      <button
                        onClick={handleExportFile}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 hover:text-brand-navy flex items-center gap-1"
                      >
                        <Download size={12} />
                        <span>Export .md</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto select-text">
                    {blogOutput.content}
                  </div>
                </div>

                {/* Save CTA */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveToDatabase}
                    className="shadow-sm font-bold"
                  >
                    <Save size={15} />
                    <span>{saveSuccess ? 'Saved to Drafts!' : 'Save Blog Draft'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-32 text-center space-y-3 text-slate-400">
                <FileText size={36} className="mx-auto opacity-30" />
                <p className="text-xs">Configure your topic and target keywords on the left to start generating.</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Saved Drafts History */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBlogs.map((b) => (
              <Card key={b._id} className="p-6 space-y-4 hover:border-brand-violet/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="violet" size="sm">{b.status || 'Draft'}</Badge>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      SEO: {b.seoScore || 92}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-brand-navy line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {b.metaDescription || b.content.slice(0, 120)}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Target: {b.targetKeyword || 'SEO'}</span>
                  <button
                    onClick={() => {
                      setBlogOutput(b);
                      setActiveTab('generator');
                    }}
                    className="text-brand-violet font-bold hover:underline"
                  >
                    Open Editor →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogGeneratorPage;

import {
  AlertCircle, BookOpen, ExternalLink, Loader2,
  RefreshCw, Search, Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

const DEPTHS = ['Quick', 'Standard', 'Deep'];

export const ResearchAssistantPage = () => {
  const [form, setForm] = useState({ topic: '', question: '', depth: 'Standard' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim() && !form.question.trim()) {
      setError('Please enter a topic or research question.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.analyzeResearch(form);
      setResult(res);
    } catch (err) {
      setError(err?.message || 'Research failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ topic: '', question: '', depth: 'Standard' });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="violet" size="sm">AI Research Engine</Badge>
          <span className="text-xs text-slate-500">• Wikipedia + Gemini</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
          Research Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Live web research combined with AI analysis. Sources are fetched in real-time — not pre-loaded.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <Card className="lg:col-span-4 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Research Topic *</label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. AI marketing trends 2026"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Specific Question (optional)</label>
              <textarea
                rows={3}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. What are the top AI tools used in content marketing in 2026?"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Research Depth</label>
              <div className="flex gap-2">
                {DEPTHS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, depth: d })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      form.depth === d
                        ? 'bg-brand-violet text-white border-brand-violet'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-violet'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full font-bold">
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /><span>Researching...</span></>
              ) : (
                <><Search size={15} /><span>Start Research</span></>
              )}
            </Button>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
              >
                <RefreshCw size={12} /> New Research
              </button>
            )}
          </form>
        </Card>

        {/* Results */}
        <div className="lg:col-span-8 space-y-4">
          {loading && (
            <Card className="p-8 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-brand-violet mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Fetching live sources & analyzing…</p>
              <p className="text-xs text-slate-500">Querying Wikipedia → Running Gemini analysis</p>
            </Card>
          )}

          {result && !loading && (
            <>
              {/* Meta */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="teal" size="sm">
                  {result.isLiveFetch ? '✓ Live Sources Fetched' : 'AI Analysis Only'}
                </Badge>
                <span className="text-xs text-slate-500 font-mono">{result.model}</span>
                <span className="text-xs text-slate-400">{new Date(result.generatedAt).toLocaleString()}</span>
              </div>

              {/* Data note */}
              {result.dataNote && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <Sparkles size={14} className="shrink-0 mt-0.5" />
                  <span>{result.dataNote}</span>
                </div>
              )}

              {/* Sources */}
              {result.sources?.length > 0 && (
                <Card className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-brand-violet" />
                    <span className="text-sm font-bold text-brand-navy">Live Sources ({result.sources.length})</span>
                  </div>
                  {result.sources.map((s, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{s.title || s.name}</span>
                        <Badge variant="teal" size="xs">Live</Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{s.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Fetched: {new Date(s.fetchedAt).toLocaleTimeString()}</span>
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-brand-violet hover:underline flex items-center gap-1"
                          >
                            View Source <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              )}

              {/* AI Analysis */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-violet" />
                  <span className="text-sm font-bold text-brand-navy">AI Analysis & Summary</span>
                  <Badge variant="violet" size="xs">Gemini</Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {result.summary}
                </div>
              </Card>
            </>
          )}

          {!result && !loading && !error && (
            <Card className="p-12 text-center space-y-3 text-slate-400">
              <Search size={40} className="mx-auto opacity-20" />
              <p className="text-sm font-semibold">Enter a topic to begin research</p>
              <p className="text-xs">Sources are fetched live from Wikipedia and analyzed by Gemini AI.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchAssistantPage;

import {
  AlertCircle, AlertTriangle, ExternalLink, Globe,
  Link as LinkIcon, Loader2, RefreshCw, Shield, Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

export const CompetitorAnalysisPage = () => {
  const [form, setForm] = useState({ url: '', businessContext: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.trim()) {
      setError('Please enter a competitor website URL.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.analyzeCompetitor(form);
      setResult(res);
    } catch (err) {
      setError(err?.message || 'Competitor analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ url: '', businessContext: '' });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="violet" size="sm">AI Intelligence Engine</Badge>
          <span className="text-xs text-slate-500">• Live Fetch + Gemini</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
          Competitor Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enter a competitor URL to fetch their public page content and get AI-powered competitive intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <Card className="lg:col-span-4 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Competitor Website URL *</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://competitor.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 pl-1">Must be publicly accessible (no login required)</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Your Business Context (optional)</label>
              <textarea
                rows={4}
                value={form.businessContext}
                onChange={(e) => setForm({ ...form, businessContext: e.target.value })}
                placeholder="e.g. We sell AI marketing software to SMBs. Looking for positioning gaps against this competitor."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full font-bold">
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /><span>Analyzing competitor…</span></>
              ) : (
                <><Shield size={15} /><span>Analyze Competitor</span></>
              )}
            </Button>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
              >
                <RefreshCw size={12} /> New Analysis
              </button>
            )}
          </form>
        </Card>

        {/* Results */}
        <div className="lg:col-span-8 space-y-4">
          {loading && (
            <Card className="p-8 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-brand-violet mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Fetching competitor page…</p>
              <p className="text-xs text-slate-500">Fetching HTML → Extracting content → Running AI analysis</p>
            </Card>
          )}

          {result && !loading && (
            <>
              {/* Meta */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={result.isLiveFetch ? 'teal' : 'slate'} size="sm">
                  {result.isLiveFetch ? '✓ Live Page Fetched' : '⚠ Domain Analysis Only'}
                </Badge>
                <span className="text-xs text-slate-500 font-mono">{result.model}</span>
                <a
                  href={result.competitorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-violet hover:underline flex items-center gap-1"
                >
                  {result.domain} <ExternalLink size={10} />
                </a>
              </div>

              {/* Page details */}
              {(result.title || result.metaDescription) && (
                <Card className="p-4 space-y-2 bg-slate-50">
                  {result.title && (
                    <p className="text-xs font-bold text-slate-800">📄 {result.title}</p>
                  )}
                  {result.metaDescription && (
                    <p className="text-xs text-slate-600">{result.metaDescription}</p>
                  )}
                </Card>
              )}

              {/* Social links */}
              {result.socialLinks?.length > 0 && (
                <Card className="p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <LinkIcon size={13} /> Social Profiles Found
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.socialLinks.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-100 hover:bg-brand-violet hover:text-white px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors text-slate-700"
                      >
                        {s.platform} <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* AI Analysis */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-violet" />
                  <span className="text-sm font-bold text-brand-navy">Competitive Intelligence</span>
                  <Badge variant="violet" size="xs">AI Analysis</Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {result.analysis}
                </div>
              </Card>

              {/* Limitations */}
              {result.limitations && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{result.limitations}</span>
                </div>
              )}
            </>
          )}

          {!result && !loading && !error && (
            <Card className="p-12 text-center space-y-3 text-slate-400">
              <Shield size={40} className="mx-auto opacity-20" />
              <p className="text-sm font-semibold">Enter a competitor URL to begin</p>
              <p className="text-xs">We'll fetch their public page and generate AI-powered competitive insights.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisPage;

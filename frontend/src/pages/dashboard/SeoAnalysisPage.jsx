import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  FileCode,
  Share2,
  RefreshCw,
  Lightbulb,
  Layers,
  Target,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';

export const SeoAnalysisPage = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'keywords'
  const [url, setUrl] = useState('https://zenvora.ai');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Audit Result
  const [auditResult, setAuditResult] = useState({
    url: 'https://zenvora.ai',
    overallScore: 92,
    meta: {
      title: 'ZENVORA AI | Autonomous Marketing Operating System',
      metaDescription: 'AI-powered marketing automation SaaS platform for autonomous campaigns, SEO intelligence, and multi-channel content operations.',
      h1Count: 1,
      h2Count: 6,
      imgCount: 14,
      imgWithoutAlt: 0,
      hasCanonical: true,
      hasOpenGraph: true,
    },
    recommendations: [
      'Ensure primary target keyword appears in the first 100 words of content.',
      'Maintain an active XML sitemap and submit it to Google Search Console.',
      'Add internal links pointing to high-priority commercial and conversion pages.',
    ],
    keywordSuggestions: [
      { keyword: 'AI marketing automation platform', volume: '14.8K', difficulty: 'Medium', intent: 'Commercial' },
      { keyword: 'autonomous content marketing SaaS', volume: '6.2K', difficulty: 'Low', intent: 'Informational' },
      { keyword: 'multi-channel social media scheduler AI', volume: '9.4K', difficulty: 'High', intent: 'Transactional' },
    ],
  });

  // Keyword Cluster Research State
  const [seedKeywords, setSeedKeywords] = useState('AI marketing automation, social media scheduler, SEO blog generator');
  const [researchingKeywords, setResearchingKeywords] = useState(false);
  const [keywordClusterResult, setKeywordClusterResult] = useState(null);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.analyzeSeo({ url });
      if (response) {
        setAuditResult(response.data || response);
      }
    } catch (err) {
      console.error('SEO Audit error:', err);
      setErrorMsg(err?.message || 'Failed to complete SEO audit. Please check that the URL is live and accessible.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordResearch = async (e) => {
    e?.preventDefault();
    if (!seedKeywords.trim()) return;

    setResearchingKeywords(true);
    setErrorMsg('');

    try {
      const res = await api.researchKeywords({
        seedKeywords: seedKeywords.trim(),
        domain: url,
      });
      if (res?.data) {
        setKeywordClusterResult(res.data);
      }
    } catch (err) {
      console.error('Keyword Research error:', err);
      setErrorMsg(err?.message || 'Failed to generate keyword clusters.');
    } finally {
      setResearchingKeywords(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Search className="text-brand-violet" size={24} />
          SEO Intelligence & Keyword Clustering
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform live technical SEO inspections, meta diagnostics, heading hierarchy analysis, and semantic keyword cluster mapping.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'audit' ? 'text-brand-violet border-b-2 border-brand-violet' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Website On-Page Audit
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-1.5 ${
            activeTab === 'keywords' ? 'text-brand-violet border-b-2 border-brand-violet' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles size={15} />
          <span>Keyword Clusters & Search Intent</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'audit' ? (
        <>
          {/* URL Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter website URL (e.g., https://yourbrand.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Analyzing Page...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Audit Webpage
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Audit Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Diagnostics (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Target URL</span>
                  <div className="text-sm font-mono font-semibold text-slate-800 break-all">{auditResult.url}</div>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl border font-mono font-bold text-lg flex items-center gap-1.5 ${getScoreColor(
                    auditResult.overallScore
                  )}`}
                >
                  <span>Score:</span>
                  <span>{auditResult.overallScore}/100</span>
                </div>
              </div>

              {/* Elements summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">H1 Tags</div>
                  <div className="text-base font-bold text-slate-900">{auditResult.meta?.h1Count ?? 1}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">H2 Tags</div>
                  <div className="text-base font-bold text-slate-900">{auditResult.meta?.h2Count ?? 4}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">Images</div>
                  <div className="text-base font-bold text-slate-900">{auditResult.meta?.imgCount ?? 12}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">Missing Alt</div>
                  <div className={`text-base font-bold ${(auditResult.meta?.imgWithoutAlt ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {auditResult.meta?.imgWithoutAlt ?? 0}
                  </div>
                </div>
              </div>

              {/* Meta details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Meta Title:</span>
                  <div className="p-2.5 rounded-lg bg-slate-50 text-slate-800 border border-slate-100">
                    {auditResult.meta?.title || 'No meta title detected'}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Meta Description:</span>
                  <div className="p-2.5 rounded-lg bg-slate-50 text-slate-800 border border-slate-100">
                    {auditResult.meta?.metaDescription || 'No meta description detected'}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb size={16} className="text-amber-500" />
                  Prioritized Recommendations
                </h4>
                <div className="space-y-1.5">
                  {(auditResult.recommendations || []).map((rec, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{typeof rec === 'string' ? rec : rec.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyword Suggestions (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-violet" />
                Target Keywords & Search Volumes
              </h3>
              <p className="text-xs text-slate-500">
                Identified commercial and informational search queries relevant to this domain.
              </p>

              <div className="space-y-2.5">
                {(auditResult.keywordSuggestions || []).map((kw, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{kw.keyword}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {kw.intent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Volume: {kw.volume || kw.searchVolume}</span>
                      <span className="font-semibold text-slate-700">Diff: {kw.difficulty || kw.competition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Keyword Clustering Tab */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-violet" />
              AI Semantic Keyword Cluster Mapping
            </h3>
            <p className="text-xs text-slate-500">
              Provide seed keywords or topic areas. The SEO Agent will cluster them by search intent (Commercial, Transactional, Informational) and pinpoint competitor content gaps.
            </p>

            <form onSubmit={handleKeywordResearch} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seed Topics & Keywords</label>
                <input
                  type="text"
                  value={seedKeywords}
                  onChange={(e) => setSeedKeywords(e.target.value)}
                  placeholder="e.g. B2B marketing automation, AI poster creator, local SEO software"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>

              <button
                type="submit"
                disabled={researchingKeywords}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-xs transition-all disabled:opacity-50"
              >
                {researchingKeywords ? (
                  <>
                    <RefreshCw className="animate-spin" size={15} />
                    Clustering Keywords...
                  </>
                ) : (
                  <>
                    <Target size={15} />
                    Map Keyword Clusters
                  </>
                )}
              </button>
            </form>
          </div>

          {keywordClusterResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Discovered Keyword Clusters</h4>
                <div className="space-y-3">
                  {(keywordClusterResult.keywordClusters || []).map((cluster, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-brand-navy">{cluster.clusterName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {cluster.intent}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-purple-700 font-semibold">
                        Primary: {cluster.primaryKeyword} ({cluster.volumeEstimate} | {cluster.difficulty})
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(cluster.secondaryKeywords || []).map((skw, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {skw}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Content Gap Opportunities</h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(keywordClusterResult.contentGapOpportunities || []).map((gap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Technical SEO Recommendations</h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(keywordClusterResult.technicalRecommendations || []).map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeoAnalysisPage;

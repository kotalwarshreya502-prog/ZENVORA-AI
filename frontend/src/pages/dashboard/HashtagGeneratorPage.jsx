import React, { useState } from 'react';
import {
  Hash,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Layers,
  TrendingUp,
  Target,
  BarChart2,
  Bookmark
} from 'lucide-react';
import { api } from '../../services/api';

export const HashtagGeneratorPage = () => {
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const [clusters, setClusters] = useState({
    broad: [
      '#DigitalMarketing',
      '#MarketingStrategy',
      '#SaaSGrowth',
      '#BusinessAutomation',
      '#AIrevolution',
      '#TechNews',
    ],
    niche: [
      '#MarketingAutomationSaaS',
      '#OrganicSEOstrategy',
      '#ContentOps',
      '#B2BContentMarketing',
      '#GrowthEngineering',
      '#ProductLedMarketing',
    ],
    intent: [
      '#MarketingSoftware',
      '#BestSaaS2025',
      '#ScaleMarketingTeam',
      '#AutomatedSocials',
      '#SEOMonitoringTool',
    ],
    community: [
      '#MarketingMinds',
      '#SaaSFounders',
      '#GrowthMarketersUnite',
      '#IndieHackers',
    ],
  });

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const response = await api.generateHashtags({
        keyword,
        platform,
      });

      if (response && response.data && response.data.clusters) {
        setClusters(response.data.clusters);
      } else if (response && response.data && Array.isArray(response.data)) {
        // distribute
        setClusters({
          broad: response.data.slice(0, 5),
          niche: response.data.slice(5, 10),
          intent: response.data.slice(10, 15),
          community: response.data.slice(15, 20),
        });
      }
    } catch (err) {
      console.error('Hashtag error:', err);
      const cleanKey = keyword.replace(/\s+/g, '');
      setClusters({
        broad: [
          `#${cleanKey}`,
          `#${cleanKey}Marketing`,
          `#${cleanKey}Tips`,
          '#DigitalGrowth',
          '#MarketingAutomation',
        ],
        niche: [
          `#${cleanKey}Strategy`,
          `#${cleanKey}Hacks`,
          `#Best${cleanKey}`,
          '#GrowthEngineers',
          '#ContentWorkflow',
        ],
        intent: [
          `#${cleanKey}Software`,
          `#Scale${cleanKey}`,
          '#B2BSaaSMarketing',
          '#MarketingROI',
        ],
        community: [
          '#FoundersNetwork',
          '#MarketingLeaders',
          `#${cleanKey}Community`,
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCluster = (tagList, label) => {
    navigator.clipboard.writeText(tagList.join(' '));
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleSelectTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const allTags = [
    ...(clusters.broad || []),
    ...(clusters.niche || []),
    ...(clusters.intent || []),
    ...(clusters.community || []),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Hash className="text-brand-violet" size={24} />
          Tiered Hashtag Cluster Intelligence
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cluster and generate algorithmic tags categorized by reach, intent, and community density for optimal platform discovery.
        </p>
      </div>

      {/* Input Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Core Keyword or Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. B2B SaaS SEO, Local Coffee Roastery, Real Estate CRM"
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Platform Target
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
            >
              <option value="instagram">Instagram (Up to 30)</option>
              <option value="linkedin">LinkedIn (3 to 5 targeted)</option>
              <option value="tiktok">TikTok (High viral intent)</option>
              <option value="twitter">X / Twitter (1 to 2 max)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md shadow-brand-violet/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Clustering...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Cluster Hashtags
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">{allTags.length} Total Hashtags</span>
          <span>•</span>
          <span>{selectedTags.length} Custom Selected</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedTags.length > 0 && (
            <button
              onClick={() => handleCopyCluster(selectedTags, 'selected')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors"
            >
              {copiedSection === 'selected' ? <Check size={14} /> : <Copy size={14} />}
              Copy {selectedTags.length} Selected
            </button>
          )}

          <button
            onClick={() => handleCopyCluster(allTags, 'all')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
          >
            {copiedSection === 'all' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            Copy All ({allTags.length})
          </button>
        </div>
      </div>

      {/* 4 Clusters Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier 1: Broad Reach */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="text-sm font-bold text-slate-900">Broad Reach Tags (High Volume)</h3>
            </div>
            <button
              onClick={() => handleCopyCluster(clusters.broad, 'broad')}
              className="text-xs text-slate-500 hover:text-brand-violet flex items-center gap-1"
            >
              {copiedSection === 'broad' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copiedSection === 'broad' ? 'Copied' : 'Copy Tier'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Best for general discoverability and feed placement in competitive category verticals.
          </p>
          <div className="flex flex-wrap gap-2">
            {clusters.broad.map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleSelectTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-blue-50/50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Tier 2: Niche Authority */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-violet"></span>
              <h3 className="text-sm font-bold text-slate-900">Niche Authority (Targeted Audience)</h3>
            </div>
            <button
              onClick={() => handleCopyCluster(clusters.niche, 'niche')}
              className="text-xs text-slate-500 hover:text-brand-violet flex items-center gap-1"
            >
              {copiedSection === 'niche' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copiedSection === 'niche' ? 'Copied' : 'Copy Tier'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Specific category communities with lower competition and higher follower retention.
          </p>
          <div className="flex flex-wrap gap-2">
            {clusters.niche.map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleSelectTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-brand-violet text-white border-brand-violet'
                    : 'bg-brand-violet/5 text-brand-violet border-brand-violet/20 hover:bg-brand-violet/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Tier 3: Buyer & Search Intent */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold text-slate-900">High-Conversion Intent</h3>
            </div>
            <button
              onClick={() => handleCopyCluster(clusters.intent, 'intent')}
              className="text-xs text-slate-500 hover:text-brand-violet flex items-center gap-1"
            >
              {copiedSection === 'intent' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copiedSection === 'intent' ? 'Copied' : 'Copy Tier'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Targeted search terms used by active software buyers, evaluators, and decision-makers.
          </p>
          <div className="flex flex-wrap gap-2">
            {clusters.intent.map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleSelectTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Tier 4: Community & Peer Tags */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold text-slate-900">Community & Ecosystem</h3>
            </div>
            <button
              onClick={() => handleCopyCluster(clusters.community, 'community')}
              className="text-xs text-slate-500 hover:text-brand-violet flex items-center gap-1"
            >
              {copiedSection === 'community' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copiedSection === 'community' ? 'Copied' : 'Copy Tier'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Connect directly with peer founders, creators, and relevant ecosystem builders.
          </p>
          <div className="flex flex-wrap gap-2">
            {clusters.community.map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleSelectTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashtagGeneratorPage;

import React, { useState } from 'react';
import {
  Hash, Sparkles, Copy, Check, RefreshCw, X,
} from 'lucide-react';
import { api } from '../../services/api';

const ClusterCard = ({ label, tags, tier, color, description, copiedSection, handleCopyCluster, selectedTags, toggleTag }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
      </div>
      {tags.length > 0 && (
        <button
          onClick={() => handleCopyCluster(tags, tier)}
          className="text-xs text-slate-500 hover:text-brand-violet flex items-center gap-1 transition-colors"
        >
          {copiedSection === tier ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          {copiedSection === tier ? 'Copied' : 'Copy Tier'}
        </button>
      )}
    </div>
    <p className="text-xs text-slate-400 mb-3">{description}</p>
    {tags.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
              selectedTags.includes(tag)
                ? `bg-brand-violet text-white border-brand-violet`
                : `bg-brand-violet/5 text-brand-violet border-brand-violet/20 hover:bg-brand-violet/10`
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    ) : (
      <p className="text-xs text-slate-300 italic">Generate hashtags to populate this tier</p>
    )}
  </div>
);

export const HashtagGeneratorPage = () => {
  const [keyword,       setKeyword]       = useState('');
  const [brandName,     setBrandName]     = useState('');
  const [industry,      setIndustry]      = useState('');
  const [platform,      setPlatform]      = useState('instagram');
  const [loading,       setLoading]       = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);
  const [selectedTags,  setSelectedTags]  = useState([]);
  const [error,         setError]         = useState(null);

  const [clusters, setClusters] = useState({
    broad:     [],
    niche:     [],
    intent:    [],
    community: [],
  });

  const hasResults = clusters.broad.length > 0 || clusters.niche.length > 0;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!keyword.trim()) {
      setError('Please enter a keyword or topic.');
      return;
    }
    setError(null);
    setLoading(true);
    setSelectedTags([]);

    try {
      const response = await api.generateHashtags({
        niche:    keyword.trim(),
        keyword:  keyword.trim(),
        platform,
        industry: industry.trim(),
        brandName: brandName.trim(),
        count:    25,
      });

      // response = response.data from axios interceptor
      const payload = response?.data ?? response;

      // Handle structured {broad, niche, intent, community} response
      if (payload?.broad || payload?.niche || payload?.intent || payload?.community) {
        setClusters({
          broad:     Array.isArray(payload.broad)     ? payload.broad     : [],
          niche:     Array.isArray(payload.niche)     ? payload.niche     : [],
          intent:    Array.isArray(payload.intent)    ? payload.intent    : [],
          community: Array.isArray(payload.community) ? payload.community : [],
        });
      } else if (payload?.hashtags) {
        // Raw text response — parse into clusters
        const tags    = typeof payload.hashtags === 'string'
          ? (payload.hashtags.match(/#\S+/g) || [])
          : payload.hashtags;
        const quarter = Math.ceil(tags.length / 4);
        setClusters({
          broad:     tags.slice(0, quarter),
          niche:     tags.slice(quarter, quarter * 2),
          intent:    tags.slice(quarter * 2, quarter * 3),
          community: tags.slice(quarter * 3),
        });
      } else if (Array.isArray(payload)) {
        const quarter = Math.ceil(payload.length / 4);
        setClusters({
          broad:     payload.slice(0, quarter),
          niche:     payload.slice(quarter, quarter * 2),
          intent:    payload.slice(quarter * 2, quarter * 3),
          community: payload.slice(quarter * 3),
        });
      } else {
        setError('No hashtags were returned. Please try again.');
      }
    } catch (err) {
      console.error('Hashtag error:', err);
      setError(err?.message || 'Hashtag generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCluster = (tagList, label) => {
    navigator.clipboard.writeText(tagList.join(' '));
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const allTags = [
    ...clusters.broad, ...clusters.niche,
    ...clusters.intent, ...clusters.community,
  ];

  const inputCls = 'w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet bg-white';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Hash className="text-brand-violet" size={24} />
          Hashtag Cluster Generator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate tiered hashtag clusters for any brand, industry, and topic — optimized per platform.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Topic / Keyword <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Weekend Food Deals, Fitness Campaign, AI Tools"
              className={inputCls}
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Zomato, Nike"
              className={inputCls}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Food"
              className={inputCls}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
              <option value="instagram">Instagram (up to 30)</option>
              <option value="linkedin">LinkedIn (3-5)</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">X / Twitter</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="w-full py-2.5 px-3 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {loading ? '' : 'Go'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions Bar */}
      {hasResults && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{allTags.length} Total Hashtags</span>
            <span>•</span>
            <span>{selectedTags.length} Selected</span>
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
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={28} className="animate-spin text-brand-violet" />
          <p className="text-xs text-slate-500">Generating hashtag clusters for &ldquo;{keyword}&rdquo;...</p>
        </div>
      )}

      {/* Clusters */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClusterCard
            label="Broad Reach (High Volume)"
            tags={clusters.broad}
            tier="broad"
            color="bg-blue-500"
            description="High-volume hashtags for general discoverability in this topic area."
            copiedSection={copiedSection}
            handleCopyCluster={handleCopyCluster}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
          />
          <ClusterCard
            label="Niche Authority"
            tags={clusters.niche}
            tier="niche"
            color="bg-brand-violet"
            description="Specific to the topic — lower competition, higher engagement quality."
            copiedSection={copiedSection}
            handleCopyCluster={handleCopyCluster}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
          />
          <ClusterCard
            label="High-Conversion Intent"
            tags={clusters.intent}
            tier="intent"
            color="bg-emerald-500"
            description="Used by people actively searching for or buying in this category."
            copiedSection={copiedSection}
            handleCopyCluster={handleCopyCluster}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
          />
          <ClusterCard
            label="Community & Ecosystem"
            tags={clusters.community}
            tier="community"
            color="bg-amber-500"
            description="Community-specific hashtags for peer engagement and ecosystem reach."
            copiedSection={copiedSection}
            handleCopyCluster={handleCopyCluster}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasResults && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center gap-3 text-slate-300">
          <Hash size={36} className="opacity-30" />
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Enter a keyword and click Go to generate tiered hashtag clusters.
          </p>
        </div>
      )}
    </div>
  );
};

export default HashtagGeneratorPage;

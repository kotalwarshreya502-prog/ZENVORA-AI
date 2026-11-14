import React, { useState, useEffect } from 'react';
import {
  Share2,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Send,
  RefreshCw,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Bookmark,
  Heart,
  X as XIcon,
  Image as ImageIcon,
  Cpu,
  AlertTriangle,
  Download,
  Key,
  ExternalLink,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Industry list ─────────────────────────────────────────────────────────────
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

const TONES = [
  'Professional & Authoritative',
  'Conversational & Friendly',
  'Inspiring & Thought-provoking',
  'Urgent & Promotional',
  'Bold & Disruptive',
  'Educational & Informative',
  'Humorous & Witty',
];

const CTA_OPTIONS = [
  'Ask for comments',
  'Link in bio / first comment',
  'Share / Repost request',
  'DM for details',
  'Shop now / Order today',
  'No direct CTA',
];

const PLATFORM_API_MAP = {
  linkedin:  'LinkedIn',
  twitter:   'X (Twitter)',
  instagram: 'Instagram',
  facebook:  'Facebook',
};

const PLATFORM_BUTTONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin',  label: 'LinkedIn' },
  { id: 'twitter',   label: 'X (Twitter)' },
  { id: 'facebook',  label: 'Facebook' },
];

export const SocialGeneratorPage = () => {
  const { user } = useAuth();

  // Form fields
  const [platform, setPlatform]             = useState('instagram');
  const [brandName, setBrandName]           = useState('');
  const [industry, setIndustry]             = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [topic, setTopic]                   = useState('');
  const [objective, setObjective]           = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords]             = useState('');
  const [tone, setTone]                     = useState('Conversational & Friendly');
  const [ctaType, setCtaType]               = useState('Link in bio / first comment');
  const [includeEmojis, setIncludeEmojis]   = useState(true);

  // Gemini API key state (stored in localStorage)
  const [customApiKey, setCustomApiKey]     = useState('');
  const [showKeyModal, setShowKeyModal]     = useState(false);
  const [keySavedToast, setKeySavedToast]   = useState(false);

  // Output state
  const [generatedPost, setGeneratedPost]   = useState('');
  const [extractedHeadline, setExtractedHeadline] = useState('');
  const [extractedCta, setExtractedCta]     = useState('');
  const [extractedHashtags, setExtractedHashtags] = useState([]);
  
  // Real Visual Creative states
  const [postImageUrl, setPostImageUrl]     = useState('');
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');
  const [activeVisualUrl, setActiveVisualUrl] = useState('');
  const [brandLogoUrl, setBrandLogoUrl]     = useState('');
  const [designSpec, setDesignSpec]         = useState(null);
  const [postImgLoaded, setPostImgLoaded]   = useState(false);
  const [postImgError, setPostImgError]     = useState(false);

  // Model & Execution states
  const [aiModel, setAiModel]               = useState('');
  const [loading, setLoading]               = useState(false);
  const [loadingStage, setLoadingStage]     = useState('');
  const [error, setError]                   = useState(null);
  
  // Action Feedback states
  const [copied, setCopied]                 = useState(false);
  const [scheduled, setScheduled]           = useState(false);
  const [savedSuccess, setSavedSuccess]     = useState(false);
  const [downloading, setDownloading]       = useState(false);

  // Load custom Gemini API key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zenvora_gemini_api_key') || '';
    setCustomApiKey(saved);
  }, []);

  const handleSaveApiKey = (e) => {
    e?.preventDefault();
    if (customApiKey.trim()) {
      localStorage.setItem('zenvora_gemini_api_key', customApiKey.trim());
    } else {
      localStorage.removeItem('zenvora_gemini_api_key');
    }
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 2500);
    setShowKeyModal(false);
  };

  const resolvedIndustry = industry === '__custom__' ? customIndustry.trim() : industry;

  const platformLimits = { linkedin: 3000, twitter: 280, instagram: 2200, facebook: 5000 };
  const maxChar        = platformLimits[platform] || 2200;
  const isOverLimit    = generatedPost.length > maxChar;

  // ── Unified Generation Handler ─────────────────────────────────────────────
  const handleGenerate = async (e, isRegen = false) => {
    e?.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a Campaign Topic or Message Hook.');
      return;
    }
    setError(null);
    setLoading(true);
    setScheduled(false);
    setSavedSuccess(false);
    setPostImgLoaded(false);
    setPostImgError(false);

    const effectiveBrand = brandName.trim() || user?.businessName || '';

    try {
      setLoadingStage('Step 1/3: Analyzing brand context & market hooks...');

      const emojiNote = includeEmojis
        ? ' Use relevant, stylish emojis to make the post visually engaging.'
        : ' Do not use any emojis.';

      // Request 1: AI Marketing Content Generation
      setLoadingStage('Step 2/3: Calling configured Gemini model for post copy...');

      const contentPromise = api.generateContent({
        topic: topic.trim(),
        type: 'Social Post',
        platform: PLATFORM_API_MAP[platform] || platform,
        industry: resolvedIndustry || 'General',
        targetAudience: targetAudience.trim() || 'General public',
        tone: tone + emojiNote,
        language: 'English',
        keywords: keywords.trim(),
        objective: objective.trim() || ctaType,
        brandName: effectiveBrand,
        length: platform === 'twitter' ? 'Short (under 100 words)' : 'Medium (100-250 words)',
      });

      // Request 2: Intelligent Poster & Visual Creative Engine
      setLoadingStage('Step 3/3: Researching brand assets & crafting visual creative...');

      const posterPromise = api.generateIntelligentPoster({
        description: `${effectiveBrand ? `${effectiveBrand}: ` : ''}${topic.trim()}`,
        style: resolvedIndustry || tone || 'modern commercial advertising',
        size: platform === 'twitter' ? 'landscape' : platform === 'facebook' ? 'landscape' : 'square',
        customHeadline: extractedHeadline || '',
        customCta: ctaType,
      });

      // Await both in parallel
      const [contentRes, posterRes] = await Promise.allSettled([contentPromise, posterPromise]);

      // ── Process Content Response ──
      if (contentRes.status === 'fulfilled') {
        const payload = contentRes.value?.data ?? contentRes.value;
        const text = payload?.content ?? payload?.text;
        const model = payload?.model || 'gemini-1.5-flash';

        if (text) {
          setGeneratedPost(text);
          setAiModel(model);

          if (payload?.headline) setExtractedHeadline(payload.headline);
          if (payload?.cta) setExtractedCta(payload.cta);
          if (payload?.hashtags && Array.isArray(payload.hashtags)) {
            setExtractedHashtags(payload.hashtags);
          }
        }
      } else {
        console.warn('[SocialGen] Content generation issue:', contentRes.reason);
      }

      // ── Process Visual Creative Response ──
      if (posterRes.status === 'fulfilled') {
        const pPayload = posterRes.value?.data ?? posterRes.value;
        const imgUrl = pPayload?.imageUrl;
        const fallbackUrl = pPayload?.fallbackImageUrl;
        const logo = pPayload?.logoResult?.logoUrl;
        const spec = pPayload?.designSpec;

        if (imgUrl) setPostImageUrl(imgUrl);
        if (fallbackUrl) setFallbackImageUrl(fallbackUrl);
        if (logo) setBrandLogoUrl(logo);
        if (spec) setDesignSpec(spec);

        // Prefer Pollinations AI image, with fallback ready
        setActiveVisualUrl(imgUrl || fallbackUrl);
      } else {
        console.warn('[SocialGen] Poster generation issue:', posterRes.reason);
      }

      // Ensure we have at least one valid image
      if (!postImageUrl && !fallbackImageUrl) {
        // Fallback default commercial visual based on topic
        const lowerT = topic.toLowerCase();
        let fallback = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&q=80';
        if (lowerT.includes('diwali') || lowerT.includes('festiv')) {
          fallback = 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1080&q=80';
        } else if (lowerT.includes('nike') || lowerT.includes('running') || lowerT.includes('shoe')) {
          fallback = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080&q=80';
        } else if (lowerT.includes('pizza') || lowerT.includes('restaurant') || lowerT.includes('food')) {
          fallback = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&q=80';
        }
        setFallbackImageUrl(fallback);
        setActiveVisualUrl(fallback);
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err?.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  // Image load error handler: smoothly cascade to fallback without failing
  const handleImageError = () => {
    setPostImgError(true);
    if (fallbackImageUrl && activeVisualUrl !== fallbackImageUrl) {
      setActiveVisualUrl(fallbackImageUrl);
      setPostImgLoaded(true);
    } else {
      setPostImgLoaded(true);
    }
  };

  // ── Action 1: Copy Post ─────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Action 2: Save Draft ───────────────────────────────────────────────────
  const handleSavePost = async () => {
    if (!generatedPost) return;
    try {
      const hashtagsList = extractedHashtags.length > 0 
        ? extractedHashtags 
        : (generatedPost.match(/#[a-zA-Z0-9_]+/g) || []);

      await api.createPost({
        title: topic.trim() || 'Social Post Draft',
        content: generatedPost,
        platform: PLATFORM_API_MAP[platform] || platform,
        status: 'Draft',
        mediaUrls: activeVisualUrl ? [activeVisualUrl] : [],
        hashtags: hashtagsList,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft: ' + (err?.message || 'Unknown error'));
    }
  };

  // ── Action 3: Schedule Post ────────────────────────────────────────────────
  const handleSchedulePost = async () => {
    if (!generatedPost) return;
    try {
      const scheduledDate = new Date(Date.now() + 86400000 * 2).toISOString();
      const hashtagsList = extractedHashtags.length > 0 
        ? extractedHashtags 
        : (generatedPost.match(/#[a-zA-Z0-9_]+/g) || []);

      await api.createPost({
        title: topic.trim() || 'Scheduled Social Post',
        content: generatedPost,
        platform: PLATFORM_API_MAP[platform] || platform,
        status: 'Scheduled',
        scheduledFor: scheduledDate,
        mediaUrls: activeVisualUrl ? [activeVisualUrl] : [],
        hashtags: hashtagsList,
      });
      setScheduled(true);
      setTimeout(() => setScheduled(false), 3000);
    } catch (err) {
      console.error('Error scheduling post:', err);
      setError('Failed to schedule: ' + (err?.message || 'Unknown error'));
    }
  };

  // ── Action 4: Download Creative ────────────────────────────────────────────
  const handleDownloadCreative = async () => {
    const targetUrl = activeVisualUrl || postImageUrl || fallbackImageUrl;
    if (!targetUrl) return;

    setDownloading(true);
    try {
      const brandSlug = (brandName || user?.businessName || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
      const filename = `${brandSlug}-${topicSlug}-creative.jpg`;

      await api.downloadImage(targetUrl, filename);
    } catch (err) {
      console.error('Download error:', err);
      // Direct window open fallback
      window.open(targetUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // Shared input / select styles
  const inputCls = 'w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet bg-white text-slate-800 placeholder:text-slate-400';

  const effectiveBrandName = brandName.trim() || user?.businessName || 'Brand';
  const displayHeadline = designSpec?.headline || extractedHeadline || topic || 'Special Offer';
  const displaySubheadline = designSpec?.subheadline || 'Exclusive Limited Time Deals & Discounts';
  const displayCta = designSpec?.cta || extractedCta || ctaType || 'Shop Now →';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="text-brand-violet" size={24} />
            Social Post Creator &amp; Live Visual Preview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real AI content generation + live advertising creative preview for any brand and industry.
          </p>
        </div>

        {/* AI Engine Status & Key Modal Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium font-mono text-[11px]">
              {aiModel ? (aiModel.includes('gemini') ? `AI: ${aiModel}` : `AI: ${aiModel}`) : 'Gemini 1.5 Flash'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            title="Configure Gemini API Key"
          >
            <Key size={14} className="text-brand-violet" />
            <span>API Key</span>
          </button>
        </div>
      </div>

      {/* Key Config Toast */}
      {keySavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span>Gemini API Key saved to your browser session and active for all generations!</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 hover:text-rose-900">
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-violet/10 text-brand-violet">
                  <Key size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Google Gemini API Key</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect your Google Gemini API key to enable live generation through <strong>Gemini 1.5 Flash</strong> and <strong>Gemini 2.0</strong>. Your key is stored locally in your browser and sent securely via headers.
            </p>
            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy... (Paste Gemini API Key)"
                className={inputCls}
              />
              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-brand-violet hover:underline flex items-center gap-1"
                >
                  Get free key from Google AI Studio <ExternalLink size={11} />
                </a>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90 shadow-xs"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Form (5 cols) + Simulator (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── Left: Generator Form ────────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col gap-5">
          <form onSubmit={(e) => handleGenerate(e, false)} className="space-y-4">

            {/* Target Platform Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Target Platform
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORM_BUTTONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPlatform(item.id)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                      platform === item.id
                        ? 'border-brand-violet bg-brand-violet/10 text-brand-violet font-semibold ring-2 ring-brand-violet/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Flipkart, Nike, Zomato, Starbucks, Apple..."
                className={inputCls}
              />
            </div>

            {/* Industry Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={inputCls}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {INDUSTRY_LABELS[ind] ?? ind}
                  </option>
                ))}
              </select>
              {industry === '__custom__' && (
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Enter your industry"
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>

            {/* Topic / Message Hook (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Topic / Offer <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. flipkart diwali offer, nike running sneakers launch, authentic artisan pizza..."
                rows={3}
                required
                className={inputCls}
              />
            </div>

            {/* Campaign Objective */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Objective
              </label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Drive Diwali sales, increase festive orders, book tables"
                className={inputCls}
              />
            </div>

            {/* Target Audience & CTA Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Festive shoppers, athletes"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  CTA Type
                </label>
                <select
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value)}
                  className={inputCls}
                >
                  {CTA_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. diwali deals, discounts, fashion, electronics"
                className={inputCls}
              />
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={inputCls}
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Options Toggle */}
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="rounded text-brand-violet focus:ring-brand-violet"
                />
                Include contextual emojis
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {aiModel || 'Gemini 1.5 Flash'}
              </span>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium shadow-md shadow-brand-violet/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Generating Post &amp; Visual Creative...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Post for {PLATFORM_API_MAP[platform] || platform}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Topic Chips */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Test Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Flipkart Diwali Offer', brand: 'Flipkart', ind: 'E-commerce & Retail' },
                { label: 'Nike Running Shoes Launch', brand: 'Nike', ind: 'Fitness & Sports' },
                { label: 'Artisan Italian Pizza Weekend', brand: 'Bella Italia', ind: 'Food & Restaurants' },
                { label: 'EcoClean Solar Energy Consultation', brand: 'EcoClean', ind: 'Technology' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setTopic(p.label);
                    setBrandName(p.brand);
                    setIndustry(p.ind);
                  }}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-2.5 rounded-full transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Live Preview & Action Bar ────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Action Bar with all 6 required buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Live Preview:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet border border-brand-violet/20">
                {PLATFORM_API_MAP[platform]} Feed Simulator
              </span>
              {generatedPost && (
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    isOverLimit ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {generatedPost.length} / {maxChar} chars
                </span>
              )}
            </div>

            {/* All Functional Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Button 1: Regenerate */}
              <button
                onClick={(e) => handleGenerate(e, true)}
                disabled={loading || !topic.trim()}
                title="Regenerate with fresh AI variations and creative seed"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Regenerate
              </button>

              {/* Button 2: Copy */}
              <button
                onClick={handleCopy}
                disabled={!generatedPost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {/* Button 3: Save Draft */}
              <button
                onClick={handleSavePost}
                disabled={!generatedPost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {savedSuccess ? <Check size={14} className="text-emerald-600" /> : <Bookmark size={14} />}
                {savedSuccess ? 'Draft Saved!' : 'Save Draft'}
              </button>

              {/* Button 4: Schedule */}
              <button
                onClick={handleSchedulePost}
                disabled={!generatedPost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {scheduled ? <Check size={14} className="text-emerald-600" /> : <Calendar size={14} />}
                {scheduled ? 'Scheduled!' : 'Schedule'}
              </button>

              {/* Button 5: Download Creative */}
              <button
                onClick={handleDownloadCreative}
                disabled={!activeVisualUrl && !postImageUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90 transition-colors shadow-2xs disabled:opacity-40"
              >
                {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                Download Creative
              </button>
            </div>
          </div>

          {/* Simulator Canvas */}
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex justify-center items-start min-h-[500px]">

            {/* Empty State */}
            {!generatedPost && !loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400 w-full">
                <Sparkles size={40} className="opacity-30 text-brand-violet" />
                <p className="text-sm font-medium text-slate-600">No Post Generated Yet</p>
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  Enter your topic on the left (e.g. &ldquo;flipkart diwali offer&rdquo;) and click <strong>Generate Post</strong> to see your dynamic AI copy and real creative visual.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 w-full">
                <RefreshCw size={32} className="animate-spin text-brand-violet" />
                <p className="text-sm font-semibold text-slate-800 text-center">
                  {loadingStage || `Generating creative for "${topic}"...`}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3.5 py-1.5 rounded-full shadow-2xs border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
                  Generating Real AI Content &amp; Advertising Visual
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 1. INSTAGRAM MOCKUP (Default / Featured)                         */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {!loading && generatedPost && platform === 'instagram' && (
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-900 font-sans">
                
                {/* Header */}
                <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full ring-2 ring-pink-500 ring-offset-1 p-0.5 shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center">
                      {brandLogoUrl ? (
                        <img
                          src={brandLogoUrl}
                          alt={effectiveBrandName}
                          className="w-full h-full object-contain rounded-full bg-white"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-700">
                          {effectiveBrandName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 leading-none">
                          {effectiveBrandName.toLowerCase().replace(/\s+/g, '_')}
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Sponsored • Special Campaign
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold tracking-widest cursor-pointer hover:text-slate-600">···</span>
                </div>

                {/* ── REAL AI-GENERATED ADVERTISING CREATIVE ── */}
                <div className="w-full aspect-square bg-slate-900 relative overflow-hidden group">
                  {/* The Creative Visual Image */}
                  {activeVisualUrl ? (
                    <>
                      {!postImgLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-slate-300">
                          <RefreshCw size={24} className="animate-spin text-brand-teal" />
                          <span className="text-xs font-medium">Loading high-impact creative...</span>
                        </div>
                      )}
                      <img
                        src={activeVisualUrl}
                        alt={topic}
                        onLoad={() => setPostImgLoaded(true)}
                        onError={handleImageError}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          postImgLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                      <ImageIcon size={32} />
                      <span className="text-xs mt-2">Visual creative rendering...</span>
                    </div>
                  )}

                  {/* Overlaid Integrated Brand Badge (Top Left) */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-lg">
                    {brandLogoUrl ? (
                      <img
                        src={brandLogoUrl}
                        alt=""
                        className="w-4 h-4 rounded-full bg-white p-0.5 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-brand-violet text-white text-[9px] flex items-center justify-center font-bold">
                        {effectiveBrandName.charAt(0)}
                      </span>
                    )}
                    <span className="tracking-wide">{effectiveBrandName}</span>
                  </div>

                  {/* Overlaid Festive / Promo Pill (Top Right) */}
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                    {topic.toLowerCase().includes('diwali') ? 'Diwali Special' : 'Special Offer'}
                  </div>

                  {/* Overlaid Advertising Typography & CTA Bar (Bottom Overlay) */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 bg-gradient-to-t from-black/95 via-black/65 to-transparent text-white pt-10">
                    <div className="text-sm sm:text-base font-black uppercase tracking-wide text-amber-300 drop-shadow-md line-clamp-1">
                      {displayHeadline}
                    </div>
                    <div className="text-[11px] text-white/90 font-medium drop-shadow-sm mt-0.5 line-clamp-1">
                      {displaySubheadline}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-md bg-white text-slate-950 shadow-sm uppercase tracking-wider hover:bg-slate-100 transition-colors">
                        {displayCta}
                      </span>
                      <button
                        type="button"
                        onClick={handleDownloadCreative}
                        className="inline-flex items-center gap-1 text-[10px] text-white/90 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2 py-1 rounded transition-colors"
                        title="Download Creative Visual"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Engagement Bar */}
                <div className="p-3.5 flex items-center justify-between text-slate-800 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <Heart size={22} className="hover:text-red-500 cursor-pointer transition-colors" />
                    <MessageCircle size={22} className="hover:text-blue-500 cursor-pointer transition-colors" />
                    <Send size={22} className="hover:text-brand-violet cursor-pointer transition-colors" />
                  </div>
                  <Bookmark size={22} className="hover:text-amber-500 cursor-pointer transition-colors" />
                </div>

                {/* Likes count */}
                <div className="px-3.5 text-xs font-bold text-slate-900">
                  Liked by 1,428 people
                </div>

                {/* Caption Area with Real AI Generated Content */}
                <div className="p-3.5 text-xs leading-relaxed text-slate-800">
                  <span className="font-bold mr-1.5 text-slate-900">
                    {effectiveBrandName.toLowerCase().replace(/\s+/g, '_')}
                  </span>
                  <div className="mt-1 whitespace-pre-line font-sans text-slate-700">
                    {generatedPost}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2.5 uppercase tracking-wider">
                    Just now • Verified Advertising Campaign
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 2. LINKEDIN MOCKUP                                               */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {!loading && generatedPost && platform === 'linkedin' && (
              <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-slate-900 font-sans">
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 ring-2 ring-blue-600/20 p-0.5 flex items-center justify-center font-bold text-blue-700 overflow-hidden">
                      {brandLogoUrl ? (
                        <img src={brandLogoUrl} alt={effectiveBrandName} className="w-full h-full object-contain rounded-full" />
                      ) : (
                        effectiveBrandName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">
                        {effectiveBrandName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {resolvedIndustry || 'Enterprise & Consumer Solutions'} • Sponsored
                      </div>
                      <div className="text-[11px] text-slate-400">Just now • 🌐 Public</div>
                    </div>
                  </div>
                  <button className="text-blue-600 text-xs font-semibold hover:underline">+ Follow</button>
                </div>

                {/* LinkedIn Body Text */}
                <div className="p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {generatedPost}
                </div>

                {/* Attached Real Creative Visual */}
                {activeVisualUrl && (
                  <div className="w-full h-64 bg-slate-900 relative overflow-hidden border-t border-b border-slate-100">
                    <img
                      src={activeVisualUrl}
                      alt={topic}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white flex items-center justify-between">
                      <div className="text-xs font-bold uppercase text-amber-300 line-clamp-1">{displayHeadline}</div>
                      <button
                        type="button"
                        onClick={handleDownloadCreative}
                        className="text-[10px] bg-white/20 hover:bg-white/30 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        <Download size={11} /> Creative
                      </button>
                    </div>
                  </div>
                )}

                {/* Social Counter */}
                <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">👍</span>
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">❤️</span>
                    48 likes
                  </span>
                  <span>19 comments • 6 reposts</span>
                </div>

                {/* Action Row */}
                <div className="px-4 py-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-slate-600 text-xs font-semibold">
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><ThumbsUp size={16} /> Like</button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><MessageCircle size={16} /> Comment</button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><Repeat2 size={16} /> Repost</button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><Send size={16} /> Send</button>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 3. X (TWITTER) MOCKUP                                            */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {!loading && generatedPost && platform === 'twitter' && (
              <div className="w-full max-w-lg bg-black text-white rounded-2xl shadow-xl p-5 border border-slate-800 font-sans">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 p-0.5 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                    {brandLogoUrl ? (
                      <img src={brandLogoUrl} alt={effectiveBrandName} className="w-full h-full object-contain rounded-full" />
                    ) : (
                      effectiveBrandName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-bold text-white">{effectiveBrandName}</span>
                        <span className="text-slate-500 text-xs">@{effectiveBrandName.toLowerCase().replace(/\s+/g, '_')} · now</span>
                      </div>
                      <span className="text-slate-500 text-xs">···</span>
                    </div>

                    <div className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-100">
                      {generatedPost}
                    </div>

                    {/* Attached Creative Visual */}
                    {activeVisualUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 relative group">
                        <img
                          src={activeVisualUrl}
                          alt={topic}
                          onError={handleImageError}
                          className="w-full h-56 object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleDownloadCreative}
                          className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded text-[10px] text-white flex items-center gap-1 shadow-md"
                        >
                          <Download size={11} /> Download
                        </button>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><MessageCircle size={15} /> 24</span>
                      <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer"><Repeat2 size={15} /> 12</span>
                      <span className="flex items-center gap-1 hover:text-pink-400 cursor-pointer"><Heart size={15} /> 142</span>
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><Bookmark size={15} /></span>
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><Share2 size={15} /></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 4. FACEBOOK MOCKUP                                               */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {!loading && generatedPost && platform === 'facebook' && (
              <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-slate-900 font-sans">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden p-0.5">
                    {brandLogoUrl ? (
                      <img src={brandLogoUrl} alt={effectiveBrandName} className="w-full h-full object-contain rounded-full" />
                    ) : (
                      effectiveBrandName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{effectiveBrandName}</div>
                    <div className="text-xs text-slate-400">Sponsored • 🌐 Public</div>
                  </div>
                </div>

                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3">
                  {generatedPost}
                </div>

                {/* Attached Visual */}
                {activeVisualUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 relative">
                    <img
                      src={activeVisualUrl}
                      alt={topic}
                      onError={handleImageError}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                          {resolvedIndustry || 'Special Campaign'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {displayHeadline}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadCreative}
                        className="px-3 py-1.5 bg-brand-violet text-white hover:bg-brand-violet/90 rounded text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <Download size={13} /> {displayCta}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Copy Editor */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Direct Copy Editor
              </label>
              <span className="text-[11px] text-slate-400">
                You can edit the generated text before saving or publishing
              </span>
            </div>
            <textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              rows={5}
              placeholder="Generated post will appear here. You can edit it directly."
              className="w-full text-xs font-mono text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-violet"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialGeneratorPage;

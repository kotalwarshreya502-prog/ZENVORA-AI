import React, { useState } from 'react';
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
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Industry list (open-ended with custom option) ─────────────────────────────
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
  'No direct CTA',
];

const PLATFORM_API_MAP = {
  linkedin:  'LinkedIn',
  twitter:   'X (Twitter)',
  instagram: 'Instagram',
  facebook:  'Facebook',
};

const PLATFORM_BUTTONS = [
  { id: 'linkedin',  label: 'LinkedIn' },
  { id: 'twitter',   label: 'X (Twitter)' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook',  label: 'Facebook' },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export const SocialGeneratorPage = () => {
  const { user } = useAuth();

  // Form fields — all empty by default; no hardcoded brand, topic, or industry
  const [platform, setPlatform]             = useState('linkedin');
  const [brandName, setBrandName]           = useState('');
  const [industry, setIndustry]             = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [topic, setTopic]                   = useState('');
  const [objective, setObjective]           = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords]             = useState('');
  const [tone, setTone]                     = useState('Professional & Authoritative');
  const [ctaType, setCtaType]               = useState('Ask for comments');
  const [includeEmojis, setIncludeEmojis]   = useState(true);

  // Output state
  const [generatedPost, setGeneratedPost] = useState('');
  const [postImageUrl, setPostImageUrl]   = useState('');  // AI-generated visual for Instagram preview
  const [postImgLoaded, setPostImgLoaded] = useState(false);
  const [aiModel, setAiModel]             = useState('');  // Track which AI engine responded
  const [loading, setLoading]             = useState(false);
  const [loadingStage, setLoadingStage]   = useState('');
  const [error, setError]                 = useState(null);
  const [copied, setCopied]               = useState(false);
  const [scheduled, setScheduled]         = useState(false);
  const [savedSuccess, setSavedSuccess]   = useState(false);

  const resolvedIndustry = industry === '__custom__' ? customIndustry.trim() : industry;

  const platformLimits = { linkedin: 3000, twitter: 280, instagram: 2200, facebook: 5000 };
  const maxChar        = platformLimits[platform] || 3000;
  const isOverLimit    = generatedPost.length > maxChar;

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a Post Topic or Message Hook.');
      return;
    }
    setError(null);
    setLoading(true);
    setLoadingStage('Understanding your request...');
    setScheduled(false);
    setSavedSuccess(false);
    setPostImageUrl('');
    setPostImgLoaded(false);
    setAiModel('');

    try {
      const emojiNote = includeEmojis
        ? ' Use relevant emojis to make the post visually engaging.'
        : ' Do not use any emojis.';

      setLoadingStage('Calling Gemini AI...');

      const response = await api.generateContent({
        // Field names must match what aiController.js reads from req.body
        topic,
        type:           'Social Post',
        platform:       PLATFORM_API_MAP[platform] || platform,
        industry:       resolvedIndustry || 'General',
        targetAudience: targetAudience.trim() || 'General public',
        tone:           tone + emojiNote,
        language:       'English',
        keywords:       keywords.trim(),
        objective:      objective.trim() || ctaType,
        brandName:      brandName.trim(),
        length:         platform === 'twitter' ? 'Short (under 100 words)' : 'Medium (100-250 words)',
      });

      // api.js interceptor returns response.data; content lives in payload.data.content
      const payload = response?.data ?? response;
      const content = payload?.content ?? payload?.text;
      const model   = payload?.model || 'zenvora-engine-v1';

      if (content) {
        setGeneratedPost(content);
        setAiModel(model);
      } else {
        setError('The AI returned an empty response. Please try again.');
        return;
      }

      // ── Generate visual for Instagram preview ────────────────────────────
      if (platform === 'instagram') {
        setLoadingStage('Generating post visual...');
        try {
          const imgRes = await api.generateSocialGraphic({
            topic: `${topic}${brandName ? ` for ${brandName}` : ''}`,
            platform: 'Instagram',
            style: resolvedIndustry || 'modern professional marketing',
            width: 1080,
            height: 1080,
          });
          const imgPayload = imgRes?.data ?? imgRes;
          if (imgPayload?.imageUrl) {
            setPostImageUrl(imgPayload.imageUrl);
          }
        } catch (imgErr) {
          console.warn('[SocialGen] Visual generation failed:', imgErr?.message);
          // Don't fail the whole generation — just no image preview
        }
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err?.message || 'Content generation failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  // ── Utilities ──────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleSavePost = async () => {
    if (!generatedPost) return;
    try {
      await api.createPost({
        content:  generatedPost,
        platform: PLATFORM_API_MAP[platform] || platform,
        status:   'draft',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Failed to save draft: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleSchedulePost = async () => {
    if (!generatedPost) return;
    try {
      const scheduledDate = new Date(Date.now() + 86400000 * 2).toISOString();
      await api.createPost({
        content:      generatedPost,
        platform:     PLATFORM_API_MAP[platform] || platform,
        status:       'scheduled',
        scheduledFor: scheduledDate,
      });
      setScheduled(true);
      setTimeout(() => setScheduled(false), 3000);
    } catch (err) {
      console.error('Error scheduling post:', err);
      setError('Failed to schedule: ' + (err?.message || 'Unknown error'));
    }
  };

  // Shared input / select styles
  const inputCls = 'w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet bg-white';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="text-brand-violet" size={24} />
            Social Post Creator &amp; Live Preview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate platform-native social content for <strong>any brand, any industry</strong> — with real-time mockup previews.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 hover:text-rose-900">
            <XIcon size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left: Generator Form (5 cols) ─────────────────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
          <form onSubmit={handleGenerate} className="space-y-4">

            {/* Platform Selector */}
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
                placeholder="e.g. Flipkart, Zomato, Nike, Zenvora AI"
                className={inputCls}
              />
            </div>

            {/* Industry */}
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

            {/* Topic (required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Topic / Message Hook <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Big Shopping Sale, Weekend Food Offers, New Smartphone Launch, Fitness Campaign..."
                rows={3}
                required
                className={inputCls}
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Objective
              </label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Drive sales, Increase awareness, Get sign-ups"
                className={inputCls}
              />
            </div>

            {/* Target Audience & CTA row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Young shoppers 18-35"
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
                placeholder="e.g. sale, electronics, discount, fashion"
                className={inputCls}
              />
            </div>

            {/* Tone */}
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

            {/* Options row */}
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
                {aiModel && aiModel !== 'zenvora-engine-v1'
                  ? `✅ ${aiModel}`
                  : aiModel === 'zenvora-engine-v1'
                  ? '⚠️ Fallback (no Gemini key)'
                  : 'Gemini 1.5 Flash'}
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
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Post for {platform.toUpperCase()}
                </>
              )}
            </button>
          </form>

          {/* Quick Topic Chips */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Topic Examples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Big Shopping Sale',
                'Weekend Food Offers',
                'New Smartphone Launch',
                'Fitness Campaign',
                'Health Awareness',
                'AI Brand Governance',
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTopic(p)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-2.5 rounded-full transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Preview & Output (7 cols) ─────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Platform Preview:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet border border-brand-violet/20">
                {PLATFORM_API_MAP[platform]} Simulator
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!generatedPost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleSavePost}
                disabled={!generatedPost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {savedSuccess ? <Check size={14} className="text-emerald-600" /> : <Bookmark size={14} />}
                {savedSuccess ? 'Draft Saved' : 'Save Draft'}
              </button>
              <button
                onClick={handleSchedulePost}
                disabled={!generatedPost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90 transition-colors shadow-xs disabled:opacity-40"
              >
                {scheduled ? <Check size={14} /> : <Calendar size={14} />}
                {scheduled ? 'Scheduled' : 'Schedule'}
              </button>
            </div>
          </div>

          {/* SIMULATOR CANVAS */}
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex justify-center items-start min-h-[460px]">

            {/* Empty state */}
            {!generatedPost && !loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-300 w-full">
                <Sparkles size={36} className="opacity-30" />
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Fill in the form and click Generate to see your post here.
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 w-full">
                <RefreshCw size={28} className="animate-spin text-brand-violet" />
                <p className="text-xs text-slate-500 text-center">
                  {loadingStage || `Generating for "${topic}"...`}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-violet animate-pulse" />
                  Calling Gemini 1.5 Flash
                </div>
              </div>
            )}

            {/* LINKEDIN MOCKUP */}
            {!loading && generatedPost && platform === 'linkedin' && (
              <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-slate-900 font-sans">
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-violet to-brand-teal flex items-center justify-center text-white font-bold text-base shadow-xs">
                      {brandName ? brandName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0) : 'Z')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">
                        {brandName || user?.name || 'Zenvora AI User'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {resolvedIndustry || 'Brand'} • Marketing
                      </div>
                      <div className="text-[11px] text-slate-400">Just now • 🌐 Public</div>
                    </div>
                  </div>
                  <button className="text-blue-600 text-xs font-semibold hover:underline">+ Follow</button>
                </div>
                <div className="p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {generatedPost}
                </div>
                <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">👍</span>
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">❤️</span>
                    42 likes
                  </span>
                  <span>14 comments • 3 reposts</span>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-slate-600 text-xs font-semibold">
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><ThumbsUp size={16} /> Like</button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><MessageCircle size={16} /> Comment</button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><Repeat2 size={16} /> Repost</button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded"><Send size={16} /> Send</button>
                </div>
              </div>
            )}

            {/* X (TWITTER) MOCKUP */}
            {!loading && generatedPost && platform === 'twitter' && (
              <div className="w-full max-w-lg bg-black text-white rounded-2xl shadow-lg p-5 border border-slate-800">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-violet to-brand-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {brandName ? brandName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0) : 'Z')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-bold text-white">{brandName || user?.name || 'Brand'}</span>
                        <span className="text-slate-500 text-xs">@{(brandName || 'brand').toLowerCase().replace(/\s+/g, '_')} · now</span>
                      </div>
                      <span className="text-slate-500 text-xs">···</span>
                    </div>
                    <div className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-100">
                      {generatedPost}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><MessageCircle size={15} /> 12</span>
                      <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer"><Repeat2 size={15} /> 8</span>
                      <span className="flex items-center gap-1 hover:text-pink-400 cursor-pointer"><Heart size={15} /> 89</span>
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><Bookmark size={15} /></span>
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><Share2 size={15} /></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INSTAGRAM MOCKUP */}
            {!loading && generatedPost && platform === 'instagram' && (
              <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden text-slate-900">
                <div className="p-3 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full ring-2 ring-pink-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {brandName ? brandName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0) : 'Z')}
                      </div>
                    </div>
                    <span className="text-xs font-bold">
                      {brandName ? brandName.toLowerCase().replace(/\s+/g, '_') : 'brand_official'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-bold">···</span>
                </div>

                {/* AI-Generated Visual — Pollinations.ai image based on topic */}
                <div className="w-full h-64 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {postImageUrl ? (
                    <>
                      {!postImgLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-100">
                          <RefreshCw size={20} className="animate-spin" />
                          <span className="text-xs">Loading AI visual...</span>
                        </div>
                      )}
                      <img
                        src={postImageUrl}
                        alt={topic}
                        onLoad={() => setPostImgLoaded(true)}
                        onError={() => setPostImgLoaded(true)}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${postImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </>
                  ) : (
                    /* Generating visual state or placeholder */
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 text-center">
                      <Sparkles className="text-brand-teal mb-1" size={24} />
                      <span className="text-xs font-semibold tracking-wide text-slate-300">
                        {topic || 'Campaign Post'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {resolvedIndustry ? `${resolvedIndustry} • ` : ''}AI Creative
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex items-center justify-between text-slate-800">
                  <div className="flex items-center gap-4">
                    <Heart size={20} className="hover:text-red-500 cursor-pointer" />
                    <MessageCircle size={20} className="hover:text-blue-500 cursor-pointer" />
                    <Send size={20} className="hover:text-brand-violet cursor-pointer" />
                  </div>
                  <Bookmark size={20} className="hover:text-yellow-500 cursor-pointer" />
                </div>
                <div className="px-3 pb-4 text-xs leading-relaxed">
                  <span className="font-bold mr-1.5">
                    {brandName ? brandName.toLowerCase().replace(/\s+/g, '_') : 'brand_official'}
                  </span>
                  <span className="text-slate-700 whitespace-pre-line">{generatedPost}</span>
                  <div className="text-[11px] text-slate-400 mt-2 uppercase">Just now</div>
                </div>
              </div>
            )}

            {/* FACEBOOK MOCKUP */}
            {!loading && generatedPost && platform === 'facebook' && (
              <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-slate-200 p-4 text-slate-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {brandName ? brandName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0) : 'Z')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{brandName || user?.businessName || 'Brand'}</div>
                    <div className="text-xs text-slate-400">Sponsored • 🌐</div>
                  </div>
                </div>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-4">
                  {generatedPost}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      {resolvedIndustry || 'Brand Campaign'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {topic || 'Campaign Post'}
                    </span>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold">
                    Learn More
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Copy Editor */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Direct Copy Editor
            </label>
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

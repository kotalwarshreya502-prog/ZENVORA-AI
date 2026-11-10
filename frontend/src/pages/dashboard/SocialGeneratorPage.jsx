import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Send,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Bookmark,
  Heart,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const SocialGeneratorPage = () => {
  const { user } = useAuth();
  const [platform, setPlatform] = useState('linkedin');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional & Authoritative');
  const [targetAudience, setTargetAudience] = useState('B2B decision makers & marketing leaders');
  const [ctaType, setCtaType] = useState('Comment below with your thoughts');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [generatedPost, setGeneratedPost] = useState(
    '🚀 High-performing digital marketing is no longer about doing more—it is about orchestrating precision.\n\nAt ZENVORA AI, we analyzed over 100,000 multi-channel campaigns. The #1 differentiator between companies scaling past 7-figures and those plateauing?\n\nAutonomous consistency backed by brand-voice intelligence.\n\n3 key takeaways for modern CMOs:\n1️⃣ Unified brand voice across every touchpoint\n2️⃣ Real-time algorithmic SEO feedback loops\n3️⃣ Continuous AI-assisted creative iteration\n\nWhat is your team’s biggest bottleneck when executing cross-channel content? Let’s discuss in the comments 👇\n\n#DigitalMarketing #SaaSGrowth #MarketingAutomation #ZenvoraAI #CMOInsights'
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const platformLimits = {
    linkedin: 3000,
    twitter: 280,
    instagram: 2200,
    facebook: 5000,
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setScheduled(false);
    setSavedSuccess(false);

    try {
      const response = await api.generateContent({
        prompt: topic,
        type: 'social',
        platform: platform,
        tone: tone,
        targetAudience: targetAudience,
      });

      if (response && response.data && response.data.content) {
        setGeneratedPost(response.data.content);
      }
    } catch (err) {
      console.error('Generation error:', err);
      // Fallback generative content
      setGeneratedPost(
        `⚡ Quick take on ${topic}:\n\nMost modern teams underestimate the power of systematizing their distribution. When you align your messaging with real customer pain points, the compound growth takes care of itself.\n\nKey takeaways:\n• Focus on value before asks\n• Maintain brand tone consistency\n• Measure what matters, ignore vanity metrics\n\nWhat's your experience with ${topic}? Share your thoughts below!\n\n#${topic.replace(/\s+/g, '')} #GrowthStrategy #ZenvoraAI`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePost = async () => {
    try {
      await api.createPost({
        content: generatedPost,
        platform: platform,
        status: 'draft',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleSchedulePost = async () => {
    try {
      const scheduledDate = new Date(Date.now() + 86400000 * 2).toISOString();
      await api.createPost({
        content: generatedPost,
        platform: platform,
        status: 'scheduled',
        scheduledFor: scheduledDate,
      });
      setScheduled(true);
      setTimeout(() => setScheduled(false), 3000);
    } catch (err) {
      console.error('Error scheduling post:', err);
    }
  };

  const maxChar = platformLimits[platform] || 2000;
  const currentLength = generatedPost.length;
  const isOverLimit = currentLength > maxChar;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="text-brand-violet" size={24} />
            Social Post Creator & Live Preview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate platform-native social content with real-time mockup visualizers for LinkedIn, X, Instagram, and Facebook.
          </p>
        </div>
      </div>

      {/* Grid: Config Form & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Target Platform Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Target Platform
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'linkedin', label: 'LinkedIn', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { id: 'twitter', label: 'X (Twitter)', color: 'bg-slate-100 text-slate-900 border-slate-300' },
                  { id: 'instagram', label: 'Instagram', color: 'bg-pink-50 text-pink-700 border-pink-200' },
                  { id: 'facebook', label: 'Facebook', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                ].map((item) => (
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

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Post Topic or Message Hook <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why B2B companies are switching to autonomous AI marketing, and 3 key metrics to track."
                rows={3}
                required
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
            </div>

            {/* Tone Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Brand Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet bg-white"
                >
                  <option value="Professional & Authoritative">Professional & Authoritative</option>
                  <option value="Conversational & Friendly">Conversational & Friendly</option>
                  <option value="Inspiring & Thought-provoking">Inspiring & Thought-provoking</option>
                  <option value="Urgent & Promotional">Urgent & Promotional</option>
                  <option value="Bold & Controversial">Bold & Disruptive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Call To Action
                </label>
                <select
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet bg-white"
                >
                  <option value="Comment below with your thoughts">Ask for Comments</option>
                  <option value="Click the link in bio / first comment">Link in Bio / Comments</option>
                  <option value="Share this with your network">Share / Repost Request</option>
                  <option value="Send a direct message">DM for Details</option>
                  <option value="No direct CTA">Pure Educational</option>
                </select>
              </div>
            </div>

            {/* Options */}
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
              <span className="text-[11px] text-slate-400 font-mono">Gemini 1.5 Flash</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium shadow-md shadow-brand-violet/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Writing native post with Gemini...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Post for {platform.toUpperCase()}
                </>
              )}
            </button>
          </form>

          {/* Prompt Templates */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Inspiration Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Product launch announcement',
                'Customer success milestone',
                'Debunking marketing myth',
                'Weekly industry round-up',
              ].map((p, idx) => (
                <button
                  key={idx}
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

        {/* Right Column: Live Mockup Preview & Output Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Platform Preview:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet border border-brand-violet/20">
                {platform} Simulator
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded ${
                  isOverLimit ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {currentLength} / {maxChar} chars
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleSavePost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                {savedSuccess ? <Check size={14} className="text-emerald-600" /> : <Bookmark size={14} />}
                {savedSuccess ? 'Draft Saved' : 'Save Draft'}
              </button>
              <button
                onClick={handleSchedulePost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90 transition-colors shadow-xs"
              >
                {scheduled ? <Check size={14} /> : <Calendar size={14} />}
                {scheduled ? 'Scheduled' : 'Schedule'}
              </button>
            </div>
          </div>

          {/* SIMULATOR CANVAS */}
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex justify-center items-start min-h-[460px]">
            {/* LINKEDIN MOCKUP */}
            {platform === 'linkedin' && (
              <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-slate-900 font-sans">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-violet to-brand-teal flex items-center justify-center text-white font-bold text-base shadow-xs">
                      {user?.name ? user.name.charAt(0) : 'Z'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">
                        {user?.name || 'Zenvora AI User'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Head of Growth • {user?.businessName || 'Zenvora Marketing Labs'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        Just now • 🌐 Public
                      </div>
                    </div>
                  </div>
                  <button className="text-blue-600 text-xs font-semibold hover:underline">+ Follow</button>
                </div>

                {/* Content */}
                <div className="p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {generatedPost}
                </div>

                {/* Engagement Bar */}
                <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">👍</span>
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">❤️</span>
                    42 likes
                  </span>
                  <span>14 comments • 3 reposts</span>
                </div>

                {/* Actions */}
                <div className="px-4 py-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-slate-600 text-xs font-semibold">
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded">
                    <ThumbsUp size={16} /> Like
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded">
                    <MessageCircle size={16} /> Comment
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded">
                    <Repeat2 size={16} /> Repost
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded">
                    <Send size={16} /> Send
                  </button>
                </div>
              </div>
            )}

            {/* X (TWITTER) MOCKUP */}
            {platform === 'twitter' && (
              <div className="w-full max-w-lg bg-black text-white rounded-2xl shadow-lg p-5 border border-slate-800">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-violet to-brand-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user?.name ? user.name.charAt(0) : 'Z'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-bold text-white">{user?.name || 'Zenvora User'}</span>
                        <span className="text-slate-500 text-xs">@zenvora_ai · now</span>
                      </div>
                      <span className="text-slate-500 text-xs">···</span>
                    </div>

                    <div className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-100">
                      {generatedPost}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                        <MessageCircle size={15} /> 12
                      </span>
                      <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                        <Repeat2 size={15} /> 8
                      </span>
                      <span className="flex items-center gap-1 hover:text-pink-400 cursor-pointer">
                        <Heart size={15} /> 89
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                        <Bookmark size={15} />
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                        <Share2 size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INSTAGRAM MOCKUP */}
            {platform === 'instagram' && (
              <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden text-slate-900">
                {/* Header */}
                <div className="p-3 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full ring-2 ring-pink-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {user?.name ? user.name.charAt(0) : 'Z'}
                      </div>
                    </div>
                    <span className="text-xs font-bold">zenvora_growth</span>
                  </div>
                  <span className="text-slate-400 font-bold">···</span>
                </div>

                {/* Media Placeholder */}
                <div className="w-full h-64 bg-gradient-to-br from-brand-navy via-slate-900 to-brand-violet flex flex-col items-center justify-center text-white p-6 text-center">
                  <Sparkles className="text-brand-teal mb-2" size={32} />
                  <span className="text-sm font-semibold tracking-wide uppercase text-brand-teal">
                    Visual Ready
                  </span>
                  <p className="text-xs text-slate-300 mt-2 max-w-xs">
                    Automated brand card generated for high feed contrast.
                  </p>
                </div>

                {/* Actions */}
                <div className="p-3 flex items-center justify-between text-slate-800">
                  <div className="flex items-center gap-4">
                    <Heart size={20} className="hover:text-red-500 cursor-pointer" />
                    <MessageCircle size={20} className="hover:text-blue-500 cursor-pointer" />
                    <Send size={20} className="hover:text-brand-violet cursor-pointer" />
                  </div>
                  <Bookmark size={20} className="hover:text-yellow-500 cursor-pointer" />
                </div>

                {/* Caption */}
                <div className="px-3 pb-4 text-xs leading-relaxed">
                  <span className="font-bold mr-1.5">zenvora_growth</span>
                  <span className="text-slate-700 whitespace-pre-line">{generatedPost}</span>
                  <div className="text-[11px] text-slate-400 mt-2 uppercase">2 minutes ago</div>
                </div>
              </div>
            )}

            {/* FACEBOOK MOCKUP */}
            {platform === 'facebook' && (
              <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-slate-200 p-4 text-slate-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {user?.name ? user.name.charAt(0) : 'Z'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{user?.businessName || 'Zenvora AI'}</div>
                    <div className="text-xs text-slate-400">Sponsored • 🌐</div>
                  </div>
                </div>

                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-4">
                  {generatedPost}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">zenvora.ai</span>
                    <span className="text-xs font-semibold text-slate-800">Smarter Marketing. Sustainable Growth.</span>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold">
                    Learn More
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Edit Direct in Textarea */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Direct Copy Editor
            </label>
            <textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              rows={4}
              className="w-full text-xs font-mono text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-violet"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialGeneratorPage;

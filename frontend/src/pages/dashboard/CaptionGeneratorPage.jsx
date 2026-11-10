import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Send,
  Zap,
  Bookmark,
  Share2,
} from 'lucide-react';
import { api } from '../../services/api';

export const CaptionGeneratorPage = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Conversational & Engaging');
  const [length, setLength] = useState('medium');
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [captions, setCaptions] = useState([
    {
      id: 1,
      style: 'The Attention Hook',
      text: 'Stop guessing your marketing metrics. 🎯 Here is the exact framework we used to scale organic leads by 312% in 90 days—without doubling ad spend.',
      tags: '#GrowthHacking #MarketingFramework #ZenvoraAI',
    },
    {
      id: 2,
      style: 'The Narrative Story',
      text: 'Two years ago, we were spending 20 hours a week manually syncing spreadsheets and guessing content performance. Today, autonomous intelligence handles the heavy lifting so our strategists can focus purely on vision. Consistency is no longer luck—it is a repeatable system.',
      tags: '#SaaSStory #FounderJourney #Automation',
    },
    {
      id: 3,
      style: 'The Conversation Starter',
      text: 'Unpopular opinion: 80% of daily social posts create zero measurable pipeline. What is the ONE marketing metric your leadership team actually cares about right now? Drop it below 👇',
      tags: '#MarketingDebate #B2BGrowth #Discussion',
    },
    {
      id: 4,
      style: 'The Minimalist Punch',
      text: 'Smarter marketing. Sustainable growth. Less noise, more qualified revenue. ⚡',
      tags: '#PrecisionMarketing #Zenvora',
    },
    {
      id: 5,
      style: 'The Action-Oriented CTA',
      text: 'Ready to turn unpredictable marketing campaigns into an automated revenue engine? Link in bio to explore the complete ZENVORA AI growth blueprint.',
      tags: '#MarketingAutomation #LinkInBio #ScaleUp',
    },
  ]);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await api.generateCaptions({
        topic,
        tone,
        length,
        platform,
      });

      if (response && response.data && Array.isArray(response.data.captions) && response.data.captions.length > 0) {
        setCaptions(response.data.captions);
      } else if (response && response.data && typeof response.data === 'string') {
        // Parse into list
        const lines = response.data.split('\n\n').filter(Boolean);
        const parsed = lines.slice(0, 5).map((l, i) => ({
          id: i + 1,
          style: `Variation ${i + 1}`,
          text: l.trim(),
          tags: `#${topic.replace(/\s+/g, '')} #ZenvoraAI`,
        }));
        setCaptions(parsed);
      }
    } catch (err) {
      console.error('Caption generation error:', err);
      // Generate clean generative fallback variations
      setCaptions([
        {
          id: 1,
          style: 'The Direct Hook',
          text: `Why most brands fail at ${topic}: they focus on vanity impressions rather than repeatable retention. Here is what actually moves the needle. 💡`,
          tags: `#${topic.replace(/\s+/g, '')} #Strategy #Growth`,
        },
        {
          id: 2,
          style: 'The Storyteller',
          text: `Behind every breakthrough in ${topic} is an obsessive commitment to systems over inspiration. When you automate the repetitive, you unlock genuine creativity.`,
          tags: `#${topic.replace(/\s+/g, '')} #SystemsThinking`,
        },
        {
          id: 3,
          style: 'The Community Question',
          text: `If you could automate one part of your ${topic} workflow today, what would it be? Tell us in the comments! 👇`,
          tags: `#Community #MarketingQuestions`,
        },
        {
          id: 4,
          style: 'The Minimalist',
          text: `Master ${topic} with clarity, not complexity. 🚀`,
          tags: `#Clarity #Focus`,
        },
        {
          id: 5,
          style: 'The Conversion Prompt',
          text: `Looking to level up your ${topic}? Tap the link in our profile for full access to our step-by-step masterclass.`,
          tags: `#LevelUp #Resources`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, tags, index) => {
    const fullText = `${text}\n\n${tags}`;
    navigator.clipboard.writeText(fullText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="text-brand-violet" size={24} />
          Multi-Angle Caption Studio
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate 5 distinct hook angles and tested caption styles tailored for high engagement and conversion across feeds.
        </p>
      </div>

      {/* Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 4 Cols */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs h-fit">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Post Subject or Visual Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photo of our new dashboard analytics feature that spots SEO drop-offs."
                rows={3}
                required
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Destination Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
              >
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok Video Description</option>
                <option value="youtube">YouTube Shorts / Community</option>
                <option value="facebook">Facebook Post</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Desired Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
              >
                <option value="Conversational & Engaging">Conversational & Engaging</option>
                <option value="Direct & High Energy">Direct & High Energy</option>
                <option value="Executive & Thoughtful">Executive & Thoughtful</option>
                <option value="Witty & Relatable">Witty & Relatable</option>
                <option value="Promotional & High Urgency">Promotional & High Urgency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Length Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['short', 'medium', 'long'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`py-2 text-xs font-medium rounded-lg border text-center capitalize transition-all ${
                      length === l
                        ? 'border-brand-violet bg-brand-violet/10 text-brand-violet font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full py-3 px-4 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md shadow-brand-violet/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Generating 5 Angles...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate 5 Captions
                </>
              )}
            </button>
          </form>

          {/* Quick presets */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Angles:
            </span>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded">
                <span className="w-2 h-2 rounded-full bg-brand-violet"></span>
                <span>The Counter-Intuitive Hook</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded">
                <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
                <span>The Vulnerable Founder Story</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>The Community Poll Prompt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: 8 Cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Generated Variations ({captions.length})
            </span>
            <span className="text-xs text-slate-400">Click any card to copy with tags</span>
          </div>

          <div className="space-y-3">
            {captions.map((c, idx) => (
              <div
                key={c.id || idx}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-violet/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-brand-violet uppercase tracking-wider bg-brand-violet/5 px-2.5 py-0.5 rounded-full border border-brand-violet/10">
                    {c.style || `Angle ${idx + 1}`}
                  </span>
                  <button
                    onClick={() => handleCopy(c.text, c.tags, idx)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-slate-100 group-hover:bg-brand-violet group-hover:text-white text-slate-700 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check size={13} className="text-emerald-500 group-hover:text-white" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy Caption
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3">
                  {c.text}
                </p>

                {c.tags && (
                  <div className="text-xs font-mono text-brand-teal bg-teal-50/50 p-2 rounded-lg border border-teal-100">
                    {c.tags}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionGeneratorPage;

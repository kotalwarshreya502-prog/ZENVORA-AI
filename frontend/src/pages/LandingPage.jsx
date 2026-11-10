import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe,
  Layers,
  LineChart,
  Lock,
  MessageSquare,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandSymbol from '../components/common/BrandSymbol';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('studio');
  const [activeFaq, setActiveFaq] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const faqs = [
    {
      q: 'How does ZENVORA AI preserve my unique brand voice?',
      a: 'ZENVORA features a dedicated Brand Knowledge Base. You define your target personas, tone attributes, prohibited vocabulary, and core value propositions. Every AI generation prompt automatically injects these guidelines to prevent generic content.',
    },
    {
      q: 'Does AI-generated content get penalized by Google?',
      a: 'Google explicitly states in their Search Essentials that content is evaluated on helpfulness, depth, and user intent, not whether AI assisted in the drafting. ZENVORA structures every article with semantic depth, original outline points, and schema-ready metadata.',
    },
    {
      q: 'Can I connect multiple social media accounts?',
      a: 'Yes! ZENVORA supports direct integrations with LinkedIn Company & Personal pages, X (Twitter), Facebook Pages, and Instagram Professional accounts.',
    },
    {
      q: 'How does the free trial work?',
      a: 'You get a full 14-day free trial on the Growth plan with 50,000 generated words and unlimited campaign scheduling. No credit card is required to explore.',
    },
    {
      q: 'Is my business data isolated and secure?',
      a: 'Yes, every business account runs within an isolated workspace. We never use your proprietary marketing data or customer records to train public AI models.',
    },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-violet/15 via-brand-teal/10 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs hover:border-brand-violet/40 transition-colors cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-brand-teal animate-pulse" />
          <span className="text-xs font-bold text-brand-navy">ZENVORA AI 2.0 Engine Live</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-brand-violet font-semibold flex items-center gap-0.5">
            Explore Autonomous Marketing <ChevronRight size={12} />
          </span>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-brand-navy leading-[1.08]">
            Smarter Marketing.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet via-[#8b5cf6] to-brand-teal">
              Sustainable Growth.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Consolidate AI blog generation, keyword clustering, autonomous social scheduling, and real-time SEO intelligence into one high-velocity marketing platform.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-4 rounded-xl shadow-lg shadow-brand-violet/25">
              <span>Start Free 14-Day Trial</span>
              <ArrowRight size={18} />
            </Button>
          </Link>

          <Link to="/features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-7 py-4 rounded-xl border-slate-300">
              <Play size={16} className="text-brand-violet fill-brand-violet" />
              <span>Explore Platform Features</span>
            </Button>
          </Link>
        </div>

        {/* Micro Social Proof */}
        <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-brand-teal" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-brand-teal" />
            <span>Real Gemini AI Engine</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <CheckCircle2 size={15} className="text-brand-teal" />
            <span>Setup in under 2 minutes</span>
          </div>
        </div>

        {/* ─── Interactive SaaS Dashboard Preview ─────────────────────────────── */}
        <div className="pt-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-5 shadow-2xl relative overflow-hidden">
            {/* Header Mockup Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 px-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-3 hidden sm:inline">app.zenvora.ai/dashboard</span>
              </div>

              {/* Showcase Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                {[
                  { id: 'studio', label: 'AI Content Studio' },
                  { id: 'blog', label: 'SEO Blog Engine' },
                  { id: 'campaigns', label: 'Campaign Hub' },
                  { id: 'seo', label: 'SEO Audit' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === t.id
                        ? 'bg-white text-brand-navy shadow-xs'
                        : 'hover:text-brand-navy'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Showcase Display Area */}
            <div className="p-4 sm:p-8 bg-slate-50/70 rounded-2xl mt-4 min-h-[380px] text-left">
              {activeTab === 'studio' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-5 space-y-4">
                    <Badge variant="violet" size="sm">Content Studio</Badge>
                    <h3 className="text-2xl font-bold text-brand-navy">Generate multi-channel marketing copy in seconds.</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Select your target audience, tone, and platform. ZENVORA AI drafts high-converting hooks, bodies, and calls-to-action tailored to your brand voice.
                    </p>
                    <div className="space-y-2 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-brand-teal" />
                        <span>Platform-optimized formatting (LinkedIn, X, Instagram)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-brand-teal" />
                        <span>Automated hashtag tiering (Reach vs Intent)</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-100">
                      <span>Platform: LinkedIn • Tone: Authoritative</span>
                      <span className="text-emerald-600 font-bold">Generated in 1.2s</span>
                    </div>
                    <div className="text-brand-navy font-sans font-semibold text-sm">
                      🚀 Most B2B marketing teams spend 68% of their hours copy-pasting posts across spreadsheets.
                    </div>
                    <p className="font-sans text-xs text-slate-600 leading-relaxed">
                      Here is the reality: clarity consistently beats cleverness. When you anchor your content to unified Brand Guidelines, you build compounding organic equity that paid ad spend simply cannot duplicate.
                    </p>
                    <div className="pt-2 text-[11px] text-brand-violet font-sans font-medium">
                      #MarketingAutomation #SaaSGrowth #OrganicSEO #DigitalStrategy
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'blog' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-5 space-y-4">
                    <Badge variant="teal" size="sm">SEO Blog Writer</Badge>
                    <h3 className="text-2xl font-bold text-brand-navy">Comprehensive long-form articles that actually rank.</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Transform a single keyword into an authoritative 1,500+ word article complete with H2/H3 structures, meta descriptions, and schema-ready FAQs.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-brand-violet text-lg font-extrabold">94/100</div>
                        <div className="text-[11px] text-slate-500">SEO Health Score</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-brand-teal text-lg font-extrabold">1,820</div>
                        <div className="text-[11px] text-slate-500">Words Generated</div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-brand-navy text-sm">The 2026 Playbook for Organic Content Scaling</span>
                      <Badge variant="success" size="sm">SEO Score: 94</Badge>
                    </div>
                    <div className="text-slate-500 italic">Meta: "Discover how growth-stage SaaS founders scale content velocity without compromising on brand tone..."</div>
                    <div className="space-y-1.5 pt-2 text-slate-700">
                      <div className="font-bold text-brand-navy">1. The Shift to Semantic Intent Architecture</div>
                      <div className="text-slate-500 pl-4">• Why keyword density metrics are obsolete in modern SERPs</div>
                      <div className="text-slate-500 pl-4">• Mapping customer query journeys across mid-funnel content</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'campaigns' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="navy" size="sm">Unified Campaigns</Badge>
                      <h4 className="text-xl font-bold text-brand-navy mt-1">Multi-Channel Campaign Performance</h4>
                    </div>
                    <Link to="/register" className="text-xs font-bold text-brand-violet hover:underline">
                      Launch New Campaign →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {[
                      { name: 'Q4 Product Launch & Organic SEO', progress: 68, status: 'In Progress', budget: '$5,000', channels: 'LinkedIn, X, Blog' },
                      { name: 'Black Friday & Cyber Week Push', progress: 45, status: 'Approved', budget: '$8,000', channels: 'Instagram, Meta' },
                      { name: 'Thought Leadership Technical Guides', progress: 92, status: 'Published', budget: '$3,500', channels: 'Blog, LinkedIn' },
                    ].map((c) => (
                      <div key={c.name} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="truncate pr-2 text-brand-navy">{c.name}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{c.status}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-violet h-full rounded-full" style={{ width: `${c.progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{c.channels}</span>
                          <span className="font-bold text-brand-navy">{c.progress}% complete</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-5 space-y-4">
                    <Badge variant="violet" size="sm">Live SEO Auditor</Badge>
                    <h3 className="text-2xl font-bold text-brand-navy">Instant technical website health analysis.</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Audit any URL for title tag limits, meta descriptions, heading depth, image alt attributes, and canonical tags with clear severity-ranked fixes.
                    </p>
                  </div>
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="font-mono text-slate-600 font-semibold">https://zenvora.ai</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">Score: 95/100</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-brand-navy">Title Tag Length (52 chars)</span>
                        <span className="text-emerald-600 font-bold">PASS</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-brand-navy">Meta Description Detected (148 chars)</span>
                        <span className="text-emerald-600 font-bold">PASS</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-brand-navy">Single Primary H1 Tag</span>
                        <span className="text-emerald-600 font-bold">PASS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted By Section ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
          POWERING MARKETING VELOCITY FOR MODERN SAAS & AGENCIES
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all text-sm font-extrabold tracking-tight text-slate-700">
          <span>APEX DIGITAL</span>
          <span>NEXUS VENTURES</span>
          <span>HYPERGROWTH LABS</span>
          <span>SCALEWORKS</span>
          <span>ORBITAL MEDIA</span>
        </div>
      </section>

      {/* ─── 6 Core Value Pillars Grid ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="violet" size="md">Complete Architecture</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight">
            Everything your marketing team needs under one roof.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Replace 6 disconnected marketing subscriptions with an integrated AI marketing engine built for high-tempo execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Bot className="text-brand-violet" size={26} />,
              title: 'AI Content Studio',
              desc: 'Generate high-performing social posts, ad copy, captions, and marketing concepts tailored to each network.',
              tag: 'Gemini 1.5 Flash',
            },
            {
              icon: <FileText className="text-brand-teal" size={26} />,
              title: 'Autonomous SEO Blog Writer',
              desc: 'Turn a target keyword into a rich, structured, research-backed blog article complete with outlines and FAQs.',
              tag: '1,500+ Words',
            },
            {
              icon: <Calendar className="text-brand-violet" size={26} />,
              title: 'Multi-Channel Calendar',
              desc: 'Drag-and-drop scheduling across LinkedIn, Instagram, and X with integrated human approval workflows.',
              tag: 'Visual Scheduling',
            },
            {
              icon: <Search className="text-brand-teal" size={26} />,
              title: 'Heuristic Website SEO Auditor',
              desc: 'Scan your public URLs to identify missing meta tags, heading issues, broken alt text, and crawlability roadblocks.',
              tag: 'Instant Scan',
            },
            {
              icon: <ShieldCheck className="text-brand-violet" size={26} />,
              title: 'Brand Knowledge Base',
              desc: 'Store your brand voice, prohibited jargon, and target personas so every output sounds unmistakably yours.',
              tag: 'Brand Protection',
            },
            {
              icon: <BarChart3 className="text-brand-teal" size={26} />,
              title: 'Actionable Marketing Analytics',
              desc: 'Track aggregate impressions, click-through rates, and organic pipeline compounding over time with Recharts.',
              tag: 'Real-time Metrics',
            },
          ].map((item) => (
            <Card key={item.title} className="p-8 space-y-4 hover:border-brand-violet/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-brand-navy">{item.title}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{item.tag}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 3-Step Workflow ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="teal" size="sm">Streamlined Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              From raw keyword to scheduled campaign in 3 minutes.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Lock In Your Brand Persona',
                desc: 'Define your voice parameters, customer demographics, and preferred keyword priorities in your Brand Guidelines.',
              },
              {
                step: '02',
                title: 'Generate High-Depth Assets',
                desc: 'Produce authoritative blog drafts and platform-native social content powered by Google Gemini models.',
              },
              {
                step: '03',
                title: 'Review, Schedule & Compound',
                desc: 'Approve assets through your team queue and schedule automatically into your unified marketing calendar.',
              },
            ].map((st) => (
              <div key={st.step} className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="text-4xl font-extrabold text-brand-violet font-mono">{st.step}</div>
                <h3 className="text-xl font-bold text-brand-navy">{st.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Preview ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        <div className="space-y-4 max-w-2xl mx-auto">
          <Badge variant="violet" size="md">Transparent Pricing</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight">
            Simple, predictable pricing for every stage.
          </h2>
          <p className="text-base text-slate-600">
            Start with our 14-day free trial. Upgrade or cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold pt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl transition-all ${billingCycle === 'monthly' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl transition-all ${billingCycle === 'yearly' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500'}`}
            >
              Annual Billing <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[10px] ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Starter Plan */}
          <Card className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-brand-navy">Starter</h3>
              <p className="text-xs text-slate-500 mt-1">For solopreneurs and early-stage founders</p>
              <div className="text-4xl font-extrabold text-brand-navy mt-4">
                {billingCycle === 'yearly' ? '$23' : '$29'}<span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> 30,000 AI words / month</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> 50 scheduled posts</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> 1 Brand Guideline profile</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> Standard SEO Website Audit</li>
            </ul>
            <Link to="/register" className="block">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </Card>

          {/* Growth Plan (Popular) */}
          <Card className="p-8 space-y-6 border-2 border-brand-violet relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-violet text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy">Growth</h3>
              <p className="text-xs text-slate-500 mt-1">For scaling SMBs and active marketing teams</p>
              <div className="text-4xl font-extrabold text-brand-navy mt-4">
                {billingCycle === 'yearly' ? '$63' : '$79'}<span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> 150,000 AI words / month</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> Unlimited scheduled posts</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> 5 Brand Guideline profiles</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> Deep SEO Heuristic Engine</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> Multi-Channel Campaign Hub</li>
            </ul>
            <Link to="/register" className="block">
              <Button variant="primary" className="w-full shadow-md shadow-brand-violet/25">Start 14-Day Free Trial</Button>
            </Link>
          </Card>

          {/* Agency Pro Plan */}
          <Card className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-brand-navy">Agency Pro</h3>
              <p className="text-xs text-slate-500 mt-1">For digital agencies and multi-client workflows</p>
              <div className="text-4xl font-extrabold text-brand-navy mt-4">
                {billingCycle === 'yearly' ? '$159' : '$199'}<span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> 500,000 AI words / month</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> Unlimited client workspaces</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> Unlimited brand guidelines</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> White-label reporting exports</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-brand-teal" /> Priority API concurrency</li>
            </ul>
            <Link to="/register" className="block">
              <Button variant="secondary" className="w-full">Choose Agency Pro</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* ─── FAQ Accordion ──────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="navy" size="sm">Got Questions?</Badge>
          <h2 className="text-3xl font-bold text-brand-navy">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between font-bold text-brand-navy text-sm sm:text-base">
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 ${
                    activeFaq === idx ? 'rotate-180 text-brand-violet' : ''
                  }`}
                />
              </div>
              {activeFaq === idx && (
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA Banner ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-navy via-[#1e274a] to-brand-navy rounded-3xl p-10 sm:p-16 text-center text-white space-y-6 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready for sustainable marketing growth?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join growth-stage founders and modern marketers leveraging ZENVORA AI to create compounding organic reach today.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-4 font-bold shadow-lg shadow-brand-violet/30">
                  <span>Start Free 14-Day Trial</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-4 text-white border-slate-700 hover:bg-slate-800">
                  <span>Talk with Marketing Expert</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

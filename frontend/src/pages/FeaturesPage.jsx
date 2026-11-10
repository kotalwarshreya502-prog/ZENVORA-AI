import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  FileText,
  Filter,
  Globe,
  Hash,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Layout,
  MessageSquare,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const FeaturesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'ai', label: 'AI Content Studio' },
    { id: 'seo', label: 'SEO & Editorial' },
    { id: 'social', label: 'Social & Calendar' },
    { id: 'management', label: 'Agency & Management' },
  ];

  const features = [
    {
      category: 'ai',
      icon: <Bot size={24} className="text-brand-violet" />,
      title: 'AI Content Studio',
      desc: 'Generate multi-channel ad copy, captions, product descriptions, and marketing hooks engineered to match your target audience persona.',
      badge: 'Gemini 1.5 Powered',
    },
    {
      category: 'seo',
      icon: <FileText size={24} className="text-brand-teal" />,
      title: 'Autonomous SEO Blog Writer',
      desc: 'Produce 1,500+ word, high-depth articles complete with structured headings, keyword integration, and schema-ready FAQs.',
      badge: 'Semantic Search Ready',
    },
    {
      category: 'social',
      icon: <Calendar size={24} className="text-brand-violet" />,
      title: 'Multi-Channel Content Calendar',
      desc: 'Plan, reschedule, and visually audit your weekly and monthly social cadence across LinkedIn, X, and Instagram in one unified interface.',
      badge: 'Visual Scheduler',
    },
    {
      category: 'seo',
      icon: <Search size={24} className="text-brand-teal" />,
      title: 'Heuristic Website SEO Auditor',
      desc: 'Audit any URL for title length, meta description quality, heading hierarchy, image alt attributes, and canonical structure.',
      badge: 'Instant Heuristics',
    },
    {
      category: 'ai',
      icon: <Hash size={24} className="text-brand-violet" />,
      title: 'Trending Hashtag Generator',
      desc: 'Generate tiered hashtag clusters divided into high-reach broad terms, mid-tier community tags, and high-intent niche keywords.',
      badge: 'Clustered Tags',
    },
    {
      category: 'ai',
      icon: <MessageSquare size={24} className="text-brand-teal" />,
      title: 'High-Converting Caption Engine',
      desc: 'Create attention-grabbing social captions with platform-specific hooks, narrative development, and actionable CTAs.',
      badge: 'Copywriting Engine',
    },
    {
      category: 'ai',
      icon: <ImageIcon size={24} className="text-brand-violet" />,
      title: 'Marketing Visual Creator',
      desc: 'Generate marketing-optimized graphic presets and style parameters to accompany your multi-channel posts.',
      badge: 'Creative Presets',
    },
    {
      category: 'management',
      icon: <Layers size={24} className="text-brand-teal" />,
      title: 'Multi-Channel Campaign Hub',
      desc: 'Group blogs, social posts, ad copy, and budgets into milestone-driven marketing campaigns with real-time progress bars.',
      badge: 'Campaign Tracking',
    },
    {
      category: 'management',
      icon: <ShieldCheck size={24} className="text-brand-violet" />,
      title: 'Brand Knowledge Base',
      desc: 'Store your brand voice parameters, target personas, preferred terminology, and prohibited words to prevent generic AI output.',
      badge: 'Brand Protection',
    },
    {
      category: 'social',
      icon: <Share2 size={24} className="text-brand-teal" />,
      title: 'Social Account Integrations',
      desc: 'Connect LinkedIn Company Pages, X (Twitter), Facebook Pages, and Instagram with transparent status indicators.',
      badge: 'OAuth Ready',
    },
    {
      category: 'management',
      icon: <BarChart3 size={24} className="text-brand-violet" />,
      title: 'Marketing Performance Analytics',
      desc: 'Interactive Recharts visualizations covering aggregated impressions, CTR trajectory, platform distribution, and content growth.',
      badge: 'Data Visualizations',
    },
    {
      category: 'management',
      icon: <Users size={24} className="text-brand-teal" />,
      title: 'Team & Role-Based Workspaces',
      desc: 'Invite team members with Admin, Manager, Editor, or Viewer privileges to collaborate safely on drafts.',
      badge: 'RBAC Security',
    },
  ];

  const filteredFeatures =
    activeCategory === 'all'
      ? features
      : features.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="violet" size="md">Platform Capabilities</Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-navy tracking-tight">
          Engineered for high-tempo marketing execution.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Explore all 18 core capabilities powering the ZENVORA AI autonomous marketing engine.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === c.id
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFeatures.map((f) => (
          <Card key={f.title} className="p-8 space-y-4 hover:border-brand-violet/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {f.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet bg-brand-violet/10 px-2.5 py-1 rounded-full">
                  {f.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-brand-navy">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-violet">
              <Link to="/register" className="inline-flex items-center gap-1 hover:underline">
                <span>Explore in Workspace</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Ready to experience the entire suite?
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Start your 14-day trial today with full access to all AI engines, SEO auditors, and campaign hubs.
        </p>
        <Link to="/register">
          <Button variant="primary" size="lg" className="px-8 shadow-md shadow-brand-violet/25">
            <span>Start Free Trial</span>
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturesPage;

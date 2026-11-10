import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  MousePointer,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const OverviewDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anRes, campRes, postRes] = await Promise.all([
          api.getAnalytics(),
          api.getCampaigns(),
          api.getPosts(),
        ]);
        setAnalytics(anRes);
        setCampaigns(campRes?.campaigns || []);
        setPosts(postRes?.posts || []);
      } catch (err) {
        console.warn('Dashboard fetch fallback:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpi = analytics?.kpi || {
    totalCampaigns: 3,
    totalPosts: 14,
    scheduledPosts: 4,
    publishedPosts: 8,
    totalImpressions: 12450,
    totalClicks: 940,
    averageCtr: '7.55%',
    marketingGrowth: '+34.8%',
  };

  const growthTimeline = analytics?.growthTimeline || [
    { day: 'Mon', impressions: 1200, clicks: 110 },
    { day: 'Tue', impressions: 1850, clicks: 165 },
    { day: 'Wed', impressions: 2400, clicks: 230 },
    { day: 'Thu', impressions: 2100, clicks: 190 },
    { day: 'Fri', impressions: 3200, clicks: 310 },
    { day: 'Sat', impressions: 1900, clicks: 140 },
    { day: 'Sun', impressions: 2800, clicks: 260 },
  ];

  const platformDistribution = analytics?.platformDistribution || [
    { platform: 'LinkedIn', share: 45, clicks: 480, fill: '#7657F6' },
    { platform: 'Instagram', share: 25, clicks: 270, fill: '#20C9B0' },
    { platform: 'Twitter / X', share: 18, clicks: 195, fill: '#38bdf8' },
    { platform: 'Organic Blog', share: 12, clicks: 130, fill: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-[#1c2242] to-brand-navy rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Autonomous Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Marketer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Workspace: <strong>{user?.businessName || 'Zenvora Digital Labs'}</strong> • All campaigns running within approved brand parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/content-studio">
            <Button variant="primary" size="md" className="shadow-md shadow-brand-violet/30 font-bold">
              <Bot size={15} />
              <span>Create Content</span>
            </Button>
          </Link>
          <Link to="/dashboard/blog-generator">
            <Button variant="teal" size="md">
              <FileText size={15} />
              <span>Write Blog</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Campaigns</span>
            <div className="p-2 rounded-xl bg-brand-violet/10 text-brand-violet">
              <Layers size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{kpi.totalCampaigns}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp size={12} />
              <span>{kpi.marketingGrowth} growth trajectory</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Generated Posts</span>
            <div className="p-2 rounded-xl bg-brand-teal/10 text-teal-700">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{kpi.totalPosts}</div>
            <div className="text-[11px] text-slate-500">
              {kpi.scheduledPosts} scheduled • {kpi.publishedPosts} live
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Impressions</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Eye size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{kpi.totalImpressions.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Across all connected channels</div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average Click-Through</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <MousePointer size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{kpi.averageCtr}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">+2.1% above SaaS average</div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Timeline Chart */}
        <Card className="lg:col-span-8 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-brand-navy">Weekly Marketing Reach Trajectory</h3>
              <p className="text-xs text-slate-500">Impressions vs direct click-throughs</p>
            </div>
            <span className="text-xs font-bold text-brand-violet bg-brand-violet/10 px-2.5 py-1 rounded-full">
              7-Day Cadence
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7657F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7657F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20C9B0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#20C9B0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11152B', borderRadius: 12, border: 'none', color: '#fff', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="impressions" stroke="#7657F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorImpressions)" />
                <Area type="monotone" dataKey="clicks" stroke="#20C9B0" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Channel Distribution */}
        <Card className="lg:col-span-4 p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-brand-navy">Traffic by Channel</h3>
            <p className="text-xs text-slate-500">Distribution of organic conversions</p>
          </div>

          <div className="space-y-3">
            {platformDistribution.map((item) => (
              <div key={item.platform} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-navy">{item.platform}</span>
                  <span className="font-bold text-slate-600">{item.share}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.share}%`, backgroundColor: item.fill }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Primary Driver:</span>
            <strong className="text-brand-violet">LinkedIn B2B Hooks</strong>
          </div>
        </Card>
      </div>

      {/* Recent Campaigns & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Campaigns List */}
        <Card className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-brand-navy">Active Campaigns</h3>
            <Link to="/dashboard/campaigns" className="text-xs font-bold text-brand-violet hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {campaigns.slice(0, 3).map((c) => (
              <div key={c._id || c.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-navy truncate max-w-[200px]">{c.name}</span>
                  <Badge variant={c.status === 'Published' ? 'success' : 'violet'} size="sm">
                    {c.status}
                  </Badge>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-violet h-full rounded-full" style={{ width: `${c.progress || 35}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Objective: {c.objective}</span>
                  <span className="font-bold text-brand-navy">{c.progress || 35}% progress</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-violet" />
            <h3 className="font-bold text-base text-brand-navy">ZENVORA AI Recommendations</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
              <div className="font-bold text-purple-900">Publish Blog Article on Search SGE</div>
              <p className="text-purple-700 leading-relaxed">
                Topic search volume increased 42% this week. Generate a 1,500-word draft in Blog Generator.
              </p>
              <Link to="/dashboard/blog-generator" className="inline-block pt-1 font-bold text-brand-violet hover:underline">
                Generate Draft →
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 space-y-1">
              <div className="font-bold text-teal-900">Schedule Wednesday LinkedIn Post</div>
              <p className="text-teal-700 leading-relaxed">
                Wednesday 09:30 AM is your highest historical engagement window for B2B impressions.
              </p>
              <Link to="/dashboard/content-studio" className="inline-block pt-1 font-bold text-teal-800 hover:underline">
                Queue Post →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewDashboard;

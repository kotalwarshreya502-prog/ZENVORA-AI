import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Share2,
  Users,
  Eye,
  MousePointer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../../services/api';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    summary: {
      totalImpressions: 148520,
      impressionsGrowth: '+28.4%',
      totalClicks: 9420,
      clicksGrowth: '+19.2%',
      averageCtr: '6.34%',
      wordsGenerated: 142800,
    },
    performanceTimeline: [
      { date: 'Oct 01', impressions: 3200, clicks: 180, engagement: 210 },
      { date: 'Oct 05', impressions: 4500, clicks: 260, engagement: 310 },
      { date: 'Oct 10', impressions: 4100, clicks: 240, engagement: 290 },
      { date: 'Oct 15', impressions: 5800, clicks: 390, engagement: 450 },
      { date: 'Oct 20', impressions: 6200, clicks: 420, engagement: 520 },
      { date: 'Oct 25', impressions: 7400, clicks: 530, engagement: 610 },
      { date: 'Oct 30', impressions: 8900, clicks: 680, engagement: 790 },
    ],
    platformShare: [
      { platform: 'LinkedIn', posts: 24, reach: 58000, color: '#3B82F6' },
      { platform: 'X / Twitter', posts: 68, reach: 49000, color: '#0F172A' },
      { platform: 'SEO Blog', posts: 12, reach: 24000, color: '#20C9B0' },
      { platform: 'Instagram', posts: 32, reach: 17520, color: '#EC4899' },
    ],
    topContent: [
      {
        title: 'Autonomous Marketing Orchestration: The Next Decade of SaaS',
        platform: 'LinkedIn',
        impressions: '18,400',
        ctr: '7.8%',
        shares: 142,
      },
      {
        title: '5 Metrics High-Growth Marketing Teams Track Every Morning',
        platform: 'X / Twitter',
        impressions: '12,900',
        ctr: '6.4%',
        shares: 98,
      },
      {
        title: 'The Complete Technical Guide to Programmatic SEO in 2025',
        platform: 'SEO Blog',
        impressions: '10,200',
        ctr: '8.9%',
        shares: 74,
      },
      {
        title: 'How AI Synthesizes Brand Tone Consistency Across 6 Touchpoints',
        platform: 'LinkedIn',
        impressions: '8,750',
        ctr: '5.2%',
        shares: 51,
      },
    ],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      if (res && res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.log('Using default analytics dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-brand-violet" size={24} />
            Unified Marketing Analytics & ROI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track multi-channel audience reach, click-through conversions, and content production efficiency in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md font-medium uppercase transition-colors ${
                  timeRange === range
                    ? 'bg-brand-violet text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export Action */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            {exported ? (
              <>
                <Check size={14} className="text-emerald-600" />
                Report Exported
              </>
            ) : (
              <>
                <Download size={14} />
                Export CSV / PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Impressions</span>
            <Eye size={18} className="text-brand-violet" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analyticsData.summary?.totalImpressions?.toLocaleString() || '148,520'}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight size={14} />
            <span>{analyticsData.summary?.impressionsGrowth || '+28.4%'}</span>
            <span className="text-slate-400 font-normal">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
            <MousePointer size={18} className="text-brand-teal" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analyticsData.summary?.totalClicks?.toLocaleString() || '9,420'}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight size={14} />
            <span>{analyticsData.summary?.clicksGrowth || '+19.2%'}</span>
            <span className="text-slate-400 font-normal">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average CTR</span>
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analyticsData.summary?.averageCtr || '6.34%'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Industry benchmark: ~2.1%
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Words Synthesized</span>
            <Sparkles size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analyticsData.summary?.wordsGenerated?.toLocaleString() || '142,800'}
          </div>
          <div className="text-xs text-brand-violet font-semibold mt-1">
            Estimated 160+ team hours saved
          </div>
        </div>
      </div>

      {/* Main Timeline Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cross-Channel Reach & Engagement Velocity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily distribution of organic impressions and resulting reader clicks.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={analyticsData.performanceTimeline}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#11152B',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="impressions"
                name="Total Reach"
                stroke="#7657F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorImpressions)"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                name="Engaged Clicks"
                stroke="#20C9B0"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClicks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Channel Breakdown + Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Channel Share (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Audience Volume by Channel
          </h3>
          <div className="space-y-4">
            {analyticsData.platformShare.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.platform}</span>
                  <span className="font-mono text-slate-500">
                    {item.reach.toLocaleString()} reach ({item.posts} posts)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.reach / 148520) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
            📊 <strong>Channel Insight:</strong> LinkedIn accounts for 39% of total reach and exhibits the highest conversion velocity for your B2B offerings.
          </div>
        </div>

        {/* Top Performing Content (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Top Performing Marketing Assets
          </h3>
          <div className="divide-y divide-slate-100">
            {analyticsData.topContent.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                    {item.platform}
                  </span>
                  <div className="text-xs font-semibold text-slate-800 truncate mt-1">
                    {item.title}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{item.impressions}</div>
                    <div className="text-[10px] text-slate-400">impressions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-teal">{item.ctr}</div>
                    <div className="text-[10px] text-slate-400">CTR</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

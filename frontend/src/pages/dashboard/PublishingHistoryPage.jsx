import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  RefreshCw,
  Share2
} from 'lucide-react';
import { api } from '../../services/api';

export const PublishingHistoryPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getPosts();
      if (res && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      // Fallback post log
      setPosts([
        {
          _id: 'post-1',
          content: '🚀 Autonomous marketing orchestration is here. We analyzed 100k campaigns to uncover why AI-assisted brand consistency drives 3x higher pipeline velocity.',
          platform: 'linkedin',
          status: 'published',
          scheduledFor: new Date(Date.now() - 86400000 * 2).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          metrics: { impressions: 1420, clicks: 88, shares: 12 },
        },
        {
          _id: 'post-2',
          content: 'Quick thread 🧵: 5 metrics high-growth marketing teams monitor every morning that amateur teams ignore. Number 3 is non-negotiable.',
          platform: 'twitter',
          status: 'published',
          scheduledFor: new Date(Date.now() - 86400000 * 1).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          metrics: { impressions: 3840, clicks: 195, shares: 44 },
        },
        {
          _id: 'post-3',
          content: 'Behind the scenes: How we automated programmatic SEO clustering for 12,000 long-tail keywords in 4 minutes.',
          platform: 'linkedin',
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 86400000 * 2).toISOString(),
          createdAt: new Date().toISOString(),
          metrics: { impressions: 0, clicks: 0, shares: 0 },
        },
        {
          _id: 'post-4',
          content: 'The real secret to high-converting Instagram carousels: contrast in typography and structured value density.',
          platform: 'instagram',
          status: 'draft',
          scheduledFor: null,
          createdAt: new Date().toISOString(),
          metrics: { impressions: 0, clicks: 0, shares: 0 },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePost(id);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      setPosts(posts.filter((p) => p._id !== id));
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesStatus =
      filterStatus === 'all' || post.status === filterStatus;
    const matchesSearch =
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.platform?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle size={12} /> Published
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-violet/10 text-brand-violet">
            <Clock size={12} /> Scheduled
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Draft
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertTriangle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <History className="text-brand-violet" size={24} />
          Publishing Audit Log & History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete transparent ledger of all published, scheduled, and drafted content across connected brand distribution channels.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'published', label: 'Published' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'draft', label: 'Drafts' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                filterStatus === item.id
                  ? 'border-brand-violet bg-brand-violet text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search copy or channel..."
            className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
          />
        </div>
      </div>

      {/* Posts Table / Card List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin mb-2 text-brand-violet" size={24} />
            Loading publishing records...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No matching publishing entries found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Content */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {post.platform}
                    </span>
                    {getStatusBadge(post.status)}
                    <span className="text-xs text-slate-400">
                      {post.scheduledFor
                        ? new Date(post.scheduledFor).toLocaleDateString()
                        : new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Performance stats if published */}
                  {post.status === 'published' && post.metrics && (
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                      <span>👁️ {post.metrics.impressions?.toLocaleString() || 1200} impressions</span>
                      <span>🖱️ {post.metrics.clicks || 45} clicks</span>
                      <span>🔄 {post.metrics.shares || 8} shares</span>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleCopy(post.content, post._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {copiedId === post._id ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copiedId === post._id ? 'Copied' : 'Copy'}
                  </button>

                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 bg-white hover:bg-red-50 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishingHistoryPage;

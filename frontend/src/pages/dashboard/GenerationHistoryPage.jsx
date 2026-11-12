import {
  AlertCircle, Bot, Clock, Filter, History,
  Loader2, RefreshCw, Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

const MODULE_LABELS = {
  'content-studio': 'Content Studio',
  'blog-generator': 'Blog Generator',
  'caption-generator': 'Caption Generator',
  'hashtag-generator': 'Hashtag Generator',
  'image-generation': 'Image Generator',
  'research-assistant': 'Research',
  'research': 'Research',
  'competitor-analysis': 'Competitor Analysis',
  'seo-analysis': 'SEO Analysis',
  'social-generator': 'Social Generator',
};

const MODULE_BADGE_VARIANT = {
  'content-studio': 'violet',
  'blog-generator': 'teal',
  'image-generation': 'slate',
  'research-assistant': 'violet',
  'research': 'violet',
  'competitor-analysis': 'teal',
  'seo-analysis': 'slate',
};

export const GenerationHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleFilter, setModuleFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = moduleFilter ? { module: moduleFilter } : {};
      const res = await api.getHistory(params);
      // Backend returns { items: [...] } or spreads directly
      setHistory(res?.items || res?.history || []);
    } catch (err) {
      setError(err?.message || 'Failed to load generation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [moduleFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this history record?')) return;
    setDeleting(id);
    try {
      await api.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      alert(err?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const moduleOptions = [...new Set(history.map((h) => h.module))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="violet" size="sm">Your Generations</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
          Generation History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Every AI generation you've made, scoped to your account only. Never mixed with other users.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter by module:</span>
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
        >
          <option value="">All Modules</option>
          {Object.entries(MODULE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={fetchHistory}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-violet hover:border-brand-violet transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
        <span className="text-xs text-slate-400 ml-auto">
          {history.length} record{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <Card className="p-12 text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-brand-violet mx-auto" />
          <p className="text-xs text-slate-500">Loading your generation history…</p>
        </Card>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertCircle size={16} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ensure the backend is running and GEMINI_API_KEY is configured. History is saved when generations succeed.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={fetchHistory}
          >
            Retry
          </Button>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && history.length === 0 && (
        <Card className="p-12 text-center space-y-3 text-slate-400">
          <History size={40} className="mx-auto opacity-20" />
          <p className="text-sm font-semibold">No generation history yet</p>
          <p className="text-xs">Use Content Studio, Research Assistant, or Image Generator to create your first record.</p>
        </Card>
      )}

      {/* History Grid */}
      {!loading && !error && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-brand-violet/10 rounded-xl shrink-0">
                    <Bot size={16} className="text-brand-violet" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-brand-navy truncate">
                        {item.title || item.input?.topic || item.input?.campaignTitle || 'Untitled'}
                      </p>
                      <Badge
                        variant={MODULE_BADGE_VARIANT[item.module] || 'slate'}
                        size="xs"
                      >
                        {MODULE_LABELS[item.module] || item.module}
                      </Badge>
                      {item.isSaved && (
                        <Badge variant="teal" size="xs">Saved</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 flex-wrap">
                      <span className="font-mono">{item.model || item.provider || '—'}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      <span className={`font-semibold ${item.status === 'success' || item.status === 'completed' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deleting === item._id}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shrink-0"
                  title="Delete"
                >
                  {deleting === item._id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerationHistoryPage;

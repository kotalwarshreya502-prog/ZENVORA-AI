import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Filter,
  Layers,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

export const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    objective: 'Lead Generation',
    targetAudience: 'B2B Founders & Marketers',
    platforms: ['LinkedIn', 'Blog'],
    budget: 3000,
    description: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await api.getCampaigns();
      setCampaigns(res?.campaigns || []);
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createCampaign(newCampaign);
      setShowModal(false);
      setNewCampaign({
        name: '',
        objective: 'Lead Generation',
        targetAudience: 'B2B Founders & Marketers',
        platforms: ['LinkedIn', 'Blog'],
        budget: 3000,
        description: '',
      });
      loadCampaigns();
    } catch (err) {
      alert(`Error creating campaign: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.deleteCampaign(id);
      loadCampaigns();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="violet" size="sm">Campaign Management</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
            Marketing Campaign Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Coordinate multi-channel campaigns, track milestone completion, and manage marketing spend.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowModal(true)} className="shadow-sm font-bold">
          <Plus size={16} />
          <span>New Campaign</span>
        </Button>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <RefreshCw size={28} className="animate-spin text-brand-violet mx-auto mb-2" />
          <span className="text-xs">Loading active campaigns...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <Layers size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-brand-navy">No campaigns created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Group your social posts, blog articles, and ad creative into structured marketing initiatives.
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            Create First Campaign
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <Card key={c._id || c.name} className="p-6 space-y-5 hover:border-brand-violet/40 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{c.objective}</span>
                    <h3 className="font-bold text-base text-brand-navy truncate">{c.name}</h3>
                  </div>
                  <Badge variant={c.status === 'Published' ? 'success' : 'violet'} size="sm">
                    {c.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description || `Targeting ${c.targetAudience} across ${c.platforms?.join(', ')}`}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Campaign Progress</span>
                    <span className="text-brand-navy font-bold">{c.progress || 35}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-violet h-full rounded-full" style={{ width: `${c.progress || 35}%` }} />
                  </div>
                </div>

                {/* Budget */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Budget Spent:</span>
                  <span className="font-bold text-brand-navy">${c.spent || 0} / ${c.budget || 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <span>{Array.isArray(c.platforms) ? c.platforms.join(', ') : 'Multi-channel'}</span>
                </div>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Delete Campaign"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-brand-navy">Create New Marketing Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Inbound Pipeline Sprint"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Primary Objective</label>
                  <select
                    value={newCampaign.objective}
                    onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
                  >
                    <option value="Lead Generation">Lead Generation</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Brand Awareness">Brand Awareness</option>
                    <option value="SEO Growth">SEO Growth</option>
                    <option value="Customer Retention">Customer Retention</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Budget ($ USD)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. E-commerce founders and VP of Marketing"
                  value={newCampaign.targetAudience}
                  onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Campaign Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key messaging pillars, timeline requirements..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Launch Campaign
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;

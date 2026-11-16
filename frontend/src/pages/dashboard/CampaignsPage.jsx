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
  Sparkles,
  BarChart2,
  Target,
  ArrowRight,
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
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [aiStrategyResult, setAiStrategyResult] = useState(null);

  // Manual Form State
  const [campaignName, setCampaignName] = useState('');
  const [campaignObjective, setCampaignObjective] = useState('Lead Generation');
  const [campaignAudience, setCampaignAudience] = useState('B2B Founders & Marketers');
  const [campaignBudget, setCampaignBudget] = useState(3000);
  const [campaignDescription, setCampaignDescription] = useState('');

  // AI Strategy Form State
  const [aiObjective, setAiObjective] = useState('Product Launch & User Acquisition');
  const [aiAudience, setAiAudience] = useState('Growth Marketers & Digital Agency Owners');
  const [aiBudget, setAiBudget] = useState(5000);
  const [aiTimeline, setAiTimeline] = useState('60-Day Sprint');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await api.getCampaigns();
      setCampaigns(res?.data?.campaigns || res?.campaigns || []);
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createCampaign({
        name: campaignName.trim(),
        objective: campaignObjective,
        targetAudience: campaignAudience.trim(),
        platforms: ['LinkedIn', 'Blog', 'Instagram'],
        budget: Number(campaignBudget) || 0,
        description: campaignDescription.trim(),
      });
      setShowModal(false);
      setCampaignName('');
      setCampaignObjective('Lead Generation');
      setCampaignAudience('B2B Founders & Marketers');
      setCampaignBudget(3000);
      setCampaignDescription('');
      loadCampaigns();
    } catch (err) {
      alert(`Error creating campaign: ${err.message}`);
    }
  };

  const handleGenerateAiStrategy = async (e) => {
    e.preventDefault();
    setGeneratingStrategy(true);
    setAiStrategyResult(null);

    try {
      const res = await api.generateCampaignPlan({
        objective: aiObjective,
        targetAudience: aiAudience,
        budget: aiBudget,
        timeline: aiTimeline,
        platforms: ['LinkedIn', 'Instagram', 'Blog', 'Email'],
        campaignName: `${aiObjective} Strategy`,
      });

      if (res?.data) {
        setAiStrategyResult(res.data);
      }
    } catch (err) {
      alert(`AI Strategy generation failed: ${err.message}`);
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const handleAdoptAiCampaign = async () => {
    if (!aiStrategyResult) return;
    try {
      const strat = aiStrategyResult.strategy;
      const plan = aiStrategyResult.plan;

      await api.createCampaign({
        name: plan?.campaignName || `${aiObjective} (AI Orchestrated)`,
        objective: aiObjective,
        targetAudience: aiAudience,
        platforms: ['LinkedIn', 'Instagram', 'Blog', 'Email'],
        budget: Number(aiBudget) || 0,
        description: strat?.executiveSummary || 'AI-generated multi-channel growth sprint.',
        status: 'Planned',
      });

      setShowAiModal(false);
      setAiStrategyResult(null);
      loadCampaigns();
    } catch (err) {
      alert(`Failed to save AI campaign: ${err.message}`);
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
            <Badge variant="violet" size="sm">Campaign Operations</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
            Marketing Campaign Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Coordinate multi-channel campaigns, AI strategic roadmaps, milestones, and budget performance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowAiModal(true)}
            className="flex-1 sm:flex-initial gap-2 border-brand-violet/30 text-brand-violet hover:bg-brand-violet/5 font-semibold text-xs"
          >
            <Sparkles size={16} />
            <span>AI Strategy Agent</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-initial gap-2 shadow-sm font-bold text-xs"
          >
            <Plus size={16} />
            <span>New Campaign</span>
          </Button>
        </div>
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
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowAiModal(true)}>
              Generate with AI Agent
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
              Create Manually
            </Button>
          </div>
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
                    {c.status || 'Planned'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description || `Targeting ${c.targetAudience} across ${Array.isArray(c.platforms) ? c.platforms.join(', ') : 'multi-channel'}`}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Campaign Progress</span>
                    <span className="text-brand-navy font-bold">{c.progress || 10}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-violet h-full rounded-full" style={{ width: `${c.progress || 10}%` }} />
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

      {/* Manual Create Modal */}
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
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Primary Objective</label>
                  <select
                    value={campaignObjective}
                    onChange={(e) => setCampaignObjective(e.target.value)}
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
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. E-commerce founders and VP of Marketing"
                  value={campaignAudience}
                  onChange={(e) => setCampaignAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Campaign Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key messaging pillars, timeline requirements..."
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
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

      {/* AI Strategy Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <Card className="max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-brand-violet font-bold text-lg">
                <Sparkles size={20} />
                <span>AI Marketing Strategy & Planning Agent</span>
              </div>
              <button
                onClick={() => { setShowAiModal(false); setAiStrategyResult(null); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {!aiStrategyResult ? (
              <form onSubmit={handleGenerateAiStrategy} className="space-y-4">
                <p className="text-xs text-slate-600">
                  The Strategy Agent uses your saved Business Profile and market positioning to formulate an actionable multi-channel roadmap with weekly milestones and KPIs.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Objective</label>
                  <input
                    type="text"
                    value={aiObjective}
                    onChange={(e) => setAiObjective(e.target.value)}
                    placeholder="e.g. Q4 Inbound Pipeline Sprint, Black Friday Blitz"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                    <input
                      type="text"
                      value={aiAudience}
                      onChange={(e) => setAiAudience(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Budget ($ USD)</label>
                    <input
                      type="number"
                      value={aiBudget}
                      onChange={(e) => setAiBudget(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Horizon</label>
                  <select
                    value={aiTimeline}
                    onChange={(e) => setAiTimeline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand-violet"
                  >
                    <option value="30-Day Sprint">30-Day Sprint (Rapid Execution)</option>
                    <option value="60-Day Sprint">60-Day Sprint (Demand & Conversion)</option>
                    <option value="90-Day Full Quarter">90-Day Full Quarter (Comprehensive Brand + SEO)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => setShowAiModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={generatingStrategy} className="font-bold gap-2">
                    {generatingStrategy ? (
                      <>
                        <RefreshCw className="animate-spin" size={15} />
                        Synthesizing Strategy...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Generate Strategy & Roadmap
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">Executive Summary</h4>
                  <p className="text-xs text-purple-950 leading-relaxed">
                    {aiStrategyResult.strategy?.executiveSummary}
                  </p>
                </div>

                {/* Campaign Pillars */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Strategic Pillars</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(aiStrategyResult.strategy?.campaignPillars || []).map((pillar, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                        <span className="font-bold text-brand-navy block">{pillar.name}</span>
                        <p className="text-slate-600 text-[11px]">{pillar.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Channel Allocation */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Channel Allocation</h4>
                  <div className="flex flex-wrap gap-2">
                    {(aiStrategyResult.strategy?.channelAllocation || []).map((ch, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
                        {ch.channel}: {ch.sharePercentage}%
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weekly Milestones */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Weekly Milestones</h4>
                  <div className="space-y-1.5">
                    {(aiStrategyResult.strategy?.weeklyMilestones || []).map((ms, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs flex items-center justify-between">
                        <span className="font-bold text-brand-violet">Week {ms.week}</span>
                        <span className="text-slate-700 flex-1 px-3 truncate">{ms.goal}</span>
                        <span className="text-slate-400 text-[11px]">{(ms.deliverables || []).join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => setAiStrategyResult(null)}>
                    Regenerate
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAdoptAiCampaign} className="font-bold gap-2">
                    <span>Adopt & Save Campaign to Hub</span>
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Layers,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  Target,
  Zap,
  Globe,
  Share2,
  TrendingUp,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export const AiAgentPage = () => {
  const [instruction, setInstruction] = useState('');
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [executionResult, setExecutionResult] = useState(null);

  const presets = [
    'Create a 30-day multi-channel growth sprint for our business, conduct web research, and formulate weekly deliverables.',
    'Plan a Q4 Product Launch campaign: generate 10 social captions, 2 advertising poster prompts, and map content milestones.',
    'Execute a competitor analysis and SEO keyword clustering roadmap with target intent and content gap opportunities.',
    'Develop a B2B LinkedIn & Blog thought leadership campaign to double organic inbound qualified leads.',
  ];

  const handleRunAgent = async (e) => {
    if (e) e.preventDefault();
    if (!instruction.trim()) return;

    setRunning(true);
    setErrorMsg('');
    setExecutionResult(null);

    try {
      const res = await api.runAutonomousAgent({ instruction: instruction.trim() });
      if (res?.data) {
        setExecutionResult(res.data);
      }
    } catch (err) {
      console.error('Agent execution error:', err);
      setErrorMsg(err?.message || 'Autonomous Agent failed to execute. Please verify your Gemini API key and connection.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="violet" size="sm">Autonomous Agent</Badge>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Multi-Agent Orchestrator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1 flex items-center gap-2.5">
          <Sparkles className="text-brand-violet" size={28} />
          Autonomous AI Marketing Agent
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
          Issue high-level marketing objectives in natural language. The Central Orchestrator coordinates all 10 specialized agents to research, plan, draft, and schedule your marketing initiatives.
        </p>
      </div>

      {/* Main Command Input Box */}
      <Card className="p-6 bg-gradient-to-br from-white via-purple-50/20 to-brand-violet/5 border-brand-violet/20 shadow-sm space-y-4">
        <form onSubmit={handleRunAgent} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Plan an end-to-end 60-day marketing sprint for our business, perform market research, formulate weekly milestone deliverables, and structure creative assets..."
              className="w-full text-sm rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-brand-violet/30 bg-white leading-relaxed resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap size={14} className="text-amber-500" />
              <span>Orchestrates 10 specialized agents using unified business memory.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={running || !instruction.trim()}
              className="font-bold shadow-md gap-2"
            >
              {running ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Orchestrating Agents...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Execute Autonomous Agent</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested Autonomous Objectives:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInstruction(preset)}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-brand-violet/40 hover:bg-purple-50/40 text-slate-700 transition-all line-clamp-1"
              >
                &ldquo;{preset}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
            {errorMsg}
          </div>
        )}
      </Card>

      {/* Execution Results */}
      {executionResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span>{executionResult.plan?.planTitle || 'Autonomous Execution Plan'}</span>
            </h2>
            <Badge variant="violet" size="sm">
              {executionResult.plan?.estimatedDuration || 'Multi-Agent Automated'}
            </Badge>
          </div>

          {/* Steps Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(executionResult.plan?.steps || []).map((s, idx) => (
              <Card key={idx} className="p-5 border-slate-200 space-y-3 hover:border-brand-violet/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-brand-violet text-white text-xs font-bold flex items-center justify-center">
                    {s.step || idx + 1}
                  </span>
                  <Badge variant="navy" size="sm">
                    {s.agent}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.action}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>Expected Output:</strong> {s.expectedOutput}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Autonomous Recommendation */}
          {executionResult.plan?.autonomousRecommendation && (
            <Card className="p-5 bg-purple-50/60 border-purple-200 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" />
                Strategic Recommendation
              </h4>
              <p className="text-xs text-purple-950 leading-relaxed">
                {executionResult.plan.autonomousRecommendation}
              </p>
            </Card>
          )}

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/dashboard/campaigns">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                <Layers size={14} />
                <span>Go to Campaign Hub</span>
              </Button>
            </Link>
            <Link to="/dashboard/calendar">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                <Calendar size={14} />
                <span>View Content Calendar</span>
              </Button>
            </Link>
            <Link to="/dashboard/content-studio">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                <Bot size={14} />
                <span>Open Content Studio</span>
              </Button>
            </Link>
            <Link to="/dashboard/image-generation">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                <Sparkles size={14} />
                <span>Open Poster Studio</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAgentPage;

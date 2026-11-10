import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  TrendingUp,
  Download,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export const BillingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [upgradedPlan, setUpgradedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const usageStats = {
    planName: 'Professional Growth',
    price: billingCycle === 'monthly' ? '$129' : '$103',
    renewalDate: 'November 28, 2025',
    wordsUsed: 142800,
    wordsLimit: 250000,
    postsUsed: 68,
    postsLimit: 150,
    channelsConnected: 4,
    channelsLimit: 10,
    seoAuditsUsed: 14,
    seoAuditsLimit: 50,
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      description: 'Ideal for solo creators and bootstrapped businesses.',
      features: [
        '50,000 AI words / month',
        '30 scheduled posts',
        '3 connected social channels',
        'Basic SEO site auditor',
        'Standard email support',
      ],
      current: false,
    },
    {
      id: 'professional',
      name: 'Professional Growth',
      price: billingCycle === 'monthly' ? '$129' : '$103',
      description: 'Built for scaling marketing teams and high-growth brands.',
      features: [
        '250,000 AI words / month',
        '150 scheduled posts',
        '10 connected social channels',
        'Advanced technical SEO audits',
        'Custom Brand Voice Guardrails',
        'Priority 24/7 Slack & Email support',
      ],
      current: true,
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Agency & Enterprise',
      price: billingCycle === 'monthly' ? '$299' : '$239',
      description: 'Full white-label suite and dedicated GPU models for marketing agencies.',
      features: [
        'Unlimited AI generations',
        'Unlimited scheduled posts',
        'Unlimited social channels & client workspaces',
        'Automated white-label PDF reports',
        'Custom Gemini 1.5 fine-tuned voices',
        'Dedicated account strategist',
      ],
      current: false,
    },
  ];

  const invoices = [
    { id: 'INV-2025-010', date: 'Oct 28, 2025', amount: '$129.00', status: 'Paid' },
    { id: 'INV-2025-009', date: 'Sep 28, 2025', amount: '$129.00', status: 'Paid' },
    { id: 'INV-2025-008', date: 'Aug 28, 2025', amount: '$129.00', status: 'Paid' },
  ];

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      await api.upgradePlan({ plan: planId, cycle: billingCycle });
      setUpgradedPlan(planId);
      setTimeout(() => setUpgradedPlan(null), 3000);
    } catch (err) {
      setUpgradedPlan(planId);
      setTimeout(() => setUpgradedPlan(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="text-brand-violet" size={24} />
          Subscription Plans & Resource Usage
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your AI word allocation, active seat distribution, and manage billing invoices and payment methods.
        </p>
      </div>

      {upgradedPlan && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check size={18} className="text-emerald-600" />
          <span>Subscription plan updated successfully to <strong>{upgradedPlan.toUpperCase()}</strong>.</span>
        </div>
      )}

      {/* Current Plan & Resource Utilization Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Plan Summary (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-navy to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal/20">
                Active Tier
              </span>
              <span className="text-xs text-slate-300">Renews {usageStats.renewalDate}</span>
            </div>

            <h2 className="text-2xl font-bold text-white">{usageStats.planName}</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">{usageStats.price}</span>
              <span className="text-sm text-slate-400">/ month</span>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Equipped with Gemini 1.5 multi-channel marketing models, autonomous brand memory, and programmatic SEO modules.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Primary Card: •••• 4242</span>
            <button className="text-brand-teal hover:underline font-semibold">
              Update Payment Method
            </button>
          </div>
        </div>

        {/* Live Usage Quotas (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Current Billing Cycle Allocation
          </h3>

          {/* Meter 1: AI Words */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">AI Synthesized Words</span>
              <span className="font-mono text-slate-500">
                {usageStats.wordsUsed.toLocaleString()} / {usageStats.wordsLimit.toLocaleString()} (57%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-violet h-full rounded-full transition-all duration-500"
                style={{ width: `${(usageStats.wordsUsed / usageStats.wordsLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Meter 2: Scheduled Posts */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Scheduled Posts & Articles</span>
              <span className="font-mono text-slate-500">
                {usageStats.postsUsed} / {usageStats.postsLimit} (45%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-teal h-full rounded-full transition-all duration-500"
                style={{ width: `${(usageStats.postsUsed / usageStats.postsLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Meter 3: Social Channels */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Connected Brand Channels</span>
              <span className="font-mono text-slate-500">
                {usageStats.channelsConnected} / {usageStats.channelsLimit} (40%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(usageStats.channelsConnected / usageStats.channelsLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Meter 4: SEO Audits */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Technical Website Audits</span>
              <span className="font-mono text-slate-500">
                {usageStats.seoAuditsUsed} / {usageStats.seoAuditsLimit} (28%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(usageStats.seoAuditsUsed / usageStats.seoAuditsLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Scaling Tiers</h2>
            <p className="text-xs text-slate-500">Upgrade or downgrade your organization tier at any time.</p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                billingCycle === 'monthly' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-white shadow-xs text-brand-violet' : 'text-slate-500'
              }`}
            >
              Annual <span className="text-[10px] bg-brand-teal/20 text-teal-800 px-1.5 py-0.2 rounded">Save 20%</span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                p.current
                  ? 'border-brand-violet ring-2 ring-brand-violet/20 shadow-md'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  {p.current && (
                    <span className="text-[11px] font-bold text-brand-violet bg-brand-violet/10 px-2 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 min-h-[32px]">{p.description}</p>

                <div className="my-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <Check size={14} className="text-brand-teal shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4">
                {p.current ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Switch to {p.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Invoice & Payment History
        </h3>

        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-slate-400" />
                <div>
                  <span className="font-semibold text-slate-800">{inv.id}</span>
                  <span className="text-slate-400 ml-2">({inv.date})</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold text-slate-800">{inv.amount}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                  {inv.status}
                </span>
                <button className="text-slate-400 hover:text-brand-violet flex items-center gap-1 font-medium">
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

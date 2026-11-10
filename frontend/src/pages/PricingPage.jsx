import { ArrowRight, Check, ChevronDown, HelpCircle, Shield, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      badge: 'Solopreneurs',
      priceMonthly: 29,
      priceYearly: 23,
      desc: 'Essential AI marketing capabilities for founders launching organic reach.',
      features: [
        '30,000 AI words per month',
        '50 scheduled social posts',
        '1 Brand Guideline profile',
        'Standard Website SEO Audit',
        'LinkedIn & X social channels',
        'Standard email support',
      ],
      cta: 'Start Free Trial',
      variant: 'outline',
      highlighted: false,
    },
    {
      name: 'Growth',
      badge: 'Most Popular',
      priceMonthly: 79,
      priceYearly: 63,
      desc: 'Complete autonomous marketing suite for growth-stage SMBs and active teams.',
      features: [
        '150,000 AI words per month',
        'Unlimited scheduled posts',
        '5 Brand Guideline profiles',
        'Deep SEO Heuristic Engine',
        'Multi-channel Campaign Hub',
        'All 4 Social Integrations',
        'Team collaboration (up to 5 seats)',
        'Priority AI model processing',
      ],
      cta: 'Start 14-Day Free Trial',
      variant: 'primary',
      highlighted: true,
    },
    {
      name: 'Agency Pro',
      badge: 'Agencies & Teams',
      priceMonthly: 199,
      priceYearly: 159,
      desc: 'Multi-client workspace architecture with white-label reporting exports.',
      features: [
        '500,000 AI words per month',
        'Unlimited client workspaces',
        'Unlimited Brand Guidelines',
        'White-label PDF report branding',
        'Custom approval queues',
        'Dedicated account manager',
        'Priority API concurrency',
        'Advanced webhook notifications',
      ],
      cta: 'Choose Agency Pro',
      variant: 'secondary',
      highlighted: false,
    },
  ];

  const comparisonRows = [
    { feature: 'AI Words per Month', starter: '30,000', growth: '150,000', agency: '500,000' },
    { feature: 'Social Posts Scheduling', starter: '50 / mo', growth: 'Unlimited', agency: 'Unlimited' },
    { feature: 'Brand Guidelines Profiles', starter: '1', growth: '5', agency: 'Unlimited' },
    { feature: 'SEO Website Audit Scans', starter: '5 / mo', growth: 'Unlimited', agency: 'Unlimited' },
    { feature: 'Social Channel Integrations', starter: '2 Accounts', growth: 'All Supported', agency: 'All Supported' },
    { feature: 'Multi-Channel Campaigns', starter: '3 Active', growth: 'Unlimited', agency: 'Unlimited' },
    { feature: 'Team Seats', starter: '1 User', growth: '5 Users', agency: 'Unlimited' },
    { feature: 'White-Label Reports', starter: '—', growth: '—', agency: 'Included' },
  ];

  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="violet" size="md">Transparent Pricing</Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-navy tracking-tight">
          Invest in sustainable marketing leverage.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Zero hidden fees. Full 14-day trial with full platform access. No credit card required.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold pt-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl transition-all ${
              billingCycle === 'monthly' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl transition-all ${
              billingCycle === 'yearly' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Annual Billing <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => {
          const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
          return (
            <Card
              key={p.name}
              className={`p-8 space-y-6 flex flex-col justify-between ${
                p.highlighted ? 'border-2 border-brand-violet relative shadow-xl' : ''
              }`}
            >
              <div className="space-y-6">
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-violet text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-brand-navy">{p.name}</h3>
                    {!p.highlighted && (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{p.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{p.desc}</p>
                  <div className="text-4xl font-extrabold text-brand-navy mt-4">
                    ${price}<span className="text-sm font-normal text-slate-500">/mo</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-brand-navy mb-3">Included features:</div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={14} className="text-brand-teal shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <Link to="/register" className="block">
                  <Button
                    variant={p.variant}
                    size="lg"
                    className={`w-full ${p.highlighted ? 'shadow-md shadow-brand-violet/25' : ''}`}
                  >
                    <span>{p.cta}</span>
                    <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-6">
        <h3 className="text-2xl font-bold text-brand-navy">Detailed Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 font-semibold">Capability</th>
                <th className="py-3 font-semibold text-center">Starter</th>
                <th className="py-3 font-semibold text-center text-brand-violet">Growth</th>
                <th className="py-3 font-semibold text-center">Agency Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3.5 font-medium text-brand-navy">{r.feature}</td>
                  <td className="py-3.5 text-center text-slate-600">{r.starter}</td>
                  <td className="py-3.5 text-center font-bold text-brand-violet">{r.growth}</td>
                  <td className="py-3.5 text-center text-slate-600">{r.agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

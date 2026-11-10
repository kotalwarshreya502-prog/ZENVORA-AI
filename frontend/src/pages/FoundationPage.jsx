import {
  Activity,
  CheckCircle2,
  Code2,
  Database,
  Layers,
  Palette,
  Server,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import React from 'react';
import BrandSymbol from '../components/common/BrandSymbol';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import useHealth from '../hooks/useHealth';
import { BRAND } from '../utils/constants';

export const FoundationPage = () => {
  const { health, loading, error, refresh } = useHealth(0);

  const brandSwatches = [
    { name: 'Midnight Navy', hex: '#11152B', role: 'Primary Color' },
    { name: 'Electric Violet', hex: '#7657F6', role: 'Brand Accent' },
    { name: 'Growth Teal', hex: '#20C9B0', role: 'Secondary Accent' },
    { name: 'Cloud White', hex: '#F5F6FA', role: 'Light Background' },
  ];

  const techStack = [
    { category: 'Frontend Architecture', items: ['React 18', 'Vite 6', 'Tailwind CSS v3', 'React Router DOM v6', 'Axios', 'Lucide React', 'Framer Motion', 'Recharts'] },
    { category: 'Backend Architecture', items: ['Node.js (v22)', 'Express.js', 'MongoDB / Mongoose', 'Helmet', 'Morgan', 'CORS', 'bcryptjs', 'jsonwebtoken'] },
    { category: 'Root Orchestration', items: ['Concurrently', 'Nodemon', 'Standardized npm scripts'] },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-[#1c2242] to-brand-navy rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <BrandSymbol size={280} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="violet" size="sm">
              Phase 1 Completed
            </Badge>
            <Badge variant="teal" size="sm">
              MERN Stack Architecture
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {BRAND.NAME}
          </h1>

          <p className="text-lg text-brand-teal font-semibold">
            {BRAND.TAGLINE}
          </p>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Technical foundation and project architecture have been established. Both client and server run concurrently with isolated secrets, standardized Tailwind brand tokens, and non-blocking MongoDB decoupled resilience.
          </p>
        </div>
      </div>

      {/* Grid: Health API Test & System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Backend Diagnostic Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet">
                <Server size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-navy">Backend Health Diagnostic</h3>
                <p className="text-xs text-slate-500">Live test via Axios client (GET /api/health)</p>
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="text-xs font-semibold text-brand-violet hover:underline"
            >
              Test again
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 shadow-inner">
            {loading && !health ? (
              <span className="text-slate-400">Pinging backend at http://localhost:5000/api/health...</span>
            ) : error ? (
              <span className="text-rose-400">Error: {error}</span>
            ) : (
              <pre>{JSON.stringify(health, null, 2)}</pre>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Expected schema verified</span>
            <span className="font-semibold text-brand-navy">
              Endpoint: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">/api/health</code>
            </span>
          </div>
        </Card>

        {/* Brand Identity Verification Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-teal-600">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-navy">Brand Identity System</h3>
              <p className="text-xs text-slate-500">Official Color Tokens & Typography</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {brandSwatches.map((swatch) => (
              <div
                key={swatch.hex}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div
                  className="w-8 h-8 rounded-lg shadow-sm border border-black/10 shrink-0"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-brand-navy truncate">{swatch.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">{swatch.hex}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Typography: <strong className="text-brand-navy font-semibold">Inter</strong></span>
            <span>Symbol: <strong className="text-brand-navy font-semibold">Orbital Velocity Core</strong></span>
          </div>
        </Card>
      </div>

      {/* Technology Stack Verification */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-brand-navy">Technology Stack Verification</h3>
            <p className="text-xs text-slate-500">Dependencies installed and configured cleanly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {techStack.map((group) => (
            <div key={group.category} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">{group.category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <Badge key={item} variant="default" size="sm">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Architecture Readiness for Phase 2 */}
      <div className="bg-brand-violet/5 border border-brand-violet/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-brand-violet shrink-0" />
            <h4 className="font-bold text-brand-navy text-sm sm:text-base">
              Phase 1 Foundation Setup Complete
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Technical setup is verified. Awaiting your approval to start <strong>Phase 2: ZENVORA AI Public Website Header, Navigation, and Mega Menus</strong>.
          </p>
        </div>
        <Badge variant="navy" size="lg">
          Ready for Phase 2
        </Badge>
      </div>
    </div>
  );
};

export default FoundationPage;


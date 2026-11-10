import { ArrowRight, Award, Compass, Cpu, Heart, Layers, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import BrandSymbol from '../components/common/BrandSymbol';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const AboutPage = () => {
  return (
    <div className="space-y-20 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="teal" size="md">Our Mission</Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-navy tracking-tight">
          Democratizing autonomous marketing intelligence.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          ZENVORA AI was founded on a simple conviction: marketing teams should spend their time developing high-level narrative strategy, not copy-pasting posts across spreadsheets.
        </p>
      </div>

      {/* Story / Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge variant="navy" size="sm">The Genesis</Badge>
          <h2 className="text-3xl font-extrabold text-brand-navy">
            Bridging the gap between generic AI tools and authentic brand equity.
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            When generative AI first emerged, it promised infinite content. But most teams quickly discovered the hidden trap: generic, robotic outputs that eroded customer trust and diluted their brand voice.
          </p>
          <p className="text-slate-600 leading-relaxed text-sm">
            We built ZENVORA AI to solve this fundamental flaw. By introducing an immutable **Brand Knowledge Base** that directly feeds every generation prompt, we ensure that whether you generate a 2,000-word SEO pillar post or a 280-character tweet, it sounds unmistakably like your company.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-brand-violet">99.4%</div>
              <div className="text-xs text-slate-500 mt-1">Brand Voice Alignment</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-brand-teal">15+ hrs</div>
              <div className="text-xs text-slate-500 mt-1">Saved per Team Weekly</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-brand-navy via-[#1e274a] to-brand-navy p-8 sm:p-12 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
          <BrandSymbol size={64} />
          <h3 className="text-2xl font-bold">Our 3 Architectural Tenets</h3>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <ShieldCheck className="text-brand-teal shrink-0 mt-0.5" size={18} />
              <span><strong>Isolated Workspace Integrity:</strong> Your proprietary marketing data and brand guidelines are strictly isolated and never used for public training.</span>
            </li>
            <li className="flex items-start gap-3">
              <Cpu className="text-brand-violet shrink-0 mt-0.5" size={18} />
              <span><strong>Semantic Depth Over Fluff:</strong> We prioritize real customer search intent and topical clustering over superficial keyword stuffing.</span>
            </li>
            <li className="flex items-start gap-3">
              <Layers className="text-brand-teal shrink-0 mt-0.5" size={18} />
              <span><strong>Human-in-the-Loop Velocity:</strong> True automation accelerates human creativity rather than attempting to replace genuine strategic thought.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Leadership Values */}
      <div className="space-y-8 text-center max-w-4xl mx-auto">
        <h3 className="text-3xl font-extrabold text-brand-navy">Core Operating Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Card className="p-6 space-y-2">
            <Target className="text-brand-violet" size={24} />
            <h4 className="font-bold text-base text-brand-navy">Data-Backed Claims</h4>
            <p className="text-xs text-slate-600">We do not manufacture fake analytics. We deliver transparent metrics with actionable recommendations.</p>
          </Card>
          <Card className="p-6 space-y-2">
            <Compass className="text-brand-teal" size={24} />
            <h4 className="font-bold text-base text-brand-navy">Sustainable Growth</h4>
            <p className="text-xs text-slate-600">Organic compounding beats short-term spam hacks every time. We build lasting brand moats.</p>
          </Card>
          <Card className="p-6 space-y-2">
            <Sparkles className="text-brand-violet" size={24} />
            <h4 className="font-bold text-base text-brand-navy">Relentless Simplicity</h4>
            <p className="text-xs text-slate-600">A clean, focused user interface that empowers non-technical founders to act with CMO-level confidence.</p>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-white p-10 rounded-3xl border border-slate-200/80 max-w-3xl mx-auto space-y-4">
        <h3 className="text-2xl font-bold text-brand-navy">Experience ZENVORA AI today</h3>
        <p className="text-sm text-slate-600">Join our growing ecosystem of forward-looking marketing teams.</p>
        <Link to="/register">
          <Button variant="primary" size="lg" className="px-8 shadow-md shadow-brand-violet/25">
            <span>Explore Platform</span>
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;

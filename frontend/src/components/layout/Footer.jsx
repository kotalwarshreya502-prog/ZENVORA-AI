import { ArrowRight, Globe, Share2, Shield, Sparkles } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import BrandSymbol from '../common/BrandSymbol';

export const Footer = () => {
  return (
    <footer className="bg-brand-navy text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <BrandSymbol size={34} />
              <div className="font-extrabold text-xl tracking-tight text-white">
                ZENVORA <span className="text-brand-violet">AI</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              The all-in-one AI marketing automation platform. Scale organic SEO traffic, schedule multi-channel social campaigns, and protect your unique brand voice.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800/80 hover:bg-brand-violet hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800/80 hover:bg-brand-violet hover:text-white transition-colors" aria-label="X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://zenvora.ai" className="p-2 rounded-lg bg-slate-800/80 hover:bg-brand-violet hover:text-white transition-colors" aria-label="Website">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">Platform</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white transition-colors">AI Content Studio</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Blog SEO Generator</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Social Scheduler</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Website SEO Auditor</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Brand Guidelines</Link></li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">Solutions</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white transition-colors">Small Businesses</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Marketing Agencies</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Multi-Location Brands</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">B2B SaaS Growth</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Enterprise Plans</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">Company</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Sales</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            &copy; {new Date().getFullYear()} ZENVORA AI Systems Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-brand-teal" />
              Enterprise Data Isolation
            </span>
            <span>Tagline: <strong>Smarter Marketing. Sustainable Growth.</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

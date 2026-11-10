import { ArrowRight, ChevronDown, Menu, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const productLinks = [
    { name: 'AI Content Studio', desc: 'Generate multi-channel ad copy, captions, and posts in seconds', path: '/features' },
    { name: 'AI Blog & SEO Engine', desc: 'Rank higher with keyword-clustered long-form articles', path: '/features' },
    { name: 'Content Calendar', desc: 'Schedule, queue, and publish across all social channels', path: '/features' },
    { name: 'SEO Audit & Analyzer', desc: 'Heuristic site scans with actionable optimization fixes', path: '/features' },
  ];

  const solutionLinks = [
    { name: 'For SMBs & Founders', desc: 'Build an organic marketing engine without hiring an agency', path: '/features' },
    { name: 'For Digital Agencies', desc: 'Manage multiple client workspaces with white-label reports', path: '/features' },
    { name: 'For E-commerce Brands', desc: 'Drive conversion velocity with high-converting social copy', path: '/features' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <BrandLogo size={38} showTagline={false} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Products Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('products')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-brand-violet py-2 transition-colors">
              <span>Platform</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'products' && (
              <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                {productLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="text-sm font-bold text-brand-navy group-hover:text-brand-violet transition-colors">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('solutions')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-brand-violet py-2 transition-colors">
              <span>Solutions</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'solutions' && (
              <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                {solutionLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="text-sm font-bold text-brand-navy group-hover:text-brand-violet transition-colors">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/features" className="text-sm font-semibold text-slate-700 hover:text-brand-violet transition-colors">
            Features
          </Link>

          <Link to="/pricing" className="text-sm font-semibold text-slate-700 hover:text-brand-violet transition-colors">
            Pricing
          </Link>

          <Link to="/about" className="text-sm font-semibold text-slate-700 hover:text-brand-violet transition-colors">
            About
          </Link>

          <Link to="/contact" className="text-sm font-semibold text-slate-700 hover:text-brand-violet transition-colors">
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-violet hover:bg-[#6545e8] text-white shadow-sm shadow-brand-violet/25 transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight size={15} />
              </Link>
              <button
                onClick={logout}
                className="text-xs font-semibold text-slate-500 hover:text-brand-navy px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-brand-navy hover:text-brand-violet px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-navy hover:bg-[#1c2242] text-white shadow-sm transition-all"
              >
                <Sparkles size={15} className="text-brand-teal" />
                <span>Start Free</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-brand-navy rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-slate-800">
            <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-brand-violet">Features & Platform</Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-brand-violet">Pricing</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-brand-violet">About Us</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-brand-violet">Contact</Link>
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-brand-violet text-white font-bold rounded-xl text-sm shadow-sm"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-slate-300 font-semibold text-brand-navy rounded-xl text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-brand-navy text-white font-bold rounded-xl text-sm shadow-sm"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

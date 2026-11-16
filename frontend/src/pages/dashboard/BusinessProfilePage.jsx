import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Palette,
  Target,
  Layers,
  DollarSign,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const BusinessProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [websiteInput, setWebsiteInput] = useState('');

  const [business, setBusiness] = useState({
    name: 'Zenvora Marketing Labs',
    website: 'https://zenvora.ai',
    industry: 'Marketing Technology & AI SaaS',
    description: 'Autonomous AI marketing operating system empowering modern brands to research, generate, publish, and scale multi-channel campaigns effortlessly.',
    companySize: '11-50 employees',
    email: 'contact@zenvora.ai',
    phone: '+1 (555) 382-9100',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
    brandVoice: 'Authoritative, innovative, data-driven, yet accessible and customer-centric',
    targetAudience: 'Growth-minded SMB founders, marketing leaders, digital agencies, and e-commerce brands',
    uniqueSellingPoints: [
      'Universal brand adaptability for any industry',
      'True generative AI text and visual composition',
      'Unified multi-agent marketing orchestration',
      'Multi-channel calendar and real publishing workflow',
    ],
    productsServices: [
      'AI Content Studio',
      'Intelligent Poster & Ad Creator',
      'Autonomous Campaign Hub',
      'SEO & Keyword Clustering Engine',
    ],
    brandColors: {
      primary: '#7657F6',
      secondary: '#11152B',
      accent: '#3B82F6',
    },
    pricingOverview: 'Growth tier starting at $49/month with custom enterprise plans available',
    competitors: ['Jasper AI', 'Copy.ai', 'HubSpot Marketing Hub'],
    address: {
      street: '450 Innovation Parkway, Suite 800',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      zipCode: '94105',
    },
    socialHandles: {
      linkedin: 'https://linkedin.com/company/zenvora-ai',
      twitter: '@zenvora_ai',
      instagram: '@zenvora_growth',
    },
  });

  const [newUsp, setNewUsp] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getBusinessProfile();
      if (res?.data?.business) {
        const b = res.data.business;
        setBusiness((prev) => ({
          ...prev,
          ...b,
          brandColors: b.brandColors || prev.brandColors,
          uniqueSellingPoints: b.uniqueSellingPoints?.length ? b.uniqueSellingPoints : prev.uniqueSellingPoints,
          productsServices: b.productsServices?.length ? b.productsServices : prev.productsServices,
          competitors: b.competitors?.length ? b.competitors : prev.competitors,
        }));
        if (b.website) setWebsiteInput(b.website);
      }
    } catch (err) {
      console.warn('Could not fetch remote profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAnalyze = async () => {
    if (!websiteInput || !websiteInput.trim()) {
      setErrorMsg('Please enter a valid website URL to analyze.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    setAnalysisSuccess(false);

    try {
      const res = await api.analyzeWebsite(websiteInput.trim());
      if (res?.data?.business) {
        const b = res.data.business;
        setBusiness((prev) => ({
          ...prev,
          ...b,
          brandColors: b.brandColors || prev.brandColors,
          uniqueSellingPoints: b.uniqueSellingPoints || prev.uniqueSellingPoints,
          productsServices: b.productsServices || prev.productsServices,
          competitors: b.competitors || prev.competitors,
        }));
        setAnalysisSuccess(true);
        setTimeout(() => setAnalysisSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Website analysis error:', err);
      setErrorMsg(err?.message || 'Failed to analyze website. Ensure the URL is live and accessible.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      await api.updateBusinessProfile(business);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving business profile:', err);
      setErrorMsg(err?.message || 'Failed to save business profile to database.');
    } finally {
      setSaving(false);
    }
  };

  const addUsp = () => {
    if (!newUsp.trim()) return;
    setBusiness((b) => ({
      ...b,
      uniqueSellingPoints: [...(b.uniqueSellingPoints || []), newUsp.trim()],
    }));
    setNewUsp('');
  };

  const removeUsp = (idx) => {
    setBusiness((b) => ({
      ...b,
      uniqueSellingPoints: b.uniqueSellingPoints.filter((_, i) => i !== idx),
    }));
  };

  const addProduct = () => {
    if (!newProduct.trim()) return;
    setBusiness((b) => ({
      ...b,
      productsServices: [...(b.productsServices || []), newProduct.trim()],
    }));
    setNewProduct('');
  };

  const removeProduct = (idx) => {
    setBusiness((b) => ({
      ...b,
      productsServices: b.productsServices.filter((_, i) => i !== idx),
    }));
  };

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return;
    setBusiness((b) => ({
      ...b,
      competitors: [...(b.competitors || []), newCompetitor.trim()],
    }));
    setNewCompetitor('');
  };

  const removeCompetitor = (idx) => {
    setBusiness((b) => ({
      ...b,
      competitors: b.competitors.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="text-brand-violet" size={24} />
            Business Intelligence & Brand Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Universal business memory powering all ZENVORA AI agents, content studios, and marketing campaigns.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md shadow-brand-violet/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Saving to Database...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle size={16} className="text-emerald-300" />
              Saved Successfully!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Profile
            </>
          )}
        </button>
      </div>

      {/* AI Website Extraction Hero Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-violet/10 via-purple-500/10 to-blue-500/10 border border-brand-violet/20 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-brand-violet font-semibold text-sm">
          <Sparkles size={18} />
          <span>AI Auto-Extract from Any Website URL</span>
        </div>
        <p className="text-xs text-slate-600">
          Enter any business website (e.g. your startup, client, or e-commerce store). ZENVORA AI will crawl the site and instantly extract brand identity, voice, products, colors, logo, target audience, and USPs.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="url"
              placeholder="https://yourcompany.com"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/30"
            />
          </div>

          <button
            type="button"
            onClick={handleAutoAnalyze}
            disabled={analyzing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60 whitespace-nowrap"
          >
            {analyzing ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Crawling & Extracting...
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-yellow-400" />
                Analyze Website with AI
              </>
            )}
          </button>
        </div>

        {analysisSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle size={15} className="text-emerald-600 shrink-0" />
            <span>Website crawled and analyzed successfully! Brand profile, colors, voice, and USPs updated below.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Business Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Core Business Information */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building size={16} className="text-brand-violet" />
              General Brand Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Company / Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Industry Vertical
                </label>
                <input
                  type="text"
                  value={business.industry}
                  onChange={(e) => setBusiness({ ...business, industry: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="url"
                    value={business.website}
                    onChange={(e) => {
                      setBusiness({ ...business, website: e.target.value });
                      setWebsiteInput(e.target.value);
                    }}
                    className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Organization Size
                </label>
                <select
                  value={business.companySize}
                  onChange={(e) => setBusiness({ ...business, companySize: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                >
                  <option value="1-10 employees">1-10 employees (Startup)</option>
                  <option value="11-50 employees">11-50 employees (Growing)</option>
                  <option value="51-200 employees">51-200 employees (Scale-up)</option>
                  <option value="201-1000 employees">201-1000 employees (Mid-market)</option>
                  <option value="1000+ employees">1000+ employees (Enterprise)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business Description & Value Proposition
              </label>
              <textarea
                rows={4}
                value={business.description}
                onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Official Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={business.email}
                    onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Direct Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    value={business.phone}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brand Voice & Target Audience */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Target size={16} className="text-brand-violet" />
              Brand Voice & Audience Strategy
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tone of Voice
              </label>
              <input
                type="text"
                value={business.brandVoice}
                onChange={(e) => setBusiness({ ...business, brandVoice: e.target.value })}
                placeholder="e.g. Authoritative, innovative, friendly, conversational"
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience & Ideal Customer Profile (ICP)
              </label>
              <textarea
                rows={3}
                value={business.targetAudience}
                onChange={(e) => setBusiness({ ...business, targetAudience: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>
          </div>

          {/* Unique Selling Points */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              Unique Selling Points (USPs)
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newUsp}
                onChange={(e) => setNewUsp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUsp();
                  }
                }}
                placeholder="Add a USP (press Enter or Click Add)..."
                className="flex-1 text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
              <button
                type="button"
                onClick={addUsp}
                className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(business.uniqueSellingPoints || []).map((usp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium"
                >
                  {usp}
                  <button type="button" onClick={() => removeUsp(idx)} className="text-purple-400 hover:text-purple-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Visual Identity, Offerings, Competitors */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand Visual Identity */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Palette size={16} className="text-brand-violet" />
              Visual Brand Assets & Colors
            </h2>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Logo URL
              </label>
              <div className="flex items-center gap-3">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt="Logo preview"
                    className="w-12 h-12 object-contain rounded-lg border border-slate-200 p-1 bg-slate-50 shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs shrink-0">
                    No logo
                  </div>
                )}
                <input
                  type="url"
                  value={business.logoUrl || ''}
                  onChange={(e) => setBusiness({ ...business, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Brand Color Palette
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">Primary</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={business.brandColors?.primary || '#7657F6'}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          brandColors: { ...business.brandColors, primary: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={business.brandColors?.primary || '#7657F6'}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          brandColors: { ...business.brandColors, primary: e.target.value },
                        })
                      }
                      className="w-full text-xs font-mono rounded border border-slate-300 p-1.5"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">Secondary</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={business.brandColors?.secondary || '#11152B'}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          brandColors: { ...business.brandColors, secondary: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={business.brandColors?.secondary || '#11152B'}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          brandColors: { ...business.brandColors, secondary: e.target.value },
                        })
                      }
                      className="w-full text-xs font-mono rounded border border-slate-300 p-1.5"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">Accent</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={business.brandColors?.accent || '#3B82F6'}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          brandColors: { ...business.brandColors, accent: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={business.brandColors?.accent || '#3B82F6'}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          brandColors: { ...business.brandColors, accent: e.target.value },
                        })
                      }
                      className="w-full text-xs font-mono rounded border border-slate-300 p-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products & Services */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-brand-violet" />
              Core Products & Services
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addProduct();
                  }
                }}
                placeholder="Add product or service offering..."
                className="flex-1 text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
              <button
                type="button"
                onClick={addProduct}
                className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(business.productsServices || []).map((prod, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium"
                >
                  {prod}
                  <button type="button" onClick={() => removeProduct(idx)} className="text-blue-400 hover:text-blue-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Pricing Overview & Competitors */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} className="text-brand-violet" />
              Commercials & Market Positioning
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pricing Overview / Plans
              </label>
              <input
                type="text"
                value={business.pricingOverview || ''}
                onChange={(e) => setBusiness({ ...business, pricingOverview: e.target.value })}
                placeholder="e.g. Freemium with paid plans from $49/mo"
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Direct / Industry Competitors
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCompetitor();
                    }
                  }}
                  placeholder="Add competitor name..."
                  className="flex-1 text-sm rounded-lg border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                />
                <button
                  type="button"
                  onClick={addCompetitor}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(business.competitors || []).map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs"
                  >
                    {comp}
                    <button type="button" onClick={() => removeCompetitor(idx)} className="text-slate-400 hover:text-slate-700">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfilePage;

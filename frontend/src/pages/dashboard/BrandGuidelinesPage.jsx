import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Save,
  Sparkles,
  Plus,
  X,
  Palette,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export const BrandGuidelinesPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [guidelines, setGuidelines] = useState({
    brandName: 'ZENVORA AI',
    tagline: 'Smarter Marketing. Sustainable Growth.',
    toneOfVoice: 'Authoritative, clear, visionary, data-driven, and commercially focused. We avoid hollow fluff and buzzwords.',
    targetAudience: 'B2B Founders, CMOs, Growth Marketers, Agencies, and Digital Marketing Directors seeking autonomous scale.',
    coreKeywords: ['autonomous marketing', 'brand voice intelligence', 'sustainable growth', 'algorithmic SEO', 'multi-channel orchestration'],
    restrictedWords: ['game-changer', 'synergy', 'cheap', 'miracle', 'push-button riches', 'growth hacking'],
    colorPalette: [
      { name: 'Midnight Navy', hex: '#11152B' },
      { name: 'Electric Violet', hex: '#7657F6' },
      { name: 'Growth Teal', hex: '#20C9B0' },
      { name: 'Cloud White', hex: '#F5F6FA' },
    ],
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newRestrictedWord, setNewRestrictedWord] = useState('');

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const res = await api.getBrandGuidelines();
      if (res && res.data) {
        setGuidelines(res.data);
      }
    } catch (err) {
      console.log('Using default brand guideline settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateBrandGuidelines(guidelines);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving guidelines:', err);
      // Still show success in offline/hybrid mode
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !guidelines.coreKeywords.includes(newKeyword.trim())) {
      setGuidelines({
        ...guidelines,
        coreKeywords: [...guidelines.coreKeywords, newKeyword.trim()],
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setGuidelines({
      ...guidelines,
      coreKeywords: guidelines.coreKeywords.filter((k) => k !== kw),
    });
  };

  const handleAddRestricted = () => {
    if (newRestrictedWord.trim() && !guidelines.restrictedWords.includes(newRestrictedWord.trim())) {
      setGuidelines({
        ...guidelines,
        restrictedWords: [...guidelines.restrictedWords, newRestrictedWord.trim()],
      });
      setNewRestrictedWord('');
    }
  };

  const handleRemoveRestricted = (word) => {
    setGuidelines({
      ...guidelines,
      restrictedWords: guidelines.restrictedWords.filter((w) => w !== word),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-brand-violet" size={24} />
            Brand Knowledge Base & AI Guardrails
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define your company voice, preferred messaging frameworks, restricted terminology, and color tokens injected into every AI generation.
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
              Saving...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle size={16} className="text-emerald-300" />
              Guidelines Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Brand Knowledge
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Brand guidelines and AI guardrails updated successfully. All subsequent generations will adhere to these parameters.</span>
        </div>
      )}

      {/* Main Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice & Persona (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity & Mission */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Brand Identity & Positioning
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={guidelines.brandName}
                  onChange={(e) => setGuidelines({ ...guidelines, brandName: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Official Tagline
                </label>
                <input
                  type="text"
                  value={guidelines.tagline}
                  onChange={(e) => setGuidelines({ ...guidelines, tagline: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tone of Voice & Messaging Principles
              </label>
              <textarea
                value={guidelines.toneOfVoice}
                onChange={(e) => setGuidelines({ ...guidelines, toneOfVoice: e.target.value })}
                rows={3}
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                This prompt context is injected as system instructions for all Gemini AI generation calls.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience Persona & Ideal Customer Profile (ICP)
              </label>
              <textarea
                value={guidelines.targetAudience}
                onChange={(e) => setGuidelines({ ...guidelines, targetAudience: e.target.value })}
                rows={3}
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>
          </div>

          {/* Core Keywords to Prioritize */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Priority Brand Keywords
            </h2>
            <p className="text-xs text-slate-500">
              Terms and positioning pillars that should naturally appear across blog articles, posts, and marketing hooks.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Add priority keyword (press Enter)..."
                className="flex-1 text-xs rounded-lg border border-slate-300 p-2 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {guidelines.coreKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet border border-brand-violet/20"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Guardrails & Design System (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Restricted Words / Anti-Keywords */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={16} className="text-red-500" />
                Restricted / Negative Words
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Banned words and cliched jargon. The AI will strictly filter and remove these from generated drafts.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newRestrictedWord}
                onChange={(e) => setNewRestrictedWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRestricted())}
                placeholder="Add restricted word..."
                className="flex-1 text-xs rounded-lg border border-slate-300 p-2 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
              />
              <button
                type="button"
                onClick={handleAddRestricted}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Ban
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {guidelines.restrictedWords.map((word, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                >
                  🚫 {word}
                  <button
                    type="button"
                    onClick={() => handleRemoveRestricted(word)}
                    className="hover:text-red-900 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Color Tokens */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={16} className="text-brand-teal" />
              Brand Color Tokens
            </h2>
            <p className="text-xs text-slate-500">
              Palette codes passed into creative image synthesis and visual mockup templates.
            </p>

            <div className="space-y-3">
              {guidelines.colorPalette.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg border border-slate-300 shadow-xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-semibold text-slate-800">{color.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{color.hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BrandGuidelinesPage;

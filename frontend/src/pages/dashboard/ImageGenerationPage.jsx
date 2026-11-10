import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Share2,
  Calendar,
  Layers,
  Wand2,
  Check,
  RefreshCw,
  Sliders,
  Palette,
  Maximize2
} from 'lucide-react';
import BrandSymbol from '../../components/common/BrandSymbol';

export const ImageGenerationPage = () => {
  const [prompt, setPrompt] = useState('Abstract 3D glowing orbital spheres in midnight navy and electric violet representing continuous data intelligence and marketing automation');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [stylePreset, setStylePreset] = useState('Modern Tech 3D');
  const [colorGrading, setColorGrading] = useState('Midnight Violet');
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [gallery, setGallery] = useState([
    {
      id: 'img-1',
      title: 'Autonomous Data Flow',
      prompt: 'High fidelity 3D glass spheres orbiting dark holographic data stream, electric violet highlights, 8k render',
      ratio: '1:1',
      style: 'Modern Tech 3D',
      gradient: 'from-slate-900 via-indigo-950 to-brand-navy',
      date: 'Today, 10:24 AM',
    },
    {
      id: 'img-2',
      title: 'SaaS Growth Infographic Hero',
      prompt: 'Minimal geometric growth curves rising with subtle teal and purple lighting, studio lighting',
      ratio: '16:9',
      style: 'Clean Corporate',
      gradient: 'from-brand-navy via-slate-900 to-teal-950',
      date: 'Yesterday',
    },
    {
      id: 'img-3',
      title: 'AI Multi-Channel Grid',
      prompt: 'Futuristic architectural interface showing social channels converging into a central prism',
      ratio: '4:5',
      style: 'Cyber Tech',
      gradient: 'from-purple-950 via-slate-900 to-indigo-950',
      date: '3 days ago',
    },
  ]);

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const newImg = {
        id: `img-${Date.now()}`,
        title: prompt.slice(0, 32) + '...',
        prompt: prompt,
        ratio: aspectRatio,
        style: stylePreset,
        gradient:
          colorGrading === 'Midnight Violet'
            ? 'from-brand-navy via-purple-950 to-brand-violet/40'
            : colorGrading === 'Growth Teal'
            ? 'from-slate-900 via-teal-950 to-brand-teal/40'
            : 'from-slate-950 via-indigo-900 to-slate-900',
        date: 'Just now',
      };
      setGallery([newImg, ...gallery]);
      setLoading(false);
    }, 1200);
  };

  const handleDownload = (img) => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="text-brand-violet" size={24} />
          Marketing Visual Studio & Prompt Synthesizer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Synthesize high-conversion marketing graphics, hero assets, and feed visuals formatted for multi-channel publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 5 Cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Visual Concept / Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your marketing visual concept in detail..."
                rows={3}
                required
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Format / Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', label: '1:1 Square', note: 'Instagram / Feed' },
                  { id: '16:9', label: '16:9 Wide', note: 'Blog / YouTube' },
                  { id: '4:5', label: '4:5 Portrait', note: 'Instagram / TikTok' },
                  { id: '1.91:1', label: '1.91:1', note: 'LinkedIn Banner' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id)}
                    className={`p-2 text-center rounded-lg border text-xs transition-all ${
                      aspectRatio === item.id
                        ? 'border-brand-violet bg-brand-violet/10 text-brand-violet font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">{item.id}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic Style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Art Style Preset
                </label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                >
                  <option value="Modern Tech 3D">Modern Tech 3D Glass</option>
                  <option value="Clean Corporate">Clean Minimal Corporate</option>
                  <option value="Cyber Tech">Futuristic / Neon Tech</option>
                  <option value="Abstract Gradient">Abstract Orbital Waves</option>
                  <option value="Editorial Photo">Studio Editorial Mockup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Color Grading
                </label>
                <select
                  value={colorGrading}
                  onChange={(e) => setColorGrading(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                >
                  <option value="Midnight Violet">ZENVORA Violet (#7657F6)</option>
                  <option value="Growth Teal">Growth Teal (#20C9B0)</option>
                  <option value="Deep Navy">Midnight Navy (#11152B)</option>
                  <option value="High Contrast">Monochrome High Contrast</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 px-4 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md shadow-brand-violet/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Synthesizing Visual Asset...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Generate Creative Asset
                </>
              )}
            </button>
          </form>

          {/* Quick Ideas */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Recommended Marketing Visual Prompts:
            </span>
            <div className="space-y-2">
              {[
                '3D glowing crystal dashboard with growth arrows and orbital energy lines',
                'Minimalist architectural office space with holographic analytics display',
                'Futuristic smartphone floating against dark navy background displaying social growth metrics',
              ].map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg cursor-pointer transition-colors border border-slate-200"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Gallery: 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Generated Marketing Assets ({gallery.length})
            </h2>
            {downloadSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Creative asset downloaded!
              </span>
            )}
          </div>

          <div className="space-y-4">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Visual Canvas Display */}
                <div
                  className={`w-full h-64 bg-gradient-to-br ${img.gradient} relative flex flex-col items-center justify-center p-6 text-white overflow-hidden`}
                >
                  {/* Subtle grid pattern overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Brand Watermark */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <BrandSymbol size={16} />
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                      ZENVORA CREATIVE
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
                    {img.ratio}
                  </div>

                  {/* Main Creative Centerpiece */}
                  <div className="relative z-10 text-center max-w-md px-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                      <Sparkles className="text-brand-teal" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-xs">
                      {img.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 drop-shadow-xs">
                      {img.prompt}
                    </p>
                  </div>

                  {/* Bottom Bar Info */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Style: {img.style}</span>
                    <span>{img.date}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 truncate max-w-xs">
                    {img.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(img)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                    >
                      <Download size={14} /> Download Asset
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-violet hover:bg-brand-violet/90 text-white rounded-lg transition-colors">
                      <Calendar size={14} /> Add to Post
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPage;

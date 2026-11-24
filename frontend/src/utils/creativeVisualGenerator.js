/**
 * ZENVORA AI — Dynamic Commercial Creative Visual Engine
 * Generates guaranteed high-definition, commercial-grade vector visuals as SVG Data URIs.
 * 
 * 100% Reliability:
 * - 0ms render latency (data:image/svg+xml;base64)
 * - 0 network dependency (works offline, in sandboxes, behind firewalls/ISPs)
 * - 0 CORS taint (seamlessly composites onto canvas and exports to PNG/JPG)
 */

export const createCommercialVectorCreative = ({
  brand = 'ZENVORA',
  topic = 'SPECIAL OFFER',
  offer = 'EXCLUSIVE DEAL',
  cta = 'SHOP NOW',
  category = 'tech',
}) => {
  const safeBrand = (brand || 'ZENVORA').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTopic = (topic || 'SPECIAL OFFER').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeOffer = (offer || 'LIMITED TIME').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const catLower = (category || topic || '').toLowerCase();

  let heroVisualSvg = '';
  let accentColor1 = '#38bdf8'; // Sky cyan
  let accentColor2 = '#818cf8'; // Indigo
  let glowColor = '#6366f1';    // Violet

  if (catLower.includes('food') || catLower.includes('pizza') || catLower.includes('samosa') || catLower.includes('burger')) {
    accentColor1 = '#fbbf24'; // Amber
    accentColor2 = '#f97316'; // Orange
    glowColor = '#ea580c';

    heroVisualSvg = `
      <!-- Gourmet Food Styling -->
      <g transform="translate(540, 520)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="180" rx="260" ry="40" fill="#1c1917" opacity="0.8" />
        <ellipse cx="0" cy="175" rx="220" ry="25" fill="${accentColor2}" opacity="0.3" />
        <!-- Floating Gourmet Dish Graphic -->
        <circle cx="0" cy="0" r="140" fill="#292524" stroke="${accentColor1}" stroke-width="4" />
        <circle cx="0" cy="0" r="120" fill="#44403c" />
        <!-- Appetizing Accents -->
        <circle cx="-35" cy="-25" r="28" fill="${accentColor2}" opacity="0.9" />
        <circle cx="35" cy="-20" r="24" fill="${accentColor1}" opacity="0.9" />
        <circle cx="5" cy="35" r="30" fill="#ef4444" opacity="0.85" />
        <path d="M -60 -40 Q 0 -80 60 -40" stroke="#fef08a" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="-15" cy="-5" r="14" fill="#22c55e" opacity="0.9" />
        <circle cx="20" cy="15" r="12" fill="#eab308" opacity="0.9" />
      </g>
    `;
  } else if (catLower.includes('shoe') || catLower.includes('sneaker') || catLower.includes('fashion') || catLower.includes('wear')) {
    accentColor1 = '#f43f5e'; // Rose
    accentColor2 = '#ec4899'; // Pink
    glowColor = '#e11d48';

    heroVisualSvg = `
      <!-- Dynamic Sneaker / Apparel Graphic -->
      <g transform="translate(540, 520)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="160" rx="280" ry="35" fill="#0f172a" opacity="0.8" />
        <ellipse cx="0" cy="155" rx="230" ry="20" fill="${accentColor1}" opacity="0.4" />
        <!-- Aerodynamic Silhouette -->
        <path d="M -160 80 Q -100 -20 20 10 Q 140 30 180 80 Q 80 110 -60 100 Z" fill="#1e1b4b" stroke="${accentColor1}" stroke-width="5" />
        <path d="M -120 75 Q -50 15 40 35 Q 120 50 150 78" stroke="${accentColor2}" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="60" cy="35" r="10" fill="#fff" />
      </g>
    `;
  } else {
    // Default: Premium Technology / Smartphone / Smart Device Series
    accentColor1 = '#38bdf8'; // Sky cyan
    accentColor2 = '#a855f7'; // Purple
    glowColor = '#6366f1';

    heroVisualSvg = `
      <!-- High-Tech Smart Device Hero -->
      <g transform="translate(540, 510)" filter="url(#dropShadow)">
        <!-- Ambient Stage Pedestal -->
        <ellipse cx="0" cy="190" rx="270" ry="38" fill="#090d16" opacity="0.9" />
        <ellipse cx="0" cy="185" rx="220" ry="22" fill="${accentColor1}" opacity="0.4" />
        
        <!-- Smartphone Body Frame -->
        <g transform="translate(-130, -210)">
          <rect x="0" y="0" width="260" height="390" rx="36" fill="#0f172a" stroke="${accentColor1}" stroke-width="4" />
          <rect x="10" y="10" width="240" height="370" rx="28" fill="#020617" />
          
          <!-- Edge Reflections -->
          <path d="M 16 30 Q 130 15 244 30" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none" />
          
          <!-- OLED Display Camera Glow -->
          <circle cx="130" cy="150" r="55" fill="${accentColor2}" opacity="0.25" />
          <circle cx="130" cy="150" r="38" fill="${accentColor1}" opacity="0.5" />
          <path d="M 115 150 L 126 161 L 148 139" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          
          <text x="130" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">${safeBrand.toUpperCase()}</text>
          <text x="130" y="268" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="${accentColor1}" text-anchor="middle" letter-spacing="1">NEXT-GEN AI PRO</text>
        </g>
      </g>
    `;
  }

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811" />
      <stop offset="45%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <radialGradient id="stageSpotlight" cx="50%" cy="46%" r="50%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.4" />
      <stop offset="55%" stop-color="${accentColor2}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#050811" stop-opacity="0" />
    </radialGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.75" />
    </filter>
    <linearGradient id="gridLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor1}" stop-opacity="0" />
      <stop offset="50%" stop-color="${accentColor1}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${accentColor1}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Deep Atmospheric Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  
  <!-- Ambient Spotlight -->
  <circle cx="540" cy="500" r="460" fill="url(#stageSpotlight)" />

  <!-- Studio Floor Perspective Grid Lines -->
  <line x1="140" y1="720" x2="940" y2="720" stroke="url(#gridLine)" stroke-width="2" />
  <line x1="220" y1="770" x2="860" y2="770" stroke="url(#gridLine)" stroke-width="1.5" />
  <line x1="300" y1="820" x2="780" y2="820" stroke="url(#gridLine)" stroke-width="1" />

  <!-- The Centered Hero Commercial Visual -->
  ${heroVisualSvg}
</svg>
`.trim();

  // Encode as base64 Data URI for total browser safety
  if (typeof btoa !== 'undefined') {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
  }
  if (typeof Buffer !== 'undefined') {
    return 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');
  }
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent);
};

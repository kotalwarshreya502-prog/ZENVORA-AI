/**
 * ZENVORA AI — Dynamic Commercial Creative Visual Engine
 * Generates guaranteed high-definition, commercial-grade vector visuals as SVG Data URIs.
 * 
 * 100% Reliability:
 * - 0ms render latency (data:image/svg+xml;base64)
 * - 0 network dependency (works offline, in sandboxes, behind firewalls/ISPs)
 * - 0 CORS taint (seamlessly composites onto canvas and exports to PNG/JPG)
 * - Centered hero visual placed in the visible aperture (Y: 200-580), perfectly clear of overlays.
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
  let glowColor = '#3b82f6';    // Blue
  let bgTop = '#0a1026';
  let bgMid = '#1e1b4b';
  let bgBottom = '#0f172a';

  if (catLower.includes('book') || catLower.includes('novel') || catLower.includes('reading') || catLower.includes('library') || catLower.includes('literature') || catLower.includes('author') || catLower.includes('textbook')) {
    accentColor1 = '#fbbf24'; // Warm gold
    accentColor2 = '#f59e0b'; // Amber
    glowColor = '#d97706';
    bgTop = '#1a1006';
    bgMid = '#2d1805';
    bgBottom = '#1c1917';

    heroVisualSvg = `
      <!-- Elegant Open Book & Luminous Reading Aesthetic Graphic -->
      <g transform="translate(540, 390)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="150" rx="280" ry="32" fill="#0c0a09" opacity="0.85" />
        <ellipse cx="0" cy="145" rx="230" ry="20" fill="${accentColor1}" opacity="0.4" />
        
        <!-- Open Hardcover Book Base -->
        <path d="M -190 100 C -130 50, -40 80, 0 105 C 40 80, 130 50, 190 100 L 170 20 C 120 -20, 30 0, 0 25 C -30 0, -120 -20, -170 20 Z" fill="#854d0e" stroke="${accentColor1}" stroke-width="4" />
        <!-- Stacked Pages Left -->
        <path d="M -170 20 C -120 -15, -30 5, 0 30 L 0 -100 C -40 -125, -130 -105, -180 -65 Z" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
        <!-- Stacked Pages Right -->
        <path d="M 0 30 C 30 5, 120 -15, 170 20 L 180 -65 C 130 -105, 40 -125, 0 -100 Z" fill="#fffbeb" stroke="#d97706" stroke-width="2.5" />
        <!-- Spine & Golden Bookmark Ribbon -->
        <line x1="0" y1="-100" x2="0" y2="30" stroke="${accentColor1}" stroke-width="5" />
        <path d="M 0 30 Q 25 75, 45 115" stroke="#f59e0b" stroke-width="6" fill="none" stroke-linecap="round" />
        
        <!-- Radiant Sparks & Star Accents -->
        <circle cx="-130" cy="-110" r="4" fill="#fde047" opacity="0.9" filter="url(#dropShadow)" />
        <circle cx="140" cy="-120" r="5" fill="#fde047" opacity="0.9" filter="url(#dropShadow)" />
        <circle cx="-60" cy="-140" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="70" cy="-130" r="3.5" fill="#ffffff" opacity="0.8" />

        <!-- Title Typography Embellishments -->
        <text x="0" y="-135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#fef3c7" text-anchor="middle" letter-spacing="3">${safeBrand.toUpperCase()}</text>
        <text x="0" y="-110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${accentColor1}" text-anchor="middle" letter-spacing="2">AUTHENTIC BOOKSTORE EDITION</text>
      </g>
    `;
  } else if (catLower.includes('jewel') || catLower.includes('diamond') || catLower.includes('watch') || catLower.includes('gold')) {
    accentColor1 = '#38bdf8'; // Diamond blue
    accentColor2 = '#fbbf24'; // Gold
    glowColor = '#0284c7';
    bgTop = '#030712';
    bgMid = '#0f172a';
    bgBottom = '#1e1b4b';

    heroVisualSvg = `
      <!-- Luxury Jewelry & Faceted Gemstone Graphic -->
      <g transform="translate(540, 390)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="150" rx="270" ry="34" fill="#030712" opacity="0.9" />
        <ellipse cx="0" cy="145" rx="210" ry="20" fill="${accentColor1}" opacity="0.4" />
        
        <!-- Brilliant Diamond Cut -->
        <polygon points="0,-120 100,-35 65,70 -65,70 -100,-35" fill="#0f172a" stroke="${accentColor1}" stroke-width="4.5" />
        <polygon points="0,-120 45,-35 28,70 -28,70 -45,-35" fill="#1e293b" stroke="${accentColor2}" stroke-width="2.5" />
        <polygon points="0,-120 100,-35 45,-35" fill="rgba(56,189,248,0.35)" />
        <polygon points="0,-120 -100,-35 -45,-35" fill="rgba(56,189,248,0.35)" />
        <circle cx="0" cy="-35" r="14" fill="#ffffff" filter="url(#dropShadow)" />
        
        <text x="0" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">${safeBrand.toUpperCase()}</text>
        <text x="0" y="138" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${accentColor2}" text-anchor="middle" letter-spacing="2">FINE LUXURY COLLECTION</text>
      </g>
    `;
  } else if (catLower.includes('food') || catLower.includes('pizza') || catLower.includes('samosa') || catLower.includes('burger')) {
    accentColor1 = '#fbbf24'; // Amber
    accentColor2 = '#f97316'; // Orange
    glowColor = '#ea580c';
    bgTop = '#1c1917';
    bgMid = '#292524';
    bgBottom = '#18181b';

    heroVisualSvg = `
      <!-- Gourmet Food Styling -->
      <g transform="translate(540, 390)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="150" rx="270" ry="38" fill="#1c1917" opacity="0.85" />
        <ellipse cx="0" cy="145" rx="220" ry="24" fill="${accentColor2}" opacity="0.35" />
        <!-- Floating Gourmet Dish Graphic -->
        <circle cx="0" cy="-10" r="140" fill="#292524" stroke="${accentColor1}" stroke-width="5" />
        <circle cx="0" cy="-10" r="118" fill="#44403c" />
        <!-- Appetizing Accents -->
        <circle cx="-35" cy="-35" r="30" fill="${accentColor2}" opacity="0.9" />
        <circle cx="35" cy="-30" r="26" fill="${accentColor1}" opacity="0.9" />
        <circle cx="5" cy="25" r="32" fill="#ef4444" opacity="0.9" />
        <path d="M -60 -50 Q 0 -90 60 -50" stroke="#fef08a" stroke-width="7" fill="none" stroke-linecap="round" />
        <circle cx="-15" cy="-15" r="15" fill="#22c55e" opacity="0.9" />
        <circle cx="20" cy="5" r="13" fill="#eab308" opacity="0.9" />

        <text x="0" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">${safeBrand.toUpperCase()}</text>
        <text x="0" y="138" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${accentColor1}" text-anchor="middle" letter-spacing="2">GOURMET CHEF SELECTION</text>
      </g>
    `;
  } else if (catLower.includes('shoe') || catLower.includes('sneaker') || catLower.includes('fashion') || catLower.includes('wear')) {
    accentColor1 = '#f43f5e'; // Rose
    accentColor2 = '#ec4899'; // Pink
    glowColor = '#e11d48';
    bgTop = '#111827';
    bgMid = '#1e1b4b';
    bgBottom = '#0f172a';

    heroVisualSvg = `
      <!-- Dynamic Sneaker / Apparel Graphic -->
      <g transform="translate(540, 390)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="140" rx="280" ry="34" fill="#0f172a" opacity="0.85" />
        <ellipse cx="0" cy="135" rx="230" ry="20" fill="${accentColor1}" opacity="0.4" />
        <!-- Aerodynamic Silhouette -->
        <path d="M -160 60 Q -100 -40 20 -10 Q 140 10 180 60 Q 80 90 -60 80 Z" fill="#1e1b4b" stroke="${accentColor1}" stroke-width="5" />
        <path d="M -120 55 Q -50 -5 40 15 Q 120 30 150 58" stroke="${accentColor2}" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="60" cy="15" r="10" fill="#fff" />

        <text x="0" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">${safeBrand.toUpperCase()}</text>
        <text x="0" y="138" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${accentColor1}" text-anchor="middle" letter-spacing="2">PERFORMANCE ATHLETIC EDITION</text>
      </g>
    `;
  } else {
    // Default: Premium Technology / Smartphone / Smart Device Series
    accentColor1 = '#38bdf8'; // Sky cyan
    accentColor2 = '#a855f7'; // Purple
    glowColor = '#3b82f6';
    bgTop = '#070b19';
    bgMid = '#131b38';
    bgBottom = '#0f172a';

    heroVisualSvg = `
      <!-- High-Tech Smartphone & Smart Device Hero (Illuminated Luminous Display) -->
      <g transform="translate(540, 380)" filter="url(#dropShadow)">
        <!-- Ambient Stage Pedestal -->
        <ellipse cx="0" cy="160" rx="270" ry="34" fill="#090d16" opacity="0.9" />
        <ellipse cx="0" cy="155" rx="220" ry="20" fill="${accentColor1}" opacity="0.4" />
        
        <!-- Smartphone Body Frame (Centered in Aperture) -->
        <g transform="translate(-130, -210)">
          <!-- Outer Chassis -->
          <rect x="0" y="0" width="260" height="360" rx="36" fill="#1e293b" stroke="${accentColor1}" stroke-width="4.5" />
          
          <!-- Inner OLED Vibrant Gradient Screen -->
          <rect x="10" y="10" width="240" height="340" rx="28" fill="url(#screenGrad)" />
          
          <!-- Edge Reflections -->
          <path d="M 16 30 Q 130 15 244 30" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" fill="none" />
          
          <!-- Dynamic Center Hologram -->
          <circle cx="130" cy="140" r="50" fill="${accentColor2}" opacity="0.3" />
          <circle cx="130" cy="140" r="34" fill="${accentColor1}" opacity="0.55" />
          <path d="M 115 140 L 126 151 L 148 129" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          
          <!-- Screen Branding -->
          <text x="130" y="225" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">${safeBrand.toUpperCase()}</text>
          <text x="130" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="${accentColor1}" text-anchor="middle" letter-spacing="1">NEXT-GEN SMART DEVICE</text>
        </g>
      </g>
    `;
  }

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgTop}" />
      <stop offset="45%" stop-color="${bgMid}" />
      <stop offset="100%" stop-color="${bgBottom}" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <radialGradient id="stageSpotlight" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.45" />
      <stop offset="50%" stop-color="${accentColor1}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000000" flood-opacity="0.8" />
    </filter>
    <linearGradient id="gridLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor1}" stop-opacity="0" />
      <stop offset="50%" stop-color="${accentColor1}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${accentColor1}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Deep Atmospheric Illuminated Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  
  <!-- Vibrant Ambient Central Spotlight -->
  <circle cx="540" cy="390" r="480" fill="url(#stageSpotlight)" />

  <!-- Studio Floor Perspective Grid Lines -->
  <line x1="140" y1="580" x2="940" y2="580" stroke="url(#gridLine)" stroke-width="2" />
  <line x1="220" y1="630" x2="860" y2="630" stroke="url(#gridLine)" stroke-width="1.5" />
  <line x1="300" y1="680" x2="780" y2="680" stroke="url(#gridLine)" stroke-width="1" />

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

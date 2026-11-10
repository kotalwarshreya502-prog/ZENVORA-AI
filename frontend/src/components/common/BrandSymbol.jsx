import React from 'react';

/**
 * ZENVORA AI - Original Abstract Orbital / Forward-Motion Symbol
 * Features dynamic elliptical trajectory with an elevated forward chevron and orbital node.
 */
export const BrandSymbol = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ZENVORA AI Symbol"
    >
      <defs>
        <linearGradient id="zenvora-orbital-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7657F6" />
          <stop offset="100%" stopColor="#20C9B0" />
        </linearGradient>
        <linearGradient id="zenvora-chevron-grad" x1="16" y1="14" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7657F6" />
          <stop offset="60%" stopColor="#967bf8" />
          <stop offset="100%" stopColor="#20C9B0" />
        </linearGradient>
      </defs>

      {/* Modern Rounded Backdrop Container */}
      <rect width="48" height="48" rx="14" fill="#11152B" />

      {/* Outer Elliptical Orbital Ring (Forward Tilt: -30deg) */}
      <ellipse
        cx="24"
        cy="24"
        rx="17"
        ry="7.5"
        transform="rotate(-30 24 24)"
        stroke="url(#zenvora-orbital-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="72 24"
      />

      {/* Dynamic Forward-Motion Velocity Chevron */}
      <path
        d="M18.5 16L29 24L18.5 32"
        stroke="url(#zenvora-chevron-grad)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sustainable Growth Satellite Node */}
      <circle cx="36" cy="18" r="3" fill="#20C9B0" />
    </svg>
  );
};

export default BrandSymbol;


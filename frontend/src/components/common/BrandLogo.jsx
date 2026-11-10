import React from 'react';
import BrandSymbol from './BrandSymbol';

/**
 * ZENVORA AI - Brand Logo & Modern Wordmark
 */
export const BrandLogo = ({
  size = 36,
  showTagline = false,
  inverted = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <BrandSymbol size={size} />
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-extrabold text-xl leading-none">
          <span className={inverted ? 'text-white' : 'text-brand-navy'}>
            ZENVORA
          </span>
          <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-brand-teal">
            AI
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[11px] font-medium tracking-wide mt-1 ${
              inverted ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Smarter Marketing. Sustainable Growth.
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;


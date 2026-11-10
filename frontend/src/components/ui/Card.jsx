import React from 'react';

export const Card = ({ children, className = '', hover = true }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;


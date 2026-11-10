import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const variantStyles = {
    primary:
      'bg-brand-violet hover:bg-[#6545e8] text-white shadow-sm shadow-brand-violet/25 active:translate-y-px',
    secondary:
      'bg-brand-navy hover:bg-[#1a2040] text-white shadow-sm active:translate-y-px',
    teal:
      'bg-brand-teal hover:bg-[#1ab59e] text-brand-navy font-bold shadow-sm active:translate-y-px',
    outline:
      'bg-white hover:bg-slate-50 text-brand-navy border border-slate-300 shadow-sm active:translate-y-px',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-xl font-semibold',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;


import React from 'react';
import { clsx } from 'clsx';

export default function Badge({ children, variant }) {
  const variantClasses = {
    high: 'bg-[rgba(198,40,40,0.08)] text-[#c62828] border-[#c62828]',
    medium: 'bg-[rgba(230,126,34,0.08)] text-[#e67e22] border-[#e67e22]',
    low: 'bg-[rgba(44,95,138,0.08)] text-[#2c5f8a] border-[#2c5f8a]',
    safe: 'bg-[rgba(46,125,100,0.08)] text-[#2e7d64] border-[#2e7d64]',
    dos: 'bg-[rgba(198,40,40,0.08)] text-[#c62828] border-transparent',
    probe: 'bg-[rgba(230,126,34,0.08)] text-[#e67e22] border-transparent',
    r2l: 'bg-[rgba(44,95,138,0.08)] text-[#2c5f8a] border-transparent',
    u2r: 'bg-[rgba(41,128,185,0.08)] text-[#2980b9] border-transparent',
    normal: 'bg-[rgba(46,125,100,0.08)] text-[#2e7d64] border-transparent'
  };

  const normalizedVariant = (variant || '').toLowerCase();
  const classes = variantClasses[normalizedVariant] || 'bg-gray-100 text-gray-800 border-transparent';

  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold uppercase", classes)}>
      {children}
    </span>
  );
}

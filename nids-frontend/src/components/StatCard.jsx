import React from 'react';
import { clsx } from 'clsx';

export default function StatCard({ label, value, subText, icon: Icon, topColor }) {
  const topColorClasses = {
    primary: 'bg-[#2c5f8a]',
    danger: 'bg-[#c62828]',
    success: 'bg-[#2e7d64]',
    warning: 'bg-[#e67e22]'
  };

  return (
    <div className="bg-white border border-[#e0e4e8] rounded-md p-4 relative overflow-hidden flex flex-col">
      <div className={clsx("absolute top-0 left-0 right-0 h-[3px]", topColorClasses[topColor] || topColorClasses.primary)} />
      
      <div className="text-[11px] font-semibold text-[#888888] uppercase mb-2">
        {label}
      </div>
      
      <div className="font-display text-[28px] font-bold leading-none mb-1.5 text-[#1a1a2e]">
        {value}
      </div>
      
      <div className="text-[11px] text-[#888888] flex-1">
        {subText}
      </div>
      
      {Icon && (
        <div className="absolute bottom-3 right-4 opacity-10 text-[#1a1a2e]">
          <Icon size={32} />
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-[#e0e4e8] rounded-md">
      {Icon && (
        <div className="text-[#2c5f8a]/80 mb-3">
          <Icon size={36} strokeWidth={1.5} />
        </div>
      )}
      <h4 className="font-display text-sm font-semibold text-[#1a1a2e] mb-1">
        {title}
      </h4>
      <p className="text-[12px] text-[#888888] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-1">
          {action}
        </div>
      )}
    </div>
  );
}

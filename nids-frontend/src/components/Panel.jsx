import React from 'react';

export default function Panel({ title, actions, children, className = '' }) {
  return (
    <div className={`bg-white border border-[#e0e4e8] rounded-md shadow-sm flex flex-col ${className}`}>
      {title || actions ? (
        <div className="px-5 py-4 border-bottom border-[#e0e4e8] flex items-center justify-between min-h-[56px] border-b">
          {title && (
            <h3 className="font-display text-sm font-semibold tracking-wider text-[#1a1a2e] uppercase">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      ) : null}
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
}

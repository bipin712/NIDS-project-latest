import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={clsx(
      "fixed bottom-5 right-5 z-[100] max-w-sm w-full p-4 rounded-md shadow-lg border text-[13px] flex items-start gap-3 animate-slide-in",
      type === 'success' 
        ? "bg-[rgba(46,125,100,0.08)] border-[#2e7d64] text-[#2e7d64]"
        : "bg-[rgba(198,40,40,0.08)] border-[#c62828] text-[#c62828]"
    )}>
      {type === 'success' ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      )}
      
      <div className="flex-1 font-medium">{message}</div>

      <button 
        type="button" 
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 transition-opacity p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#1a1a2e]/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content Card */}
      <div className={`relative bg-white rounded-md shadow-lg border border-[#e0e4e8] w-full ${maxWidth} max-h-[85vh] flex flex-col z-10 animate-fade-in`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e0e4e8] flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold tracking-wider text-[#1a1a2e] uppercase">
            {title}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-[#888888] hover:text-[#c62828] transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 text-[13px] leading-relaxed text-[#333333]">
          {children}
        </div>
      </div>
    </div>
  );
}

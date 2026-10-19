import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const variant = toast.variant || 'success';

  const borderClass =
    variant === 'error'
      ? 'border-red-400/50'
      : variant === 'info'
      ? 'border-[#3FCFE6]/50'
      : 'border-[#3FD9B4]/50';

  const iconBoxClass =
    variant === 'error'
      ? 'bg-red-500/15 border-red-400/40 text-red-400'
      : variant === 'info'
      ? 'bg-[#2E54F5]/25 border-[#3FCFE6]/40 text-[#3FCFE6]'
      : 'bg-[#3FD9B4]/15 border-[#3FD9B4]/40 text-[#3FD9B4]';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: 'rgba(9, 16, 30, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      className={`fixed bottom-5 right-5 z-[60] max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto rounded-2xl border ${borderClass} shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-4 text-[#E8EEF7] flex items-start gap-3.5 transition-all duration-200`}
    >
      <span
        className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconBoxClass}`}
      >
        {variant === 'error' ? (
          <AlertCircle className="w-4 h-4" />
        ) : variant === 'info' ? (
          <Info className="w-4 h-4" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
      </span>

      <div className="flex-1 min-w-0 pr-1">
        <div className="font-display font-bold text-sm text-white leading-snug">
          {toast.title}
        </div>
        {toast.description && (
          <p className="text-xs text-[#A9B6CA] mt-1 leading-relaxed break-words">
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="p-1 rounded-lg text-[#A9B6CA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

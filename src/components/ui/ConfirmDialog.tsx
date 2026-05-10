import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '🗑️',
      accent: 'border-rose-700/60',
      confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white',
      iconBg: 'bg-rose-950/60 border border-rose-800/50',
      glow: 'shadow-rose-950/40',
    },
    warning: {
      icon: '⚠️',
      accent: 'border-amber-700/60',
      confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white',
      iconBg: 'bg-amber-950/60 border border-amber-800/50',
      glow: 'shadow-amber-950/40',
    },
    info: {
      icon: 'ℹ️',
      accent: 'border-cyan-700/60',
      confirmBtn: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      iconBg: 'bg-cyan-950/60 border border-cyan-800/50',
      glow: 'shadow-cyan-950/40',
    },
    success: {
      icon: '✅',
      accent: 'border-emerald-700/60',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      iconBg: 'bg-emerald-950/60 border border-emerald-800/50',
      glow: 'shadow-emerald-950/40',
    },
  };

  const s = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Dialog */}
      <div
        className={`
          relative z-10 w-80 rounded-xl border ${s.accent}
          bg-slate-950 shadow-2xl ${s.glow}
          animate-in zoom-in-95 fade-in duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className={`h-px w-full rounded-t-xl bg-gradient-to-r from-transparent via-rose-500/40 to-transparent`} />

        {/* Content */}
        <div className="p-5">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center text-xl mb-4`}>
            {s.icon}
          </div>

          <h3 className="text-sm font-bold text-white mb-1 leading-snug">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800/80 mx-0" />

        {/* Actions */}
        <div className="flex gap-2 p-3">
          <button
            onClick={onCancel}
            className="
              flex-1 py-2 px-3 rounded-lg text-xs font-semibold
              bg-slate-800/60 hover:bg-slate-700/80
              text-slate-300 hover:text-white
              border border-slate-700/50 hover:border-slate-600
              transition-all duration-150
            "
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`
              flex-1 py-2 px-3 rounded-lg text-xs font-semibold
              ${s.confirmBtn}
              transition-all duration-150 active:scale-95
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
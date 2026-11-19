import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, icon: Icon, children, footer, maxWidth = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <div className={`w-full ${maxWidth} overflow-hidden rounded-2xl bg-white shadow-modal`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex size-9 items-center justify-center rounded-xl bg-surface-low text-brand-dark">
                <Icon className="size-5" />
              </span>
            )}
            <div>
              <h3 className="text-base font-bold text-ink">{title}</h3>
              {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-low hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-surface px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

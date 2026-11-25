import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, icon: Icon, children, footer, maxWidth = 'max-w-lg', layarPublik = false }) {
  const dialog = useRef(null);
  const heading = useId();
  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <dialog ref={dialog} aria-labelledby={heading} className={layarPublik ? 'portal-dialog portal-dialog-publik' : `portal-dialog ${maxWidth}`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="size-5 shrink-0 text-brand" aria-hidden="true" />}
          <div>
            <h2 id={heading} className="text-lg font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-ink-soft">{subtitle}</p>}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Tutup dialog" className="grid size-11 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-surface-low">
          <X size={18} />
        </button>
      </div>
      <div className="p-5">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface px-5 py-4">{footer}</div>}
    </dialog>
  );
}

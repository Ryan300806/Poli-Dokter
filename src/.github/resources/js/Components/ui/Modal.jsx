// Components/ui/Modal.jsx
// Pop-up standar (UI-005, 013, 018, 019 dan pop-up lain). Tutup lewat Esc, klik latar, atau tombol X.
// footer: isi tombol di bawah (mis. <Button>). Jika tidak diisi, footer tidak tampil.
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

const LEBAR = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' };

export default function Modal({ open, onClose, title, description, size = 'md', footer, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const tekan = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', tekan);
    return () => document.removeEventListener('keydown', tekan);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={cn('relative w-full rounded-2xl bg-white shadow-xl', LEBAR[size])}>
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            {description && <p className="mt-1 text-[13px] text-ink-soft">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-low">
            <X className="size-4" />
          </button>
        </div>
        {children && <div className="px-6 py-4 text-[13px] text-ink-soft">{children}</div>}
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
        {!children && !footer && <div className="pb-4" />}
      </div>
    </div>
  );
}

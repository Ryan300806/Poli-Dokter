import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

let listener = null;

export const toast = {
  success: (title, message = '') => listener?.({ type: 'success', title, message }),
  error: (title, message = '') => listener?.({ type: 'error', title, message }),
};

export function ToastContainer({ flashSuccess, flashInfo }) {
  const [item, setItem] = useState(null);

  useEffect(() => {
    listener = (next) => setItem(next);
    return () => { listener = null; };
  }, []);

  useEffect(() => {
    if (flashSuccess) setItem({ type: 'success', title: flashSuccess, message: '' });
    else if (flashInfo) setItem({ type: 'info', title: flashInfo, message: '' });
  }, [flashSuccess, flashInfo]);

  useEffect(() => {
    if (!item) return undefined;
    const t = setTimeout(() => setItem(null), 4500);
    return () => clearTimeout(t);
  }, [item]);

  if (!item) return null;

  const isError = item.type === 'error';

  return (
    <div role={isError ? 'alert' : 'status'} className="fixed right-4 bottom-4 left-4 sm:left-auto z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-modal">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isError ? 'bg-danger-light text-danger' : 'bg-brand-light-active text-brand'}`}>
        {isError ? <AlertCircle className="size-5" /> : item.type === 'info' ? <Info className="size-5" /> : <CheckCircle2 className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-ink">{item.title}</p>
        {item.message && <p className="mt-0.5 text-[11px] text-ink-soft">{item.message}</p>}
      </div>
      <button type="button" aria-label="Tutup pemberitahuan" onClick={() => setItem(null)} className="text-ink-muted hover:text-ink">
        <X className="size-4" />
      </button>
    </div>
  );
}

// Components/ui/Callout.jsx
// Kotak informasi/peringatan. tone: info | success | warning | danger
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

const NADA = {
  info: { kotak: 'bg-surface-low', ikon: Info, warna: 'bg-brand/10 text-brand' },
  success: { kotak: 'bg-brand-light', ikon: CheckCircle2, warna: 'bg-brand/15 text-brand' },
  warning: { kotak: 'bg-warning-light', ikon: AlertTriangle, warna: 'bg-warning/15 text-warning' },
  danger: { kotak: 'bg-danger-light', ikon: XCircle, warna: 'bg-danger/10 text-danger' },
};

export default function Callout({ tone = 'info', className, children, aside }) {
  const n = NADA[tone];
  const Ikon = n.ikon;
  return (
    <div className={cn('flex items-center gap-4 rounded-xl px-4 py-4', n.kotak, className)}>
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', n.warna)}><Ikon className="size-4" /></span>
      <div className="flex-1 text-xs leading-[18px] text-ink-soft">{children}</div>
      {aside && <div className="text-[10px] font-medium text-ink-muted">{aside}</div>}
    </div>
  );
}

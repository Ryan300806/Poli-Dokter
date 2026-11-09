// Components/ui/Badge.jsx
// Lencana status (pil kecil). tone: neutral | solid | success | muted | danger | warning | info
// dot: titik di kiri. check: ikon centang di kiri. Untuk status antrean pakai lib/status.js.
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

const NADA = {
  neutral: 'bg-surface-mid text-ink',
  solid: 'bg-brand text-white',
  success: 'bg-brand/20 text-brand',
  muted: 'bg-surface-high text-ink-soft',
  danger: 'bg-danger-light text-danger',
  warning: 'bg-warning-light text-warning',
  info: 'bg-info-light text-info',
};

const TITIK = {
  neutral: 'bg-ink-muted', solid: 'bg-surface', success: 'bg-brand', muted: 'bg-ink-muted',
  danger: 'bg-danger', warning: 'bg-warning', info: 'bg-info',
};

export default function Badge({ tone = 'neutral', dot = false, check = false, icon: Ikon, className, children }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold leading-[14px]',
      NADA[tone], className,
    )}>
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', TITIK[tone])} />}
      {check && <Check className="size-3 shrink-0" strokeWidth={3} />}
      {Ikon && <Ikon className="size-3 shrink-0" />}
      {children}
    </span>
  );
}

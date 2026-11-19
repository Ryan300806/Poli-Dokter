import { cn } from '../../lib/cn';

const TONES = {
  success: 'bg-brand-light-active text-brand-dark',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  neutral: 'bg-surface-mid text-ink-soft',
  brand: 'bg-brand text-white',
};

export default function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none',
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

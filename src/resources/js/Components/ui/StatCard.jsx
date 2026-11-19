import { cn } from '../../lib/cn';

export default function StatCard({ label, value, unit, detail, icon: Icon, tone = 'default' }) {
  const isBrand = tone === 'brand';
  const isDanger = tone === 'danger';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-card',
        isBrand && 'border-l-4 border-brand',
        isDanger && 'border-l-4 border-danger'
      )}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-ink">{value}</span>
          {unit && <span className="text-xs font-medium text-ink-soft">{unit}</span>}
        </div>
        {detail && (
          <p className={cn('mt-1.5 text-[11px] font-medium', isBrand ? 'text-brand' : isDanger ? 'text-danger' : 'text-ink-muted')}>
            {detail}
          </p>
        )}
      </div>
      {Icon && (
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            isBrand ? 'bg-brand-light-active text-brand' : isDanger ? 'bg-danger-light text-danger' : 'bg-surface-low text-ink-soft'
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
    </div>
  );
}

// Components/ui/StatCard.jsx
// Kartu ringkasan angka (mis. Total Antrean). tone="brand" untuk kartu yang disorot (garis hijau di kiri).
import { cn } from '../../lib/cn';

export default function StatCard({ label, value, unit, icon: Ikon, tone = 'default' }) {
  const brand = tone === 'brand';
  return (
    <div className={cn(
      'flex flex-1 items-center justify-between rounded-xl bg-white p-4 shadow-card',
      brand && 'border-l-4 border-brand',
    )}>
      <div>
        <p className={cn('text-[10px] font-semibold uppercase tracking-[0.4px]', brand ? 'text-brand' : 'text-ink-muted')}>
          {label}
        </p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className={cn('text-[28px] font-bold leading-[34px]', brand ? 'text-brand' : 'text-ink')}>{value}</span>
          {unit && <span className={cn('text-xs', brand ? 'text-brand' : 'text-ink-soft')}>{unit}</span>}
        </p>
      </div>
      {Ikon && (
        <span className={cn(
          'flex size-12 items-center justify-center rounded-xl',
          brand ? 'bg-brand/10 text-brand' : 'bg-surface-mid text-ink-soft',
        )}>
          <Ikon className="size-6" />
        </span>
      )}
    </div>
  );
}

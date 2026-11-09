// Components/ui/PageHeader.jsx
// Judul halaman + baris info + area aksi di kanan. Dipakai di bagian atas SETIAP halaman.
import { cn } from '../../lib/cn';

export default function PageHeader({ icon: Ikon, title, children, actions, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {Ikon && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Ikon className="size-4" />
            </span>
          )}
          <h1 className="text-[31px] font-bold leading-10 tracking-[-0.775px] text-ink">{title}</h1>
        </div>
        {children && <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-soft">{children}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

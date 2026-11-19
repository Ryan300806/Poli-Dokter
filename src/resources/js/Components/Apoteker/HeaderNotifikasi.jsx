import { UserRound } from 'lucide-react';
import Logo from '../layout/Logo';

export default function HeaderNotifikasi({ user }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-[72px] items-center justify-between border-b border-line bg-white px-[22px]">
      <div className="flex items-center gap-4">
        <Logo className="size-[30px]" />
        <div className="leading-none">
          <p className="text-sm font-bold tracking-[-0.2px] text-ink">Outpatient Care</p>
          <p className="mt-1 text-[11px] font-medium tracking-[0.2px] text-ink-soft">
            Rumah Sakit Citra Medika
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-5">
        <span className="h-[30px] w-px bg-line" aria-hidden="true" />
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="max-w-[220px] truncate text-sm font-bold text-ink">{user.nama}</p>
          <p className="mt-0.5 truncate text-[11px] font-medium text-ink-muted">{user.peran}</p>
        </div>
      </div>
    </header>
  );
}

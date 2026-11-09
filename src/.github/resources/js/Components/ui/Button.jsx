// Components/ui/Button.jsx
// Tombol standar. Pakai varian ini, jangan membuat tombol dengan <button className="..."> sendiri.
// variant: primary (hijau) | secondary (abu terang) | outline | danger | ghost
// size: sm | md | lg
// Jika diberi href, tombol dirender sebagai tautan Inertia (pindah halaman tanpa reload).
import { Link } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const VARIAN = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active shadow-card',
  secondary: 'bg-surface-low text-ink hover:bg-surface-mid active:bg-surface-high',
  outline: 'bg-white text-ink border border-line hover:bg-surface-low',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-low',
};

const UKURAN = {
  sm: 'px-3 py-1.5 text-[13px] gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-[13px] gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
};

export default function Button({
  variant = 'primary', size = 'md', icon: Ikon, loading = false, href, className, children, disabled, ...sisa
}) {
  const kelas = cn(
    'inline-flex items-center justify-center font-semibold transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIAN[variant], UKURAN[size], className,
  );
  const isi = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" /> : Ikon && <Ikon className="size-4" />}
      {children}
    </>
  );
  if (href && !disabled) return <Link href={href} className={kelas} {...sisa}>{isi}</Link>;
  return <button type="button" className={kelas} disabled={disabled || loading} {...sisa}>{isi}</button>;
}

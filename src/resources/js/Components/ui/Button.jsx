import { Link } from '@inertiajs/react';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-hover shadow-sm',
  secondary: 'bg-surface-low text-ink hover:bg-surface-mid border border-line',
  outline: 'bg-white text-ink border border-line hover:bg-surface-low',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-low',
  danger: 'bg-danger text-white hover:bg-danger-strong',
  softDanger: 'bg-danger-light text-danger hover:bg-red-100',
  softBrand: 'bg-brand-light-active text-brand-dark hover:bg-brand-light',
};

export default function Button({
  children,
  variant = 'primary',
  icon: Icon,
  href,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    VARIANTS[variant] || VARIANTS.primary,
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {Icon && <Icon className="size-4 shrink-0" />}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {Icon && <Icon className="size-4 shrink-0" />}
      {children}
    </button>
  );
}

// Components/ui/Input.jsx
// Input, Select, Textarea dengan label, petunjuk, dan pesan galat yang seragam.
// Contoh: <Input label="NIK" name="nik" error={errors.nik} icon={Search} />
import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

const DASAR = 'w-full rounded-lg bg-surface-low text-[13px] text-ink placeholder:text-ink-muted '
  + 'border border-transparent focus:border-brand focus:bg-white focus:outline-none '
  + 'focus:ring-2 focus:ring-brand/20 disabled:opacity-60';

function Bungkus({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-xs font-semibold text-ink-soft">{label}</label>}
      {children}
      {error
        ? <p className="text-xs text-danger" role="alert">{error}</p>
        : hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, icon: Ikon, className, ...sisa }, ref) {
  const id = useId();
  return (
    <Bungkus id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        {Ikon && <Ikon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />}
        <input
          ref={ref} id={id} aria-invalid={!!error}
          className={cn(DASAR, 'h-10 px-3', Ikon && 'pl-10', error && 'border-danger', className)}
          {...sisa}
        />
      </div>
    </Bungkus>
  );
});

export const Select = forwardRef(function Select({ label, hint, error, opsi = [], className, ...sisa }, ref) {
  const id = useId();
  return (
    <Bungkus id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          ref={ref} id={id} aria-invalid={!!error}
          className={cn(DASAR, 'h-10 appearance-none px-3 pr-9 font-medium', error && 'border-danger', className)}
          {...sisa}
        >
          {opsi.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
      </div>
    </Bungkus>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, className, ...sisa }, ref) {
  const id = useId();
  return (
    <Bungkus id={id} label={label} hint={hint} error={error}>
      <textarea
        ref={ref} id={id} aria-invalid={!!error}
        className={cn(DASAR, 'min-h-24 px-3 py-2', error && 'border-danger', className)}
        {...sisa}
      />
    </Bungkus>
  );
});

export default Input;

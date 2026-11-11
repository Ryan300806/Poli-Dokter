// Components/ui/Table.jsx
// Primitif tabel dengan gaya Figma. Susun sendiri: Table > Thead > Tr > Th, Tbody > Tr > Td.
// <Tr aktif> memberi sorotan hijau tipis (baris yang sedang diperiksa).
import { cn } from '../../lib/cn';

export function Table({ className, children }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-left', className)}>{children}</table>
    </div>
  );
}
export const Thead = ({ children }) => <thead className="bg-surface-low">{children}</thead>;
export const Tbody = ({ children }) => <tbody>{children}</tbody>;

export function Th({ className, children }) {
  return (
    <th className={cn('px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.5px] text-ink-soft', className)}>
      {children}
    </th>
  );
}
export function Tr({ aktif = false, className, children }) {
  return <tr className={cn('border-b border-line/60 last:border-b-0', aktif && 'bg-brand/5', className)}>{children}</tr>;
}
export function Td({ className, children, ...sisa }) {
  return <td className={cn('px-3 py-4 align-middle', className)} {...sisa}>{children}</td>;
}

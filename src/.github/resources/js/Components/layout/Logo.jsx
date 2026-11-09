// Components/layout/Logo.jsx: logo hijau "Outpatient Care" (dibuat dengan SVG agar tidak bergantung pada berkas gambar).
export default function Logo({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Logo Outpatient Care">
      <rect width="32" height="32" rx="6" fill="var(--color-brand)" />
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M16 7v18M8.2 11.5l15.6 9M23.8 11.5l-15.6 9" />
      </g>
    </svg>
  );
}

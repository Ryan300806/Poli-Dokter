import logo from '../../../images/logo-rawat-jalan.png';

export default function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img src={logo} width="32" height="32" alt="" className="size-8 shrink-0" />
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-ink">Outpatient Care</p>
        <p className="mt-0.5 text-[11px] text-ink-soft">Rumah Sakit Citra Medika</p>
      </div>
    </div>
  );
}

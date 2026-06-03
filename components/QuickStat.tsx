// A single stat cell used inside the analytics telemetry grid on the dashboard.

interface QuickStatProps {
  label: string;
  value: string;
}

export default function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="relative overflow-hidden p-6 text-center hover:bg-neutral-100/40 dark:hover:bg-neutral-900/10 transition-colors">
      {/* Inner grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
      <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight tabular-nums relative z-10">
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-650 dark:text-violet-400 mt-2 relative z-10 leading-none">
        {label}
      </p>
    </div>
  );
}

// A numbered instruction row used in the "How This Works" section on the interview page.

interface TipRowProps {
  num: string;
  text: string;
}

export default function TipRow({ num, text }: TipRowProps) {
  return (
    <div className="flex gap-3.5 items-start">
      <span className="shrink-0 w-5 h-5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-violet-650 dark:text-violet-400 text-[10px] font-black flex items-center justify-center mt-0.5">
        {num}
      </span>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
        {text}
      </p>
    </div>
  );
}

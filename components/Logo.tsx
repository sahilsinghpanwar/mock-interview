// Reusable branded logo used in the dashboard header and other nav surfaces.

export default function Logo() {
  return (
    <div className="flex items-center gap-3.5 group cursor-pointer">
      {/* Audio waveform icon */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-inner transition-all duration-300">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-neutral-900 dark:text-white relative z-10"
        >
          <path d="M7 16V16.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40" />
          <path d="M11 12V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-75" />
          <path d="M15 8V24" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 12V20" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M23 10V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" />
          <path d="M27 16V16.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40" />
          <defs>
            <linearGradient id="logo-grad" x1="15" y1="8" x2="19" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">
        Mock<span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">.ai</span>
      </span>
    </div>
  );
}

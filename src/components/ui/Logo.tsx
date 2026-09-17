export function Logo({
  className = "",
  showText = true,
  textClassName = "",
}: {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M20 4.5a15.5 15.5 0 1 0 11 26.5"
          stroke="#166849"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30.2 31.6l4.3-0.9-0.6 4.3"
          stroke="#166849"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect
          x="10.5"
          y="13.5"
          width="19"
          height="13"
          rx="3.5"
          stroke="#166849"
          strokeWidth="2.1"
          fill="none"
        />
        <line
          x1="10.5"
          y1="19.2"
          x2="29.5"
          y2="19.2"
          stroke="#166849"
          strokeWidth="2.1"
        />
        <circle cx="15" cy="26.6" r="1.7" fill="#166849" />
        <circle cx="25" cy="26.6" r="1.7" fill="#166849" />
      </svg>
      {showText && (
        <span
          className={`font-extrabold text-lg tracking-tight text-[var(--color-brand-primary)] ${textClassName}`}
        >
          COLLAKTIV
        </span>
      )}
    </div>
  );
}

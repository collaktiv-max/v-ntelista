// lucide-react har inte längre varumärkesikoner (Instagram/TikTok), så de
// ritas som enkla inline-SVG:er i samma linjestil som appens övriga ikoner.

export function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15 3.5c.5 2.1 2 3.6 4.2 3.9v3c-1.5.1-2.9-.3-4.2-1.1v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.06v3.1a2.6 2.6 0 1 0 1.8 2.47V3.5H15z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cartivaLogoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D93FF" />
          <stop offset="1" stopColor="#12266E" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#cartivaLogoGrad)" />
      <text
        x="19.5"
        y="22"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Sora, sans-serif"
        fontWeight="800"
        fontSize="21"
        fill="white"
      >
        C
      </text>
      <circle cx="32.5" cy="7.5" r="4.5" fill="#FF7A45" />
    </svg>
  );
}

export function RouteMapBackground({ className }: { className?: string } = {}) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden${
        className ? ` ${className}` : ''
      }`}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="rm-blur-lg" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
          <filter
            id="rm-blur-sm"
            x="-150%"
            y="-150%"
            width="400%"
            height="400%"
          >
            <feGaussianBlur stdDeviation="10" />
          </filter>

          <pattern
            id="rm-dots"
            x="0"
            y="0"
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="17" cy="17" r="1.1" fill="currentColor" />
          </pattern>
          <radialGradient id="rm-edge-fade" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="55%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
          <mask id="rm-edge-mask">
            <rect width="1440" height="900" fill="url(#rm-edge-fade)" />
          </mask>

          <path
            id="rm-pin"
            d="M0 0C-6 0 -10.8 4.8 -10.8 10.8C-10.8 19.2 0 31 0 31C0 31 10.8 19.2 10.8 10.8C10.8 4.8 6 0 0 0Z"
          />
        </defs>

        <g className="text-muted-foreground">
          <rect
            width="1440"
            height="900"
            fill="url(#rm-dots)"
            mask="url(#rm-edge-mask)"
            opacity="0.55"
          />
        </g>

        <g className="text-primary" filter="url(#rm-blur-lg)">
          <circle
            cx="1180"
            cy="140"
            r="260"
            fill="currentColor"
            opacity="0.05"
          />
        </g>
        <g className="text-muted-foreground" filter="url(#rm-blur-lg)">
          <circle
            cx="1370"
            cy="420"
            r="150"
            fill="currentColor"
            opacity="0.06"
          />
        </g>
        <g className="text-primary" filter="url(#rm-blur-lg)">
          <circle
            cx="160"
            cy="760"
            r="230"
            fill="currentColor"
            opacity="0.05"
          />
        </g>

        <g className="text-primary" fill="none" stroke="currentColor">
          <path
            d="M1440 40 C1300 85 1195 205 1080 340"
            strokeWidth="1.2"
            strokeDasharray="1 7"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>
        <g className="text-primary" fill="currentColor">
          <circle cx="1300" cy="135" r="3" opacity="0.35" />
          <circle cx="1165" cy="255" r="2.4" opacity="0.28" />
        </g>
        <g className="text-primary" opacity="0.4">
          <circle
            cx="1080"
            cy="340"
            r="16"
            filter="url(#rm-blur-sm)"
            fill="currentColor"
            opacity="0.3"
          />
          <use
            href="#rm-pin"
            transform="translate(1080,340) scale(1.05)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <circle cx="1080" cy="349.5" r="1.8" fill="currentColor" />
        </g>

        <g className="text-primary" fill="none" stroke="currentColor">
          <path
            d="M0 860 C140 815 245 695 360 560"
            strokeWidth="1.2"
            strokeDasharray="1 7"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>
        <g className="text-primary" fill="currentColor">
          <circle cx="140" cy="765" r="3" opacity="0.35" />
          <circle cx="275" cy="645" r="2.4" opacity="0.28" />
        </g>
        <g className="text-primary" opacity="0.4">
          <circle
            cx="360"
            cy="560"
            r="16"
            filter="url(#rm-blur-sm)"
            fill="currentColor"
            opacity="0.3"
          />
          <use
            href="#rm-pin"
            transform="translate(360,560) scale(1.05)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <circle cx="360" cy="569.5" r="1.8" fill="currentColor" />
        </g>

        <g className="text-muted-foreground" filter="url(#rm-blur-lg)">
          <circle cx="90" cy="60" r="140" fill="currentColor" opacity="0.045" />
        </g>
        <g className="text-primary" fill="currentColor">
          <circle cx="70" cy="90" r="2.2" opacity="0.25" />
          <circle cx="132" cy="48" r="1.8" opacity="0.2" />
          <circle cx="40" cy="140" r="1.6" opacity="0.18" />
        </g>

        <g className="text-muted-foreground" filter="url(#rm-blur-lg)">
          <circle
            cx="1350"
            cy="840"
            r="140"
            fill="currentColor"
            opacity="0.045"
          />
        </g>
        <g className="text-primary" fill="currentColor">
          <circle cx="1370" cy="810" r="2.2" opacity="0.25" />
          <circle cx="1308" cy="852" r="1.8" opacity="0.2" />
          <circle cx="1400" cy="762" r="1.6" opacity="0.18" />
        </g>
      </svg>
    </div>
  );
}

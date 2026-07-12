export function JourneyIllustration({
  className,
  mirrored = false,
}: { className?: string; mirrored?: boolean } = {}) {
  return (
    <svg
      className={`h-full w-full${className ? ` ${className}` : ''}`}
      viewBox="0 0 440 440"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform={mirrored ? 'translate(440, 0) scale(-1, 1)' : undefined}>
        <defs>
          <path
            id="ji-pin"
            d="M0 0C-5.2 0 -9.4 4.2 -9.4 9.4C-9.4 16.7 0 27 0 27C0 27 9.4 16.7 9.4 9.4C9.4 4.2 5.2 0 0 0Z"
          />
        </defs>

        <circle
          cx="220"
          cy="220"
          r="170"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.15"
        />
        <circle
          cx="220"
          cy="220"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.12"
        />

        <path
          id="ji-route"
          d="M70 320 Q130 300 165 255 Q200 210 175 165 Q155 130 190 95 Q220 65 270 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="1 8"
          strokeLinecap="round"
          opacity="0.55"
        />

        <g opacity="0.85">
          <use
            href="#ji-pin"
            transform="translate(70,320) scale(1.3)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <circle cx="70" cy="328.5" r="1.6" fill="currentColor" />
        </g>

        <g opacity="0.95">
          <use
            href="#ji-pin"
            transform="translate(270,60) scale(1.5)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="270" cy="69.5" r="1.8" fill="currentColor" />
          <circle
            cx="270"
            cy="60"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <animate
              attributeName="r"
              values="9;22;9"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0;0.5"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        <circle r="4.5" fill="currentColor">
          <animateMotion dur="5.5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#ji-route" />
          </animateMotion>
        </circle>
      </g>
    </svg>
  );
}

// Fullmake logo wordmark — used on landing page and app header
// "full" = bold 700, "make" = light 300, gradient slash separator

export default function Logo({
  width = 240,
  animate = true,
}: {
  width?: number;
  animate?: boolean;
}) {
  const height = (width / 440) * 56;

  return (
    <svg
      viewBox="0 0 440 56"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Fullmake logo"
    >
      <defs>
        <linearGradient id="slash-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D97706" stopOpacity="1" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="42"
        fontFamily="'DM Sans', system-ui, sans-serif"
        fontSize="44"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-2"
      >
        full
      </text>
      <line
        className={animate ? "logo-slash" : ""}
        x1="140"
        y1="2"
        x2="128"
        y2="52"
        stroke="url(#slash-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={!animate ? { strokeDashoffset: 0 } : undefined}
      />
      <text
        x="148"
        y="42"
        fontFamily="'DM Sans', system-ui, sans-serif"
        fontSize="44"
        fontWeight="300"
        fill="currentColor"
        letterSpacing="-2"
      >
        make
      </text>
    </svg>
  );
}

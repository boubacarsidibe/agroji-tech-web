export default function WeaveDivider({
  color = "#b8552b",
  background = "transparent",
  className = "",
}: {
  color?: string;
  background?: string;
  className?: string;
}) {
  const id = `weave-${color.replace("#", "")}`;

  return (
    <svg
      viewBox="0 0 48 12"
      preserveAspectRatio="none"
      className={`h-3 w-full ${className}`}
      aria-hidden="true"
    >
      <rect width="48" height="12" fill={background} />
      <defs>
        <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 12 L6 0 L12 12 Z" fill={color} />
        </pattern>
      </defs>
      <rect width="48" height="12" fill={`url(#${id})`} />
    </svg>
  );
}

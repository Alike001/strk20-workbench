import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const common = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.7,
  viewBox: "0 0 24 24",
};

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export function FlaskIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M9 3h6M10 3v5l-5 9.2A2.5 2.5 0 0 0 7.2 21h9.6a2.5 2.5 0 0 0 2.2-3.8L14 8V3" />
      <path d="M7.4 16h9.2" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <rect height="9" rx="2" width="12" x="6" y="11" />
      <path d="M9 11V8a3 3 0 0 1 6 0v3M12 15v2" />
    </svg>
  );
}

export function TerminalIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <rect height="18" rx="3" width="20" x="2" y="3" />
      <path d="m7 8 3 3-3 3M13 15h4" />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2.1V7.5Z" />
      <path d="M4.5 8H18M15 12h5v4h-5a2 2 0 1 1 0-4Z" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3 20 7v5c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V7l8-4Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

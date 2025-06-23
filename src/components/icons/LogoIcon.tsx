import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <g fill="currentColor">
        <path
          d="M14.5 5a1.5 1.5 0 0 1 3 0v9.5h9.5a1.5 1.5 0 0 1 0 3h-9.5v9.5a1.5 1.5 0 0 1-3 0v-9.5H5a1.5 1.5 0 0 1 0-3h9.5V5z"
          transform="rotate(45 16 16)"
        />
        <path d="M14.5 5a1.5 1.5 0 0 1 3 0v9.5h9.5a1.5 1.5 0 0 1 0 3h-9.5v9.5a1.5 1.5 0 0 1-3 0v-9.5H5a1.5 1.5 0 0 1 0-3h9.5V5z" />
      </g>
      <path d="M18 0H32V14H28V4H18V0Z" fill="url(#logoGradient)" />
    </svg>
  );
}

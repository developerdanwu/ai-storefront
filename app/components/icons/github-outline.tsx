import type { SVGProps } from "react";

const OCTOCAT_PATH =
  "M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.288-.6-1.175-1.025-1.413-.35-.187-.85-.65-.013-.662.788-.013 1.35.725 1.538 1.025.9 1.512 2.338 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.113-4.55-4.938 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.275.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10Z";

const GithubOutline = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <defs>
      {/* Metallic gradient - purple to cyan with shimmer */}
      <linearGradient
        id="metallic-gradient"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#7463BE" />
        <stop offset="10%" stopColor="#a8a0d0" />
        <stop offset="20%" stopColor="#7463BE" />
        <stop offset="35%" stopColor="#5b8dd9" />
        <stop offset="50%" stopColor="#4a9ee8" />
        <stop offset="62%" stopColor="#60c8f0" />
        <stop offset="72%" stopColor="#38bdf8" />
        <stop offset="80%" stopColor="#5580c8" />
        <stop offset="88%" stopColor="#5a4a9e" />
        <stop offset="100%" stopColor="#4a3d8a" />
      </linearGradient>
      {/* Soft outer glow filter */}
      <filter id="outer-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
        />
      </filter>
      {/* Shadow for depth */}
      <filter id="metal-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow
          dx="0"
          dy="0.3"
          stdDeviation="0.15"
          floodColor="#000000"
          floodOpacity="0.5"
        />
      </filter>
    </defs>
    {/* Layer 1: Outer glow */}
    <path
      d={OCTOCAT_PATH}
      stroke="#7463BE"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#outer-glow)"
      opacity="0.25"
    />
    {/* Layer 2: Main metallic stroke */}
    <path
      d={OCTOCAT_PATH}
      stroke="url(#metallic-gradient)"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#metal-shadow)"
    />
  </svg>
);

export default GithubOutline;

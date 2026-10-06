import React from "react";

interface MotifProps {
  className?: string;
  size?: number;
}

/**
 * Geometric Diamond Motif inspired by Masamer's identity
 */
export function MasamerDiamondMotif({ className = "w-6 h-6 text-secondary-600", size = 24 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L21 12L12 22L3 12L12 2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L17.5 12L12 18L6.5 12L12 6Z"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="1.5 1.5"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Elegant fine curved flourish line
 */
export function MasamerFlourish({ className = "text-secondary-400/40" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 10C40 10 50 2 80 2C110 2 120 10 160 10"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="80" cy="2" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Corner luxury geometric ornament
 */
export function GeometricCorner({ className = "text-secondary-500/20" }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 0H40V2H2V40H0V0Z" fill="currentColor" />
      <circle cx="6" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}

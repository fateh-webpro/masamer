import type { SVGProps } from "react";

export type SocialPlatform = "facebook" | "twitter" | "instagram" | "snapchat";

interface SocialIconProps extends SVGProps<SVGSVGElement> {
  platform: SocialPlatform;
}

export function SocialIcon({ platform, ...props }: SocialIconProps) {
  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M13.5 22v-8h2.75l.41-3.2H13.5V8.75c0-.93.26-1.56 1.59-1.56h1.7V4.33a22.8 22.8 0 0 0-2.48-.13c-2.45 0-4.13 1.5-4.13 4.25v2.35H7.4V14h2.78v8h3.32Z" />
      </svg>
    );
  }

  if (platform === "twitter") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M21.54 7.2c.01.21.01.42.01.63 0 6.42-4.88 13.82-13.82 13.82A13.73 13.73 0 0 1 .3 19.47c.38.05.76.07 1.16.07 2.27 0 4.36-.77 6.02-2.07a4.86 4.86 0 0 1-4.54-3.37c.3.05.6.09.92.09.44 0 .89-.06 1.3-.17A4.86 4.86 0 0 1 1.27 9.25v-.06c.65.36 1.41.59 2.21.61A4.85 4.85 0 0 1 1.98 3.3a13.79 13.79 0 0 0 10 5.07 5.44 5.44 0 0 1-.12-1.11 4.85 4.85 0 0 1 8.4-3.32 9.54 9.54 0 0 0 3.08-1.17 4.83 4.83 0 0 1-2.14 2.68A9.65 9.65 0 0 0 24 4.7a10.42 10.42 0 0 1-2.46 2.5Z" />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.25c-2.9 0-5.07 2.35-5.07 5.47 0 1.2.22 2.06.22 2.88 0 .68-.45 1.5-1.93 2.12-.5.2-.84.45-.84.77 0 .5.82.79 2.26 1.02.22.04.28.33.35.72.1.52.29 1.2 1.04 1.32.42.07.88-.02 1.23.2.47.3.57 1.03 1.18 1.38.4.23.95.34 1.56.34s1.16-.11 1.56-.34c.61-.35.71-1.08 1.18-1.38.35-.22.81-.13 1.23-.2.75-.12.94-.8 1.04-1.32.07-.39.13-.68.35-.72 1.44-.23 2.26-.52 2.26-1.02 0-.32-.34-.57-.84-.77-1.48-.62-1.93-1.44-1.93-2.12 0-.82.22-1.68.22-2.88 0-3.12-2.17-5.47-5.07-5.47Z" />
    </svg>
  );
}

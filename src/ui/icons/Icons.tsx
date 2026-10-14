import type { SVGProps } from 'react';

/** Retreva icon set: 24px grid, 1.75 stroke, round caps/joins, currentColor. */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 22, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconMap = (p: P) => (
  <Base {...p}>
    <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
    <path d="M9 4v14M15 6v14" />
  </Base>
);
export const IconJobs = (p: P) => (
  <Base {...p}>
    <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" />
    <path d="M9 7.5V5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3.5 12.5h17M11 12.5v2h2v-2" />
  </Base>
);
export const IconBag = (p: P) => (
  <Base {...p}>
    <path d="M5 8.5h14l-1 11.5H6L5 8.5Z" />
    <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
  </Base>
);
export const IconWallet = (p: P) => (
  <Base {...p}>
    <path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5v-11Z" />
    <path d="M4 7.5 15.5 4.2V7.5M15.5 13.5h2" />
  </Base>
);
export const IconChat = (p: P) => (
  <Base {...p}>
    <path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4v-10Z" />
    <path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" strokeWidth={2.4} />
  </Base>
);
export const IconPlane = (p: P) => (
  <Base {...p}>
    <path d="m3.5 13.5 4.5.8 3.2 5.2 1.8-.6-1.4-5 5.4.9c1.4.2 3-.6 3.4-1.6.3-.8-.4-1.4-1.6-1.6L13.4 10l-1.2-5-1.8-.4-1 5.2-4.4-.8-1.2-2.2-1.3.3.9 3.4Z" />
  </Base>
);
export const IconTicket = (p: P) => (
  <Base {...p}>
    <path d="M3.5 8a1.5 1.5 0 0 1 1.5-1.5h14A1.5 1.5 0 0 1 20.5 8v2a2 2 0 0 0 0 4v2a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-2a2 2 0 0 0 0-4V8Z" />
    <path d="M14.5 6.5v11" strokeDasharray="1.5 2" />
  </Base>
);
export const IconBed = (p: P) => (
  <Base {...p}>
    <path d="M3.5 18.5v-12M3.5 15h17v3.5M20.5 15v-2.5a2.5 2.5 0 0 0-2.5-2.5h-7.5V15" />
    <circle cx="7" cy="11.5" r="1.8" />
  </Base>
);
export const IconUser = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 19.5c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
  </Base>
);
export const IconGear = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
  </Base>
);
export const IconPhone = (p: P) => (
  <Base {...p}>
    <rect x="6.5" y="3" width="11" height="18" rx="2.2" />
    <path d="M10.5 18h3" />
  </Base>
);
export const IconPause = (p: P) => (
  <Base {...p}>
    <path d="M9 5.5v13M15 5.5v13" strokeWidth={2.4} />
  </Base>
);
export const IconClose = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);
export const IconBack = (p: P) => (
  <Base {...p}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </Base>
);
export const IconRun = (p: P) => (
  <Base {...p}>
    <circle cx="14.5" cy="4.8" r="1.6" />
    <path d="m8 20 2.8-4.6 2.7 2 1-5.4 2.5 2.5h3M6.5 10.5l3-2.5h4l-1 5.5" />
  </Base>
);
export const IconPlate = (p: P) => (
  <Base {...p}>
    <ellipse cx="12" cy="13" rx="8.5" ry="5" />
    <path d="M7.5 12c1-1.8 2.6-2.8 4.5-2.8s3.5 1 4.5 2.8" />
  </Base>
);
export const IconCup = (p: P) => (
  <Base {...p}>
    <path d="M6.5 6.5h11l-1.4 13H7.9L6.5 6.5Z" />
    <path d="M7 10.5h10M13 6.5l1.5-3" />
  </Base>
);
export const IconBottle = (p: P) => (
  <Base {...p}>
    <path d="M10 3.5h4v3l1.5 2.5v11h-7V9L10 6.5v-3Z" />
    <path d="M8.5 12.5h7" />
  </Base>
);
export const IconSnack = (p: P) => (
  <Base {...p}>
    <path d="M6.5 4.5h11l-1 3 1 12.5h-11l1-12.5-1-3Z" />
    <path d="M9.5 12.5h5M10.5 15.5h3" />
  </Base>
);
export const IconKey = (p: P) => (
  <Base {...p}>
    <circle cx="8" cy="14" r="4" />
    <path d="m11 11 8-7.5M16 6l2.5 2.5M14 8l2 2" />
  </Base>
);
export const IconPin = (p: P) => (
  <Base {...p}>
    <path d="M12 20.5s6-5.6 6-10.5a6 6 0 1 0-12 0c0 4.9 6 10.5 6 10.5Z" />
    <circle cx="12" cy="10" r="2.2" />
  </Base>
);
export const IconLock = (p: P) => (
  <Base {...p}>
    <rect x="5.5" y="10.5" width="13" height="9" rx="1.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Base>
);
export const IconCoin = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M9 8.5v7M15 8.5v7M9 8.5l6 7M7.5 11h9M7.5 13h9" strokeWidth={1.4} />
  </Base>
);

export const ITEM_ICONS: Record<string, (p: P) => JSX.Element> = {
  plate: IconPlate,
  cup: IconCup,
  bottle: IconBottle,
  snack: IconSnack,
  bag: IconBag,
  key: IconKey,
};

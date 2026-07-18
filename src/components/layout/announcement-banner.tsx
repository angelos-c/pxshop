"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Now available: same-day in-house permanent unlocks for all BMW 2020+ (inc. G80, G81, G82, X6M...and more!)",
  "All in stock parts available in 1-2 days at our Limassol location",
];

// Bump this whenever the messages change so a stale dismissal doesn't hide
// a genuinely new announcement.
const DISMISS_KEY = "px-announcement-dismissed-v2";

// The full message list is repeated enough times that the marquee track
// always overflows the viewport, however wide — see the identical technique
// in partner-logos.tsx.
const REPEAT_COUNT = 3;

function MarqueeHalf({ hidden }: { hidden: boolean }) {
  return (
    <div className="flex items-center" aria-hidden={hidden}>
      {Array.from({ length: REPEAT_COUNT }, (_, cycle) =>
        MESSAGES.map((message, i) => (
          <span
            key={`${cycle}-${i}`}
            className="flex items-center gap-4 px-4 text-[11px] font-bold tracking-wide uppercase md:text-xs"
          >
            <span>{message}</span>
            <span aria-hidden className="opacity-50">
              •
            </span>
          </span>
        ))
      )}
    </div>
  );
}

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative bg-brand text-cream">
      <div className="overflow-hidden pr-10">
        <div className="animate-marquee-slow flex w-max py-2 whitespace-nowrap motion-reduce:animate-none">
          <MarqueeHalf hidden={false} />
          <MarqueeHalf hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        aria-label="Dismiss announcement"
        className="absolute top-0 right-0 flex h-full w-10 items-center justify-center text-cream/70 transition-colors hover:text-cream"
      >
        ×
      </button>
    </div>
  );
}

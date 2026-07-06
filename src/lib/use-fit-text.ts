"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Scales a single line of text so it always spans the full width of its
 * container — the same "fluid wordmark" trick OUTFIT uses for its hero
 * (rather than guessing a vw-based clamp() that only works for one string
 * length). Falls back gracefully to whatever font-size the className/style
 * provides until the measurement runs on mount.
 */
export function useFitText<T extends HTMLElement = HTMLHeadingElement>() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<T>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const containerWidth = container.offsetWidth;
      if (!containerWidth) return;

      const previousFontSize = text.style.fontSize;
      text.style.fontSize = "100px";
      const naturalWidth = text.scrollWidth;
      text.style.fontSize = previousFontSize;

      if (!naturalWidth) return;
      setFontSize((containerWidth / naturalWidth) * 100);
    };

    fit();

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);

    document.fonts?.ready.then(fit).catch(() => {});

    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, textRef, fontSize };
}

"use client";

import { XStamp } from "@/components/brand/x-stamp";
import { useFitText } from "@/lib/use-fit-text";

export function HeroWordmark() {
  const { containerRef, textRef, fontSize } = useFitText<HTMLHeadingElement>();

  return (
    <section className="relative w-full max-w-full">
      <div className="site-gutter pb-2 pt-6 md:pb-3 md:pt-8">
        <div ref={containerRef} className="w-full">
          <h1
            ref={textRef}
            style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
            className="-mt-[0.27em] inline-block w-max whitespace-nowrap text-[clamp(3rem,12vw,15rem)] font-bold leading-[1.25] tracking-[-0.02em] text-brand"
          >
            PROJECT [X].
          </h1>
        </div>
      </div>

      <div className="site-gutter">
        <div className="editorial-rule-bold" />
      </div>

      <div className="site-gutter grid gap-8 py-8 md:grid-cols-[1fr_2fr_1fr] md:gap-0 md:py-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Project <XStamp size="sm" />
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-brand/70">
            tuning
          </p>
        </div>

        <div className="md:border-x md:border-border md:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            <XStamp size="sm" />
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand md:text-base">
            Authorised and licensed dealer for prestigious
            automotive enhancements — Eventuri | Black Mamba | ZRP | Akrapovic | Mishimoto | Milltek | do88.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:items-end md:text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Shipping & Returns
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-brand/60">
            © 2026
          </p>
        </div>
      </div>

      <div className="site-gutter">
        <div className="editorial-rule-bold" />
      </div>
    </section>
  );
}

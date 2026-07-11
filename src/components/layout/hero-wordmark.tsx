"use client";

import { PartnerLogos } from "@/components/layout/partner-logos";
import { useFitText } from "@/lib/use-fit-text";

export function HeroWordmark() {
  const { containerRef, textRef, fontSize } = useFitText<HTMLHeadingElement>();

  return (
    <section className="relative w-full max-w-full">
      <div className="site-gutter pb-2 pt-1 md:pb-3">
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

      <div className="site-gutter py-8 md:py-10">
        <PartnerLogos />
      </div>

      <div className="site-gutter">
        <div className="editorial-rule-bold" />
      </div>
    </section>
  );
}

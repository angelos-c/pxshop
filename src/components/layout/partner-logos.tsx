const PARTNERS = [
  { name: "Eventuri", file: "eventuri.png" },
  { name: "Black Mamba", file: "black-mamba.png" },
  { name: "ZRP", file: "zrp.png" },
  { name: "CTS Turbo", file: "ctsturbo.png" },
  { name: "Mishimoto", file: "mishimoto.png" },
  { name: "Milltek", file: "milltek.png" },
  { name: "Maxton", file: "maxton.png" },
];

function LogoMark({ partner }: { partner: (typeof PARTNERS)[number] }) {
  return (
    <span
      role="img"
      aria-label={partner.name}
      className="logo-mask h-9 w-full max-w-36 bg-brand/60 transition-colors duration-200 hover:bg-brand md:h-11"
      style={{
        maskImage: `url(/partners/${partner.file})`,
        WebkitMaskImage: `url(/partners/${partner.file})`,
      }}
    />
  );
}

export function PartnerLogos() {
  return (
    <div className="border border-border">
      {/* Mobile: an auto-scrolling marquee so every logo surfaces on load
          instead of being stuck off-screen behind a manual horizontal
          scroll. The track below is the list rendered twice back-to-back —
          animating it exactly half its own width loops seamlessly. */}
      <div className="overflow-hidden md:hidden">
        <div className="animate-marquee flex w-max divide-x divide-border">
          {[...PARTNERS, ...PARTNERS].map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              aria-hidden={index >= PARTNERS.length}
              className="flex h-20 w-[33.333vw] shrink-0 items-center justify-center px-4"
            >
              <LogoMark partner={partner} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: every logo already fits without scrolling. */}
      <div className="hidden divide-x divide-border md:flex">
        {PARTNERS.map((partner) => (
          <div
            key={partner.name}
            className="flex h-24 flex-1 items-center justify-center px-4"
          >
            <LogoMark partner={partner} />
          </div>
        ))}
      </div>
    </div>
  );
}

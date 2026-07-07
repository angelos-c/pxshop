const PARTNERS = [
  { name: "Eventuri", file: "eventuri.png" },
  { name: "Black Mamba", file: "black-mamba.png" },
  { name: "ZRP", file: "zrp.png" },
  { name: "CTS Turbo", file: "ctsturbo.png" },
  { name: "Mishimoto", file: "mishimoto.png" },
  { name: "Milltek", file: "milltek.png" },
  { name: "Maxton", file: "maxton.png" },
];

export function PartnerLogos() {
  return (
    <div className="border border-border">
      <div className="flex divide-x divide-border overflow-x-auto">
        {PARTNERS.map((partner) => (
          <div
            key={partner.name}
            className="flex h-20 flex-1 shrink-0 basis-1/3 items-center justify-center px-4 sm:basis-1/4 md:h-24 md:basis-0"
          >
            <span
              role="img"
              aria-label={partner.name}
              className="logo-mask h-9 w-full max-w-36 bg-brand/60 transition-colors duration-200 hover:bg-brand md:h-11"
              style={{
                maskImage: `url(/partners/${partner.file})`,
                WebkitMaskImage: `url(/partners/${partner.file})`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

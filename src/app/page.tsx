import { HeroWordmark } from "@/components/layout/hero-wordmark";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BrandShowcase } from "@/components/shop/brand-showcase";
import { getFeaturedByBrand, getProductsByBrand } from "@/lib/products";

/**
 * One entry per homepage brand showcase, in display order. `heroImage` is
 * optional — see public/brand-hero/README.md for the naming convention;
 * brands without one yet just skip the hero tile in their carousel.
 */
const HOME_BRANDS = [
  { brand: "Eventuri", href: "/shop?brand=Eventuri", heroImage: "/brand-hero/eventuri.jpg" },
  { brand: "Black Mamba", href: "/shop?brand=Black+Mamba", heroImage: "/brand-hero/black-mamba.jpg" },
  { brand: "ZRP", href: "/shop?brand=ZRP", heroImage: "/brand-hero/zrp.jpg" },
  { brand: "CTS Turbo", href: "/shop?brand=CTS+Turbo", heroImage: "/brand-hero/ctsturbo.jpg" },
  { brand: "Maxton Design", href: "/shop?brand=Maxton+Design", heroImage: "/brand-hero/maxton.webp" },
  { brand: "Milltek", href: "/shop?brand=Milltek", heroImage: "/brand-hero/milltek.jpg" },
  { brand: "Mishimoto", href: "/shop?brand=Mishimoto", heroImage: "/brand-hero/mishimoto.jpg" },
] as const;

export default async function Home() {
  const showcases = await Promise.all(
    HOME_BRANDS.map(async ({ brand, href, heroImage }) => {
      const [products, featured] = await Promise.all([
        getProductsByBrand(brand),
        getFeaturedByBrand(brand, 8),
      ]);
      return { brand, href, heroImage, count: products.length, featured };
    })
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip pb-24 md:pb-0">
        <HeroWordmark />

        {showcases.map(({ brand, href, heroImage, count, featured }, index) => (
          <div key={brand}>
            {index > 0 && <div className="editorial-rule" />}
            <BrandShowcase
              brand={brand}
              count={count}
              products={featured}
              href={href}
              heroImage={heroImage}
            />
          </div>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}

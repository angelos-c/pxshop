import { HeroWordmark } from "@/components/layout/hero-wordmark";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BrandShowcase } from "@/components/shop/brand-showcase";
import { getFeaturedByBrand, getProductsByBrand } from "@/lib/products";

export default async function Home() {
  const [eventuri, featuredEventuri, blackMamba, featuredBlackMamba, zrp, featuredZrp] =
    await Promise.all([
      getProductsByBrand("Eventuri"),
      getFeaturedByBrand("Eventuri", 8),
      getProductsByBrand("Black Mamba"),
      getFeaturedByBrand("Black Mamba", 8),
      getProductsByBrand("ZRP"),
      getFeaturedByBrand("ZRP", 8),
    ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip pb-24 md:pb-0">
        <HeroWordmark />

        <BrandShowcase
          brand="Eventuri"
          count={eventuri.length}
          products={featuredEventuri}
          href="/shop?brand=Eventuri"
          heroImage="/brand-hero/eventuri.jpg"
        />

        <div className="editorial-rule" />

        <BrandShowcase
          brand="Black Mamba"
          count={blackMamba.length}
          products={featuredBlackMamba}
          href="/shop?brand=Black+Mamba"
          heroImage="/brand-hero/black-mamba.jpg"
        />

        <div className="editorial-rule" />

        <BrandShowcase
          brand="ZRP"
          count={zrp.length}
          products={featuredZrp}
          href="/shop?brand=ZRP"
          heroImage="/brand-hero/zrp.jpg"
        />
      </main>
      <SiteFooter />
    </>
  );
}

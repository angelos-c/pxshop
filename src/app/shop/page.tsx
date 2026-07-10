import { HeroWordmark } from "@/components/layout/hero-wordmark";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { getBrands, getProducts, getProductsByBrand } from "@/lib/products";

export const metadata = {
  title: "Shop — Project X Tuning",
};

type ShopPageProps = {
  searchParams: Promise<{ brand?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { brand } = await searchParams;
  const brands = await getBrands();
  const activeBrand = brands.find((b) => b.toLowerCase() === brand?.toLowerCase());
  const catalog = activeBrand ? await getProductsByBrand(activeBrand) : await getProducts();

  // Surface available stock first on the "all products" listing. The catalog
  // already arrives alphabetically sorted; a stable sort by `inStock` keeps
  // that name ordering within each of the in-stock / out-of-stock groups.
  const items = [...catalog].sort((a, b) => Number(b.inStock) - Number(a.inStock));

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip pb-24 md:pb-0">
        <HeroWordmark />

        <section className="site-gutter py-10 md:py-14">
          <ShopBrowser products={items} activeBrand={activeBrand} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

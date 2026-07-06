import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductDetail } from "@/components/shop/product-detail";
import { getProduct } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Product — Project X Tuning" };

  return {
    title: `${product.name} — Project X Tuning`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-24 md:pb-0">
        <ProductDetail product={product} />
      </main>
      <SiteFooter />
    </>
  );
}

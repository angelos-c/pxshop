import { BagContents } from "@/components/cart/bag-contents";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "Bag — Project X Tuning",
};

export default function BagPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip pb-24 md:pb-0">
        <div className="site-gutter pt-8 md:pt-10">
          <h1 className="text-3xl font-black tracking-tight text-brand md:text-5xl">
            Your bag
          </h1>
        </div>
        <div className="site-gutter mt-6">
          <div className="editorial-rule" />
        </div>
        <BagContents />
      </main>
      <SiteFooter />
    </>
  );
}

import { LegalSection as Section } from "@/components/legal/legal-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "Shipping & Returns — Project X Tuning",
};

export default function ShippingReturnsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip pb-24 md:pb-0">
        <div className="site-gutter pt-8 md:pt-10">
          <h1 className="text-3xl font-black tracking-tight text-brand md:text-5xl">
            Shipping &amp; returns
          </h1>
        </div>

        <div className="site-gutter mt-6">
          <div className="editorial-rule" />
        </div>

        <div className="site-gutter divide-y divide-border">
          <Section title="Delivery times">
            <p>In-stock items ship within 1–3 days.</p>
            <p>Low-stock items also ship within 1–3 days.</p>
            <p>
              Out-of-stock items can still be ordered — these are placed as a
              special order and may take up to 10 days to arrive.
            </p>
          </Section>

          <Section title="Returns">
            <p>
              At store launch, we are not yet offering returns. This policy
              will be revised shortly — check back here for updates, or get
              in touch if you have a specific question about an order.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about an order or delivery? Email{" "}
              <a
                href="mailto:info@projectxtuning.com"
                className="text-brand hover:opacity-60"
              >
                info@projectxtuning.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+35799770968"
                className="text-brand hover:opacity-60"
              >
                +357 99 770968
              </a>
              .
            </p>
          </Section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

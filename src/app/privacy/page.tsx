import { LegalSection as Section } from "@/components/legal/legal-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "Privacy Policy — Project X Tuning",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip pb-24 md:pb-0">
        <div className="site-gutter pt-8 md:pt-10">
          <h1 className="text-3xl font-black tracking-tight text-brand md:text-5xl">
            Privacy policy
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand/80">
            Your privacy matters to us, and we only use the information we
            collect about you in accordance with the General Data Protection
            Regulation (EU) 2016/679 (&ldquo;GDPR&rdquo;) and applicable
            Cyprus data protection law. By using this website or placing an
            order with us, you accept this policy.
          </p>
        </div>

        <div className="site-gutter mt-6">
          <div className="editorial-rule" />
        </div>

        <div className="site-gutter divide-y divide-border">
          <Section title="Use of personal data">
            <p>
              When you place an order or create an account with us, we
              collect information such as your name, email address, and
              delivery address, so that we can process your order, manage
              your account, and keep you updated on its status.
            </p>
            <p>
              Payment is handled entirely by Stripe, our payment processor —
              your card number and expiry date are entered directly on
              Stripe&rsquo;s secure checkout page and never pass through or
              get stored on our own servers.
            </p>
            <p>
              We may also ask for a phone number so we can reach you quickly
              if there&rsquo;s a query with your order. We use this
              information to keep you informed about delivery, to improve the
              content and functionality of our site, and to understand how
              our customers shop with us.
            </p>
          </Section>

          <Section title="Protection of personal data">
            <p>
              We take the protection of your data seriously and put
              safeguards in place around any information you give us when
              placing an order or registering an account. Checkout pages use
              industry-standard Transport Layer Security (TLS) encryption for
              anything you submit to us.
            </p>
            <p>
              For security reasons, and to protect your right to privacy, we
              may occasionally ask you to verify your identity before
              disclosing sensitive information or accepting changes to the
              details we hold for you.
            </p>
            <p>
              We only keep your data for as long as it&rsquo;s needed to
              complete the purpose it was collected for, or for legitimate
              business or legal reasons.
            </p>
          </Section>

          <Section title="Disclosure of information to third parties">
            <p>
              We do not sell, trade, or rent your personal information. We
              share the minimum necessary with trusted third parties who
              perform specific functions on our behalf — for example, a
              courier delivering your order, or Stripe processing your
              payment. These parties are not permitted to use your
              information for any other purpose, and are required to handle
              it in line with GDPR.
            </p>
          </Section>

          <Section title="Access to information">
            <p>
              You can request details of the personal information we hold
              about you at any time by emailing{" "}
              <a
                href="mailto:info@projectxtuning.com"
                className="text-brand hover:opacity-60"
              >
                info@projectxtuning.com
              </a>
              .
            </p>
          </Section>

          <Section title="Opt out">
            <p>
              You can opt out of email updates at any time by emailing{" "}
              <a
                href="mailto:info@projectxtuning.com"
                className="text-brand hover:opacity-60"
              >
                info@projectxtuning.com
              </a>{" "}
              and asking to be removed, or by using the unsubscribe link at
              the bottom of any email we send you.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              If you have any comments, suggestions, or concerns about this
              privacy policy, please email{" "}
              <a
                href="mailto:info@projectxtuning.com"
                className="text-brand hover:opacity-60"
              >
                info@projectxtuning.com
              </a>
              .
            </p>
          </Section>

          <Section title="What are cookies?">
            <p>
              Cookies are small text files stored on your device when you
              visit a website. At Project X Tuning, we use a minimal set of
              cookies and local storage to remember what&rsquo;s in your bag
              and your site preferences between visits, so your shopping
              experience carries over when you come back.
            </p>
            <p>
              Our cookies don&rsquo;t store sensitive information such as
              your name, address, or payment details — they simply help us
              recognise your browser on our site. Stripe, our payment
              processor, may also set its own cookies while you&rsquo;re on
              its secure checkout page.
            </p>
          </Section>

          <Section title="How to block or restrict cookies">
            <p>
              You can stop cookies being used on your browser or device
              through your browser&rsquo;s own settings — check the
              &ldquo;Help&rdquo; menu in your browser for instructions. Note
              that if you block cookies, parts of your shopping experience
              may be affected, including your bag not being remembered
              between visits.
            </p>
          </Section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

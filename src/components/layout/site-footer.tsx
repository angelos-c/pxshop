import Link from "next/link";
import { XStamp } from "@/components/brand/x-stamp";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="site-gutter py-16 md:py-24">
        <div className="flex flex-col items-start gap-4 border-b border-border pb-10 md:flex-row md:items-start md:justify-between md:gap-8 md:pb-16">
          <p className="footer-statement text-brand">Built to be judged.</p>
          <div className="flex shrink-0 items-center gap-1 text-brand">
            <span className="text-[clamp(4rem,12vw,11rem)] font-black leading-none">
              ©
            </span>
            <span className="text-[clamp(4rem,12vw,11rem)] font-black leading-none">
              26
            </span>
          </div>
        </div>

        <p className="mt-10 max-w-md text-sm leading-relaxed text-brand/80 md:mt-14">
          Officially authorised and licensed dealer for carefully curated
          automotive brand collections.
        </p>

        <div className="editorial-rule mt-10 md:mt-14" />

        <div className="grid gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-4 md:pt-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              <XStamp size="sm" /> Project X Tuning
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand/60">
              All rights reserved © 2026
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Contact
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand/80">
              info@projectxtuning.com
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-sm text-brand/80">
              <li>
                <Link href="#" className="hover:opacity-60">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-60">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Follow
            </p>
            <ul className="mt-3 space-y-2 text-sm text-brand/80">
              <li>
                <Link href="#" className="hover:opacity-60">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

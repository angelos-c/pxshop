// CTS Turbo has no manufacturer XLSX catalogue — name & fitment are parsed
// straight from the live b2bmotorsport.com product description at scrape
// time. Use this file the same way as eventuri.mjs to hand-fix a specific
// SKU's name or fitment tags when the automatic parsing gets it wrong.

/** @type {Record<string, string>} SKU -> exact display name override. */
export const CTS_TURBO_NAME_OVERRIDES = {
  // Source description has a mangled "3β€³" (mis-encoded 3″) baked into their
  // own CMS data — not a scraper bug, just fixing it at display time.
  "CTS-IT-220R": "3″ Air Intake System for MK6 GTI, Scirocco, EOS 1.8/2.0TSI EA888.1",
};

/** @type {Record<string, string[]>} SKU -> exact fitment tag list override. */
export const CTS_TURBO_FITMENT_OVERRIDES = {};

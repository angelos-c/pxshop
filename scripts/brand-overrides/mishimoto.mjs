// Mishimoto has no manufacturer XLSX catalogue — name & fitment are parsed
// straight from the live b2bmotorsport.com product description at scrape
// time. Use this file the same way as eventuri.mjs to hand-fix a specific
// SKU's name or fitment tags when the automatic parsing gets it wrong.
// Mishimoto also sells a fair number of universal parts (drain plugs,
// fittings) with no vehicle in the description at all — those just fall
// back to fitment: ["Mishimoto"], which is expected, not a bug.

/** @type {Record<string, string>} SKU -> exact display name override. */
export const MISHIMOTO_NAME_OVERRIDES = {};

/** @type {Record<string, string[]>} SKU -> exact fitment tag list override. */
export const MISHIMOTO_FITMENT_OVERRIDES = {};

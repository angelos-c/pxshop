// ZRP has no manufacturer XLSX catalogue — name & fitment are parsed
// straight from the live b2bmotorsport.com product description at scrape
// time. Use this file the same way as eventuri.mjs to hand-fix a specific
// SKU's name or fitment tags when the automatic parsing gets it wrong.

/** @type {Record<string, string>} SKU -> exact display name override. */
export const ZRP_NAME_OVERRIDES = {};

/** @type {Record<string, string[]>} SKU -> exact fitment tag list override. */
export const ZRP_FITMENT_OVERRIDES = {};

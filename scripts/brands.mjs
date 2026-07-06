/**
 * Add a new entry here to onboard another brand's b2bmotorsport.com page.
 * `path` is the URL segment (https://b2bmotorsport.com/<path>), `imageFolder`
 * is the folder name used under /image/catalog/<imageFolder>/ on their site,
 * and `xlsxPath` (optional) points at a manufacturer RRP catalogue used to
 * enrich the live listing with human-readable names/fitment.
 */
export const BRANDS = {
  eventuri: {
    label: "Eventuri",
    path: "eventuri",
    imageFolder: "Eventuri",
    xlsxPath: "catalogs/Eventuri.xlsx",
  },
  "black-mamba": {
    label: "Black Mamba",
    path: "black-mamba",
    imageFolder: "black-mamba",
    // No manufacturer catalogue for this brand — fitment/name are derived
    // straight from the live b2b product description (see scrape script).
    xlsxPath: null,
  },
  zrp: {
    label: "ZRP",
    path: "zrp",
    imageFolder: "zrp",
    // No manufacturer catalogue for this brand either — same
    // description-parsed approach as Black Mamba.
    xlsxPath: null,
  },
};

#!/usr/bin/env node
/**
 * Pulls a brand's live product listing (price, stock, image) from the
 * b2bmotorsport.com trade extranet.
 *
 * For brands with a manufacturer RRP catalogue configured (`xlsxPath` in
 * brands.mjs, e.g. Eventuri) this merges in the reference make/model/
 * description data (plus any manual overrides).
 *
 * For brands with no catalogue (e.g. Black Mamba) the name, category and
 * fitment tags are instead derived straight from the live product
 * description on the b2b detail page — see `stripBrandPrefix` /
 * `extractFitmentTags` below.
 *
 * Usage:
 *   node --env-file=.env.local scripts/scrape-b2b-catalog.mjs eventuri [--force]
 *   node --env-file=.env.local scripts/scrape-b2b-catalog.mjs black-mamba [--force]
 *
 * Requires B2B_MOTORSPORT_EMAIL / B2B_MOTORSPORT_PASSWORD in the environment
 * (see .env.local). Re-runnable: existing images are kept unless --force is
 * passed, and the generated JSON is fully overwritten each run.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { createSession, login } from "./lib/b2b-client.mjs";
import { loadXlsxCatalog } from "./lib/xlsx-catalog.mjs";
import { BRANDS } from "./brands.mjs";
import { EVENTURI_OVERRIDES, EVENTURI_NAME_OVERRIDES } from "./brand-overrides/eventuri.mjs";
import {
  BLACK_MAMBA_NAME_OVERRIDES,
  BLACK_MAMBA_FITMENT_OVERRIDES,
} from "./brand-overrides/black-mamba.mjs";
import { ZRP_NAME_OVERRIDES, ZRP_FITMENT_OVERRIDES } from "./brand-overrides/zrp.mjs";
import {
  CTS_TURBO_NAME_OVERRIDES,
  CTS_TURBO_FITMENT_OVERRIDES,
} from "./brand-overrides/cts-turbo.mjs";
import { MAXTON_NAME_OVERRIDES, MAXTON_FITMENT_OVERRIDES } from "./brand-overrides/maxton.mjs";
import { MILLTEK_NAME_OVERRIDES, MILLTEK_FITMENT_OVERRIDES } from "./brand-overrides/milltek.mjs";
import {
  MISHIMOTO_NAME_OVERRIDES,
  MISHIMOTO_FITMENT_OVERRIDES,
} from "./brand-overrides/mishimoto.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE_URL = "https://b2bmotorsport.com";

const OVERRIDES_BY_BRAND = {
  eventuri: { fitment: EVENTURI_OVERRIDES, names: EVENTURI_NAME_OVERRIDES },
  "black-mamba": {
    names: BLACK_MAMBA_NAME_OVERRIDES,
    fitmentTags: BLACK_MAMBA_FITMENT_OVERRIDES,
  },
  zrp: {
    names: ZRP_NAME_OVERRIDES,
    fitmentTags: ZRP_FITMENT_OVERRIDES,
  },
  "cts-turbo": {
    names: CTS_TURBO_NAME_OVERRIDES,
    fitmentTags: CTS_TURBO_FITMENT_OVERRIDES,
  },
  maxton: {
    names: MAXTON_NAME_OVERRIDES,
    fitmentTags: MAXTON_FITMENT_OVERRIDES,
  },
  milltek: {
    names: MILLTEK_NAME_OVERRIDES,
    fitmentTags: MILLTEK_FITMENT_OVERRIDES,
  },
  mishimoto: {
    names: MISHIMOTO_NAME_OVERRIDES,
    fitmentTags: MISHIMOTO_FITMENT_OVERRIDES,
  },
};

// Manufacturer names that don't play nicely with naive Title Case (acronyms,
// stylised casing, etc). Anything not listed falls back to Title Case.
const MAKE_DISPLAY_NAMES = {
  BMW: "BMW",
  MINI: "MINI",
  SEAT: "SEAT",
  MERCEDES: "Mercedes-Benz",
};

async function main() {
  const [brandKey, ...flags] = process.argv.slice(2);
  const force = flags.includes("--force");

  if (!brandKey || !BRANDS[brandKey]) {
    console.error(
      `Usage: node --env-file=.env.local scripts/scrape-b2b-catalog.mjs <brand> [--force]\nAvailable brands: ${Object.keys(BRANDS).join(", ")}`
    );
    process.exit(1);
  }

  const email = process.env.B2B_MOTORSPORT_EMAIL;
  const password = process.env.B2B_MOTORSPORT_PASSWORD;
  if (!email || !password) {
    console.error(
      "Missing B2B_MOTORSPORT_EMAIL / B2B_MOTORSPORT_PASSWORD.\nRun with: node --env-file=.env.local scripts/scrape-b2b-catalog.mjs " +
        brandKey
    );
    process.exit(1);
  }

  const brand = BRANDS[brandKey];

  console.log(`Logging in to ${BASE_URL} as ${email}...`);
  const session = createSession();
  await login(session, { baseUrl: BASE_URL, email, password });
  console.log("Login OK.\n");

  console.log(`Fetching ${brand.label} catalogue (b2bmotorsport.com/${brand.path})...`);
  const listRes = await session.request(`${BASE_URL}/${brand.path}?limit=200`);
  const html = await listRes.text();
  const $ = cheerio.load(html);

  const items = [];
  $(".product-layout").each((_, el) => {
    const $el = $(el);
    const sku = $el.find(".name a").first().text().trim();
    if (!sku) return;

    const cost = parsePrice($el.find(".price-new").first().text());
    const rrp = parsePrice($el.find(".price-old").first().text());
    const stockText = $el.find(".stockstyle").first().text().trim();
    const imgSrc = $el.find("img").first().attr("src") ?? "";
    const href = $el.find(".name a").first().attr("href") ?? null;
    const listingDescription = $el
      .find(".caption .description")
      .first()
      .text()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\.\.$/, "");

    items.push({
      sku,
      cost,
      price: rrp ?? cost,
      inStock: /in stock/i.test(stockText),
      imgSrc,
      href,
      listingDescription,
    });
  });
  console.log(`Found ${items.length} live listings.\n`);

  let xlsxMap = new Map();
  if (brand.xlsxPath) {
    try {
      xlsxMap = loadXlsxCatalog(path.join(ROOT, brand.xlsxPath));
      console.log(`Loaded ${xlsxMap.size} reference entries from ${brand.xlsxPath}.\n`);
    } catch (err) {
      console.warn(`Could not load ${brand.xlsxPath}: ${err.message}\n`);
    }
  }

  const overrides = OVERRIDES_BY_BRAND[brandKey]?.fitment ?? {};
  const nameOverrides = OVERRIDES_BY_BRAND[brandKey]?.names ?? {};
  const fitmentTagOverrides = OVERRIDES_BY_BRAND[brandKey]?.fitmentTags ?? {};
  const usesCatalogue = Boolean(brand.xlsxPath);

  const imagesDir = path.join(ROOT, "public", "products", brandKey);
  await fs.mkdir(imagesDir, { recursive: true });

  const records = [];
  const unmatched = [];
  let downloaded = 0;
  let skippedExisting = 0;
  let missingImages = 0;

  for (const item of items) {
    const key = item.sku.toUpperCase();

    let name;
    let category;
    let fitment;

    if (usesCatalogue) {
      const fitmentEntries = xlsxMap.get(key) ?? overrides[key] ?? null;
      if (!fitmentEntries) unmatched.push(item.sku);

      fitment = (fitmentEntries ?? [])
        .filter((entry) => entry.make !== "COMPONENTS")
        .map((entry) => `${displayMake(entry.make)} ${entry.model}`.trim());
      if (!fitment.length && fitmentEntries?.some((entry) => entry.make === "COMPONENTS")) {
        fitment.push("Universal");
      }
      const primaryDescription = fitmentEntries?.[0]?.description ?? item.sku;
      name = nameOverrides[key] ?? cleanText(primaryDescription);
      category = classifyCategory(primaryDescription);
    } else {
      // No manufacturer catalogue for this brand (e.g. Black Mamba) — pull
      // the untruncated description straight off the product detail page
      // and derive name/fitment/category from that free text instead.
      const rawDescription = await fetchDetailDescription(session, item.href, item.listingDescription);
      const stripped = stripBrandPrefix(rawDescription, brand.label, brand.prefixAliases);

      name = nameOverrides[key] ?? cleanText(stripped);
      fitment =
        fitmentTagOverrides[key] ??
        (brandKey === "milltek" ? extractMilltekFitment(stripped) : null) ??
        extractFitmentTags(stripped, brand.label);
      if (!fitment.length) fitment = [brand.label];
      category = classifyCategory(stripped);
    }

    let image = null;
    const resolvedImage = item.imgSrc ? toOriginalImageUrl(item.imgSrc) : null;
    if (resolvedImage && !isGenericPlaceholder(resolvedImage.baseName)) {
      const ext = path.extname(new URL(resolvedImage.url).pathname) || ".jpg";
      const localFile = `${item.sku.toLowerCase()}${ext}`;
      const localPath = path.join(imagesDir, localFile);

      const result = await downloadImage(session, resolvedImage.url, localPath, force);
      if (result === "downloaded") downloaded += 1;
      else if (result === "skipped") skippedExisting += 1;
      else missingImages += 1;

      if (result !== "missing") image = `/products/${brandKey}/${localFile}`;
    } else if (item.imgSrc) {
      missingImages += 1;
    }

    records.push({
      sku: item.sku,
      slug: item.sku.toLowerCase(),
      brand: brand.label,
      name,
      category,
      price: item.price,
      cost: item.cost,
      currency: "EUR",
      inStock: item.inStock,
      fitment: fitment.length ? fitment : [brand.label],
      image,
    });

    // Be polite to the supplier's server.
    await sleep(60);
  }

  const deduped = dedupeBySku(records);
  const dupeCount = records.length - deduped.length;
  deduped.sort((a, b) => a.name.localeCompare(b.name));
  if (dupeCount > 0) {
    console.log(
      `\n${dupeCount} listing(s) shared a SKU with another listing (same physical part sold for multiple vehicles) — merged into one product each with combined fitment tags.`
    );
  }

  const outPath = path.join(ROOT, "src", "data", `${brandKey}.generated.json`);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(deduped, null, 2)}\n`);

  console.log(`\nWrote ${deduped.length} products to ${path.relative(ROOT, outPath)}`);
  console.log(`Images — downloaded: ${downloaded}, already had: ${skippedExisting}, missing: ${missingImages}`);

  if (unmatched.length) {
    console.log(
      `\n${unmatched.length} SKU(s) had no catalogue/override match (named from SKU, no fitment):`
    );
    for (const sku of unmatched) console.log(`  - ${sku}`);
  }
}

/**
 * Some b2bmotorsport.com listings reuse the exact same SKU across several
 * separate "product" entries — one per compatible vehicle — rather than one
 * listing with multiple fitment tags (seen on Milltek, e.g. SSXFD273 sold
 * as 4 near-identical listings for Fiesta ST pre/post-facelift, Puma ST,
 * and a malformed 4th copy). Left as-is, later scrape rows silently
 * overwrite earlier ones once synced to Stripe (same SKU -> same Stripe
 * product id), so this merges them up front into one record with the union
 * of every duplicate's fitment tags. Junk fragments produced by a
 * malformed source listing (too short to be a real vehicle name) are
 * dropped rather than merged in.
 */
function dedupeBySku(records) {
  const groups = new Map();
  for (const record of records) {
    if (!groups.has(record.sku)) groups.set(record.sku, []);
    groups.get(record.sku).push(record);
  }

  const merged = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }
    // Prefer, as the base record (name/category/price/image), a listing
    // whose own fitment tags all look like real vehicle mentions — a
    // malformed duplicate that fell back to generic text extraction tends
    // to produce both a messier name and junk fitment fragments.
    const clean = group.find((r) => r.fitment.every((tag) => VEHICLE_HINT.test(tag)));
    const base = clean ?? group[0];

    const mergedFitment = new Set();
    for (const record of group) {
      for (const tag of record.fitment) {
        if (VEHICLE_HINT.test(tag)) mergedFitment.add(tag);
      }
    }
    merged.push({ ...base, fitment: mergedFitment.size ? [...mergedFitment] : base.fitment });
  }
  return merged;
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayMake(make) {
  if (!make) return "";
  return MAKE_DISPLAY_NAMES[make.toUpperCase()] ?? titleCase(make);
}

function cleanText(value) {
  const trimmed = String(value).trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Removes a leading "<Brand Name> " prefix, e.g. for a brand with no
 * separate name field, where the b2b description doubles as the title.
 * `aliases` covers brands that sometimes drop part of their label in the
 * description (e.g. CTS Turbo SKUs titled "CTS B-Cool ..." with no "Turbo") —
 * tried longest-first so the fuller label wins when both would match. */
function stripBrandPrefix(text, brandLabel, aliases = []) {
  const trimmed = String(text).trim();
  for (const candidate of [brandLabel, ...aliases]) {
    const re = new RegExp(`^${escapeRegExp(candidate)}\\s+`, "i");
    if (re.test(trimmed)) return trimmed.replace(re, "").trim();
  }
  return trimmed;
}

/**
 * Fetches a product's full (untruncated) description straight off its
 * detail page — used for brands with no manufacturer catalogue, where the
 * listing-page description is truncated with "..". Falls back to the
 * truncated listing text if the detail page can't be reached.
 */
async function fetchDetailDescription(session, href, fallback) {
  if (!href) return fallback;
  try {
    const res = await session.request(href);
    const html = await res.text();
    const $ = cheerio.load(html);
    const block = $(".product-blocks.blocks-top .block-content").first().text().trim();
    const og = $('meta[property="og:description"]').attr("content")?.trim();
    return (block || og || fallback).replace(/\s+/g, " ");
  } catch {
    return fallback;
  }
}

// Words that indicate a chunk of free text is about a vehicle/engine
// platform rather than the product itself (make/model names, or anything
// with a digit — chassis codes, generations, displacements all have one).
// Word-bounded on purpose — an earlier unbounded version matched "mini"
// inside "aluMINIum" and similar false positives.
const VEHICLE_HINT =
  /\b(bmw|audi|mercedes|porsche|volkswagen|vw|seat|skoda|mini|lamborghini|toyota|ford|honda|hyundai|opel|abarth|ferrari|mclaren|ducati|mazda|nissan|mitsubishi|subaru|renault|peugeot|citroen|fiat|alfa|chevrolet|dodge|jeep|lexus|infiniti|acura|volvo|chrysler|cadillac|jaguar|land ?rover|kia|suzuki|isuzu|golf|leon|octavia|polo|scirocco|cupra|urus|cayenne|tt)\b|\d/i;

// Descriptive "variant" noise that isn't part of the vehicle fitment and
// isn't a standalone product-type word either — strip it outright before
// splitting so it doesn't get misread as its own chunk (e.g. "W/Shield"
// would otherwise split into two garbage fragments "W" and "Shield").
const FITMENT_NOISE = /\b(w\/\s?shield|w\/\s?heat shield|with heat shield|\(\s*heat shield\s*\))\b/gi;

// Product-type phrases that can legitimately trail a vehicle name in the
// same delimited chunk (e.g. "CLA 45 AMG Decat Downpipe") — stripped off
// the end so the fitment tag is just the vehicle ("CLA 45 AMG"). `name`
// keeps the original untouched text, so nothing is lost overall.
const PRODUCT_TYPE_SUFFIX = new RegExp(
  "\\s+(" +
    [
      "decat downpipes?",
      "sports cat downpipe",
      "downpipes?",
      "intercooler kit",
      "intercooler",
      "charge ?pipes? kit",
      "charge ?pipes?",
      "turbo inlets? kit",
      "turbo inlet pipe",
      "turbo outlet pipe",
      "turbo outlets?",
      "throttle inlet pipe",
      "throttle pipe",
      "discharge pipe",
      "crossover exhaust pipe",
      "j ?pipe",
      "turbo muffler delete",
      "muffler delete",
      "ignition coils? set",
      "ignition coils?",
      "boost hose",
      "baffled oil catch can",
      "oil catch can",
      "pcv adapter( for catch can)?",
      "turbo blankets?",
      "side radiators?",
      "chargecooler intercooler",
      "charge cooler radiators?",
      "aluminium undertray",
      "mid-?pipe",
      "intake kit",
      "intake manifold",
      "intake pipe",
      "intake",
    ].join("|") +
    ")\\s*$",
  "i"
);

/**
 * Best-effort extraction of "fitment" tags from a free-text description
 * (used for brands without a structured make/model catalogue). This is
 * intentionally lossy — it's a supplementary display tag, not the source of
 * truth, since `name` always keeps the full original text intact.
 *
 * `brandLabel` (optional) is cut off along with everything after it within a
 * chunk — needed for brands like ZRP whose product-type wording follows the
 * brand name *mid-string* (e.g. "...EA839 Turbo ZRP Connecting Rods"),
 * rather than only as a leading prefix (which `stripBrandPrefix` already
 * handles for the whole description).
 */
/**
 * Milltek descriptions consistently read "<Make/model/engine> <startYear>
 * <endYear> <system description...>" (e.g. "Audi A3 2.0T FSI 2WD 3 door
 * 2003 2012 Cat-back Resonated..."), so the vehicle portion can be lifted
 * cleanly by cutting right after the year range — far more reliable here
 * than the generic hyphen/slash-based `extractFitmentTags`, which has
 * nothing to split on in a sentence like this. Returns null (falls back to
 * `extractFitmentTags`) for the handful of universal/add-on listings with
 * no vehicle + year range in the text at all.
 */
function extractMilltekFitment(text) {
  const match = text.match(/^(.*?\b\d{4}\s+\d{4})\b/);
  return match ? [match[1].trim()] : null;
}

function extractFitmentTags(text, brandLabel) {
  const normalized = text
    .replace(/[–—]/g, "-")
    .replace(FITMENT_NOISE, " ")
    .replace(/\bfor\b/gi, " - ");

  // Only split on a "-"/"/" that has whitespace on at least one side — a
  // bare hyphen with none (e.g. "RX-8", "GT-R", "Cat-back", "M-Pack") is
  // part of a single model/product token, not a delimiter between chunks.
  const chunks = normalized
    .split(/\s+[-/]\s*|\s*[-/]\s+/)
    .map((c) => c.trim())
    .filter(Boolean);

  const brandCutRe = brandLabel
    ? new RegExp(`\\s+${escapeRegExp(brandLabel)}\\b.*$`, "i")
    : null;

  const tags = [];
  for (let chunk of chunks) {
    if (!VEHICLE_HINT.test(chunk)) continue;

    let stripped = brandCutRe ? chunk.replace(brandCutRe, "").trim() : chunk;
    let previous;
    do {
      previous = stripped;
      stripped = stripped.replace(PRODUCT_TYPE_SUFFIX, "").trim();
    } while (stripped !== previous && stripped.length > 0);

    if (stripped) tags.push(stripped);
  }
  return [...new Set(tags)];
}

/**
 * Turns a resized/cached image URL (image/cache/catalog/.../SKU-150x120h.jpg)
 * into the original full-resolution asset (image/catalog/.../SKU.jpg),
 * preserving whatever directory structure and extension the source used.
 */
function toOriginalImageUrl(cacheSrc) {
  try {
    const url = new URL(cacheSrc);
    url.pathname = url.pathname.replace("/image/cache/", "/image/");

    const parts = url.pathname.split("/");
    const filename = decodeURIComponent(parts.pop());
    const match = filename.match(/^(.*)-\d+x\d+[hw]?(\.[a-zA-Z0-9]+)$/);
    const baseName = match ? match[1] : filename.replace(/\.[a-zA-Z0-9]+$/, "");
    const restoredFilename = match ? `${match[1]}${match[2]}` : filename;

    parts.push(encodeURIComponent(restoredFilename).replace(/%2F/g, "/"));
    url.pathname = parts.join("/");
    return { url: url.toString(), baseName };
  } catch {
    return null;
  }
}

/**
 * The b2b extranet falls back to a generic Eventuri logo or an unrelated
 * stock/lifestyle photo when a manufacturer hasn't supplied real product
 * photography yet. Those aren't genuine product shots, so we skip them
 * rather than presenting stock imagery as if it were the actual part.
 */
function isGenericPlaceholder(baseName) {
  const lower = baseName.toLowerCase();
  if (lower === "eventuri" || lower.startsWith("eventuri-")) return true;
  if (lower === "black-mamba" || lower === "blackmamba" || lower.startsWith("black-mamba-")) return true;
  if (lower === "zrp" || lower.startsWith("zrp-")) return true;
  if (lower === "ctsturbo" || lower === "cts-turbo" || lower.startsWith("ctsturbo-")) return true;
  if (lower === "maxton" || lower.startsWith("maxton-")) return true;
  if (lower === "milltek" || lower.startsWith("milltek-")) return true;
  if (lower === "mishimoto" || lower.startsWith("mishimoto-")) return true;
  if (lower === "no_image" || lower === "placeholder" || lower === "logo") return true;
  if (/^\d{6,}_[0-9a-f]{5,}/i.test(baseName)) return true;
  return false;
}

function parsePrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

function classifyCategory(description) {
  const d = description.toLowerCase();
  // Checked first, ahead of everything else: exhaust system descriptions
  // (esp. Milltek's) routinely contain incidental substrings that would
  // otherwise misfire other categories below — "valved rear silencer"
  // contains "valve", "Requires ... lower spoiler" contains "spoiler", etc.
  // A strong exhaust-system signal should always win over those.
  if (
    d.includes("cat-back") ||
    d.includes("catback") ||
    d.includes("resonated") ||
    d.includes("filter-back") ||
    d.includes("silencer") ||
    d.includes("exhaust system") ||
    d.includes("gpf/opf bypass") ||
    d.includes("opf/gpf bypass")
  )
    return "Exhaust System";
  if (d.includes("connecting rod") || d.includes("con-rod") || d.includes("con rod")) return "Connecting Rods";
  if (d.includes("crankshaft")) return "Crankshaft";
  if (d.includes("piston")) return "Pistons";
  if (d.includes("valve spring")) return "Valve Springs";
  if (d.includes("valve")) return "Valves";
  if (d.includes("engine cover")) return "Engine Cover";
  if (d.includes("plenum")) return "Plenum";
  if (d.includes("scoop")) return "Carbon Scoop";
  if (d.includes("strut brace") || d.includes("strut")) return "Chassis Brace";
  if (d.includes("seat back")) return "Interior";
  if (d.includes("slam panel")) return "Slam Panel";
  if (d.includes("downpipe")) return "Downpipe";
  if (d.includes("mid-pipe") || d.includes("mid pipe") || d.includes("muffler delete") || d.includes("crossover") || d.includes("j pipe"))
    return "Exhaust Hardware";
  if (d.includes("catch can") || d.includes("pcv")) return "Catch Can";
  if (d.includes("ignition coil") || d.includes("coilpack") || d.includes("coil pack")) return "Ignition Coils";
  if (d.includes("turbo blanket") || d.includes("heat wrap")) return "Heat Management";
  if (d.includes("oil filter housing") || d.includes("drain plug") || d.includes("sandwich plate") || d.includes("oil filler cap"))
    return "Oil System";
  if (d.includes("radiator") || d.includes("oil cooler") || d.includes("coolant") || d.includes("transmission cooler") || d.includes("thermostat"))
    return "Cooling";
  if (d.includes("undertray") || d.includes("battery tie-down") || d.includes("battery tie down")) return "Chassis";
  if (d.includes("shift knob")) return "Interior";
  if (d.includes("boost hose") || d.includes("boost tap") || d.includes("hose")) return "Hose";
  if (d.includes("intercooler") || d.includes("fmic")) return "Intercooler";
  if (d.includes("exhaust tip")) return "Exhaust Tips";
  if (d.includes("splitter")) return "Splitter";
  if (d.includes("diffuser")) return "Diffuser";
  if (d.includes("flap")) return "Aero Flaps";
  if (d.includes("spoiler")) return "Spoiler";
  if (d.includes("side skirt") || d.includes("skirt")) return "Side Skirts";
  if (d.includes("canard")) return "Canards";
  if (d.includes("removal") && d.includes("tool")) return "Tools";
  if (
    d.includes("turbo inlet") ||
    d.includes("turbo outlet") ||
    d.includes("throttle inlet") ||
    d.includes("throttle pipe") ||
    d.includes("throttle body boot") ||
    d.includes("discharge pipe") ||
    d.includes("turbo tube") ||
    d.includes("chargepipe") ||
    d.includes("charge pipe") ||
    d.includes("turbo flange") ||
    d.includes("hybrid turbo") ||
    d.includes("silicone combo kit") ||
    d.includes("silicon combo kit") ||
    d.includes("silicone transition") ||
    d.includes("silicon transition") ||
    d.includes("compressor inlet")
  )
    return "Turbo Hardware";
  if (
    d.includes("turbo kit") ||
    d.includes("turbocharger") ||
    d.includes("turbo upgrade") ||
    d.includes("boss turbo") ||
    d.includes("turbo set") ||
    /\bturbo (for|replacement)\b/.test(d)
  )
    return "Turbo Kit";
  if (d.includes("turbo manifold") || d.includes("resonator delete") || d.includes("noise pipe delete"))
    return "Turbo Hardware";
  if (d.includes("lowering spring")) return "Lowering Springs";
  if (d.includes("lowering link") || d.includes("torque arm") || d.includes("shock mount")) return "Suspension";
  if (d.includes("sway bar")) return "Sway Bar";
  if (d.includes("control arm")) return "Suspension";
  if (d.includes("transmission mount") || d.includes("engine mount")) return "Engine Mounts";
  if (d.includes("wheel spacer") || d.includes("flush kit")) return "Wheel Spacers";
  if (d.includes("duct")) return "Duct";
  if (d.includes("airbox") || d.includes("intake")) return "Intake System";
  if (d.includes("cleaning kit")) return "Accessories";
  if (d.includes("filter")) return "Filter";
  return "Accessories";
}

async function downloadImage(session, url, destPath, force) {
  if (!force) {
    try {
      await fs.access(destPath);
      return "skipped";
    } catch {
      // fall through to download
    }
  }

  const res = await session.request(url);
  if (!res.ok) {
    console.warn(`  ! image not found: ${url}`);
    return "missing";
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buffer);
  return "downloaded";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

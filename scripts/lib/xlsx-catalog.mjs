import XLSX from "xlsx";

/**
 * Parses an Eventuri-style "brand catalogue" xlsx (a single sheet organised
 * as repeated sections: a MAKE header row, a MODEL/REFERENCE/DESCRIPTION/
 * FILTER TYPE/PRICE RRP header row, then data rows) into a
 * Map<reference (uppercased), Array<{ make, model, description, filterType, priceRRP }>>.
 *
 * A reference can appear more than once when a single part fits multiple
 * make/model combinations (e.g. a shared 4.0 TFSI intake fitting an Audi,
 * a Bentley and a Lamborghini).
 */
export function loadXlsxCatalog(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: "A", defval: "" });

  let currentMake = null;
  const map = new Map();

  for (const row of rows) {
    const model = String(row.B ?? "").trim();
    const reference = String(row.C ?? "").trim();
    const description = String(row.D ?? "").trim();
    const filterType = String(row.E ?? "").trim();
    const priceRRP = Number(row.F) || 0;

    if (!model && !reference && !description) continue;
    if (model === "MODEL" && reference === "REFERENCE") continue;

    if (!reference) {
      currentMake = model;
      continue;
    }

    const entry = {
      make: currentMake,
      model: model.replace(/\n/g, " / "),
      description,
      filterType,
      priceRRP,
    };

    const key = reference.toUpperCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
  }

  return map;
}

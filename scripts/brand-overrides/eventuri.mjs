/**
 * The Eventuri.xlsx catalogue supplied by the client is dated April 2024 and
 * is missing SKUs Eventuri has released since (new BMW G9X M5, G87 M2
 * scoops, Ferrari F12, etc). These were cross-referenced against Eventuri's
 * own site and authorised resellers so the storefront still gets a proper
 * name/fitment instead of falling back to the bare SKU.
 *
 * Shape matches xlsx-catalog.mjs entries: { make, model, description }.
 */
export const EVENTURI_OVERRIDES = {
  "EVE-G9X-CF-INT": [
    { make: "BMW", model: "G90 / G99 M5", description: "BMW G90/G99 M5 Black Carbon Intake System — Gloss Finish" },
  ],
  "EVE-G9X-CFM-INT": [
    { make: "BMW", model: "G90 / G99 M5", description: "BMW G90/G99 M5 Black Carbon Intake System — Matte Finish" },
  ],
  "EVE-G9X-CF-CHG": [
    { make: "BMW", model: "G90 / G99 M5", description: "BMW G90/G99 M5 Carbon Turbo Inlets — Gloss Finish" },
  ],
  "EVE-G9X-CFM-CHG": [
    { make: "BMW", model: "G90 / G99 M5", description: "BMW G90/G99 M5 Carbon Turbo Inlets — Matte Finish" },
  ],
  "EVE-G63AMG-CF-INT": [
    { make: "MERCEDES", model: "G63 AMG W463A / W464", description: "Mercedes-AMG G63 W463A/W464 Black Carbon Intake System" },
  ],
  "EVE-G63AMG-FTR": [
    { make: "MERCEDES", model: "G63 AMG W463A / W464", description: "Replacement Filter for Mercedes-AMG G63 W463A/W464 Intake" },
  ],
  "EVE-G63W465-CF-INT": [
    { make: "MERCEDES", model: "G63 AMG W465", description: "Mercedes-AMG G63 W465 Black Carbon Intake System" },
  ],
  "EVE-F6X-CF-INT": [
    { make: "MINI", model: "F65 / F66 / F67", description: "Mini F65/F66/F67 Cooper S / JCW Carbon Intake System" },
  ],
  "EVE-Z8-CF-INT": [{ make: "BMW", model: "Z8", description: "BMW Z8 Carbon Fibre Intake System" }],
  "EVE-X56M-LCI-CHG": [
    { make: "BMW", model: "F9X X5M / X6M LCI", description: "BMW F9X X5M/X6M Facelift Carbon Turbo Inlets" },
  ],
  "EVE-X56M-CHG": [
    { make: "BMW", model: "F9X X5M / X6M", description: "BMW F9X X5M/X6M Carbon Turbo Inlets" },
  ],
  "EVE-TRB8Y-LHD-NIL": [
    { make: "AUDI", model: "RS3 8Y", description: "Audi RS3 8Y LHD Carbon Turbo Inlet with No Flange" },
  ],
  "EVE-S58-CF-STR": [
    { make: "BMW", model: "G8X M2 / M3 / M4", description: "BMW G8X M2/M3/M4 CSL Carbon Strut Brace — Gloss Finish" },
  ],
  "EVE-S58-CFM-STR": [
    { make: "BMW", model: "G8X M2 / M3 / M4", description: "BMW G8X M2/M3/M4 CSL Carbon Strut Brace — Matte Finish" },
  ],
  "EVE-GR86-CF-INT": [{ make: "TOYOTA", model: "GR86", description: "Toyota GR86 Carbon Intake" }],
  "EVE-GR86-CF-ENG": [{ make: "TOYOTA", model: "GR86", description: "Toyota GR86 Carbon Engine Cover" }],
  "EVE-G8XM-CF-SC": [
    { make: "BMW", model: "G80 M3 / G82 M4", description: "BMW G8X M3/M4 Carbon Scoops — Gloss Finish" },
  ],
  "EVE-G8XM-CFM-SC": [
    { make: "BMW", model: "G80 M3 / G82 M4", description: "BMW G8X M3/M4 Carbon Scoops — Matte Finish" },
  ],
  "EVE-G87M2-CF-SC": [{ make: "BMW", model: "G87 M2", description: "BMW G87 M2 Carbon Scoops — Gloss Finish" }],
  "EVE-G87M2-CFM-SC": [{ make: "BMW", model: "G87 M2", description: "BMW G87 M2 Carbon Scoops — Matte Finish" }],
  "EVE-FX34M-V2-INT": [
    { make: "BMW", model: "F97 X3M / F98 X4M", description: "BMW F97 X3M/F98 X4M V2 Carbon Intake System" },
  ],
  "EVE-FLV8TT-CF-INT": [
    {
      make: "PORSCHE",
      model: "Cayenne Turbo / GTS / S (9YA / 9YB)",
      description: "4.0 TFSI Twin Turbo V8 Carbon Intake — 2025+ Facelift, Electronic Wastegate",
    },
    {
      make: "LAMBORGHINI",
      model: "Urus (2025+)",
      description: "4.0 TFSI Twin Turbo V8 Carbon Intake — 2025+ Facelift, Electronic Wastegate",
    },
  ],
  "EVE-F12-CF-INT": [{ make: "FERRARI", model: "F12 Berlinetta", description: "Ferrari F12 Berlinetta Carbon Intake System" }],
  "EVE-F12-FTR": [
    { make: "FERRARI", model: "F12 Berlinetta", description: "Replacement Filter for Ferrari F12 Berlinetta Intake" },
  ],
  "EVE-E46ABX-CF-INT": [
    { make: "BMW", model: "E46 M3", description: "BMW E46 M3 Hybrid Carbon Airbox with Full Carbon Intake" },
  ],
  "EVE-E46ABX-CF-PLM": [
    {
      make: "BMW",
      model: "E46 M3",
      description: "BMW E46 M3 Hybrid Carbon Airbox — Plenum Only, for Existing Eventuri Intake Owners",
    },
  ],
  "EVE-E39Z8-FTR": [
    { make: "BMW", model: "E39 M5", description: "Replacement Filter for BMW E39 M5 / Z8 Carbon Plenum" },
    { make: "BMW", model: "Z8", description: "Replacement Filter for BMW E39 M5 / Z8 Carbon Plenum" },
  ],
  "EVE-E36M3-CF-INT": [{ make: "BMW", model: "E36 M3", description: "BMW E36 M3 Carbon Intake" }],
  "EVE-CYNV6-CF-INT": [
    { make: "PORSCHE", model: "Cayenne V6", description: "Porsche Cayenne 3.0 V6 Turbo Carbon Intake (2018+)" },
  ],
  "EVE-B48A20-CF-INT": [
    {
      make: "BMW",
      model: "F70 M135 / F74 M235 / U10 X2 / U11 X1 M35i",
      description: "BMW F7X M135/M235, U1X X1/X2 M35i Carbon Intake System",
    },
  ],
  "EVE-4V8TT-TTE": [
    { make: "AUDI", model: "RS6 / RS7 C8", description: "4.0 TFSI Twin Turbo V8 TTE Hybrid Turbo Inlets" },
  ],
  "EVE-X5M50-CF-INT": [
    {
      make: "BMW",
      model: "G05 X5 / G06 X6 / G07 X7 M50i",
      description: "BMW G05/G06/G07 M50i Carbon Intake System",
    },
  ],
};

/**
 * A handful of references fit multiple unrelated platforms and read
 * awkwardly if we just reuse one fitment's description as the product name.
 * These give the shared part a clean, generic title instead.
 */
export const EVENTURI_NAME_OVERRIDES = {
  "EVE-4V8TT-CF-INT": "4.0 TFSI Twin Turbo V8 Carbon Intake",
  "EVE-2TFSI-CF-INT": "2.0 TFSI Carbon Intake",
  "EVE-EA8884-GTI-INT": "EA888.4 2.0 TFSI Carbon Intake",
  "EVE-EA8884-R-INT": "EA888.4 2.0 TFSI Carbon Intake — High Output",
  "EVE-FK8FK2-ENG": "FL5, FK8 & FK2 Carbon Engine Cover",
};

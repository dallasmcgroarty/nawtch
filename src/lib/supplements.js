import { dbGetAll, dbPut, dbDelete } from "./db.js";

// The saved-supplements catalog — parallel to CORE_ITEMS in items.js. The
// tracker page both manages this catalog and logs doses against it, so
// unlike Foods (split across foods.js/today.js) both live in one island.
export let SUPPLEMENT_ITEMS = [];

export async function loadSupplementItems() {
  let dbItems = [];
  try {
    dbItems = await dbGetAll("supplementitems");
  } catch (e) {
    dbItems = [];
  }
  SUPPLEMENT_ITEMS.length = 0;
  SUPPLEMENT_ITEMS.push(...dbItems);
}

export async function saveSupplementItem(item) {
  await dbPut("supplementitems", item);
}

export async function deleteSupplementItemFromDB(id) {
  await dbDelete("supplementitems", id);
}

// Static reference lists for the "known item" dropdown — never persisted,
// just used to populate the grouped <select> and auto-fill the name field.
// "Supplements" = the 14 existing dedicated Nawtch supplement pages + 17
// additional popular supplements with no dedicated page. "Approved
// Medications" = Tier 1 (FDA-approved) peptides only, cross-referenced
// against /supplements/peptides/ — Tier 2/3 peptides are deliberately never
// listed here.
export const KNOWN_SUPPLEMENTS = [
  { name: "Creatine" },
  { name: "Omega-3" },
  { name: "Electrolytes" },
  { name: "Protein" },
  { name: "Vitamin D" },
  { name: "Magnesium" },
  { name: "Caffeine" },
  { name: "Collagen" },
  { name: "Beta-Alanine" },
  { name: "Berberine" },
  { name: "Ashwagandha" },
  { name: "NAD/NMN" },
  { name: "Fiber" },
  { name: "Prebiotics/Probiotics" },
  { name: "Zinc" },
  { name: "Iron" },
  { name: "Vitamin B12" },
  { name: "Multivitamin" },
  { name: "L-Glutamine" },
  { name: "Turmeric/Curcumin" },
  { name: "Melatonin" },
  { name: "Fish Oil" },
  { name: "CoQ10" },
  { name: "L-Theanine" },
  { name: "ZMA" },
  { name: "Glucosamine" },
  { name: "Biotin" },
  { name: "Calcium" },
  { name: "Vitamin C" },
  { name: "NAC (N-Acetylcysteine)" },
  { name: "Rhodiola Rosea" },
];

export const KNOWN_MEDICATIONS = [
  { name: "Semaglutide" },
  { name: "Tirzepatide" },
  { name: "PT-141 (Bremelanotide)" },
  { name: "Orforglipron" },
  { name: "Tesamorelin" },
  { name: "Elamipretide (SS-31)" },
];

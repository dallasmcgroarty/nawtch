// Hand-picked "Related" links for supplement and peptide pages. Each page
// lists a few pages a reader is likely to want next: same drug class or
// mechanism, a common stack, or an approved alternative. Pairings are grounded
// in what the pages themselves discuss.
//
// RELATED is keyed by page path; values are paths in PAGES. Links don't have
// to be mutual. To add a page: add it to PAGES, then list it where it fits.

export const PAGES: Record<string, string> = {
  // Supplements
  '/supplements/ashwagandha/': 'Ashwagandha',
  '/supplements/berberine/': 'Berberine',
  '/supplements/beta-alanine/': 'Beta-Alanine',
  '/supplements/caffeine/': 'Caffeine',
  '/supplements/collagen/': 'Collagen',
  '/supplements/creatine/': 'Creatine',
  '/supplements/electrolytes/': 'Electrolytes',
  '/supplements/fiber/': 'Fiber',
  '/supplements/magnesium/': 'Magnesium',
  '/supplements/melatonin/': 'Melatonin',
  '/supplements/multivitamin/': 'Multivitamins',
  '/supplements/nad-nmn/': 'NAD+ / NMN',
  '/supplements/omega-3/': 'Omega-3 / Fish Oil',
  '/supplements/prebiotics-probiotics/': 'Prebiotics & Probiotics',
  '/supplements/protein/': 'Protein / Whey',
  '/supplements/vitamin-d/': 'Vitamin D',
  // Peptides
  '/supplements/peptides/amycretin/': 'Amycretin',
  '/supplements/peptides/aod-9604/': 'AOD-9604',
  '/supplements/peptides/bpc-157/': 'BPC-157',
  '/supplements/peptides/cagrisema/': 'CagriSema',
  '/supplements/peptides/cjc-1295/': 'CJC-1295',
  '/supplements/peptides/elamipretide/': 'Elamipretide',
  '/supplements/peptides/epithalon/': 'Epithalon',
  '/supplements/peptides/ghk-cu/': 'GHK-Cu',
  '/supplements/peptides/kisspeptin/': 'Kisspeptin',
  '/supplements/peptides/mazdutide/': 'Mazdutide',
  '/supplements/peptides/melanotan-ii/': 'Melanotan II',
  '/supplements/peptides/mitochondrial-peptides/': 'KPV, MOTS-c & Humanin',
  '/supplements/peptides/mk-677/': 'MK-677',
  '/supplements/peptides/orforglipron/': 'Orforglipron',
  '/supplements/peptides/pt-141/': 'PT-141',
  '/supplements/peptides/restricted-secretagogues/': 'GHRP-2 & GHRP-6',
  '/supplements/peptides/retatrutide/': 'Retatrutide',
  '/supplements/peptides/selank-semax/': 'Selank & Semax',
  '/supplements/peptides/semaglutide/': 'Semaglutide',
  '/supplements/peptides/sermorelin/': 'Sermorelin',
  '/supplements/peptides/survodutide/': 'Survodutide',
  '/supplements/peptides/tb-500/': 'TB-500',
  '/supplements/peptides/tesamorelin/': 'Tesamorelin',
  '/supplements/peptides/thymosin-alpha-1/': 'Thymosin Alpha-1',
  '/supplements/peptides/thymosin-beta-4/': 'Thymosin Beta-4',
  '/supplements/peptides/tirzepatide/': 'Tirzepatide',
  // Other sections linked from these pages
  '/diets/eating-on-glp-1/': 'Eating on GLP-1 Medications',
  '/diets/high-protein/': 'High-Protein Diet',
  '/calculators/one-rep-max/': 'One Rep Max Calculator',
  '/calculators/protein/': 'Protein Calculator',
};

const S = '/supplements/';
const P = '/supplements/peptides/';

export const RELATED: Record<string, string[]> = {
  // ── Supplements ──
  // Training
  [`${S}creatine/`]: [`${S}beta-alanine/`, `${S}protein/`, `${S}caffeine/`, '/calculators/one-rep-max/'],
  [`${S}beta-alanine/`]: [`${S}creatine/`, `${S}caffeine/`, `${S}protein/`],
  [`${S}protein/`]: [`${S}creatine/`, `${S}collagen/`, '/calculators/protein/', '/diets/high-protein/'],
  [`${S}collagen/`]: [`${S}protein/`, `${P}ghk-cu/`],
  [`${S}caffeine/`]: [`${S}creatine/`, `${S}beta-alanine/`, `${S}melatonin/`, `${S}magnesium/`],
  // Sleep and stress
  [`${S}melatonin/`]: [`${S}magnesium/`, `${S}caffeine/`, `${S}ashwagandha/`],
  [`${S}magnesium/`]: [`${S}melatonin/`, `${S}electrolytes/`, `${S}vitamin-d/`],
  [`${S}ashwagandha/`]: [`${S}melatonin/`, `${S}magnesium/`, `${P}selank-semax/`],
  // Micronutrients
  [`${S}electrolytes/`]: [`${S}magnesium/`],
  [`${S}vitamin-d/`]: [`${S}magnesium/`, `${S}omega-3/`, `${S}multivitamin/`],
  [`${S}omega-3/`]: [`${S}vitamin-d/`, `${S}multivitamin/`],
  [`${S}multivitamin/`]: [`${S}vitamin-d/`, `${S}omega-3/`, `${S}magnesium/`],
  // Gut and blood sugar
  [`${S}fiber/`]: [`${S}prebiotics-probiotics/`, `${S}berberine/`],
  [`${S}prebiotics-probiotics/`]: [`${S}fiber/`],
  [`${S}berberine/`]: [`${S}fiber/`, `${P}semaglutide/`],
  // Aging
  [`${S}nad-nmn/`]: [`${P}mitochondrial-peptides/`, `${P}elamipretide/`, `${P}epithalon/`],

  // ── Peptides ──
  // GLP-1 and related weight-loss drugs
  [`${P}semaglutide/`]: [`${P}tirzepatide/`, `${P}orforglipron/`, `${P}cagrisema/`, '/diets/eating-on-glp-1/'],
  [`${P}tirzepatide/`]: [`${P}semaglutide/`, `${P}retatrutide/`, `${P}mazdutide/`, '/diets/eating-on-glp-1/'],
  [`${P}orforglipron/`]: [`${P}semaglutide/`, `${P}tirzepatide/`, '/diets/eating-on-glp-1/'],
  [`${P}retatrutide/`]: [`${P}tirzepatide/`, `${P}survodutide/`, `${P}mazdutide/`, '/diets/eating-on-glp-1/'],
  [`${P}survodutide/`]: [`${P}mazdutide/`, `${P}retatrutide/`, `${P}semaglutide/`],
  [`${P}mazdutide/`]: [`${P}survodutide/`, `${P}retatrutide/`, `${P}tirzepatide/`],
  [`${P}cagrisema/`]: [`${P}semaglutide/`, `${P}amycretin/`, `${P}tirzepatide/`],
  [`${P}amycretin/`]: [`${P}cagrisema/`, `${P}semaglutide/`, `${P}retatrutide/`],
  [`${P}aod-9604/`]: [`${P}semaglutide/`, `${P}tirzepatide/`, `${P}tesamorelin/`],
  // Growth hormone axis
  [`${P}tesamorelin/`]: [`${P}sermorelin/`, `${P}cjc-1295/`, `${P}mk-677/`, `${P}aod-9604/`],
  [`${P}sermorelin/`]: [`${P}tesamorelin/`, `${P}cjc-1295/`, `${P}restricted-secretagogues/`],
  [`${P}cjc-1295/`]: [`${P}sermorelin/`, `${P}tesamorelin/`, `${P}restricted-secretagogues/`, `${P}mk-677/`],
  [`${P}mk-677/`]: [`${P}restricted-secretagogues/`, `${P}cjc-1295/`, `${P}sermorelin/`, `${P}aod-9604/`],
  [`${P}restricted-secretagogues/`]: [`${P}mk-677/`, `${P}cjc-1295/`, `${P}sermorelin/`],
  // Healing and repair
  [`${P}bpc-157/`]: [`${P}tb-500/`, `${P}thymosin-beta-4/`, `${P}ghk-cu/`],
  [`${P}tb-500/`]: [`${P}thymosin-beta-4/`, `${P}bpc-157/`, `${P}ghk-cu/`],
  [`${P}thymosin-beta-4/`]: [`${P}tb-500/`, `${P}bpc-157/`, `${P}thymosin-alpha-1/`],
  [`${P}ghk-cu/`]: [`${P}bpc-157/`, `${P}tb-500/`, `${S}collagen/`],
  // Immune
  [`${P}thymosin-alpha-1/`]: [`${P}thymosin-beta-4/`, `${P}mitochondrial-peptides/`],
  // Sexual health and melanocortin
  [`${P}pt-141/`]: [`${P}melanotan-ii/`, `${P}kisspeptin/`],
  [`${P}melanotan-ii/`]: [`${P}pt-141/`],
  [`${P}kisspeptin/`]: [`${P}pt-141/`],
  // Mitochondria and aging
  [`${P}elamipretide/`]: [`${P}mitochondrial-peptides/`, `${S}nad-nmn/`],
  [`${P}mitochondrial-peptides/`]: [`${P}elamipretide/`, `${P}epithalon/`, `${S}nad-nmn/`],
  [`${P}epithalon/`]: [`${P}mitochondrial-peptides/`, `${S}nad-nmn/`, `${P}elamipretide/`],
  // Nootropic
  [`${P}selank-semax/`]: [`${S}ashwagandha/`],
};

const GROUPS: [prefix: string, heading: string][] = [
  [P, 'Peptides'],
  [S, 'Supplements'],
  ['/diets/', 'Diets'],
  ['/calculators/', 'Calculators'],
];

// Related links for a page, grouped by section. Headings only show when a
// page links to more than one section.
export function relatedFor(path: string): { heading?: string; links: { href: string; label: string }[] }[] {
  const paths = RELATED[path] ?? [];
  for (const p of paths) {
    if (!PAGES[p]) throw new Error(`relatedPages: "${p}" (listed on ${path}) is missing from PAGES`);
  }
  const groups = GROUPS.map(([prefix, heading]) => ({
    heading,
    links: paths
      .filter((p) => p.startsWith(prefix) && GROUPS.find(([pre]) => p.startsWith(pre))?.[0] === prefix)
      .map((p) => ({ href: p, label: PAGES[p] })),
  })).filter((g) => g.links.length);
  return groups.length > 1 ? groups : groups.map((g) => ({ links: g.links }));
}

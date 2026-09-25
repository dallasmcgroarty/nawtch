// AdSense configuration. Manual ad units only (Auto ads should stay off in the
// AdSense dashboard so ads never appear outside these placements).
//
// Until ADS_LIVE is true, <AdSlot> renders hidden placeholder boxes instead of
// real ads. Preview them with `astro dev` (always on) or by adding
// ?adpreview=1 to any URL (?adpreview=0 turns it back off).

export const ADS_LIVE = false;

export const AD_CLIENT = 'ca-pub-9032766473005467';

// Ad unit IDs from AdSense → Ads → By ad unit. One unit per position (not per
// page) so reporting shows which positions perform.
export const AD_UNITS = {
  'rail': '',        // desktop right rail, 160×600, fixed beside the 900px column
  'in-article': '',  // between sections of long-form content
  'after-tool': '',  // below a calculator/tool, clear of its inputs and results; 728×90 / 320×100 mobile
  'page-bottom': '', // end of page content, above the legal footer; 728×90 / 320×100 mobile
} as const;

export type AdPlacement = keyof typeof AD_UNITS;

// Per-page ad level, set via BaseLayout's `ads` prop:
//   full — right rail (desktop) + page-bottom + any in-content <AdSlot>s
//   rail — right rail only (tracker screens, legal pages)
//   none — no ads at all (404, Tier 2/3 peptides, peptides hub)
export type AdLevel = 'full' | 'rail' | 'none';

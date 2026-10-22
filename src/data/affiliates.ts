// Affiliate picks — every product link Nawtch shows lives here, so links,
// copy, and sources can be reviewed in one place (same idea as ads.ts and
// relatedPages.ts). Pages place a pick with <AffiliatePick id="…" />.
//
// Each entry has a `source`. A resolver per source turns the entry into the
// same normalized shape the component renders, so a new affiliate service
// only needs a new resolver, not component changes.
//
// Rules for anything added here:
// - Only products we'd actually recommend on that page. Any "personally used"
//   or "reviewed" claim in the copy must be true.
// - No picks on peptide pages.
// - Amazon: links must carry our Associates tag. Product images and prices
//   may only come from Amazon's own tools (SiteStripe or the Product
//   Advertising API), never copied from product pages. Prices are not shown.
// - When the first Amazon pick goes live, add Amazon's required statement
//   ("As an Amazon Associate, Nawtch earns from qualifying purchases.") to
//   the site footer and a note about affiliate links to the Privacy Policy.

export type AffiliateSource = 'manual' | 'amazon';

export interface AffiliateImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

// What the component renders, whatever the source.
export interface ResolvedPick {
  href: string;
  title: string;
  description?: string;
  image?: AffiliateImage;
  source: AffiliateSource;
  disclosure: string; // tooltip text behind the "Affiliate link ⓘ" label
}

interface BaseEntry {
  title: string;
  description?: string;
  image?: AffiliateImage;
  disclosure?: string; // overrides the default tooltip text
}

// Any affiliate program where we paste the tracking URL and write the copy.
export interface ManualEntry extends BaseEntry {
  source: 'manual';
  href: string;
  program?: string; // e.g. 'Impact', 'Awin', 'Brand direct' (for our records)
}

// Amazon Associates. The link is built from the ASIN and our tag.
// Title, description, and image are entered manually for now (image via
// SiteStripe). Once Product Advertising API access is earned, a build-time
// lookup can fill or refresh these from the ASIN; see resolveAmazon().
export interface AmazonEntry extends BaseEntry {
  source: 'amazon';
  asin: string;
}

export type AffiliateEntry = ManualEntry | AmazonEntry;

// Our Amazon Associates tracking ID (e.g. "nawtch-20"). Empty until approved;
// Amazon picks fail the build while it's empty so an untagged link can't ship.
export const AMAZON_ASSOCIATE_TAG = '';

const DEFAULT_DISCLOSURE = 'Nawtch earns a small commission if you buy through this link, at no extra cost to you.';
const AMAZON_DISCLOSURE = `${DEFAULT_DISCLOSURE} As an Amazon Associate, Nawtch earns from qualifying purchases.`;

export const AFFILIATES: Record<string, AffiliateEntry> = {
  // Example entries (keep commented out until real, reviewed picks exist):
  //
  // 'food-scale-example': {
  //   source: 'amazon',
  //   asin: 'B000000000',
  //   title: 'Example Kitchen Scale',
  //   description: 'Weighs to 1 g. Tare button for bowls and plates.',
  //   image: { src: 'https://m.media-amazon.com/images/I/….jpg', alt: 'Example kitchen scale' },
  // },
  // 'hr-strap-example': {
  //   source: 'manual',
  //   program: 'Brand direct',
  //   href: 'https://brand.example/product?ref=nawtch',
  //   title: 'Example Heart Rate Strap',
  //   description: 'Chest strap that pairs with most watches and apps.',
  // },
};

function resolveManual(e: ManualEntry): ResolvedPick {
  return {
    href: e.href,
    title: e.title,
    description: e.description,
    image: e.image,
    source: 'manual',
    disclosure: e.disclosure ?? DEFAULT_DISCLOSURE,
  };
}

function resolveAmazon(e: AmazonEntry, id: string): ResolvedPick {
  if (!AMAZON_ASSOCIATE_TAG) {
    throw new Error(`Affiliate pick "${id}" is an Amazon link but AMAZON_ASSOCIATE_TAG is empty in src/data/affiliates.ts`);
  }
  if (!/^[A-Z0-9]{10}$/.test(e.asin)) {
    throw new Error(`Affiliate pick "${id}" has an invalid ASIN: "${e.asin}"`);
  }
  // Future: when PA-API access exists, look up e.asin here at build time and
  // use its title/image (cache the response so builds don't depend on the API).
  return {
    href: `https://www.amazon.com/dp/${e.asin}?tag=${encodeURIComponent(AMAZON_ASSOCIATE_TAG)}`,
    title: e.title,
    description: e.description,
    image: e.image,
    source: 'amazon',
    disclosure: e.disclosure ?? AMAZON_DISCLOSURE,
  };
}

// Add a case here when a new affiliate service needs its own handling.
export function resolveEntry(entry: AffiliateEntry, id = 'inline'): ResolvedPick {
  switch (entry.source) {
    case 'manual':
      return resolveManual(entry);
    case 'amazon':
      return resolveAmazon(entry, id);
  }
}

export function resolveAffiliate(id: string): ResolvedPick {
  const entry = AFFILIATES[id];
  if (!entry) throw new Error(`Affiliate pick "${id}" is not defined in src/data/affiliates.ts`);
  return resolveEntry(entry, id);
}

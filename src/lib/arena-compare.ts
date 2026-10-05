// Build-time helpers for Diet Arena pair pages. Everything here is pure and
// deterministic: the same pair always produces the same text, but phrasing is
// varied across pairs by hashing the pair slug.
import type { Diet, DietTag } from '../data/diets';

// ---------------------------------------------------------------- utilities

function hash(str: string): number {
  // FNV-1a, 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(options: T[], key: string): T {
  return options[hash(key) % options.length];
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

const has = (d: Diet, t: DietTag) => d.attrs.tags.includes(t);
const nm = (d: Diet) => d.shortName;

// ---------------------------------------------------------------- descriptors

const ANIMAL_RANK = { excluded: 0, limited: 1, included: 2, central: 3 } as const;
const EVIDENCE_RANK = { minimal: 0, limited: 1, moderate: 2, strong: 3 } as const;

function animalDesc(d: Diet): string {
  if (has(d, 'excludes-plant-foods')) return 'eats only animal foods';
  switch (d.attrs.animalProducts) {
    case 'central':
      return 'is built around meat, fish, and eggs';
    case 'included':
      return has(d, 'no-food-rules')
        ? 'puts no limits on animal foods'
        : 'includes animal foods such as fish, poultry, eggs, or dairy';
    case 'limited':
      return 'keeps meat to an occasional role';
    case 'excluded':
      return 'minimizes or fully excludes animal products';
  }
}
function animalHook(d: Diet): string {
  if (has(d, 'excludes-plant-foods')) return 'eats only animal foods';
  return {
    central: 'centers on meat, fish, and eggs',
    included: 'includes animal foods',
    limited: 'keeps meat occasional',
    excluded: 'minimizes or excludes animal products',
  }[d.attrs.animalProducts];
}

function strictDesc(d: Diet): string {
  switch (d.attrs.restrictiveness) {
    case 1:
      return 'sets few hard rules and bans nothing outright';
    case 2:
      return d.attrs.eatingWindow
        ? 'restricts timing rather than banning any food'
        : 'works through targets and limits rather than food-group bans';
    case 3:
      return has(d, 'phased-elimination')
        ? 'restricts several food groups for a set period, then adds them back'
        : 'cuts out or sharply limits whole food groups';
    case 4:
      return 'removes every plant food';
  }
}
function strictHook(d: Diet): string {
  return {
    1: 'bans nothing outright',
    2: d.attrs.eatingWindow ? 'restricts timing, not foods' : 'uses targets, not bans',
    3: has(d, 'phased-elimination') ? 'restricts food groups for a set period' : 'cuts whole food groups',
    4: 'removes all plant foods',
  }[d.attrs.restrictiveness];
}

function carbDesc(d: Diet): string {
  if (d.attrs.carbs === 'low') {
    return has(d, 'emphasizes-fat')
      ? 'keeps carbohydrates very low and gets most of its calories from fat'
      : 'keeps carbohydrates very low';
  }
  return d.attrs.carbs === 'moderate' ? 'allows a moderate amount of carbohydrate' : 'sets no carb target';
}
function carbHook(d: Diet): string {
  return { low: 'keeps carbs very low', moderate: 'allows moderate carbs', unspecified: 'sets no carb target' }[
    d.attrs.carbs
  ];
}

function evidenceDesc(d: Diet): string {
  return {
    strong: 'has strong evidence behind it, including large randomized trials',
    moderate: 'has a moderate evidence base',
    limited: 'rests on limited evidence',
    minimal: 'has almost no clinical research behind it',
  }[d.attrs.evidence];
}
function evidenceHook(d: Diet): string {
  return {
    strong: 'has strong trial evidence',
    moderate: 'has moderate evidence',
    limited: 'has limited evidence',
    minimal: 'has almost no research',
  }[d.attrs.evidence];
}

function calorieHow(d: Diet): string {
  if (has(d, 'low-energy-density')) return 'lowers calories by favoring foods with fewer calories per bite';
  if (has(d, 'tracks-numbers')) return 'sets daily calorie and macro targets';
  if (d.attrs.eatingWindow) return 'cuts calories through fasting periods or reduced-calorie days';
  return 'is designed to lower calorie intake';
}
function calorieHook(d: Diet): string {
  if (has(d, 'low-energy-density')) return 'favors low-calorie-density foods';
  if (has(d, 'tracks-numbers')) return 'sets calorie and macro targets';
  if (d.attrs.eatingWindow) return 'uses fasting periods';
  return 'manages calories directly';
}

// Food-group stances: -2 cuts out, -1 limits, 0 no rule, +1 builds meals around.
const GROUPS: { key: string; noun: string; excl?: DietTag; lim?: DietTag; emph?: DietTag }[] = [
  { key: 'grains', noun: 'grains', excl: 'excludes-grains', lim: 'limits-grains', emph: 'emphasizes-whole-grains' },
  { key: 'legumes', noun: 'beans and lentils', excl: 'excludes-legumes', lim: 'limits-legumes', emph: 'emphasizes-legumes' },
  { key: 'dairy', noun: 'dairy', excl: 'excludes-dairy', lim: 'limits-dairy' },
  { key: 'sugar', noun: 'added sugar', excl: 'excludes-added-sugar', lim: 'limits-added-sugar' },
];
function stance(d: Diet, g: (typeof GROUPS)[number]): number {
  if (g.excl && has(d, g.excl)) return -2;
  if (g.lim && has(d, g.lim)) return -1;
  if (g.emph && has(d, g.emph)) return 1;
  return 0;
}
const VERB: Record<number, string> = { [-2]: 'cuts out', [-1]: 'limits', 0: 'has no set rule on', 1: 'builds meals around' };
// Rules first, then emphasis, then "no set rule".
const VERB_ORDER = [-2, -1, 1, 0];

function groupPhrase(d: Diet, groups: (typeof GROUPS)[number][]): string {
  const byVerb = new Map<number, string[]>();
  for (const g of groups) {
    const s = stance(d, g);
    const noun = s === 1 && g.key === 'grains' ? 'whole grains' : g.noun;
    byVerb.set(s, [...(byVerb.get(s) ?? []), noun]);
  }
  const parts = [...byVerb.entries()].sort((a, b) => VERB_ORDER.indexOf(a[0]) - VERB_ORDER.indexOf(b[0])).map(([s, nouns]) => `${VERB[s]} ${listJoin(nouns)}`);
  // Each part may already contain "and", so separate parts with a comma.
  return parts.length === 2 ? `${parts[0]}, and ${parts[1]}` : listJoin(parts);
}

// ---------------------------------------------------------------- differences

export interface Difference {
  key: string;
  score: number;
  text: string;
  hook: string; // short "A ...; B ..." clause for the meta description
}

export function keyDifferences(a: Diet, b: Diet, pair: string): Difference[] {
  const out: Difference[] = [];
  const v = (k: string) => `${pair}:${k}`;
  const hookOf = (x: Diet, hx: string, y: Diet, hy: string) => `${nm(x)} ${hx}; ${nm(y)} ${hy}`;

  // Animal products
  {
    const gap = Math.abs(ANIMAL_RANK[a.attrs.animalProducts] - ANIMAL_RANK[b.attrs.animalProducts]);
    const plantsGap = has(a, 'excludes-plant-foods') !== has(b, 'excludes-plant-foods') ? 1 : 0;
    if (gap + plantsGap > 0) {
      const [hi, lo] = ANIMAL_RANK[a.attrs.animalProducts] >= ANIMAL_RANK[b.attrs.animalProducts] ? [a, b] : [b, a];
      const H = animalDesc(hi), L = animalDesc(lo);
      out.push({
        key: 'animal',
        score: (gap + plantsGap) * 3,
        text: pick(
          [
            `${nm(hi)} ${H}, while ${nm(lo)} ${L}.`,
            `The biggest split is animal foods. ${nm(hi)} ${H}; ${nm(lo)} ${L}.`,
            `On animal foods they sit far apart: ${nm(lo)} ${L}, whereas ${nm(hi)} ${H}.`,
          ],
          v('animal'),
        ),
        hook: hookOf(hi, animalHook(hi), lo, animalHook(lo)),
      });
    }
  }

  // Restrictiveness
  {
    const gap = Math.abs(a.attrs.restrictiveness - b.attrs.restrictiveness);
    if (gap > 0) {
      const [hi, lo] = a.attrs.restrictiveness > b.attrs.restrictiveness ? [a, b] : [b, a];
      const H = strictDesc(hi), L = strictDesc(lo);
      out.push({
        key: 'strict',
        score: gap * 2.5,
        text: pick(
          [
            `${nm(hi)} ${H}. ${nm(lo)}, by contrast, ${L}.`,
            `They differ a lot in strictness. ${nm(lo)} ${L}, while ${nm(hi)} ${H}.`,
            `How strict is each? ${nm(hi)} ${H}, and ${nm(lo)} ${L}.`,
          ],
          v('strict'),
        ),
        hook: hookOf(hi, strictHook(hi), lo, strictHook(lo)),
      });
    }
  }

  // Carbohydrate stance (only "low" versus the rest is a real contrast)
  if ((a.attrs.carbs === 'low') !== (b.attrs.carbs === 'low')) {
    const [low, other] = a.attrs.carbs === 'low' ? [a, b] : [b, a];
    const L = carbDesc(low), O = carbDesc(other);
    out.push({
      key: 'carbs',
      score: other.attrs.carbs === 'moderate' ? 4 : 3,
      text: pick(
        [
          `${nm(low)} ${L}, while ${nm(other)} ${O}.`,
          `Carbs are a clear dividing line: ${nm(low)} ${L}, and ${nm(other)} ${O}.`,
          `Where ${nm(other)} ${O}, ${nm(low)} ${L}.`,
        ],
        v('carbs'),
      ),
      hook: hookOf(low, carbHook(low), other, carbHook(other)),
    });
  }

  // Evidence
  {
    const gap = Math.abs(EVIDENCE_RANK[a.attrs.evidence] - EVIDENCE_RANK[b.attrs.evidence]);
    if (gap > 0) {
      const [hi, lo] = EVIDENCE_RANK[a.attrs.evidence] > EVIDENCE_RANK[b.attrs.evidence] ? [a, b] : [b, a];
      const H = evidenceDesc(hi), L = evidenceDesc(lo);
      out.push({
        key: 'evidence',
        score: gap * 2,
        text: pick(
          [
            `The research behind them differs: ${nm(hi)} ${H}, while ${nm(lo)} ${L}.`,
            `${nm(lo)} ${L}. ${nm(hi)} ${H}.`,
            `On evidence, ${nm(lo)} ${L}, compared with ${nm(hi)}, which ${H}.`,
          ],
          v('evidence'),
        ),
        hook: hookOf(hi, evidenceHook(hi), lo, evidenceHook(lo)),
      });
    }
  }

  // Eating window
  if (a.attrs.eatingWindow !== b.attrs.eatingWindow) {
    const [t, f] = a.attrs.eatingWindow ? [a, b] : [b, a];
    out.push({
      key: 'window',
      score: 5,
      text: pick(
        [
          `${nm(t)} is defined by when you eat, using fasting windows or fasting days. ${nm(f)} has no timing rules at all.`,
          `Timing is the main split. ${nm(t)} restricts when you eat, while ${nm(f)} only shapes what you eat.`,
          `${nm(f)} has no rules about when to eat, whereas ${nm(t)} is built entirely around eating windows and fasting periods.`,
        ],
        v('window'),
      ),
      hook: hookOf(t, 'restricts when you eat', f, 'has no timing rules'),
    });
  }

  // Sodium
  if (a.attrs.sodiumFocus !== b.attrs.sodiumFocus) {
    const [t, f] = a.attrs.sodiumFocus ? [a, b] : [b, a];
    out.push({
      key: 'sodium',
      score: 4,
      text: pick(
        [
          `${nm(t)} sets a daily sodium limit; ${nm(f)} has no sodium target.`,
          `Only ${nm(t)} caps sodium, which means cooking from scratch and reading labels more often than ${nm(f)} asks.`,
          `${nm(f)} doesn't address sodium, while ${nm(t)} makes a daily sodium limit one of its core rules.`,
        ],
        v('sodium'),
      ),
      hook: hookOf(t, 'caps daily sodium', f, 'sets no sodium limit'),
    });
  }

  // Calorie mechanism
  if (a.attrs.calorieMechanism !== b.attrs.calorieMechanism) {
    const [t, f] = a.attrs.calorieMechanism ? [a, b] : [b, a];
    out.push({
      key: 'calories',
      score: 3.5,
      text: pick(
        [
          `${nm(t)} ${calorieHow(t)}, while ${nm(f)} has no calorie target of its own.`,
          `${nm(f)} doesn't ask you to manage calories directly. ${nm(t)} does: it ${calorieHow(t)}.`,
          `One works on calories and one doesn't. ${nm(t)} ${calorieHow(t)}, and ${nm(f)} leaves calories alone.`,
        ],
        v('calories'),
      ),
      hook: hookOf(t, calorieHook(t), f, 'has no calorie target'),
    });
  }

  // Medical context
  if (a.attrs.medicalContext !== b.attrs.medicalContext) {
    const [t, f] = a.attrs.medicalContext ? [a, b] : [b, a];
    const focus = t.attrs.medicalFocus ?? 'a medical purpose';
    out.push({
      key: 'medical',
      score: 4.5,
      text: pick(
        [
          `${nm(t)} was designed for ${focus}; ${nm(f)} isn't built around a specific medical condition.`,
          `${nm(t)} has a medical purpose (${focus}), while ${nm(f)} is a general eating pattern.`,
          `${nm(f)} is a general eating pattern, whereas ${nm(t)} was designed for ${focus}.`,
        ],
        v('medical'),
      ),
      hook: hookOf(t, `is built for ${focus}`, f, 'is a general eating pattern'),
    });
  } else if (a.attrs.medicalContext && b.attrs.medicalContext) {
    out.push({
      key: 'medical',
      score: 4,
      text: pick(
        [
          `Both have a medical purpose, but different ones: ${nm(a)} was designed for ${a.attrs.medicalFocus}, and ${nm(b)} for ${b.attrs.medicalFocus}.`,
          `${nm(a)} was designed for ${a.attrs.medicalFocus}, while ${nm(b)} was designed for ${b.attrs.medicalFocus}.`,
        ],
        v('medical'),
      ),
      hook: hookOf(a, `is built for ${a.attrs.medicalFocus}`, b, `is built for ${b.attrs.medicalFocus}`),
    });
  }

  // Food-group rules (grains, legumes, dairy, added sugar), combined into one sentence
  {
    const differing = GROUPS.filter((g) => Math.abs(stance(a, g) - stance(b, g)) >= 2);
    if (differing.length) {
      const gapSum = differing.reduce((s, g) => s + Math.abs(stance(a, g) - stance(b, g)), 0);
      const strictness = (d: Diet) => differing.reduce((s, g) => s + stance(d, g), 0);
      const [x, y] = strictness(a) <= strictness(b) ? [a, b] : [b, a];
      const X = groupPhrase(x, differing), Y = groupPhrase(y, differing);
      out.push({
        key: 'groups',
        score: Math.min(gapSum * 1.2, 7),
        text: pick(
          [
            `${nm(x)} ${X}, while ${nm(y)} ${Y}.`,
            `The food lists differ: ${nm(y)} ${Y}, but ${nm(x)} ${X}.`,
            `Look at the shopping list and the gap is clear. ${nm(x)} ${X}; ${nm(y)} ${Y}.`,
          ],
          v('groups'),
        ),
        hook: `${nm(x)} ${groupPhrase(x, differing.slice(0, 1))}; ${nm(y)} ${groupPhrase(y, differing.slice(0, 1))}`,
      });
    }
  }

  // Single-tag themes
  const themes: { key: string; tag: DietTag; weight: number; on: string; off: string; hookOn: string; hookOff: string }[] = [
    {
      key: 'phased',
      tag: 'phased-elimination',
      weight: 3,
      on: 'runs in phases, with a strict elimination period followed by reintroduction',
      off: 'is meant to be followed without set phases',
      hookOn: 'runs in elimination and reintroduction phases',
      hookOff: 'has no set phases',
    },
    {
      key: 'tracking',
      tag: 'tracks-numbers',
      weight: 2,
      on: 'involves tracking numbers such as grams, servings, or carbs',
      off: 'needs no counting',
      hookOn: 'involves tracking numbers',
      hookOff: 'needs no counting',
    },
    {
      key: 'protein',
      tag: 'emphasizes-protein',
      weight: 1.5,
      on: 'puts protein at the center of meals',
      off: 'does not single out protein',
      hookOn: 'puts protein first',
      hookOff: 'sets no protein focus',
    },
    {
      key: 'density',
      tag: 'low-energy-density',
      weight: 2,
      on: 'sorts food by calories per gram',
      off: 'does not use energy density',
      hookOn: 'sorts food by calorie density',
      hookOff: 'ignores calorie density',
    },
  ];
  for (const th of themes) {
    if (has(a, th.tag) === has(b, th.tag)) continue;
    // Skip themes already implied by a stronger dimension.
    if (th.key === 'density' && out.some((d) => d.key === 'calories')) continue;
    const [t, f] = has(a, th.tag) ? [a, b] : [b, a];
    out.push({
      key: th.key,
      score: th.weight,
      text: pick(
        [
          `${nm(t)} ${th.on}, while ${nm(f)} ${th.off}.`,
          `${nm(f)} ${th.off}. ${nm(t)}, on the other hand, ${th.on}.`,
        ],
        v(th.key),
      ),
      hook: hookOf(t, th.hookOn, f, th.hookOff),
    });
  }

  // Highest scores first; ties keep the fixed insertion order above.
  return out
    .map((d, i) => ({ d, i }))
    .sort((p, q) => q.d.score - p.d.score || p.i - q.i)
    .map((p) => p.d)
    .filter((d) => d.score >= 2)
    .slice(0, 4);
}

// ---------------------------------------------------------------- shared ground

const EMPHASIS: [DietTag, string][] = [
  ['emphasizes-vegetables', 'vegetables'],
  ['emphasizes-fruit', 'fruit'],
  ['emphasizes-whole-grains', 'whole grains'],
  ['emphasizes-legumes', 'beans and lentils'],
  ['emphasizes-nuts-seeds', 'nuts and seeds'],
  ['emphasizes-fish', 'fish'],
  ['emphasizes-olive-oil', 'olive oil'],
  ['emphasizes-protein', 'protein'],
];
const LIMITS: [DietTag, string][] = [
  ['limits-red-meat', 'red meat'],
  ['limits-added-sugar', 'added sugar'],
  ['limits-processed-food', 'processed food'],
  ['limits-dairy', 'dairy'],
  ['limits-fruit', 'high-sugar fruit'],
  ['limits-alcohol', 'alcohol'],
];
const EXCLUDES: [DietTag, string][] = [
  ['excludes-grains', 'grains'],
  ['excludes-legumes', 'legumes'],
  ['excludes-dairy', 'dairy'],
  ['excludes-added-sugar', 'added sugar'],
  ['excludes-processed-food', 'processed food'],
  ['excludes-alcohol', 'alcohol'],
];

export function sharedGround(a: Diet, b: Diet, pair: string): { text: string; count: number } {
  const both = (t: DietTag) => has(a, t) && has(b, t);
  const emph = EMPHASIS.filter(([t]) => both(t)).map(([, n]) => n);
  const excl = EXCLUDES.filter(([t]) => both(t)).map(([, n]) => n);
  const lim = LIMITS.filter(([t]) => both(t)).map(([, n]) => n).filter((n) => !excl.includes(n));
  const extra: string[] = [];

  if (a.attrs.restrictiveness === 1 && b.attrs.restrictiveness === 1)
    extra.push(pick(['Neither bans any food outright.', 'Neither one bans a food outright.'], `${pair}:noban`));
  if (a.attrs.carbs === 'low' && b.attrs.carbs === 'low') extra.push('Both keep carbohydrates very low.');
  if (both('plant-forward')) extra.push(pick(['Both are plant-forward.', 'Both lean plant-forward.'], `${pair}:pf`));
  if (both('tracks-numbers')) extra.push('Both involve some tracking of numbers.');
  if (both('phased-elimination')) extra.push('Both run in phases, with elimination followed by reintroduction.');
  if (a.attrs.calorieMechanism && b.attrs.calorieMechanism) extra.push('Both work by managing calorie intake directly.');
  if (a.attrs.medicalContext && b.attrs.medicalContext) extra.push('Both were designed with a medical purpose in mind.');
  if (a.attrs.evidence === b.attrs.evidence && a.attrs.evidence === 'strong')
    extra.push('Both are backed by strong trial evidence.');

  const sentences: string[] = [];
  if (emph.length)
    sentences.push(
      pick(
        [
          `Both build meals around ${listJoin(emph)}.`,
          `${cap(listJoin(emph))} ${emph.length > 1 || /s$/.test(emph[0]) ? 'are' : 'is'} staples in both.`,
          `Both lean on ${listJoin(emph)}.`,
        ],
        `${pair}:emph`,
      ),
    );
  if (excl.length) sentences.push(`Both cut out ${listJoin(excl)}.`);
  if (lim.length)
    sentences.push(pick([`Both limit ${listJoin(lim)}.`, `They also share limits on ${listJoin(lim)}.`], `${pair}:lim`));
  sentences.push(...extra);

  const count = emph.length + excl.length + lim.length + extra.length;
  if (count === 0)
    return {
      text: 'These two have very little in common. Their core rules don’t overlap in any meaningful way.',
      count,
    };
  if (count === 1) return { text: `Common ground is thin. ${sentences[0]}`, count };
  return { text: sentences.slice(0, 4).join(' '), count };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------- metadata

export function pairTitle(a: Diet, b: Diet): string {
  const options = [
    `${nm(a)} vs ${nm(b)}: Diet Comparison | Nawtch`,
    `${nm(a)} vs ${nm(b)} Diets | Nawtch`,
    `${nm(a)} vs ${nm(b)} | Nawtch`,
  ];
  return options.find((t) => t.length <= 60) ?? options[options.length - 1];
}

export function pairDescription(a: Diet, b: Diet, diffs: Difference[]): string {
  const suffixes = [' Compare foods, rules, and evidence.', ' Compare them side by side.', ''];
  for (const d of diffs) {
    for (const s of suffixes) {
      const text = `${d.hook}.${s}`;
      if (text.length <= 150) return text;
    }
  }
  return `Compare ${nm(a)} and ${nm(b)}: foods, rules, evidence, and practical tradeoffs.`;
}

export function pairMeta(a: Diet, b: Diet) {
  const pair = `${a.slug}-vs-${b.slug}`;
  const differences = keyDifferences(a, b, pair);
  return { pair, differences, title: pairTitle(a, b), description: pairDescription(a, b, differences) };
}

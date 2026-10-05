export interface Diet {
  slug: string;
  name: string;
  shortName: string;
  shortDescription: string;
  typicalFoods: string;
  foodsToAvoid: string;
  eatingPattern: string;
  primaryGoal: string;
  bestFor: string;
  macroEmphasis: string;
  healthConditionRelevance: string;
  evidenceStrength: string;
  restrictiveness: string;
  costAccessibility: string;
  nutrientsToWatch: string;
  adjustmentPeriod: string;
  sampleDay: string;
  prepAndEatingOut: string;
  cautionGroups: string;
  adherenceAndStopping: string;
  attrs: DietAttrs;
  url: string;
}

// Normalized attributes used by the Diet Arena to compute pair-specific
// "Key differences" and "What they share" sections (src/lib/arena-compare.ts).
// Values are judgment calls grounded in the same research as the text fields.
export type DietTag =
  | 'excludes-grains'
  | 'limits-grains'
  | 'emphasizes-whole-grains'
  | 'emphasizes-legumes'
  | 'excludes-legumes'
  | 'limits-legumes'
  | 'limits-dairy'
  | 'excludes-dairy'
  | 'excludes-added-sugar'
  | 'limits-added-sugar'
  | 'emphasizes-fish'
  | 'emphasizes-vegetables'
  | 'emphasizes-fruit'
  | 'limits-fruit'
  | 'emphasizes-nuts-seeds'
  | 'emphasizes-olive-oil'
  | 'limits-red-meat'
  | 'emphasizes-protein'
  | 'emphasizes-fat'
  | 'limits-processed-food'
  | 'excludes-processed-food'
  | 'excludes-plant-foods'
  | 'excludes-alcohol'
  | 'limits-alcohol'
  | 'no-food-rules'
  | 'phased-elimination'
  | 'tracks-numbers'
  | 'timed-eating'
  | 'plant-forward'
  | 'low-energy-density';

export interface DietAttrs {
  /** 1 = few hard rules, 4 = removes an entire kingdom of food. */
  restrictiveness: 1 | 2 | 3 | 4;
  evidence: 'strong' | 'moderate' | 'limited' | 'minimal';
  eatingWindow: boolean;
  animalProducts: 'central' | 'included' | 'limited' | 'excluded';
  carbs: 'low' | 'moderate' | 'unspecified';
  sodiumFocus: boolean;
  /** The diet's own rules work by lowering calorie intake. */
  calorieMechanism: boolean;
  /** Designed for a medical condition or medication context. */
  medicalContext: boolean;
  /** Short phrase naming that context, used in generated sentences. */
  medicalFocus?: string;
  tags: DietTag[];
}

export const DIETS: Diet[] = [
  {
    slug: 'mediterranean',
    name: 'Mediterranean Diet',
    shortName: 'Mediterranean',
    shortDescription:
      'An eating pattern modeled on traditional Mediterranean-country diets — vegetables, fruit, whole grains, legumes, nuts, and olive oil as the main fat, with fish regularly and red meat/sweets only occasionally. Not a fixed rulebook or weight-loss program.',
    typicalFoods:
      'Vegetables, fruit, legumes, whole grains, nuts and seeds, extra-virgin olive oil, fatty fish (sardines, salmon, mackerel), herbs; eggs, poultry, and dairy in moderation.',
    foodsToAvoid:
      'Red and processed meat, butter/margarine, refined grains, sugary drinks, packaged sweets, highly processed snacks — limited, not banned outright.',
    eatingPattern: 'No specific eating window — a food-quality framework, not a timed or calorie-counted plan.',
    primaryGoal: 'Cardiovascular and metabolic health.',
    bestFor:
      'People focused on long-term heart/metabolic health who want a flexible, food-based pattern over strict rules or tracking.',
    macroEmphasis: 'None built in — no calorie counting or macro ratio; total calories still determine weight change.',
    healthConditionRelevance:
      'Cardiovascular disease, stroke, type 2 diabetes risk, all-cause mortality (PREDIMED trial and large cohort evidence).',
    evidenceStrength:
      'Strong — one of the most rigorously studied diets in nutrition science, with decades of randomized-trial and cohort evidence.',
    restrictiveness: 'Low — not a rulebook with hard limits, food-quality guidance rather than exclusions.',
    costAccessibility: 'May be less practical for tight food budgets or limited access to fresh produce and fish.',
    nutrientsToWatch:
      'No consistent gaps are documented, and closer adherence is linked to better overall nutrient intake. In one trial, vitamin B12 and calcium intake dipped compared with participants’ usual diets.',
    adjustmentPeriod:
      'Few side effects are reported. Eating more beans and fiber can cause gas or bloating in the first week or so, and this varies a lot from person to person.',
    sampleDay:
      'Breakfast: plain Greek yogurt with berries and walnuts. Lunch: lentil and vegetable soup, whole-grain bread, and a salad with olive oil. Dinner: baked salmon or sardines with roasted vegetables and farro. Snack: an orange and a few almonds.',
    prepAndEatingOut:
      'Moderate cooking, mostly vegetables, legumes, and fish, with no special products or tracking. Easy to eat out, since nothing is banned and Mediterranean-style dishes are common.',
    cautionGroups:
      'People on warfarin should keep leafy-green intake steady, since vitamin K affects the drug. During pregnancy and for children, choose lower-mercury fish. Wine is optional, and people who don’t drink are advised not to start.',
    adherenceAndStopping:
      'Adherence holds up well in trials. In one two-year trial comparing three diets, about 85% of all participants were still following their assigned diet at two years. Little is known about what happens after people stop, beyond the general pattern of regain after any diet ends.',
    attrs: {
      restrictiveness: 1,
      evidence: 'strong',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'moderate',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['emphasizes-whole-grains', 'emphasizes-legumes', 'emphasizes-fish', 'emphasizes-vegetables', 'emphasizes-fruit', 'emphasizes-nuts-seeds', 'emphasizes-olive-oil', 'limits-red-meat', 'limits-added-sugar', 'limits-processed-food', 'plant-forward'],
    },
    url: '/diets/mediterranean/',
  },
  {
    slug: 'dash',
    name: 'DASH Diet',
    shortName: 'DASH',
    shortDescription:
      'An NIH-developed eating pattern built specifically to lower blood pressure, using serving-based targets across food groups plus a sodium limit rather than food bans.',
    typicalFoods:
      'Vegetables, fruits, whole grains, low-fat/fat-free dairy, lean protein (poultry, fish), nuts/seeds/legumes a few times a week — defined daily serving counts.',
    foodsToAvoid:
      'Table salt/high-sodium foods, cured and deli meats, canned soups, fatty meats, full-fat dairy, sugary drinks, sweets. Limited by serving count, not excluded outright.',
    eatingPattern:
      'No specific eating window — serving-count structure (6–8 grains, 4–5 vegetables, 4–5 fruits, 2–3 dairy servings/day, etc.) plus a 2,300mg (or 1,500mg) sodium target, based on a 2,000 kcal reference diet.',
    primaryGoal: 'Lower blood pressure.',
    bestFor:
      'People with hypertension, prehypertension, or elevated cardiovascular risk who want a produce-and-whole-grain pattern with RCT evidence behind the blood-pressure claim.',
    macroEmphasis: 'None — no calorie-restriction or macro-ratio mechanism of its own.',
    healthConditionRelevance:
      'Hypertension/prehypertension, cardiovascular risk; secondary cohort evidence for lower kidney stone risk.',
    evidenceStrength:
      'Strong — an NIH-developed clinical intervention, with controlled feeding trials (original 1997 trial, DASH-Sodium) through large long-term cohorts.',
    restrictiveness:
      'Moderate — works through serving-based targets and a sodium ceiling rather than food bans, but hitting the sodium target usually means cooking more from scratch.',
    costAccessibility:
      'Fresh produce plus lean protein can raise grocery cost and prep time versus processed staples; dairy servings may not suit anyone lactose-intolerant or vegan without substitution.',
    nutrientsToWatch:
      'No gaps are documented. The plan is built to be rich in potassium, calcium, magnesium, and fiber. People who are lactose intolerant may need lactose-free dairy or lactase pills to reach the dairy servings.',
    adjustmentPeriod:
      'Blood pressure starts falling within about a week. The higher fiber intake can cause bloating at first, so the standard advice is to add servings gradually.',
    sampleDay:
      'Breakfast: bran flakes with a banana and low-fat milk, plus whole-wheat toast. Lunch: chicken salad on whole-wheat bread with a cucumber and tomato salad. Dinner: lean roast beef, green beans, and a small baked potato. Snack: unsalted nuts with raisins, or fat-free yogurt.',
    prepAndEatingOut:
      'Moderate to high prep. Meeting the sodium target usually means cooking from scratch and choosing low-sodium products. Eating out is possible, but restaurant meals make the sodium limit hard to hit.',
    cautionGroups:
      'People with chronic kidney disease, chronic liver disease, or taking ACE inhibitors or ARBs should check with a clinician first, because of the diet’s high potassium and phosphorus. Heart failure, uncontrolled type 2 diabetes, lactose intolerance, and celiac disease may call for a modified version. Warfarin users should keep leafy-green intake steady.',
    adherenceAndStopping:
      'With structured support, people kept their improved eating habits for 18 months in one large trial. Without support, adherence is low: fewer than 1 in 5 U.S. adults with high blood pressure eat in line with DASH. No study has measured what happens to blood pressure after people stop.',
    attrs: {
      restrictiveness: 2,
      evidence: 'strong',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'moderate',
      sodiumFocus: true,
      calorieMechanism: false,
      medicalContext: true,
      medicalFocus: 'lowering blood pressure',
      tags: ['emphasizes-whole-grains', 'emphasizes-vegetables', 'emphasizes-fruit', 'emphasizes-nuts-seeds', 'emphasizes-legumes', 'limits-added-sugar', 'limits-processed-food', 'tracks-numbers'],
    },
    url: '/diets/dash/',
  },
  {
    slug: 'intermittent-fasting',
    name: 'Intermittent Fasting',
    shortName: 'Intermittent Fasting',
    shortDescription:
      'Cycles eating and fasting periods rather than restricting which foods you eat; several distinct protocols (16:8, 5:2, alternate-day, Eat-Stop-Eat) share the same when-not-what approach.',
    typicalFoods:
      'No food-type restriction — any foods within the eating window/days; water, black coffee, or plain tea during fasting hours.',
    foodsToAvoid: 'None specifically — timing, not food type, is restricted.',
    eatingPattern:
      'Defines the diet: 16:8 daily time-restricted eating window, 5:2 (two lower-calorie days/week), alternate-day fasting, or Eat-Stop-Eat (one or two full 24-hour fasts/week).',
    primaryGoal: 'Weight loss / metabolic health via changing meal timing rather than food choice.',
    bestFor:
      'People who find a fixed eating window easier to sustain than counting every meal, or who naturally skip breakfast anyway.',
    macroEmphasis: 'None specified — only timing is restricted, not macro ratios.',
    healthConditionRelevance:
      'Some improvements in insulin sensitivity, blood pressure, and cholesterol in certain trials; no advantage shown over plain calorie restriction in several recent RCTs.',
    evidenceStrength:
      'Mixed. Weight loss is broadly comparable to calorie restriction. The TREAT trial found no advantage for 16:8 eating over regular meal timing, and a 2022 NEJM trial found no added benefit over calorie restriction alone. A 2025 BMJ meta-analysis found a small edge for alternate-day fasting, mostly in shorter trials.',
    restrictiveness:
      'Moderate — no food is off-limits, but timing has to be maintained; not recommended without medical supervision for disordered-eating history, pregnancy, type 1 diabetes, or children.',
    costAccessibility: 'No special foods required — flexible and affordable, since only timing changes.',
    nutrientsToWatch:
      'Not studied. No specific nutrient gaps have been linked to fasting itself. Nutrient intake depends on what is eaten during the eating window or on non-fasting days.',
    adjustmentPeriod:
      'Hunger is the most common complaint, especially in the evening. Trials found no higher rates of fatigue or headache than with control diets. Some people report stress around meal timing.',
    sampleDay:
      'Breakfast: none, since the eating window opens at noon (water, black coffee, or plain tea only). Lunch: turkey and vegetable wrap and an apple. Snack: Greek yogurt and nuts. Dinner, before 8 p.m.: chicken or tofu stir-fry with brown rice.',
    prepAndEatingOut:
      'Low prep, since no special foods are needed. Social fit is mixed. Restaurant food works inside the eating window, but fasting hours and fasting days can clash with shared breakfasts or late dinners.',
    cautionGroups:
      'People with diabetes on glucose-lowering medication face a higher risk of low blood sugar on fasting days and need a clinician to adjust doses. Safety in pregnancy and in people with a history of disordered eating has not been studied. In young people, fasting has been linked with eating-disorder symptoms.',
    adherenceAndStopping:
      'Dropout varies by method. In one year-long trial, alternate-day fasting had the highest dropout, 38%, and people often ate more than planned on fast days. Weight loss ends up similar to plain calorie restriction. No trial has followed people after they stop.',
    attrs: {
      restrictiveness: 2,
      evidence: 'moderate',
      eatingWindow: true,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: true,
      medicalContext: false,
      tags: ['timed-eating', 'no-food-rules'],
    },
    url: '/diets/intermittent-fasting/',
  },
  {
    slug: 'keto',
    name: 'Ketogenic (Keto) Diet',
    shortName: 'Keto',
    shortDescription:
      'A very-low-carbohydrate, high-fat eating pattern (roughly 70–80% fat, 10–20% protein, 5–10% carb) that shifts metabolism into ketosis; originally a clinical epilepsy treatment, now popularly used for weight loss.',
    typicalFoods:
      'Olive and avocado oil, butter, fatty fish (salmon, sardines), eggs, cheese, nuts and seeds, avocado, poultry and beef, low-carb vegetables (leafy greens, broccoli, cauliflower, zucchini, peppers).',
    foodsToAvoid: 'Bread, rice, pasta, cereal, sugar and sweets, most fruit, potatoes, corn, legumes, most milk.',
    eatingPattern: 'No specific eating window — defined by macro ratios, not meal timing.',
    primaryGoal: 'Weight loss / ketosis-driven metabolic shift (clinically, epilepsy management).',
    bestFor:
      'People who do well with firm food-category rules and don’t mind cutting out entire food groups, more than people wanting a flexible, indefinitely sustainable pattern.',
    macroEmphasis: 'Very high fat (70–80%), low protein (10–20%), very low carb (5–10%, roughly 20–50g net carbs/day).',
    healthConditionRelevance:
      'Originally developed for drug-resistant epilepsy (still in clinical use); not recommended without medical guidance for pancreatitis, liver or gallbladder disease, certain kidney conditions, pregnancy, or insulin/SGLT2-inhibitor use.',
    evidenceStrength:
      'Limited long-term advantage. Meta-analyses show short-term benefits similar to other calorie-restricted diets but no clear long-term edge, with real adherence and safety caveats: LDL increases in some people, and dropout as high as 54% in some trials.',
    restrictiveness: 'High — cuts entire food groups; trial dropout reached over half of participants in some studies.',
    costAccessibility:
      "Cost varies widely depending on execution: built on everyday meat, eggs, and vegetables it's comparably priced to a standard diet, but relying on specialty low-carb products like keto bread, pasta, or meal-replacement shakes adds a substantial premium over the same diet made with whole foods.",
    nutrientsToWatch:
      'Fiber, thiamin, folate, magnesium, iron, and vitamin C tend to fall, since grains, legumes, and most fruit are cut. Intake of vitamin B12, vitamin D, and selenium tends to rise.',
    adjustmentPeriod:
      'Many people report “keto flu” in the first week: headache, fatigue, nausea, dizziness, and brain fog. Reports usually fade within a few days to four weeks. Blood sugar can also drop quickly at the start.',
    sampleDay:
      'Breakfast: eggs scrambled in butter with spinach, and avocado. Lunch: salmon on leafy greens with olive oil, cucumber, and feta. Dinner: chicken thighs with roasted broccoli and cauliflower. Snack: a few macadamia nuts and some cheese.',
    prepAndEatingOut:
      'Moderate prep, mostly cooking from whole foods and checking carbs. Eating out is harder, since bread, rice, pasta, most desserts, and many sauces are off the table.',
    cautionGroups:
      'People taking SGLT2 inhibitors should not start it without a clinician, because the combination can cause ketoacidosis. People on insulin or sulfonylureas need medication changes from day one. Also talk to a clinician first with pancreatitis, liver, gallbladder, or kidney disease, familial high cholesterol, pregnancy, or a history of disordered eating. LDL cholesterol tends to rise.',
    adherenceAndStopping:
      'Dropout is high, reaching about half of the keto group in some trials. Over a year or more, weight loss is only about 1 kg more than low-fat diets. In one trial, people drifted back toward higher-carb eating once meals were no longer provided.',
    attrs: {
      restrictiveness: 3,
      evidence: 'moderate',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'low',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['excludes-grains', 'excludes-legumes', 'limits-fruit', 'excludes-added-sugar', 'tracks-numbers', 'emphasizes-fat', 'emphasizes-nuts-seeds'],
    },
    url: '/diets/keto/',
  },
  {
    slug: 'plant-based',
    name: 'Plant-Based & Vegan Diets',
    shortName: 'Plant-Based',
    shortDescription:
      'Related but distinct patterns built around minimizing (plant-based) or fully excluding (vegan) animal products, centering whole plant foods like fruits, vegetables, legumes, whole grains, nuts, and seeds.',
    typicalFoods:
      'Legumes, tofu, tempeh, seitan, whole grains, nuts and seeds; the vegan version fully excludes meat, poultry, seafood, dairy, eggs, and honey.',
    foodsToAvoid:
      'Vegan: all animal-derived foods and ingredients. Plant-based (looser): minimizes but doesn’t require full exclusion of meat, dairy, or eggs.',
    eatingPattern: 'No specific eating window.',
    primaryGoal: 'Cardiometabolic health, often alongside environmental or ethical motivations.',
    bestFor:
      'People motivated by environmental or ethical concerns, or by the cardiometabolic risk reduction the research points to, who are willing to plan meals rather than eat on autopilot.',
    macroEmphasis: 'None specified — food-group based, not macro-ratio based.',
    healthConditionRelevance:
      'Lower BMI, lower rates of type 2 diabetes and heart disease, and lower all-cause mortality in large cohort studies — concentrated in “healthful” plant-based patterns, not ones built on refined carbs and sugar.',
    evidenceStrength:
      'Strong cohort evidence (e.g. Adventist Health Study-2, ~73,000 people) though observational rather than randomized for the core mortality/disease claims.',
    restrictiveness:
      'Variable — plant-based is low restrictiveness (a spectrum, no full exclusion); vegan is high (full animal-product exclusion).',
    costAccessibility:
      "Generally less expensive overall than a meat- and dairy-centered diet, since savings from cutting meat and dairy tend to outweigh the added cost of vegetables, whole grains, and plant-based meat substitutes, though reliable access to fresh produce remains a real barrier in areas with limited grocery options.",
    nutrientsToWatch:
      'Vitamin B12 is the main one for vegans, and it needs fortified foods or a supplement. Iodine, calcium, zinc, selenium, vitamin D, and omega-3s also need planning. Planned well, vegan diets can meet adult nutrient needs.',
    adjustmentPeriod:
      'More beans often means more gas at first, though fewer than half of people report it in the first week. No adjustment timeline has been studied.',
    sampleDay:
      'Breakfast: oatmeal made with fortified soy milk, ground flax, and berries. Lunch: chickpea and quinoa salad with vegetables, tahini, and pumpkin seeds. Dinner: tofu or tempeh stir-fry with broccoli over brown rice. Snack: hummus with carrots. Plus a B12 supplement or fortified foods.',
    prepAndEatingOut:
      'Moderate prep, with planning for protein variety and fortified foods. Plant-based eating is easy at restaurants. Strict vegan eating is harder, since animal ingredients hide in many dishes.',
    cautionGroups:
      'Children on vegan diets need careful planning, since studies show shorter height and lower iron and B12 status. Pregnant and breastfeeding people need a reliable B12 source and should ask about omega-3s. One large study found higher hip fracture risk in vegans. Warfarin users should keep leafy-green intake steady.',
    adherenceAndStopping:
      'In a six-month trial, people stuck with a vegan diet about as well as with other diets, and the vegan group lost the most weight. In a 74-week trial in type 2 diabetes, weight loss held up as well as on a standard diabetes diet. No trial has tracked what happens after people stop.',
    attrs: {
      restrictiveness: 3,
      evidence: 'moderate',
      eatingWindow: false,
      animalProducts: 'excluded',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['plant-forward', 'emphasizes-legumes', 'emphasizes-whole-grains', 'emphasizes-vegetables', 'emphasizes-fruit', 'emphasizes-nuts-seeds', 'limits-dairy'],
    },
    url: '/diets/plant-based/',
  },
  {
    slug: 'flexitarian',
    name: 'Flexitarian Diet',
    shortName: 'Flexitarian',
    shortDescription:
      'A plant-forward, semi-vegetarian pattern where most meals center on vegetables, whole grains, and plant protein, with meat treated as an occasional addition rather than a daily staple.',
    typicalFoods:
      'Vegetables, fruit, whole grains (oats, quinoa, brown rice), legumes (lentils, chickpeas, black beans), tofu and tempeh, nuts and seeds; meat a few times a week in smaller portions.',
    foodsToAvoid: 'None banned outright — no macro targets, calorie counts, or banned foods; just a general shift toward plants.',
    eatingPattern: 'No specific eating window.',
    primaryGoal: 'General health via a mostly-plant balance without eliminating meat entirely.',
    bestFor:
      'People wanting some of the cardiometabolic benefit of plant-forward eating without eliminating meat — useful for shared households, social eating, or anyone who finds full vegetarian/vegan too restrictive.',
    macroEmphasis: 'None — no macro targets or calorie counts.',
    healthConditionRelevance:
      'In the Adventist Health Study-2, semi-vegetarians (meat no more than once a week) had significantly lower odds of type 2 diabetes in a cross-sectional analysis, while their lower mortality did not reach statistical significance. Benefits look more modest than stricter vegetarian or vegan patterns.',
    evidenceStrength:
      'Limited. Evidence comes mainly from observational semi-vegetarian subgroups and a review describing it as emerging; trials are small and short. It also has a U.S. News expert-panel top ranking, which is not a clinical trial result.',
    restrictiveness: 'Low — no fixed rules, less structure than plans with explicit food lists or macro targets.',
    costAccessibility:
      "Flexible and generally affordable since it's built on standard grocery staples (legumes, whole grains, produce) without requiring specialty or processed meat-substitute products.",
    nutrientsToWatch:
      'Few studies exist. One survey found semi-vegetarians generally had better diet quality than meat eaters, without the calcium shortfalls seen in vegans.',
    adjustmentPeriod:
      'Little is known. The main reported issue is gas from eating more beans, which fewer than half of people notice in the first week.',
    sampleDay:
      'Breakfast: whole-grain toast with peanut butter and banana. Lunch: black bean and vegetable burrito bowl with brown rice. Dinner: lentil curry, or on a meat night a small chicken portion with vegetables and quinoa. Snack: fruit and a handful of nuts.',
    prepAndEatingOut:
      'Low to moderate prep. Very easy socially, since nothing is banned and meat is still an option when eating out or at shared meals.',
    cautionGroups:
      'No flexitarian-specific cautions have been published. Warfarin users should keep leafy-green intake steady as vegetable intake rises.',
    adherenceAndStopping:
      'In a six-month trial, a semi-vegetarian diet was as easy to stick with as vegan, vegetarian, or omnivore diets, with weight loss similar to omnivores. Nothing is known beyond six months or after people stop.',
    attrs: {
      restrictiveness: 1,
      evidence: 'limited',
      eatingWindow: false,
      animalProducts: 'limited',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['plant-forward', 'emphasizes-legumes', 'emphasizes-vegetables', 'emphasizes-whole-grains', 'emphasizes-fruit', 'emphasizes-nuts-seeds', 'limits-red-meat'],
    },
    url: '/diets/flexitarian/',
  },
  {
    slug: 'paleo',
    name: 'Paleo Diet',
    shortName: 'Paleo',
    shortDescription:
      'Modeled on a presumed hunter-gatherer eating pattern — lean meats, fish, fruit, vegetables, nuts and seeds — excluding grains, legumes, dairy, refined sugar, and processed foods.',
    typicalFoods:
      'Grass-fed beef, chicken, wild-caught salmon, eggs, almonds, walnuts, pumpkin seeds, berries, apples, leafy greens, broccoli, sweet potatoes (some versions restrict starchy tubers), olive oil, avocado.',
    foodsToAvoid:
      'Wheat bread and pasta, rice, oats, beans and lentils, peanuts, milk, cheese and yogurt, table sugar, chips, and packaged snacks.',
    eatingPattern: 'No specific eating window — restricts food categories, not calories, macros, or timing.',
    primaryGoal: 'General health by cutting processed foods, added sugar, and refined carbs, modeled on ancestral eating.',
    bestFor:
      'People who feel or perform better cutting out processed foods, added sugar, and refined carbs generally, regardless of whether the ancestral framing itself holds up.',
    macroEmphasis: 'None specified — restricts food categories, not macro ratios.',
    healthConditionRelevance:
      'Modest improvements in glucose tolerance (small RCT in people with ischemic heart disease), weight, waist circumference, blood pressure, and lipids in a meta-analysis — evidence the study authors themselves call “not conclusive.”',
    evidenceStrength:
      'Limited. Real but thinner and shorter-term than Mediterranean or DASH. A key supporting meta-analysis carries a published expression of concern, benefits in a two-year trial faded over time, and the “one ancestral diet” premise has been challenged. A 2026 meta-analysis was more favorable.',
    restrictiveness: 'High — restricts entire food categories (grains, legumes, dairy) rather than counting anything.',
    costAccessibility: 'Paleo-compliant meat, fish, nuts, and produce typically cost more than the grain, legume, and dairy staples it excludes.',
    nutrientsToWatch:
      'Iodine and calcium. Paleo cuts dairy and often table salt, two major iodine sources, and one two-year trial found iodine levels fell by about half. Calcium intake was lower in a short trial. Resistant starch, a type of fiber, also tends to be lower.',
    adjustmentPeriod:
      'One short trial found more diarrhea in the paleo group in the first month. People also report that the restrictions are hard to keep up. No adaptation timeline has been studied.',
    sampleDay:
      'Breakfast: eggs scrambled in olive oil with spinach and peppers, plus berries. Lunch: salmon on leafy greens with avocado and lemon. Dinner: grilled chicken thighs with roasted broccoli, carrots, and squash. Snack: an apple and a few walnuts.',
    prepAndEatingOut:
      'Moderate to high prep, since most packaged foods are out. Grocery cost is a common complaint: in one trial, about 7 in 10 people on paleo said cost was a concern. Eating out is moderately hard, as many dishes include bread, rice, dairy, or legumes.',
    cautionGroups:
      'Pregnant and breastfeeding people should watch iodine, since cutting dairy raises the risk of low intake. People with kidney disease should check protein intake with a clinician, since high-protein versions can exceed kidney guidance. People on diabetes medication should talk to a clinician, as research in diabetes is small and short.',
    adherenceAndStopping:
      'Real-world adherence is low. In a year-long study where people chose their own diet, only about a third of paleo followers were still on it at 12 months, fewer than for Mediterranean or intermittent fasting. In a two-year trial, early fat-loss advantages faded. No study follows people after they stop.',
    attrs: {
      restrictiveness: 3,
      evidence: 'limited',
      eatingWindow: false,
      animalProducts: 'central',
      carbs: 'moderate',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['excludes-grains', 'excludes-legumes', 'excludes-dairy', 'excludes-added-sugar', 'excludes-processed-food', 'emphasizes-protein', 'emphasizes-vegetables', 'emphasizes-fruit', 'emphasizes-nuts-seeds'],
    },
    url: '/diets/paleo/',
  },
  {
    slug: 'mind',
    name: 'MIND Diet',
    shortName: 'MIND',
    shortDescription:
      'A hybrid of the Mediterranean and DASH diets, built specifically around brain health, scored on 15 food components with extra emphasis on berries and leafy greens.',
    typicalFoods:
      'Green leafy vegetables (six or more servings a week), other vegetables, nuts, berries (especially blueberries), beans and legumes, whole grains, fish, poultry, olive oil, and wine in moderation.',
    foodsToAvoid: 'Red meat, butter and stick margarine, cheese, pastries and sweets, fried or fast food (the 5 components to limit).',
    eatingPattern: 'No specific eating window — scored on 15 food components, not timing.',
    primaryGoal: 'Long-term brain and cognitive health (Alzheimer’s disease risk).',
    bestFor:
      'People prioritizing long-term brain and cognitive health who want a sustainable, food-based pattern close to Mediterranean or DASH but with a sharper berries-and-greens focus.',
    macroEmphasis: 'None specified.',
    healthConditionRelevance: 'Cognitive decline / Alzheimer’s disease risk — its primary, purpose-built focus.',
    evidenceStrength:
      'Mixed — the original 2015 cohort found 53% lower Alzheimer’s risk (top vs. bottom adherence tertile), but the one major randomized trial (NEJM 2023) found no significant cognitive advantage over a calorie-controlled control diet over 3 years, directly complicating the earlier finding.',
    restrictiveness: 'Low-to-moderate — food-component scoring rather than hard rules, similar structure to Mediterranean/DASH.',
    costAccessibility:
      "Costs more than a standard mixed diet given its reliance on berries, fish, olive oil, and nuts, similar in price to Mediterranean and DASH, and for households on a fixed or limited food budget, may exceed what's practical to sustain long-term.",
    nutrientsToWatch:
      'Not studied. No research has measured nutrient gaps on MIND. In its main trial, blood carotenoid levels rose, a sign of higher fruit and vegetable intake.',
    adjustmentPeriod:
      'Little is known. In a three-year trial, side effects were no more common than on the control diet. Beans more than three times a week may cause some gas at first.',
    sampleDay:
      'Breakfast: oatmeal with blueberries and walnuts. Lunch: leafy-green salad with chickpeas and tomatoes, dressed with olive oil. Dinner: baked salmon or chicken with brown rice and roasted vegetables. Snack: a small handful of almonds.',
    prepAndEatingOut:
      'Moderate prep, with daily vegetables, whole grains, and regular beans and fish. Eating out is fairly easy, since the diet sets limits rather than bans.',
    cautionGroups:
      'Wine is part of the original scoring, but people who don’t drink are advised not to start. Warfarin users should keep leafy-green intake steady. The research was done in older adults, so there is no specific guidance for pregnancy or children.',
    adherenceAndStopping:
      'In a three-year trial, 93% of participants finished, and diet scores improved within six months and stayed there. Participants were given some foods and dietitian support, so real-world adherence is unknown. Nothing is known about what happens after people stop.',
    attrs: {
      restrictiveness: 2,
      evidence: 'moderate',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'moderate',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['emphasizes-whole-grains', 'emphasizes-legumes', 'emphasizes-vegetables', 'emphasizes-nuts-seeds', 'emphasizes-olive-oil', 'emphasizes-fish', 'limits-red-meat', 'limits-dairy', 'limits-added-sugar', 'limits-processed-food', 'plant-forward'],
    },
    url: '/diets/mind/',
  },
  {
    slug: 'whole30',
    name: 'Whole30',
    shortName: 'Whole30',
    shortDescription:
      'A strict, time-limited 30-day elimination-and-reintroduction program designed to reveal personal food sensitivities — a short-term self-experiment, not a long-term diet.',
    typicalFoods:
      'Chicken, beef, pork, fish, shellfish, eggs; all vegetables and fruit; compliant fats (olive oil, coconut oil, avocado, ghee); some nuts and seeds (not peanuts).',
    foodsToAvoid:
      'Added sugar (real and artificial), alcohol (even in cooking), grains, most legumes including peanuts and soy (green beans and most peas are allowed), and dairy (ghee is an exception). The “Pancake Rule” also bans baked goods, chips, and fries made from compliant ingredients.',
    eatingPattern:
      'Strictly time-boxed: 30 days of elimination, then foods reintroduced one group at a time over a minimum 10-day period.',
    primaryGoal: 'Self-experiment/reset to identify personal food sensitivities, not weight loss or long-term eating.',
    bestFor: 'People who want a short, structured reset with a built-in process for identifying personal food sensitivities.',
    macroEmphasis: 'None — no macro or calorie structure, only an exclusion list.',
    healthConditionRelevance: 'None specific — framed around identifying personal food sensitivities generally, not any named condition.',
    evidenceStrength:
      'Limited: no independent clinical trials — only an unpublished, non-peer-reviewed company pilot cohort (~45 participants) plus self-reported alumni surveys. Cleveland Clinic calls it “an experiment,” not an evidence-backed treatment.',
    restrictiveness: 'High — strict, time-limited elimination of multiple food groups at once.',
    costAccessibility:
      'Relies heavily on compliant packaged condiments, dressings, and marinades that typically cost noticeably more than standard equivalents, though cutting alcohol, takeout, and processed snacks for the 30 days can offset some of that premium.',
    nutrientsToWatch:
      'Not studied. No research has measured nutrient intake on Whole30. Cutting dairy and grains removes common sources of calcium and fiber for the 30 days.',
    adjustmentPeriod:
      'Not independently studied. The program itself says the first one to two weeks can be hard, with cravings and digestive changes, and that the elimination phase can trigger binge eating in some people.',
    sampleDay:
      'Breakfast: eggs cooked in ghee with peppers, spinach, and half an avocado. Lunch: grilled chicken on greens with olive oil and vinegar. Dinner: pan-seared salmon, a baked sweet potato, and green beans. Snack: an apple and a few almonds.',
    prepAndEatingOut:
      'High prep. Nearly everything is cooked from scratch, and sauces and condiments need label checks for hidden sugar or soy. Eating out is hard during the 30 days, since alcohol, sugar, grains, dairy, and soy sauce are common in restaurant food.',
    cautionGroups:
      'The program itself says it is not recommended for anyone with a history of disordered eating. Its plant-based version is not recommended during pregnancy, breastfeeding, or for young children. People on prescription medication should talk to a clinician first; the program says medical advice comes before its rules.',
    adherenceAndStopping:
      'Not studied. No adherence or follow-up data exist. By design, the 30 days are followed by at least 10 days of reintroduction, adding back one food group at a time with two to three days of elimination in between.',
    attrs: {
      restrictiveness: 3,
      evidence: 'minimal',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['excludes-grains', 'excludes-legumes', 'excludes-dairy', 'excludes-added-sugar', 'limits-processed-food', 'phased-elimination', 'emphasizes-vegetables', 'excludes-alcohol'],
    },
    url: '/diets/whole30/',
  },
  {
    slug: 'flexible-dieting',
    name: 'Flexible Dieting (IIFYM)',
    shortName: 'IIFYM',
    shortDescription:
      'Built around hitting daily protein, carb, and fat gram targets (and usually total calories) rather than following a fixed list of allowed or forbidden foods — nothing is categorically off-limits.',
    typicalFoods: 'Any foods that fit the day’s remaining macro and calorie targets — no specific food list.',
    foodsToAvoid: 'None categorically banned — the only requirement is hitting daily macro/calorie targets.',
    eatingPattern: 'No specific eating window — organized around daily macro/calorie totals, not timing.',
    primaryGoal: 'Hit daily protein/carb/fat and calorie targets with maximum food flexibility.',
    bestFor: 'People who do well with structure-light, numbers-based tracking and want the social and travel flexibility of no off-limits foods.',
    macroEmphasis: 'Defined entirely by protein/carb/fat gram targets and usually total calories — the core organizing principle of the diet.',
    healthConditionRelevance:
      "Research comparing flexible and rigid approaches to dietary restraint has generally linked flexible, non-black-and-white eating rules to lower rates of binge eating and disordered-eating symptoms than strict, all-or-nothing dieting, though findings aren't fully consistent across studies. The approach is also widely used in physique and bodybuilding contest prep, valued as a way to hit macro targets without the psychological rigidity of a fixed 'clean eating' list. Macro tracking is not the same thing as flexible restraint, though, and hitting exact numbers every day can itself become rigid.",
    evidenceStrength:
      'Limited. One small RCT (23 people, about 40% dropout) tested macro-based “IIFYM” dieting by name. Most other support comes from the related but distinct flexible-versus-rigid dietary restraint research, which is mostly correlational.',
    restrictiveness: 'Low — no food is off-limits, but requires consistent daily tracking to work.',
    costAccessibility: 'Flexible and affordable in principle since no specialty foods are required, though the diet says nothing about fiber, vitamins, minerals, or protein quality.',
    nutrientsToWatch:
      'Not studied. The approach sets only protein, carb, fat, and calorie targets. It says nothing about fiber, vitamins, or minerals, so food quality is up to the individual.',
    adjustmentPeriod:
      'Not studied. The main reported challenge is psychological: hitting exact macro numbers every day can become rigid for some people.',
    sampleDay:
      'Breakfast: a bagel with two eggs and cheese. Lunch: chicken burrito bowl with rice, black beans, and salsa. Dinner: pasta with lean beef tomato sauce and a side salad. Snack: Greek yogurt with granola, or ice cream if it fits the day’s numbers.',
    prepAndEatingOut:
      'Low cooking burden, but weighing and logging food every day is the main time cost. Socially flexible, since nothing is banned, though restaurant meals are hard to log accurately.',
    cautionGroups:
      'People with a history of disordered eating should be cautious. Many people being treated for eating disorders say food-tracking apps made their condition worse, although trials in low-risk groups found no harm. People with kidney disease should check protein targets with a clinician.',
    adherenceAndStopping:
      'Evidence is thin. In the only trial, about 40% of participants dropped out over 10 weeks, similar to a rigid meal plan. Research links flexible eating attitudes with less binge eating and better weight outcomes, but that is not the same as macro tracking. Not studied after people stop.',
    attrs: {
      restrictiveness: 2,
      evidence: 'limited',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: true,
      medicalContext: false,
      tags: ['tracks-numbers', 'no-food-rules', 'emphasizes-protein'],
    },
    url: '/diets/flexible-dieting/',
  },
  {
    slug: 'volumetrics',
    name: 'Volumetrics',
    shortName: 'Volumetrics',
    shortDescription:
      'Organizes eating around a food’s energy density (calories per gram) rather than restricting any food group — building meals around lower-density, water- and fiber-rich foods to feel full on fewer calories.',
    typicalFoods:
      'Very-low-density: broth-based soups, non-starchy vegetables, most fruit. Low-density: starchy vegetables, whole grains, legumes, low-fat dairy, lean protein — the everyday staples.',
    foodsToAvoid: 'None eliminated — higher-density foods (nuts, seeds, dried fruit, oils and butter, chips, chocolate, cookies) are enjoyed in smaller amounts, not banned.',
    eatingPattern: 'No specific eating window — organized around food energy density, not timing.',
    primaryGoal: 'Weight loss via increased fullness/satiety per calorie.',
    bestFor: 'People who find restriction-based dieting hard to sustain because they end up hungry, and who like understanding the “why” behind a recommendation.',
    macroEmphasis: 'None — organized around energy density (calories per gram), not macro ratios.',
    healthConditionRelevance: 'Not tied to a specific health condition — a general weight-loss/satiety focus.',
    evidenceStrength:
      'Moderate. A decades-long Penn State research program (Dr. Barbara Rolls) shows lower energy density reduces calorie intake, and a year-long trial in 97 women found adding fruit and vegetables to a reduced-fat diet led to more weight loss and less hunger. A 2022 meta-analysis found no significant weight effect, and long-term results are inconsistent.',
    restrictiveness: 'Low — no foods eliminated, just density-tier awareness; requires some ongoing attention to food composition rather than fixed rules.',
    costAccessibility:
      'Built on inexpensive, widely available staples (produce, whole grains, legumes, broth-based soups, lean protein) with no specialty products required, making it one of the more budget-friendly structured approaches.',
    nutrientsToWatch:
      'No gaps are documented. Low-energy-density diets are linked with higher intake of vitamins A, C, and B6, folate, iron, calcium, and potassium.',
    adjustmentPeriod:
      'Little is known. In its main year-long trial, the group eating more fruit and vegetables reported less hunger, not more.',
    sampleDay:
      'Breakfast: oatmeal with berries and a hard-boiled egg. Lunch: broth-based vegetable soup, then a turkey sandwich on whole-grain bread with lettuce and tomato. Dinner: big green salad, grilled fish, brown rice, and roasted vegetables. Snack: grapes with nonfat Greek yogurt.',
    prepAndEatingOut:
      'Low to moderate prep, since soups and salads can be made in batches and nothing is tracked. Easy to eat out: start with a broth-based soup or salad and fill up on vegetables.',
    cautionGroups:
      'Not studied. No specific cautions have been published for Volumetrics.',
    adherenceAndStopping:
      'In its year-long trial, about 73% of participants finished. In a small seven-month trial, a low-energy-density diet reduced weight regain after weight loss. Over the long term, lower-density diets have not consistently produced more weight loss than calorie restriction alone.',
    attrs: {
      restrictiveness: 1,
      evidence: 'moderate',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: true,
      medicalContext: false,
      tags: ['emphasizes-vegetables', 'emphasizes-fruit', 'emphasizes-whole-grains', 'emphasizes-legumes', 'low-energy-density'],
    },
    url: '/diets/volumetrics/',
  },
  {
    slug: 'low-fodmap',
    name: 'Low-FODMAP Diet',
    shortName: 'Low-FODMAP',
    shortDescription:
      'A Monash University-developed, three-phase diagnostic elimination diet for irritable bowel syndrome (IBS) — temporary by design, not a general long-term eating plan.',
    typicalFoods: 'Low-FODMAP alternatives during elimination (e.g. an orange instead of an apple); personalized based on identified individual triggers after reintroduction.',
    foodsToAvoid:
      'High-FODMAP foods during the restriction phase: wheat, onions, garlic, certain fruits, high-lactose dairy, and most legumes, until reintroduction identifies personal triggers.',
    eatingPattern:
      'Three sequential phases: elimination (2–6 weeks), reintroduction (roughly 6–8 weeks, testing FODMAP subgroups one at a time), personalization (ongoing, only actual triggers avoided).',
    primaryGoal: 'Diagnose and manage IBS symptoms (bloating, pain, altered bowel habits).',
    bestFor: 'People diagnosed with IBS or a related functional GI disorder — not intended for people without a GI diagnosis.',
    macroEmphasis: 'None — organized around FODMAP carbohydrate content, not macros.',
    healthConditionRelevance: 'Irritable bowel syndrome (IBS) specifically — its entire purpose; no evidence supports it as a general “gut health” plan for people without a GI diagnosis.',
    evidenceStrength:
      'Moderate. The best-studied diet for IBS, with a meta-analysis of 10 RCTs (511 participants) showing symptom improvement, but the ACG rates the evidence very low quality because the trials carry a high risk of bias.',
    restrictiveness: 'High during the elimination phase (temporary), tapering to low/personalized after reintroduction — meant to be short-term, not permanent.',
    costAccessibility:
      'Specialty low-FODMAP-certified products, gluten-free swaps, and lactose-free items typically cost several times more than their standard counterparts, and getting full benefit from the elimination-reintroduction process usually involves working with a dietitian, an added expense not always covered by insurance.',
    nutrientsToWatch:
      'Calcium is the main concern, since high-lactose dairy is limited; calcium-fortified alternatives help. The restriction phase also lowers beneficial gut bacteria. In one long-term study, nutrient intake was adequate after reintroduction.',
    adjustmentPeriod:
      'The restriction phase lasts 2 to 6 weeks, and people who respond usually notice within that time. If symptoms don’t improve, guidelines say to stop and try another treatment. Serious side effects have not been reported.',
    sampleDay:
      'Breakfast: oats with lactose-free milk, blueberries, and pumpkin seeds. Lunch: spelt sourdough with roast chicken, lettuce, cucumber, and hard cheese, plus an orange. Dinner: firm tofu or salmon stir-fry with bok choy and green beans, flavored with chives instead of onion or garlic, over rice. Snack: kiwifruit and walnuts.',
    prepAndEatingOut:
      'High prep during restriction, since garlic and onion are in most sauces, stocks, and packaged foods. Eating out is hard at first; asking for sauces on the side helps. Long term, people report that it affects social eating and costs more.',
    cautionGroups:
      'Best started with a dietitian, as major gastroenterology guidelines recommend. Not advised for people with an eating disorder, those at risk of malnutrition, or those facing food insecurity. Not recommended to start during pregnancy. Children and older adults often use a gentler version.',
    adherenceAndStopping:
      'In one long-term follow-up, about 57% still reported good symptom relief and 82% were following a personalized version of the diet. Stopping is built in: foods return one FODMAP group at a time over about 6 to 8 weeks, and only personal triggers stay limited.',
    attrs: {
      restrictiveness: 3,
      evidence: 'moderate',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: true,
      medicalFocus: 'managing IBS symptoms',
      tags: ['phased-elimination', 'limits-grains', 'limits-dairy', 'limits-fruit', 'limits-legumes'],
    },
    url: '/diets/low-fodmap/',
  },
  {
    slug: 'blue-zones',
    name: 'Blue Zones Diet',
    shortName: 'Blue Zones',
    shortDescription:
      'An eating pattern distilled from field observations of five regions reported to have unusually high longevity — legume-heavy and plant-forward, with meat and dairy only occasional — alongside a real, unresolved dispute over the underlying longevity data.',
    typicalFoods: 'Legumes (beans, lentils, chickpeas) as the primary protein source, whole grains, vegetables, nuts — roughly 95–100% plant-based across the studied populations.',
    foodsToAvoid: 'Meat (limited to about 2oz, roughly five times a month), minimal dairy, added sugar (around 28g/day or less) — not eliminated, just occasional/low.',
    eatingPattern: 'No specific eating window — descriptive daily/weekly serving targets (e.g. at least 1/2 cup of beans daily, about two handfuls of nuts daily) rather than timing.',
    primaryGoal: 'Longevity, modeled on populations reported to have high rates of extreme old age.',
    bestFor:
      'The general population interested in a legume-and-vegetable-heavy pattern. Most of its food guidance lines up with general nutrition advice, though its daily-wine suggestion does not.',
    macroEmphasis: 'None — no calorie or macro structure; descriptive food targets, not a clinically-derived prescription.',
    healthConditionRelevance: 'Not tied to a specific condition; the legume-intake component specifically has independent epidemiological support (lower all-cause and stroke mortality) separate from the disputed longevity-region claims.',
    evidenceStrength:
      'Contested. The underlying demographic “longevity hotspot” claim is disputed (age-verification problems were the subject of a 2024 Ig Nobel Prize-winning analysis, and a 2025 rebuttal defends the data), though the legume-heavy eating pattern itself has independent, better-supported cohort evidence.',
    restrictiveness:
      'Moderate. No calorie or macro structure, but firm caps on meat (about five times a month), eggs and fish (three times a week or less), and no soft drinks.',
    costAccessibility:
      'Built primarily around legumes, whole grains, and vegetables, among the least expensive protein and staple food sources available, making it one of the more affordable dietary patterns to sustain.',
    nutrientsToWatch:
      'Not studied. No research has measured nutrient intake on this diet. Because it is 95 to 100% plant-based, vitamin B12 is worth watching, as it is for vegetarians.',
    adjustmentPeriod:
      'Little is known. The daily half cup of beans may cause gas at first, which fewer than half of people report in the first week.',
    sampleDay:
      'Breakfast: steel-cut oats with walnuts and berries, with coffee or tea. Lunch: minestrone with white beans and greens, and a slice of sourdough. Dinner: black beans and rice with corn tortillas and sautéed greens. Snack: a handful of almonds. Water through the day, no soft drinks.',
    prepAndEatingOut:
      'Moderate prep, mainly cooking beans and whole grains; canned beans save time. Eating out is moderately easy, though the limits on meat, eggs, and fish rule out many menu items.',
    cautionGroups:
      'The guidelines include one to three small glasses of red wine a day, which conflicts with heart-health advice not to start drinking for health. Pregnant people and anyone under 21 should not drink. With very little animal food, vitamin B12 needs attention. Warfarin users should keep leafy-green intake steady.',
    adherenceAndStopping:
      'Not studied. The diet has never been tested as a defined plan in a trial, so there is no data on adherence or on what happens when people stop.',
    attrs: {
      restrictiveness: 2,
      evidence: 'limited',
      eatingWindow: false,
      animalProducts: 'limited',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['plant-forward', 'emphasizes-legumes', 'emphasizes-vegetables', 'emphasizes-whole-grains', 'emphasizes-nuts-seeds', 'emphasizes-fruit', 'emphasizes-olive-oil', 'limits-red-meat', 'limits-dairy', 'limits-added-sugar', 'limits-processed-food'],
    },
    url: '/diets/blue-zones/',
  },
  {
    slug: 'carnivore',
    name: 'Carnivore Diet',
    shortName: 'Carnivore',
    shortDescription:
      'Eliminates all plant foods and eats only animal products (meat, fish, eggs, sometimes dairy) — an elimination diet taken to its extreme, with essentially no long-term clinical evidence.',
    typicalFoods: 'Meat (including organ meats), fish, eggs, sometimes butter, cheese, or other dairy — no plant foods.',
    foodsToAvoid: 'Fruits, vegetables, grains, legumes, nuts, seeds, and added sugar — all plant foods entirely.',
    eatingPattern:
      'No specific eating window. The exclusion list is the entire structure, not timing or macros.',
    primaryGoal: 'Health motivation (93% of self-reported survey respondents cited health reasons), often symptom relief via extreme elimination.',
    bestFor: 'Not clearly established — no RCTs exist to define who it suits; anyone considering it should treat it as a short, medically-supervised elimination experiment given the evidence gaps.',
    macroEmphasis: 'No formal macro target, but by default very low-carb and high-protein/fat from removing all plant foods.',
    healthConditionRelevance: 'None demonstrated — anecdotal reports of autoimmune/IBS symptom relief are self-reported, not clinically confirmed.',
    evidenceStrength:
      'Minimal: no randomized controlled trials exist. A 2026 scoping review found only 9 human studies (2021 to 2025), mostly surveys, case series, and case reports at the lowest evidence tiers, and concluded long-term safety “cannot be reliably assessed.”',
    restrictiveness: 'Very high — eliminates an entire kingdom of food (all plants), zero dietary fiber by design.',
    costAccessibility:
      'Cost depends heavily on which cuts are prioritized: organ meats and cheaper cuts keep cost comparable to a moderate food budget, while relying mainly on premium muscle cuts can push grocery spending well above a standard mixed diet.',
    nutrientsToWatch:
      'Fiber is close to zero. Reported intakes often fall short on vitamin C, vitamin D, calcium, magnesium, thiamin, potassium, and iodine. No scurvy cases have been reported so far.',
    adjustmentPeriod:
      'Some people report headache, dizziness, and fatigue early on, similar to keto flu. LDL cholesterol rose substantially in observational studies. Among long-term followers surveyed, digestive and other symptoms were uncommon, but that survey only reached people who stayed on the diet.',
    sampleDay:
      'Breakfast: eggs scrambled in butter, with bacon. Lunch: ground beef patties with a slice of hard cheese. Dinner: pan-seared steak or salmon, with beef liver once or twice a week. Snack: sugar-free beef jerky or hard-boiled eggs.',
    prepAndEatingOut:
      'Low to moderate prep, mostly searing or grilling meat. Steakhouses and bunless burgers are easy, but most sides and cuisines don’t fit. Followers often report social conflict with family, friends, and clinicians.',
    cautionGroups:
      'People with high LDL, heart disease, or familial high cholesterol should talk to a clinician first. A history of high triglycerides, pancreatitis, kidney stones, gout, or kidney disease also calls for caution. People on diabetes medication need supervision, since many report reducing their medication. No data exist for pregnancy or children.',
    adherenceAndStopping:
      'Little is known. No trial has measured adherence, and surveys only include people who stayed on the diet for at least six months. A recent review concluded that long-term adherence cannot be recommended. No study has followed people after they stop.',
    attrs: {
      restrictiveness: 4,
      evidence: 'minimal',
      eatingWindow: false,
      animalProducts: 'central',
      carbs: 'low',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['excludes-grains', 'excludes-legumes', 'excludes-added-sugar', 'emphasizes-protein', 'emphasizes-fat', 'excludes-plant-foods'],
    },
    url: '/diets/carnivore/',
  },
  {
    slug: 'eating-on-glp-1',
    name: 'Eating on GLP-1 Medications',
    shortName: 'GLP-1 Eating',
    shortDescription:
      'Practical nutrition guidance for the sharply reduced appetite created by GLP-1 medications (semaglutide, tirzepatide) — not a diet plan with its own food rules, but adaptations to protect muscle mass and manage side effects.',
    typicalFoods: 'Protein-dense foods prioritized first at each meal (eggs, dairy, poultry, fish, tofu, legumes, protein supplements); smaller, more frequent meals; adequate fiber and fluids.',
    foodsToAvoid:
      'High-fat, greasy, or fried foods and large meals, which slow digestion further and commonly trigger nausea. Guidance also suggests minimizing refined carbs, sugary drinks, red and processed meat, and alcohol.',
    eatingPattern: 'Smaller, more frequent meals rather than a few large ones — recommended specifically to manage nausea from delayed gastric emptying, not a fixed window or schedule.',
    primaryGoal: 'Preserve lean muscle mass and manage GI side effects while eating much less food overall.',
    bestFor: 'People on GLP-1/GIP receptor agonist medications (semaglutide, tirzepatide, and similar) needing to close protein, fiber, and micronutrient gaps despite a much smaller appetite.',
    macroEmphasis:
      'High protein emphasis. Published guidance suggests about 1.2 to 1.6 g per kg of body weight daily during weight loss (or 80 to 120 g a day), well above the 0.8 g/kg RDA, alongside resistance training, and advises against staying at 2 g/kg or more for long periods.',
    healthConditionRelevance:
      'Specifically for people on GLP-1 or dual GIP/GLP-1 receptor agonist medications. Addresses lean-mass loss (roughly 25 to 40% of weight lost in trial body-composition substudies) and GI side effects (about 70% of people on semaglutide in trials, versus about 47% on placebo).',
    evidenceStrength:
      'Limited for the nutrition guidance itself. The drug and body-composition data are strong (SURMOUNT-1, STEP 1), but the eating recommendations come from a 2025 expert advisory based on expert knowledge and clinical experience, not from trials in GLP-1 users.',
    restrictiveness: 'Low in food-type terms — no foods banned; the main constraint is a sharply reduced total food volume, which raises the risk of nutrient shortfalls.',
    costAccessibility:
      'Prioritizing protein-dense foods at every meal, and sometimes a protein supplement, to hit intake targets on a much smaller food volume can add cost on top of the medication itself.',
    nutrientsToWatch:
      'Eating much less makes it harder to get enough protein, iron, calcium, magnesium, zinc, and vitamins A, D, E, K, B1, B12, and C. Guidance suggests asking a clinician about vitamin D, calcium, B12, or a multivitamin. Protein matters most, since 25 to 40% of weight lost in trials was lean mass.',
    adjustmentPeriod:
      'Nausea, vomiting, diarrhea, and constipation are common, mostly while doses are being increased, and usually ease over time. About 7 in 10 people had digestive side effects in trials, compared with about half on placebo. Small meals, avoiding large or fatty meals, and steady fluids are the usual advice.',
    sampleDay:
      'Breakfast: a small bowl of Greek yogurt with berries and chia seeds, with ginger tea. Lunch: a small lentil-vegetable soup with shredded chicken. Snack: a smoothie of milk, banana, and peanut butter. Dinner: a small plate of baked salmon, roasted vegetables, and quinoa. Water sipped steadily all day.',
    prepAndEatingOut:
      'Moderate prep, since several small meals a day and protein planning take effort. Eating out works, but restaurant portions are large and often fatty, so small plates or taking food home fit the guidance better.',
    cautionGroups:
      'These medications are prescribed and managed by a clinician. They are not used with a personal or family history of medullary thyroid cancer or MEN 2, and are stopped in pregnancy. Tell a clinician about past pancreatitis, gallbladder disease, kidney problems, or an eating disorder. Before surgery or sedation, tell the care team, because of aspiration risk.',
    adherenceAndStopping:
      'In real-world data, about half to two-thirds of people without diabetes stop within a year. After stopping, most people regain much of the weight: in one trial, about two-thirds of the loss returned within a year. Exercise during treatment may help keep more weight off afterward.',
    attrs: {
      restrictiveness: 1,
      evidence: 'limited',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: true,
      medicalFocus: 'people taking GLP-1 medications',
      tags: ['emphasizes-protein', 'emphasizes-vegetables', 'emphasizes-fruit', 'emphasizes-whole-grains', 'emphasizes-nuts-seeds', 'limits-red-meat', 'limits-added-sugar', 'limits-processed-food', 'limits-alcohol'],
    },
    url: '/diets/eating-on-glp-1/',
  },
  {
    slug: 'high-protein',
    name: 'High-Protein Diet',
    shortName: 'High-Protein',
    shortDescription:
      'Eating well above the 0.8 g/kg protein RDA, typically by building each meal around a protein source. A macronutrient emphasis rather than a branded plan, and the most common diet Americans report following (IFIC 2025).',
    typicalFoods:
      'Poultry, fish and seafood, eggs, lean red meat, Greek yogurt, cottage cheese, milk, tofu, tempeh, edamame, lentils, beans, chickpeas; protein powder optional.',
    foodsToAvoid:
      'Nothing formally excluded. Lower-protein refined carbs and sweets get less room in practice, since protein takes up more of each meal at the same calorie level.',
    eatingPattern: 'No specific eating window. At least roughly 25–30g of protein per meal is a commonly cited per-meal target.',
    primaryGoal: 'Appetite control and preserving lean mass, especially during weight loss or resistance training.',
    bestFor:
      'People losing weight who struggle with hunger, people who lift weights, and older adults with higher protein needs.',
    macroEmphasis: 'High protein. Roughly 1.2–1.6 g/kg/day in weight-management research, versus the 0.8 g/kg/day RDA; carbs and fat fill the remaining calories.',
    healthConditionRelevance:
      'Weight loss and body composition (modestly more fat loss and lean-mass retention in energy-restricted trials), age-related muscle loss. Not appropriate at high intakes for chronic kidney disease (KDIGO 2024).',
    evidenceStrength:
      'Moderate. Consistent but modest benefits in short-term controlled trials (meta-analysis of 24 RCTs); longer-term results are limited and conflicting, largely due to poor adherence.',
    restrictiveness: 'Low. No foods banned, though hitting a protein target each day takes some planning or tracking.',
    costAccessibility:
      'Animal proteins and protein powders can raise grocery costs; eggs, dairy, canned fish, and legumes keep it affordable.',
    nutrientsToWatch:
      'Not studied. No nutrient gaps specific to high-protein eating have been documented.',
    adjustmentPeriod:
      'Not studied. No research describes an adjustment period. In healthy adults, trials found that higher protein intake did not harm kidney function.',
    sampleDay:
      'Breakfast: Greek yogurt with oats, berries, and pumpkin seeds. Lunch: chicken, quinoa, and black bean salad with vegetables. Dinner: tofu or salmon stir-fry with edamame and brown rice. Snack: cottage cheese with fruit.',
    prepAndEatingOut:
      'Moderate prep, mostly planning a protein source for each meal; tracking grams is common but optional. Easy to eat out, since nearly every menu has a protein-centered option.',
    cautionGroups:
      'People with chronic kidney disease should not eat high protein; kidney guidelines suggest staying near the standard intake. People with a history of disordered eating should be careful with daily gram tracking. Some guidance advises against staying at 2 g per kg of body weight or more for long periods.',
    adherenceAndStopping:
      'Benefits in trials held mostly for people who stuck with it, and longer-term results are mixed. In one large trial, fewer people dropped out of the high-protein group than the low-protein group. Higher protein also helped people keep weight off after an initial diet.',
    attrs: {
      restrictiveness: 1,
      evidence: 'moderate',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['emphasizes-protein', 'tracks-numbers'],
    },
    url: '/diets/high-protein/',
  },
  {
    slug: 'anti-inflammatory',
    name: 'Anti-Inflammatory Diet',
    shortName: 'Anti-Inflammatory',
    shortDescription:
      'A loosely defined, Mediterranean-style eating pattern built around foods linked to lower inflammation markers. No official plan, governing body, or calorie target, and different sources publish different food lists.',
    typicalFoods:
      'Tomatoes, olive oil, leafy greens, nuts, fatty fish (salmon, mackerel, sardines), berries and other fruit, whole grains, legumes, herbs and spices.',
    foodsToAvoid:
      'Refined carbohydrates, fried foods, sugar-sweetened drinks, red and processed meat, margarine/shortening/lard. These are limited, not banned outright.',
    eatingPattern: 'No specific eating window. A food-quality framework, not a timed or calorie-counted plan.',
    primaryGoal: 'Lowering chronic, low-grade inflammation and associated chronic disease risk.',
    bestFor:
      'People who want a flexible, food-quality pattern without counting and like the general shape of Mediterranean-style eating.',
    macroEmphasis: 'None built in. No calorie or macro structure; total calories still determine weight change.',
    healthConditionRelevance:
      'Associated (observationally) with lower risk of heart attack, all-cause mortality, and some cancers via the Dietary Inflammatory Index; Mediterranean-diet RCTs show modest drops in CRP and IL-6. Not a treatment for any specific inflammatory condition.',
    evidenceStrength:
      'Limited-to-moderate. Large but mostly observational evidence (only 1 of 38 outcomes graded "convincing" in a 2021 umbrella review); trial evidence comes from Mediterranean-diet studies, not the diet as its own named plan.',
    restrictiveness: 'Low. Food-quality guidance with limits rather than hard exclusions.',
    costAccessibility: 'Similar to the Mediterranean diet. May be less practical on tight food budgets or with limited access to fresh produce and fish.',
    nutrientsToWatch:
      'Not studied. No research has measured nutrient gaps on a named anti-inflammatory diet. The similar Mediterranean pattern is linked with better overall nutrient intake.',
    adjustmentPeriod:
      'Little is known. More beans and fiber may cause some gas at first.',
    sampleDay:
      'Breakfast: oatmeal with blueberries, walnuts, and ground flax, with green tea. Lunch: leafy-green salad with chickpeas, tomatoes, and olive oil, with whole-grain pita. Dinner: baked salmon or sardines with roasted vegetables and brown rice. Snack: an apple and a few almonds.',
    prepAndEatingOut:
      'Moderate prep, similar to Mediterranean: fresh produce, fish, and legumes with no tracking. Easy to eat out, since grilled fish, salads, and vegetable dishes are common.',
    cautionGroups:
      'It is not a treatment for inflammatory conditions; in a trial in rheumatoid arthritis, the main result was not significant. Warfarin users should keep leafy-green intake steady. During pregnancy and for children, choose lower-mercury fish.',
    adherenceAndStopping:
      'Not studied over the long term. The only trial ran for 10 weeks with much of the food provided, and most participants completed it. There is no data on what happens after stopping.',
    attrs: {
      restrictiveness: 1,
      evidence: 'limited',
      eatingWindow: false,
      animalProducts: 'included',
      carbs: 'unspecified',
      sodiumFocus: false,
      calorieMechanism: false,
      medicalContext: false,
      tags: ['plant-forward', 'emphasizes-vegetables', 'emphasizes-fruit', 'emphasizes-whole-grains', 'emphasizes-legumes', 'emphasizes-fish', 'emphasizes-nuts-seeds', 'emphasizes-olive-oil', 'limits-red-meat', 'limits-added-sugar', 'limits-processed-food'],
    },
    url: '/diets/anti-inflammatory/',
  },
];

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
  url: string;
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
      'Table salt/high-sodium foods, cured and deli meats, canned soups, red meat, full-fat dairy, sugary drinks, sweets — limited by serving count, not excluded outright.',
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
      'Mixed — weight loss broadly comparable to calorie restriction, but several well-designed recent trials (TREAT; NEJM 2022) found no added benefit over calorie restriction alone.',
    restrictiveness:
      'Moderate — no food is off-limits, but timing has to be maintained; not recommended without medical supervision for disordered-eating history, pregnancy, type 1 diabetes, or children.',
    costAccessibility: 'No special foods required — flexible and affordable, since only timing changes.',
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
      'Limited long-term advantage — meta-analyses show short-term benefits similar to other calorie-restricted diets but no clear long-term edge, with real adherence and safety caveats (LDL increases in some people, dropout as high as 54–91% in some trial arms).',
    restrictiveness: 'High — cuts entire food groups; trial dropout reached over half of participants in some studies.',
    costAccessibility:
      "Cost varies widely depending on execution: built on everyday meat, eggs, and vegetables it's comparably priced to a standard diet, but relying on specialty low-carb products like keto bread, pasta, or meal-replacement shakes adds a substantial premium over the same diet made with whole foods.",
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
      'Type 2 diabetes and mortality data (Adventist Health Study-2 semi-vegetarian subgroup) show a trend toward benefit that’s more modest than stricter vegetarian/vegan patterns, and the mortality reduction didn’t reach statistical significance in that cohort.',
    evidenceStrength:
      'Moderate — semi-vegetarian subgroup research shows real but more modest benefits than full vegetarian/vegan patterns; also a U.S. News expert-panel top ranking, not a single clinical trial result.',
    restrictiveness: 'Low — no fixed rules, less structure than plans with explicit food lists or macro targets.',
    costAccessibility:
      "Flexible and generally affordable since it's built on standard grocery staples (legumes, whole grains, produce) without requiring specialty or processed meat-substitute products.",
    url: '/diets/flexitarian/',
  },
  {
    slug: 'paleo',
    name: 'Paleo Diet',
    shortName: 'Paleo',
    shortDescription:
      'Modeled on a presumed hunter-gatherer eating pattern — lean meats, fish, fruit, vegetables, nuts and seeds — excluding grains, legumes, dairy, refined sugar, and processed foods.',
    typicalFoods:
      'Grass-fed beef, chicken, wild-caught salmon, eggs, almonds, walnuts, pumpkin seeds, berries, apples, leafy greens, broccoli, sweet potatoes, olive oil, avocado.',
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
      'Limited/thinner — real but noticeably thinner and shorter-term than Mediterranean or DASH; a supporting meta-analysis had published calculation-error concerns, and the “one ancestral diet” premise has been directly challenged in the scientific literature.',
    restrictiveness: 'High — restricts entire food categories (grains, legumes, dairy) rather than counting anything.',
    costAccessibility: 'Paleo-compliant meat, fish, nuts, and produce typically cost more than the grain, legume, and dairy staples it excludes.',
    url: '/diets/paleo/',
  },
  {
    slug: 'mind',
    name: 'MIND Diet',
    shortName: 'MIND',
    shortDescription:
      'A hybrid of the Mediterranean and DASH diets, built specifically around brain health, scored on 15 food components with extra emphasis on berries and leafy greens.',
    typicalFoods:
      'Green leafy vegetables, other vegetables, nuts, berries (especially blueberries), beans and legumes, whole grains, fish, poultry, olive oil, wine in moderation, and a daily green salad.',
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
      'Added sugar (real and artificial), alcohol, grains, legumes (including peanuts and soy), dairy (ghee is an exception); also “SWYPO” compliant-ingredient treat mimics like paleo pancakes.',
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
      "Research comparing flexible and rigid approaches to dietary restraint has generally linked flexible, non-black-and-white eating rules to lower rates of binge eating and disordered-eating symptoms than strict, all-or-nothing dieting, though findings aren't fully consistent across studies. The approach is also widely used in physique and bodybuilding contest prep, valued as a way to hit macro targets without the psychological rigidity of a fixed 'clean eating' list.",
    evidenceStrength:
      'Limited/indirect — no peer-reviewed study has evaluated “IIFYM” by that name; supporting evidence comes from the related but distinct “flexible vs. rigid dietary restraint” literature, mostly correlational, with one small RCT (n=23) on macro-based tracking.',
    restrictiveness: 'Low — no food is off-limits, but requires consistent daily tracking to work.',
    costAccessibility: 'Flexible and affordable in principle since no specialty foods are required, though the diet says nothing about fiber, vitamins, minerals, or protein quality.',
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
      'Strong relative to similarly-styled diets — comes from a specific, decades-long Penn State research program (Dr. Barbara Rolls), with a year-long RCT (97 obese women) showing greater weight loss and lower hunger from the low-density approach.',
    restrictiveness: 'Low — no foods eliminated, just density-tier awareness; requires some ongoing attention to food composition rather than fixed rules.',
    costAccessibility:
      'Built on inexpensive, widely available staples (produce, whole grains, legumes, broth-based soups, lean protein) with no specialty products required, making it one of the more budget-friendly structured approaches.',
    url: '/diets/volumetrics/',
  },
  {
    slug: 'low-fodmap',
    name: 'Low-FODMAP Diet',
    shortName: 'Low-FODMAP',
    shortDescription:
      'A Monash University-developed, three-phase diagnostic elimination diet for irritable bowel syndrome (IBS) — temporary by design, not a general long-term eating plan.',
    typicalFoods: 'Low-FODMAP alternatives during elimination (e.g. an orange instead of an apple); personalized based on identified individual triggers after reintroduction.',
    foodsToAvoid: 'High-FODMAP foods during elimination: wheat, onions, garlic, certain fruits, dairy, legumes — until the reintroduction phase identifies actual individual triggers.',
    eatingPattern:
      'Three sequential phases: elimination (2–6 weeks), reintroduction (roughly 6–8 weeks, testing FODMAP subgroups one at a time), personalization (ongoing, only actual triggers avoided).',
    primaryGoal: 'Diagnose and manage IBS symptoms (bloating, pain, altered bowel habits).',
    bestFor: 'People diagnosed with IBS or a related functional GI disorder — not intended for people without a GI diagnosis.',
    macroEmphasis: 'None — organized around FODMAP carbohydrate content, not macros.',
    healthConditionRelevance: 'Irritable bowel syndrome (IBS) specifically — its entire purpose; no evidence supports it as a general “gut health” plan for people without a GI diagnosis.',
    evidenceStrength: 'Strong for IBS specifically — genuinely strong, randomized evidence (meta-analysis of 10 RCTs, 511 participants), though effect size varies by study.',
    restrictiveness: 'High during the elimination phase (temporary), tapering to low/personalized after reintroduction — meant to be short-term, not permanent.',
    costAccessibility:
      'Specialty low-FODMAP-certified products, gluten-free swaps, and lactose-free items typically cost several times more than their standard counterparts, and getting full benefit from the elimination-reintroduction process usually involves working with a dietitian, an added expense not always covered by insurance.',
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
    bestFor: 'The general population interested in a legume-and-vegetable-heavy pattern; low-risk for most people since it doesn’t conflict with general nutrition guidance.',
    macroEmphasis: 'None — no calorie or macro structure; descriptive food targets, not a clinically-derived prescription.',
    healthConditionRelevance: 'Not tied to a specific condition; the legume-intake component specifically has independent epidemiological support (lower all-cause and stroke mortality) separate from the disputed longevity-region claims.',
    evidenceStrength:
      'Contested/mixed — the underlying demographic “longevity hotspot” claim is seriously disputed (age-verification data critiqued in a 2024 Ig Nobel Prize-winning analysis), though the legume-heavy eating pattern itself has independent, better-supported cohort evidence.',
    restrictiveness: 'Low — no macro/calorie structure, mostly-plant descriptive targets rather than hard rules.',
    costAccessibility:
      'Built primarily around legumes, whole grains, and vegetables, among the least expensive protein and staple food sources available, making it one of the more affordable dietary patterns to sustain.',
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
    eatingPattern: 'No specific eating window — the exclusion list is the entire structure, not timing or macros; most followers end up in ketosis by default from near-zero carbs.',
    primaryGoal: 'Health motivation (93% of self-reported survey respondents cited health reasons), often symptom relief via extreme elimination.',
    bestFor: 'Not clearly established — no RCTs exist to define who it suits; anyone considering it should treat it as a short, medically-supervised elimination experiment given the evidence gaps.',
    macroEmphasis: 'No formal macro target, but by default very low-carb and high-protein/fat from removing all plant foods.',
    healthConditionRelevance: 'None demonstrated — anecdotal reports of autoimmune/IBS symptom relief are self-reported, not clinically confirmed.',
    evidenceStrength:
      'Limited: no randomized controlled trials exist — a 2026 scoping review found only 9 observational human studies (2021–2025), rated NHMRC Levels III–IV (the lowest evidence tiers), concluding long-term safety “cannot be reliably assessed.”',
    restrictiveness: 'Very high — eliminates an entire kingdom of food (all plants), zero dietary fiber by design.',
    costAccessibility:
      'Cost depends heavily on which cuts are prioritized: organ meats and cheaper cuts keep cost comparable to a moderate food budget, while relying mainly on premium muscle cuts can push grocery spending well above a standard mixed diet.',
    url: '/diets/carnivore/',
  },
  {
    slug: 'eating-on-glp-1',
    name: 'Eating on GLP-1 Medications',
    shortName: 'GLP-1 Eating',
    shortDescription:
      'Practical nutrition guidance for the sharply reduced appetite created by GLP-1 medications (semaglutide, tirzepatide) — not a diet plan with its own food rules, but adaptations to protect muscle mass and manage side effects.',
    typicalFoods: 'Protein-dense foods prioritized first at each meal (eggs, dairy, poultry, fish, tofu, legumes, protein supplements); smaller, more frequent meals; adequate fiber and fluids.',
    foodsToAvoid: 'High-fat, greasy, or fried foods (they slow gastric emptying further and are a common nausea trigger); large meals in general.',
    eatingPattern: 'Smaller, more frequent meals rather than a few large ones — recommended specifically to manage nausea from delayed gastric emptying, not a fixed window or schedule.',
    primaryGoal: 'Preserve lean muscle mass and manage GI side effects while eating much less food overall.',
    bestFor: 'People on GLP-1/GIP receptor agonist medications (semaglutide, tirzepatide, and similar) needing to close protein, fiber, and micronutrient gaps despite a much smaller appetite.',
    macroEmphasis: 'High protein emphasis — 1.6–2.3 g protein per kg of fat-free mass daily (well above the 0.8 g/kg RDA), alongside resistance training.',
    healthConditionRelevance: 'Specifically for people on GLP-1/dual GIP-GLP-1 receptor agonist medications; addresses lean-mass loss (up to roughly 25% of weight lost is lean mass per SURMOUNT-1) and GI side effects (40–70% of patients).',
    evidenceStrength:
      'Strong for the underlying mechanisms cited — DXA-based body-composition substudies (SURMOUNT-1, STEP 1) and clinical reviews, though the page notes a general lack of structured nutrition guidance for GLP-1 patients.',
    restrictiveness: 'Low in food-type terms — no foods banned; the main constraint is a sharply reduced total food volume, which raises the risk of nutrient shortfalls.',
    costAccessibility:
      'Prioritizing protein-dense foods at every meal, and sometimes a protein supplement, to hit intake targets on a much smaller food volume can add cost on top of the medication itself.',
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
    url: '/diets/anti-inflammatory/',
  },
];

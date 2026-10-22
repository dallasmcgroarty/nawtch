// Weight projections — pure math behind the Weight page's trend line, weekly
// rate, data-based TDEE estimate, and goal projection. No DB access and no
// formatting: every input and output is in kg, kcal, and "YYYY-MM-DD" date
// strings. weight.js loads the logs and converts results for display.
import { isoDate, daysBetween } from "./dates.js";

export const TREND_ALPHA = 0.1; // Hacker's Diet smoothing factor
export const KCAL_PER_KG = 7700; // ~3,500 kcal per lb

export const RATE_WINDOW_DAYS = 21;
export const RATE_MIN_SPAN_DAYS = 7;

export const TDEE_WINDOW_DAYS = 28;
export const TDEE_MIN_SPAN_DAYS = 14;
export const TDEE_MIN_WEIGH_INS = 8;
export const TDEE_MIN_FOOD_DAYS = 10;
const TDEE_MIN_KCAL = 1000;
const TDEE_MAX_KCAL = 5000;

const FLAT_KG_PER_WEEK = 0.02; // ~0.05 lb/week; slower than this counts as flat
const MAX_PROJECTION_DAYS = 730;
const FAST_PACE_FRACTION = 0.01; // 1% of trend weight per week

export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

// One point per calendar day from the first weigh-in to the last. Days with
// no weigh-in use a straight-line estimate between the weigh-ins on either
// side, so a 5-day gap moves the trend like 5 days, not 1. `weightKg` is the
// real weigh-in on that day, or null for a filled-in day. Never extends past
// the last weigh-in. `entries` must be sorted by date, one per day.
export function computeTrend(entries) {
  if (!entries.length) return [];
  let trend = entries[0].weightKg;
  const out = [{ date: entries[0].date, trendKg: trend, weightKg: entries[0].weightKg }];
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const cur = entries[i];
    const gap = daysBetween(prev.date, cur.date);
    for (let d = 1; d <= gap; d++) {
      const w = prev.weightKg + ((cur.weightKg - prev.weightKg) * d) / gap;
      trend += TREND_ALPHA * (w - trend);
      out.push({ date: addDays(prev.date, d), trendKg: trend, weightKg: d === gap ? cur.weightKg : null });
    }
  }
  return out;
}

// Least-squares slope of y over x.
function slope(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

// Weekly rate of change: linear regression over the trend values from the
// last 21 days ending at the last weigh-in (or all of them if fewer).
// Returns null until the trend covers at least 7 days.
export function computeWeeklyRate(trend) {
  if (trend.length - 1 < RATE_MIN_SPAN_DAYS) return null;
  const pts = trend.slice(-RATE_WINDOW_DAYS);
  const xs = pts.map((_, i) => i);
  const ys = pts.map((p) => p.trendKg);
  return slope(xs, ys) * 7;
}

// Estimated TDEE from real data over the 28 days ending yesterday (today's
// food log is usually unfinished):
//   avg intake − (trend change between first and last weigh-in in the window
//   × 7,700 kcal/kg ÷ days between them)
// Intake averages only days with food logged; empty days are skipped, not
// counted as zero.
export function estimateTdee({ entries, trend, foodDays, today }) {
  const end = addDays(today, -1);
  const start = addDays(today, -TDEE_WINDOW_DAYS);
  const inWindow = (d) => d >= start && d <= end;

  const weighIns = entries.filter((e) => inWindow(e.date));
  const logged = foodDays.filter((d) => inWindow(d.date) && d.cal > 0);
  const spanDays = weighIns.length >= 2 ? daysBetween(weighIns[0].date, weighIns[weighIns.length - 1].date) : 0;

  const needs = {
    weighIns: Math.max(0, TDEE_MIN_WEIGH_INS - weighIns.length),
    spanDays: Math.max(0, TDEE_MIN_SPAN_DAYS - spanDays),
    foodDays: Math.max(0, TDEE_MIN_FOOD_DAYS - logged.length),
  };
  if (needs.weighIns || needs.spanDays || needs.foodDays) return { status: "insufficient", needs };

  const trendByDate = new Map(trend.map((p) => [p.date, p.trendKg]));
  const startDate = weighIns[0].date;
  const endDate = weighIns[weighIns.length - 1].date;
  const trendChangeKg = trendByDate.get(endDate) - trendByDate.get(startDate);
  const avgIntakeKcal = logged.reduce((s, d) => s + d.cal, 0) / logged.length;
  const tdeeKcal = avgIntakeKcal - (trendChangeKg * KCAL_PER_KG) / spanDays;

  const result = { tdeeKcal, avgIntakeKcal, trendChangeKg, spanDays, foodDayCount: logged.length, weighInCount: weighIns.length };
  if (tdeeKcal < TDEE_MIN_KCAL || tdeeKcal > TDEE_MAX_KCAL) return { status: "implausible", ...result };
  return { status: "ok", ...result };
}

// Goal projection. Adds to the existing goal feature; never changes it.
//   projection: when the current trend rate reaches the goal weight
//   needed:     daily intake to reach the goal by the target date, or null
//               when there's no TDEE estimate or the target date is today or past
export function projectGoal({ goal, currentTrendKg, asOfDate, kgPerWeek, tdeeKcal, today }) {
  const toward = goal.direction === "lose" ? -1 : 1;
  const remainingKg = goal.targetWeightKg - currentTrendKg;

  let projection;
  if (remainingKg * toward <= 0) {
    projection = { status: "trendPastGoal" };
  } else if (kgPerWeek == null) {
    projection = { status: "noRate" };
  } else if (Math.abs(kgPerWeek) < FLAT_KG_PER_WEEK || Math.sign(kgPerWeek) !== toward) {
    projection = { status: "notMoving" };
  } else {
    const days = Math.ceil(remainingKg / (kgPerWeek / 7));
    if (days > MAX_PROJECTION_DAYS) {
      projection = { status: "tooFar" };
    } else {
      const date = addDays(asOfDate, days);
      projection = { status: "date", date, daysAhead: daysBetween(date, goal.targetDate) };
    }
  }

  let needed = null;
  const daysLeft = daysBetween(today, goal.targetDate);
  if (tdeeKcal != null && daysLeft > 0 && projection.status !== "trendPastGoal") {
    const kgPerDay = remainingKg / daysLeft;
    const kcalPerDay = tdeeKcal + kgPerDay * KCAL_PER_KG;
    if (kcalPerDay <= 0) {
      needed = { status: "unreachable" };
    } else {
      const requiredKgPerWeek = kgPerDay * 7;
      needed = {
        status: "ok",
        kcalPerDay,
        requiredKgPerWeek,
        fastPace: Math.abs(requiredKgPerWeek) > FAST_PACE_FRACTION * currentTrendKg,
      };
    }
  }

  return { projection, needed };
}

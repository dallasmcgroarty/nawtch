// Workout stats — pure functions behind "Last time" values, personal records,
// and in-session PR badges. No DB access and no formatting: weights in kg,
// durations in seconds. PRs are never stored; they're recomputed from the
// saved session snapshots so editing or deleting a session always updates them.
import { estimate1RM } from "./calculators/calc-shared.js";

export const MAX_1RM_REPS = 10; // est. 1RM only from sets of 1–10 reps
const EPS = 1e-6;

export function normName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

// Maps a normalized name to an exercise ID, so a session-only exercise typed in
// by name ("bench press") still matches the library exercise of the same name.
// Library names win; otherwise the most recent session that used an ID.
export function buildNameIndex(libraryExercises, sessions) {
  const index = new Map();
  [...sessions].reverse().forEach((s) =>
    (s.exercises || []).forEach((ex) => {
      if (ex.exerciseId) index.set(normName(ex.name), ex.exerciseId);
    })
  );
  libraryExercises.forEach((ex) => index.set(normName(ex.name), ex.id));
  return index;
}

// Stable key for matching an exercise across sessions: its exercise ID where
// it has one, falling back to name matching for exercises added mid-session.
export function exerciseKey(ex, nameIndex) {
  if (ex.exerciseId) return `id:${ex.exerciseId}`;
  const id = nameIndex.get(normName(ex.name));
  return id ? `id:${id}` : `name:${normName(ex.name)}`;
}

export function doneSets(ex) {
  return (ex.sets || []).filter((s) => s.done);
}

// The matching exercise from the most recent completed session that has at
// least one done set for it. `sessions` must be sorted newest first.
export function lastTimeFor(key, sessions, nameIndex, excludeId = null) {
  for (const s of sessions) {
    if (s.id === excludeId) continue;
    const match = (s.exercises || []).find((ex) => exerciseKey(ex, nameIndex) === key && doneSets(ex).length);
    if (match) return { date: s.date, mode: match.mode, sets: doneSets(match) };
  }
  return null;
}

function est1RMFor(set) {
  if (!(set.weightKg > 0) || !(set.reps >= 1) || set.reps > MAX_1RM_REPS) return null;
  return estimate1RM(set.weightKg, set.reps);
}

// Folds one done set into a PR record. Returns which records it beat; the
// first set ever logged for an exercise counts as beating nothing.
function applySet(rec, set, date) {
  const beat = [];
  const hadHistory = rec.setCount > 0;
  if (set.durationSec > 0) {
    if (!rec.longest || set.durationSec > rec.longest.durationSec + EPS) {
      if (hadHistory && rec.longest) beat.push("longest");
      rec.longest = { durationSec: set.durationSec, date };
    }
  }
  // Weight and reps are recorded together: a tie on the main value goes to
  // the set with more of the other (same weight for more reps, same reps at
  // a heavier weight).
  const w = set.weightKg > 0 ? set.weightKg : 0;
  if (set.reps > 0) {
    const prev = rec.mostReps;
    if (!prev || set.reps > prev.reps || (set.reps === prev.reps && w > (prev.weightKg || 0) + EPS)) {
      if (hadHistory && prev) beat.push("mostReps");
      rec.mostReps = { reps: set.reps, weightKg: w || null, date };
    }
  }
  if (w > 0) {
    const prev = rec.heaviest;
    if (!prev || w > prev.weightKg + EPS || (Math.abs(w - prev.weightKg) <= EPS && (set.reps || 0) > (prev.reps || 0))) {
      if (hadHistory && prev) beat.push("heaviest");
      rec.heaviest = { weightKg: w, reps: set.reps || null, date };
    }
    const e1rm = est1RMFor(set);
    if (e1rm != null && (!rec.best1RM || e1rm > rec.best1RM.valueKg + EPS)) {
      if (hadHistory && rec.best1RM) beat.push("best1RM");
      rec.best1RM = { valueKg: e1rm, weightKg: set.weightKg, reps: set.reps, date };
    }
  }
  rec.setCount += 1;
  return beat;
}

function emptyRecord(key, name, mode) {
  return { key, name, mode, setCount: 0, heaviest: null, best1RM: null, mostReps: null, longest: null, lastDate: null };
}

// Personal records per exercise across completed sessions.
// Returns a Map key -> { name, mode, heaviest, best1RM, mostReps, longest, lastDate }.
// `name` is from the most recent session, so renames show the current name.
export function computePRs(sessions, nameIndex, excludeId = null) {
  const records = new Map();
  const chronological = [...sessions]
    .filter((s) => s.id !== excludeId)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.finishedAt || 0) - (b.finishedAt || 0));
  for (const s of chronological) {
    for (const ex of s.exercises || []) {
      const done = doneSets(ex);
      if (!done.length) continue;
      const key = exerciseKey(ex, nameIndex);
      if (!records.has(key)) records.set(key, emptyRecord(key, ex.name, ex.mode));
      const rec = records.get(key);
      rec.name = ex.name;
      rec.mode = ex.mode;
      rec.lastDate = s.date;
      done.forEach((set) => applySet(rec, set, s.date));
    }
  }
  return records;
}

// For a session in progress (or being edited): which done sets beat a record
// from earlier sessions. Sets are folded in order, so two equal sets only
// badge the first. Returns an array per exercise of arrays per set:
// [] when not a PR, otherwise the list of records beaten.
export function sessionPRFlags(session, priorRecords, nameIndex) {
  return (session.exercises || []).map((ex) => {
    const key = exerciseKey(ex, nameIndex);
    const prior = priorRecords.get(key);
    // No badges the first time an exercise is ever logged
    if (!prior) return (ex.sets || []).map(() => []);
    const rec = structuredClone(prior);
    return (ex.sets || []).map((set) => (set.done ? applySet(rec, set, session.date) : []));
  });
}

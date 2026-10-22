// Workout session module — owns the "workoutSessions" IndexedDB store.
// Same two-record-shape pattern as weightGoals.js, distinguished by `kind`:
//   - the single in-progress session, always stored under the fixed id
//     "active-session" and rewritten on every change so a refresh, closed tab,
//     or locked phone never loses it
//   - completed sessions, one per finished workout, id "ws_<ms>"
// Every session is a full snapshot (program name, exercise names, planned and
// actual values), so later edits or deletions of programs and exercises never
// change past sessions. Weights are stored in kg, durations in seconds.
//
// Durability: an IndexedDB write that hasn't committed when the page unloads
// is aborted, so a check tapped just before a refresh, tab close, or phone lock
// could be lost. The active session is therefore also mirrored synchronously
// to localStorage on every change, and on load whichever copy has the newer
// `updatedAt` wins. Finishing and discarding clear the mirror first, then
// apply the IndexedDB change in a single transaction so it can't half-apply.
import { db, dbGet, dbGetAll, dbPut, dbDelete } from "./db.js";

const STORE = "workoutSessions";
const ACTIVE_ID = "active-session";
export const LS_ACTIVE_WORKOUT = "nawtch_active_workout_v1";

function readMirror() {
  try {
    const raw = localStorage.getItem(LS_ACTIVE_WORKOUT);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearMirror() {
  try { localStorage.removeItem(LS_ACTIVE_WORKOUT); } catch (e) {}
}

// Synchronous: survives an immediate unload. Call on every change.
export function mirrorActiveSession(session) {
  const record = { ...session, id: ACTIVE_ID, kind: "active", updatedAt: Date.now() };
  try { localStorage.setItem(LS_ACTIVE_WORKOUT, JSON.stringify(record)); } catch (e) {}
  return record;
}

export async function getActiveSession() {
  let stored = null;
  try {
    stored = (await dbGet(STORE, ACTIVE_ID)) || null;
  } catch (e) {}
  const mirror = readMirror();
  if (mirror && (!stored || (mirror.updatedAt || 0) > (stored.updatedAt || 0))) {
    // The last change didn't reach IndexedDB before the page went away
    try { await dbPut(STORE, mirror); } catch (e) {}
    return mirror;
  }
  return stored;
}

export async function saveActiveSession(session) {
  await dbPut(STORE, mirrorActiveSession(session));
}

function runTx(ops) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    ops(store);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function discardActiveSession() {
  clearMirror();
  await dbDelete(STORE, ACTIVE_ID);
}

export async function finishActiveSession(session) {
  const { updatedAt, ...rest } = session;
  const completed = { ...rest, id: `ws_${Date.now()}`, kind: "completed", finishedAt: Date.now() };
  clearMirror();
  await runTx((store) => {
    store.put(completed);
    store.delete(ACTIVE_ID);
  });
  return completed;
}

// Completed sessions, newest first (session date, then finish time).
export async function getCompletedSessions() {
  let all;
  try {
    all = (await dbGetAll(STORE)) || [];
  } catch (e) {
    return [];
  }
  return all
    .filter((s) => s.kind === "completed")
    .sort((a, b) => b.date.localeCompare(a.date) || (b.finishedAt || 0) - (a.finishedAt || 0));
}

export async function saveCompletedSession(session) {
  await dbPut(STORE, { ...session, kind: "completed" });
}

export async function deleteCompletedSession(id) {
  await dbDelete(STORE, id);
}

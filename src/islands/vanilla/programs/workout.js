// Workout sessions — the session view (start, log, finish, edit), the
// "Resume workout" banner, and the Workout Log tab (history + PRs).
// Storage lives in lib/workouts.js; matching and PR math in lib/workoutStats.js.
// programs.js owns PROGRAMS/EXERCISES and hands access in via initWorkouts().
//
// Units: weights are stored in kg and durations in seconds, converted only
// for display using the shared lb/kg setting (same convention as the Weight page).
import * as prefs from '../../../lib/prefs.js';
import * as workouts from '../../../lib/workouts.js';
import * as stats from '../../../lib/workoutStats.js';
import { todayStr, formatDateShort } from '../../../lib/dates.js';
import { esc, showConfirm } from '../../../lib/ui.js';

const KG_PER_LB = 0.45359237;
const TIME_FACTOR = { s: 1, min: 60, hr: 3600 };
const PR_LABELS = { heaviest: 'Heaviest weight', best1RM: 'Best est. 1RM', mostReps: 'Most reps', longest: 'Longest time' };

let ctx = null; // { getPrograms, getExercises, saveExercise, saveProgram, onProgramsChanged }
let weightUnit = 'lb';
let activeSession = null; // stored in-progress session, or null
let completedSessions = []; // newest first
let currentTab = 'programs';

// Session view state
let view = null; // { session, mode: 'active' | 'edit', dirty }
let priorRecords = new Map();
let nameIndex = new Map();
let pushedHash = false;
let persistTimer = null;
let addExQuery = '';

// ── Units / formatting ──
function kgToDisplay(kg) { return weightUnit === 'lb' ? kg / KG_PER_LB : kg; }
function displayToKg(v) { return weightUnit === 'lb' ? v * KG_PER_LB : v; }
function fmtWeight(kg) { return String(Math.round(kgToDisplay(kg) * 10) / 10); }
function fmtDuration(sec) {
  const s = Math.round(sec);
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}
// Adds the year only when it isn't the current one ("Mar 3" vs "Mar 3, 2025")
function withYear(dateStr, opts) {
  const sameYear = dateStr.slice(0, 4) === todayStr().slice(0, 4);
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', sameYear ? opts : { ...opts, year: 'numeric' });
}
function dateShortY(dateStr) { return withYear(dateStr, { month: 'short', day: 'numeric' }); }
function dateLongY(dateStr) { return withYear(dateStr, { weekday: 'short', month: 'short', day: 'numeric' }); }
function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}`; }
function fmtSet(set, mode) {
  if (mode === 'time') return set.durationSec > 0 ? fmtDuration(set.durationSec) : '—';
  if (set.weightKg > 0) return `${fmtWeight(set.weightKg)} × ${set.reps ?? '—'}`;
  return `${set.reps ?? '—'} reps`;
}
function sessionTitle(s) { return `${s.programName} · Day ${s.dayNumber}`; }

// ── Init / data ──
export async function initWorkouts(context) {
  ctx = context;
  weightUnit = await prefs.getWeightUnit();
  await reloadSessions();
  renderTabs();
  renderChrome();
  if (location.hash === '#workout') {
    if (activeSession) openView(structuredClone(activeSession), 'active', false);
    else history.replaceState(null, '', location.pathname + location.search);
  }
  window.addEventListener('popstate', () => {
    if (location.hash !== '#workout' && view) hideView();
  });
  // Flush a pending debounced save if the page is backgrounded or closed
  const flush = () => { if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; persistNow(); } };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  // Another tab changed the in-progress workout: adopt its version so this
  // tab's next save doesn't overwrite it. Fires only in the other tabs.
  window.addEventListener('storage', (e) => {
    if (e.key !== workouts.LS_ACTIVE_WORKOUT) return;
    onActiveChangedElsewhere(e.newValue ? JSON.parse(e.newValue) : null);
  });
}

function onActiveChangedElsewhere(next) {
  activeSession = next;
  if (view && view.mode === 'active') {
    if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
    if (next) {
      view.session = structuredClone(next);
      renderView();
    } else {
      closeView(); // finished or discarded in the other tab
    }
  }
  // Give the other tab's IndexedDB write a moment to commit before re-reading
  setTimeout(async () => {
    await reloadSessions();
    renderChrome();
    if (currentTab === 'log') renderLog();
  }, 300);
}

export function getWeightUnit() { return weightUnit; }

async function reloadSessions() {
  activeSession = await workouts.getActiveSession();
  completedSessions = await workouts.getCompletedSessions();
}

// ── Tabs + resume banner ──
function renderTabs() {
  const el = document.getElementById('pg-tabs');
  if (!el) return;
  el.innerHTML = `
    <button class="wt-toggle-btn ${currentTab === 'programs' ? 'active' : ''}" onclick="window.wsSetTab('programs')">Programs</button>
    <button class="wt-toggle-btn ${currentTab === 'log' ? 'active' : ''}" onclick="window.wsSetTab('log')">Workout Log</button>
  `;
  const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? '' : 'none'; };
  show('programs-list', currentTab === 'programs');
  show('pg-info-programs', currentTab === 'programs');
  show('pg-log', currentTab === 'log');
  show('pg-info-log', currentTab === 'log');
  if (currentTab === 'log') renderLog();
}

window.wsSetTab = (tab) => {
  if (tab !== 'programs' && tab !== 'log') return;
  if (tab === 'log' && currentTab !== 'log') resetHistoryPaging();
  currentTab = tab;
  renderTabs();
};

function renderChrome() {
  const el = document.getElementById('pg-active-banner');
  if (!el) return;
  if (!activeSession) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="ws-resume-banner">
      <div class="ws-resume-info">
        <div class="ws-resume-title">Workout in progress</div>
        <div class="ws-resume-sub">${esc(sessionTitle(activeSession))} · started ${formatDateShort(activeSession.date)}</div>
      </div>
      <button class="add-btn" onclick="window.wsResume()">Resume workout</button>
    </div>
  `;
}

window.wsResume = () => {
  if (activeSession) openView(structuredClone(activeSession), 'active');
};

// ── Starting a session ──
function lastTime(ex) {
  return stats.lastTimeFor(stats.exerciseKey(ex, nameIndex), completedSessions, nameIndex, view?.session?.id);
}

// Builds a session exercise from a program-day exercise or library exercise.
// Planned sets/reps/weight/time come from the program; any value the program
// doesn't specify is prefilled from the same set last time.
function buildSessionExercise(src, name, exerciseId) {
  const reps = parseInt(src.reps) || null;
  const time = Number(src.time) || 0;
  const timeUnit = src.timeUnit || 's';
  const mode = time && !reps ? 'time' : 'reps';
  const plannedWeightKg = Number(src.weightKg) > 0 ? Number(src.weightKg) : null;
  const plannedDurationSec = time ? time * (TIME_FACTOR[timeUnit] || 1) : null;
  const ex = {
    exerciseId: exerciseId || null,
    name,
    mode,
    timeUnit,
    planned: { sets: parseInt(src.sets) || null, reps, weightKg: plannedWeightKg, time: time || null, timeUnit },
    sets: [],
  };
  const last = lastTime(ex);
  const count = parseInt(src.sets) || (last ? last.sets.length : 1);
  for (let i = 0; i < count; i++) {
    const prev = last ? last.sets[Math.min(i, last.sets.length - 1)] : null;
    const set = {
      reps: reps ?? prev?.reps ?? null,
      weightKg: plannedWeightKg ?? (prev?.weightKg > 0 ? prev.weightKg : null),
      durationSec: plannedDurationSec ?? prev?.durationSec ?? null,
      done: false,
    };
    set.planned = { reps: set.reps, weightKg: set.weightKg, durationSec: set.durationSec };
    ex.sets.push(set);
  }
  return ex;
}

function refreshIndexes(excludeId = null) {
  nameIndex = stats.buildNameIndex(ctx.getExercises(), completedSessions);
  priorRecords = stats.computePRs(completedSessions, nameIndex, excludeId);
}

export async function startWorkout(programId, dayNumber) {
  await reloadSessions();
  if (activeSession) {
    renderChrome();
    if (await showConfirm(`You already have a workout in progress (${sessionTitle(activeSession)}). Finish or discard it before starting another.`, 'Resume')) {
      window.wsResume();
    }
    return;
  }
  const program = ctx.getPrograms().find((p) => p.id === programId);
  const day = program?.days.find((d) => d.dayNumber === dayNumber);
  if (!day) return;
  refreshIndexes();
  const session = {
    date: todayStr(), // session date is the day it started, even if finished after midnight
    startedAt: Date.now(),
    programId: program.id,
    programName: program.name,
    dayNumber: day.dayNumber,
    exercises: day.exercises.map((e) => buildSessionExercise(e, e.exerciseName, e.exerciseId)),
  };
  await workouts.saveActiveSession(session);
  activeSession = { ...session, id: 'active-session', kind: 'active' };
  renderChrome();
  openView(structuredClone(activeSession), 'active');
}

// ── Session view ──
function ensureViewEl() {
  let el = document.getElementById('ws-modal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ws-modal';
    el.className = 'pg-modal ws-modal'; // no backdrop-click close: too easy to hit mid-workout
    document.body.appendChild(el);
  }
  return el;
}

function openView(session, mode, pushHash = true) {
  // The program popup (Start / Resume) sits at the same z-index; close it so it can't cover the view
  document.getElementById('program-view-modal')?.classList.remove('open');
  view = { session, mode, dirty: false };
  refreshIndexes(mode === 'edit' ? session.id : null);
  if (pushHash && location.hash !== '#workout') {
    history.pushState({ ws: 1 }, '', '#workout');
    pushedHash = true;
  } else {
    pushedHash = false;
  }
  const el = ensureViewEl();
  el.innerHTML = ''; // start a newly opened view at the top
  el.classList.add('open');
  document.body.classList.add('ws-open');
  renderView();
}

function hideView() {
  document.getElementById('ws-modal')?.classList.remove('open');
  document.body.classList.remove('ws-open');
  view = null;
  renderChrome();
  if (currentTab === 'log') renderLog();
}

function closeView() {
  if (pushedHash && location.hash === '#workout') {
    pushedHash = false;
    history.back(); // popstate hides the view
  } else {
    if (location.hash === '#workout') history.replaceState(null, '', location.pathname + location.search);
    hideView();
  }
}

function persistNow() {
  if (!view || view.mode !== 'active') return;
  const s = view.session;
  activeSession = { ...structuredClone(s), id: 'active-session', kind: 'active' };
  workouts.saveActiveSession(s).catch(() => {});
}

// Active sessions save on every change: a synchronous localStorage mirror
// right away (survives an immediate refresh or tab close), then IndexedDB.
// Structural changes hit IndexedDB right away; typing is debounced so each
// keystroke isn't its own write.
function changed(debounce = false) {
  if (!view) return;
  view.dirty = true;
  if (view.mode !== 'active') return;
  activeSession = workouts.mirrorActiveSession(structuredClone(view.session));
  if (persistTimer) clearTimeout(persistTimer);
  if (debounce) persistTimer = setTimeout(() => { persistTimer = null; persistNow(); }, 300);
  else { persistTimer = null; persistNow(); }
}

function prFlags() {
  return stats.sessionPRFlags(view.session, priorRecords, nameIndex);
}

function prBadgeHTML(flags) {
  if (!flags.length) return '';
  return `<span class="ws-pr" title="${esc(flags.map((f) => PR_LABELS[f]).join(', '))}">PR</span>`;
}

function setRowHTML(ex, i, set, j, flags) {
  const timed = ex.mode === 'time';
  const factor = TIME_FACTOR[ex.timeUnit] || 1;
  const valueInputs = timed
    ? `<input type="number" class="ws-input" inputmode="decimal" min="0" step="any" aria-label="Set ${j + 1} time"
         value="${set.durationSec != null ? Math.round((set.durationSec / factor) * 100) / 100 : ''}" oninput="window.wsSetVal(${i},${j},'time',this.value)" />`
    : `<input type="number" class="ws-input" inputmode="decimal" min="0" step="any" placeholder="BW" title="Leave blank for body weight" aria-label="Set ${j + 1} weight"
         value="${set.weightKg > 0 ? fmtWeight(set.weightKg) : ''}" oninput="window.wsSetVal(${i},${j},'weight',this.value)" />
       <input type="number" class="ws-input" inputmode="numeric" min="0" step="1" aria-label="Set ${j + 1} reps"
         value="${set.reps ?? ''}" oninput="window.wsSetVal(${i},${j},'reps',this.value)" />`;
  return `
    <div class="ws-set-row ${timed ? 'timed' : ''} ${set.done ? 'done' : ''}">
      <span class="ws-set-num">${j + 1}</span>
      ${valueInputs}
      <button class="ws-check ${set.done ? 'on' : ''}" aria-pressed="${set.done}" aria-label="Set ${j + 1} done" onclick="window.wsToggleSet(${i},${j})">✓</button>
      <span class="ws-pr-slot" id="ws-pr-${i}-${j}">${prBadgeHTML(flags)}</span>
      <button class="ws-remove" title="Remove set" aria-label="Remove set ${j + 1}" onclick="window.wsRemoveSet(${i},${j})">×</button>
    </div>`;
}

function exerciseHTML(ex, i, flags) {
  const last = lastTime(ex);
  const lastHTML = last
    ? `<div class="ws-last">Last: ${last.sets.map((s) => fmtSet(s, last.mode)).join(', ')} <span class="ws-last-date">· ${dateShortY(last.date)}</span></div>`
    : '';
  const timed = ex.mode === 'time';
  const head = timed
    ? `<span>Set</span><span>Time (${esc(ex.timeUnit || 's')})</span><span></span><span></span><span></span>`
    : `<span>Set</span><span>Weight (${weightUnit})</span><span>Reps</span><span></span><span></span><span></span>`;
  return `
    <div class="ws-ex">
      <div class="ws-ex-head">
        <div class="ws-ex-name">${esc(ex.name)}</div>
        <button class="ghost-btn ws-mini-btn" onclick="window.wsMarkAll(${i})">Mark all as planned</button>
      </div>
      ${lastHTML}
      <div class="ws-set-row ws-set-head ${timed ? 'timed' : ''}">${head}</div>
      ${ex.sets.map((set, j) => setRowHTML(ex, i, set, j, flags[j] || [])).join('')}
      <div class="ws-ex-foot">
        <button class="ws-link" onclick="window.wsAddSet(${i})">+ Add set</button>
        <button class="ws-link ws-link-muted" onclick="window.wsRemoveExercise(${i})">Remove exercise</button>
      </div>
    </div>`;
}

function renderView() {
  const el = ensureViewEl();
  // Re-rendering replaces the scrolling body, so carry its scroll position over
  const prevScroll = el.querySelector('.pg-modal-body')?.scrollTop ?? 0;
  const s = view.session;
  const hasWeighted = s.exercises.some((ex) => ex.mode !== 'time');
  const flags = prFlags();
  const editing = view.mode === 'edit';
  el.innerHTML = `
    <div class="pg-modal-box ws-box">
      <div class="pg-modal-header">
        <div>
          <div class="pg-modal-title">${esc(sessionTitle(s))}</div>
          <div class="pg-modal-subtitle">${dateLongY(s.date)} · ${editing ? 'Editing a past workout' : 'In progress, saved as you go'}</div>
        </div>
        <button class="pg-close-btn" title="${editing ? 'Close' : 'Close (your workout stays saved)'}" onclick="window.wsClose()">×</button>
      </div>
      <div class="pg-modal-body">
        ${hasWeighted ? `<div class="field-hint ws-bw-hint">BW means body weight. Leave weight blank for a bodyweight set.</div>` : ''}
        ${s.exercises.length ? s.exercises.map((ex, i) => exerciseHTML(ex, i, flags[i])).join('') : `<div class="pg-empty-day">No exercises. Add one below.</div>`}
        <button class="pg-add-day-btn" onclick="window.wsOpenAddExercise()">+ Add exercise</button>
      </div>
      <div class="pg-modal-footer">
        ${editing
          ? `<button class="ghost-btn" onclick="window.wsClose()">Cancel</button>
             <button class="add-btn" onclick="window.wsSaveEdit()">Save changes</button>`
          : `<button class="ghost-btn pg-delete-btn" onclick="window.wsDiscard()">Discard workout</button>
             <button class="add-btn" onclick="window.wsFinish()">Finish</button>`}
      </div>
    </div>
  `;
  const body = el.querySelector('.pg-modal-body');
  if (body) body.scrollTop = prevScroll;
}

// Updates PR badges in place, so typing in a field doesn't re-render and lose focus.
function refreshBadges() {
  const flags = prFlags();
  view.session.exercises.forEach((ex, i) =>
    ex.sets.forEach((_, j) => {
      const slot = document.getElementById(`ws-pr-${i}-${j}`);
      if (slot) slot.innerHTML = prBadgeHTML(flags[i][j] || []);
    })
  );
}

window.wsSetVal = (i, j, field, raw) => {
  const ex = view?.session.exercises[i];
  const set = ex?.sets[j];
  if (!set) return;
  const v = parseFloat(raw);
  if (field === 'reps') set.reps = Number.isFinite(v) && v >= 0 ? Math.round(v) : null;
  else if (field === 'weight') set.weightKg = Number.isFinite(v) && v > 0 ? displayToKg(v) : null;
  else if (field === 'time') set.durationSec = Number.isFinite(v) && v > 0 ? v * (TIME_FACTOR[ex.timeUnit] || 1) : null;
  changed(true);
  if (set.done) refreshBadges();
};

window.wsToggleSet = (i, j) => {
  const set = view?.session.exercises[i]?.sets[j];
  if (!set) return;
  set.done = !set.done;
  changed();
  renderView();
};

window.wsMarkAll = (i) => {
  const ex = view?.session.exercises[i];
  if (!ex) return;
  ex.sets.forEach((s) => { s.done = true; });
  changed();
  renderView();
};

window.wsAddSet = (i) => {
  const ex = view?.session.exercises[i];
  if (!ex) return;
  const prev = ex.sets[ex.sets.length - 1];
  ex.sets.push({
    reps: prev?.reps ?? null,
    weightKg: prev?.weightKg ?? null,
    durationSec: prev?.durationSec ?? null,
    done: false,
    planned: null, // added during the session, not part of the plan
  });
  changed();
  renderView();
};

window.wsRemoveSet = (i, j) => {
  const ex = view?.session.exercises[i];
  if (!ex) return;
  ex.sets.splice(j, 1);
  changed();
  renderView();
};

window.wsRemoveExercise = async (i) => {
  const ex = view?.session.exercises[i];
  if (!ex) return;
  if (!(await showConfirm(`Remove ${ex.name} from this workout?`, 'Remove'))) return;
  view.session.exercises.splice(i, 1);
  changed();
  renderView();
};

window.wsClose = async () => {
  if (!view) return;
  if (view.mode === 'edit' && view.dirty && !(await showConfirm('Discard your changes to this workout?', 'Discard'))) return;
  if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; persistNow(); }
  closeView();
};

function doneCount(session) {
  return session.exercises.reduce((n, ex) => n + stats.doneSets(ex).length, 0);
}

window.wsFinish = async () => {
  if (!view) return;
  const done = doneCount(view.session);
  const msg = done
    ? `Finish and save this workout? ${plural(done, 'checked set')} will be saved. Unchecked sets won't count.`
    : 'No sets are checked. Save an empty workout anyway?';
  if (!(await showConfirm(msg, done ? 'Finish' : 'Save empty'))) return;
  if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
  await workouts.finishActiveSession(view.session);
  await reloadSessions();
  closeView();
  currentTab = 'log';
  renderTabs();
};

window.wsDiscard = async () => {
  if (!view) return;
  if (!(await showConfirm('Discard this workout? Nothing from it will be saved.', 'Discard'))) return;
  if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
  await workouts.discardActiveSession();
  activeSession = null;
  closeView();
};

window.wsSaveEdit = async () => {
  if (!view || view.mode !== 'edit') return;
  if (!doneCount(view.session) && !(await showConfirm('No sets are checked. Save this workout with no completed sets?', 'Save'))) return;
  await workouts.saveCompletedSession(view.session);
  await reloadSessions();
  closeView();
};

// ── Add exercise (pick from library or type a new one) ──
function ensureAddModal() {
  let el = document.getElementById('ws-add-modal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ws-add-modal';
    el.className = 'pg-modal';
    el.addEventListener('click', (e) => { if (e.target === el) el.classList.remove('open'); });
    document.body.appendChild(el);
  }
  return el;
}

function canAddToProgram() {
  if (!view || view.mode !== 'active') return false;
  const program = ctx.getPrograms().find((p) => p.id === view.session.programId);
  return !!program?.days.find((d) => d.dayNumber === view.session.dayNumber);
}

function addExResultsHTML() {
  const q = addExQuery.trim();
  const nq = stats.normName(q);
  const lib = ctx.getExercises();
  const matches = (nq ? lib.filter((e) => stats.normName(e.name).includes(nq)) : lib)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 40);
  const exact = lib.some((e) => stats.normName(e.name) === nq);
  return `
    ${q && !exact ? `<button class="ws-pick ws-pick-new" onclick="window.wsAddNewExercise()">+ Add "${esc(q)}" as a new exercise</button>` : ''}
    ${matches.map((e) => `<button class="ws-pick" onclick="window.wsAddLibraryExercise('${e.id}')">${esc(e.name)}</button>`).join('')}
    ${!matches.length && !q ? `<div class="pg-empty-day">Your exercise library is empty. Type a name to add one.</div>` : ''}
  `;
}

window.wsOpenAddExercise = () => {
  addExQuery = '';
  const el = ensureAddModal();
  el.innerHTML = `
    <div class="pg-modal-box">
      <div class="pg-modal-header">
        <div class="pg-modal-title">Add Exercise</div>
        <button class="pg-close-btn" onclick="document.getElementById('ws-add-modal').classList.remove('open')">×</button>
      </div>
      <div class="pg-modal-body">
        <input type="text" id="ws-add-search" class="pg-ex-search-input" placeholder="Search or type a new exercise..." oninput="window.wsAddSearch(this.value)" />
        ${canAddToProgram()
          ? `<label class="ws-checkbox"><input type="checkbox" id="ws-add-to-program" /><span>Also add to this program (Day ${view.session.dayNumber})</span></label>`
          : ''}
        <div class="ws-pick-list" id="ws-add-results">${addExResultsHTML()}</div>
      </div>
    </div>
  `;
  el.classList.add('open');
  setTimeout(() => document.getElementById('ws-add-search')?.focus(), 50);
};

window.wsAddSearch = (val) => {
  addExQuery = val;
  const el = document.getElementById('ws-add-results');
  if (el) el.innerHTML = addExResultsHTML();
};

async function addToProgramDay(entry) {
  const program = ctx.getPrograms().find((p) => p.id === view.session.programId);
  const day = program?.days.find((d) => d.dayNumber === view.session.dayNumber);
  if (!day) return;
  const updated = structuredClone(program);
  updated.days.find((d) => d.dayNumber === day.dayNumber).exercises.push(entry);
  updated.updatedAt = Date.now();
  await ctx.saveProgram(updated);
  ctx.onProgramsChanged();
}

function finishAdd(ex) {
  view.session.exercises.push(ex);
  document.getElementById('ws-add-modal')?.classList.remove('open');
  changed();
  renderView();
  const body = document.querySelector('#ws-modal .pg-modal-body');
  if (body) body.scrollTop = body.scrollHeight;
}

window.wsAddLibraryExercise = async (id) => {
  const lib = ctx.getExercises().find((e) => e.id === id);
  if (!lib || !view) return;
  const alsoProgram = document.getElementById('ws-add-to-program')?.checked;
  if (alsoProgram) {
    await addToProgramDay({
      exerciseId: lib.id, exerciseName: lib.name,
      sets: lib.sets || '', reps: lib.reps || '', weightKg: lib.weightKg || '',
      rest: lib.rest || '', restUnit: lib.restUnit || 's',
      time: lib.time || '', timeUnit: lib.timeUnit || 's', notes: lib.notes || '',
    });
  }
  finishAdd(buildSessionExercise(lib, lib.name, lib.id));
};

window.wsAddNewExercise = async () => {
  const name = addExQuery.trim().replace(/\s+/g, ' ');
  if (!name || !view) return;
  const alsoProgram = document.getElementById('ws-add-to-program')?.checked;
  let exerciseId = null;
  if (alsoProgram) {
    // Adding to the program needs a library entry, so it gets a stable ID
    const newEx = { id: 'ex_' + Date.now(), name, sets: '', reps: '', weightKg: '', rest: '', restUnit: 's', time: '', timeUnit: 's', notes: '', muscleGroup: '', difficulty: '' };
    await ctx.saveExercise(newEx);
    exerciseId = newEx.id;
    await addToProgramDay({ exerciseId, exerciseName: name, sets: '', reps: '', weightKg: '', rest: '', restUnit: 's', time: '', timeUnit: 's', notes: '' });
    nameIndex = stats.buildNameIndex(ctx.getExercises(), completedSessions);
  }
  // Session-only by default: no ID, matched to other sessions by name
  finishAdd(buildSessionExercise({}, name, exerciseId));
};

// ── Workout Log tab ──
function displayName(rec) {
  if (rec.key.startsWith('id:')) {
    const lib = ctx.getExercises().find((e) => `id:${e.id}` === rec.key);
    if (lib) return lib.name;
  }
  return String(rec.name || '').trim();
}

// "185 lb × 5 reps", or "BW × 12 reps" for a bodyweight set. Weight and reps
// are shown together because a record only means something as a pair.
function fmtWeightReps(weightKg, reps) {
  const w = weightKg > 0 ? `${fmtWeight(weightKg)} ${weightUnit}` : 'BW';
  return reps ? `${w} × ${plural(reps, 'rep')}` : w;
}

let prsOpen = false; // Personal Records list starts collapsed

function prsHTML() {
  const idx = stats.buildNameIndex(ctx.getExercises(), completedSessions);
  const records = [...stats.computePRs(completedSessions, idx).values()].sort((a, b) =>
    displayName(a).localeCompare(displayName(b))
  );
  if (!records.length) return '';
  const item = (label, value, date, extra = '') =>
    `<div class="ws-pr-item"><span class="ws-pr-lbl">${label}</span><span class="ws-pr-val">${value}${extra}</span><span class="ws-pr-date">${dateShortY(date)}</span></div>`;
  const rows = records.map((r) => {
    const items = [];
    if (r.heaviest) items.push(item('Heaviest', fmtWeightReps(r.heaviest.weightKg, r.heaviest.reps), r.heaviest.date));
    if (r.mostReps) items.push(item('Most reps', fmtWeightReps(r.mostReps.weightKg, r.mostReps.reps), r.mostReps.date));
    if (r.best1RM) items.push(item('Est. 1RM', `${fmtWeight(r.best1RM.valueKg)} ${weightUnit}`, r.best1RM.date,
      ` <span class="ws-pr-from">from ${fmtWeight(r.best1RM.weightKg)} × ${r.best1RM.reps}</span>`));
    if (r.longest) items.push(item('Longest', fmtDuration(r.longest.durationSec), r.longest.date));
    return `<div class="ws-pr-row"><div class="ws-pr-name">${esc(displayName(r))}</div><div class="ws-pr-items">${items.join('')}</div></div>`;
  }).join('');
  return `
    <div class="meter-section ws-prs ${prsOpen ? 'open' : ''}" id="ws-prs">
      <button class="ws-prs-toggle" aria-expanded="${prsOpen}" onclick="window.wsTogglePRs()">
        <span class="section-title" style="margin:0;">Personal Records</span>
        <span class="ws-prs-count">${plural(records.length, 'exercise')}</span>
        <span class="info-banner-chevron">▼</span>
      </button>
      <div class="ws-prs-body">
        ${rows}
        <div class="field-hint" style="color:var(--muted);margin-top:10px;">BW means body weight. Est. 1RM is the average of the Epley and Brzycki formulas, from sets of 1 to 10 reps.</div>
      </div>
    </div>`;
}

window.wsTogglePRs = () => {
  prsOpen = !prsOpen;
  const el = document.getElementById('ws-prs');
  if (!el) return;
  el.classList.toggle('open', prsOpen);
  el.querySelector('.ws-prs-toggle')?.setAttribute('aria-expanded', String(prsOpen));
};

// ── Session history: same Day / Month / Year filters and "Load More"
// paging as the Supplement Tracker's History tab ──
const HISTORY_PAGE_SIZE = 30;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let historyMode = 'day'; // 'day' | 'month' | 'year'
let historyYear = '';
let historyMonth = '';
let historyLimit = HISTORY_PAGE_SIZE;

function resetHistoryPaging() {
  historyLimit = HISTORY_PAGE_SIZE;
}

function historyFiltersHTML() {
  const years = [...new Set(completedSessions.map((s) => s.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  if ((historyMode === 'month' || historyMode === 'year') && !years.includes(historyYear)) historyYear = years[0] || '';
  let selects = '';
  if (historyMode === 'year' || (historyMode === 'month' && years.length > 1)) {
    selects += `<select onchange="window.wsSetHistoryYear(this.value)">
      ${years.map((y) => `<option value="${y}" ${y === historyYear ? 'selected' : ''}>${y}</option>`).join('')}
    </select>`;
  }
  if (historyMode === 'month') {
    const months = [...new Set(completedSessions.filter((s) => s.date.slice(0, 4) === historyYear).map((s) => s.date.slice(5, 7)))].sort();
    if (!months.includes(historyMonth)) historyMonth = months[months.length - 1] || '';
    selects += `<select onchange="window.wsSetHistoryMonth(this.value)">
      ${months.map((m) => `<option value="${m}" ${m === historyMonth ? 'selected' : ''}>${MONTH_NAMES[parseInt(m, 10) - 1]}</option>`).join('')}
    </select>`;
  }
  return `
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
      <div class="wt-toggle">
        <button class="wt-toggle-btn ${historyMode === 'day' ? 'active' : ''}" onclick="window.wsSetHistoryMode('day')">Day</button>
        <button class="wt-toggle-btn ${historyMode === 'month' ? 'active' : ''}" onclick="window.wsSetHistoryMode('month')">Month</button>
        <button class="wt-toggle-btn ${historyMode === 'year' ? 'active' : ''}" onclick="window.wsSetHistoryMode('year')">Year</button>
      </div>
      ${selects}
    </div>`;
}

function filteredSessions() {
  if (historyMode === 'month') return completedSessions.filter((s) => s.date.slice(0, 4) === historyYear && s.date.slice(5, 7) === historyMonth);
  if (historyMode === 'year') return completedSessions.filter((s) => s.date.slice(0, 4) === historyYear);
  return completedSessions;
}

function historyListHTML() {
  const sessions = filteredSessions();
  if (!sessions.length) return '<div style="color:var(--muted);padding:20px 0;">No workouts logged in this period.</div>';
  const visible = historyMode === 'day' ? sessions.slice(0, historyLimit) : sessions;
  const rowsHtml = visible.map((s) => `
    <tr class="day-row" onclick="window.wsOpenDetail('${s.id}')">
      <td><span class="day-date">${dateLongY(s.date)}</span></td>
      <td>${esc(sessionTitle(s))}</td>
      <td>${s.exercises.filter((ex) => stats.doneSets(ex).length).length}</td>
      <td>${doneCount(s)}</td>
    </tr>`).join('');
  const loadMore = historyMode === 'day' && sessions.length > historyLimit
    ? `<button class="ghost-btn ws-load-more" onclick="window.wsLoadMoreHistory()">Load More</button>`
    : '';
  return `
    <table class="days-table">
      <thead><tr><th>Date</th><th>Workout</th><th>Exercises</th><th>Sets</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    ${loadMore}`;
}

function renderHistory() {
  const filters = document.getElementById('ws-history-filters');
  const list = document.getElementById('ws-history-list');
  if (filters) filters.innerHTML = historyFiltersHTML();
  if (list) list.innerHTML = historyListHTML();
}

window.wsSetHistoryMode = (mode) => {
  historyMode = mode;
  historyYear = '';
  historyMonth = '';
  resetHistoryPaging();
  renderHistory();
};
window.wsSetHistoryYear = (year) => { historyYear = year; historyMonth = ''; renderHistory(); };
window.wsSetHistoryMonth = (month) => { historyMonth = month; renderHistory(); };
window.wsLoadMoreHistory = () => { historyLimit += HISTORY_PAGE_SIZE; renderHistory(); };

function renderLog() {
  const el = document.getElementById('pg-log');
  if (!el) return;
  if (!completedSessions.length) {
    el.innerHTML = `<div class="no-history">No workouts logged yet.<br><br>Open a program and tap Start on a day to log your first workout.</div>`;
    return;
  }
  el.innerHTML = `
    ${prsHTML()}
    <div class="section-title" style="margin:4px 0 10px;">Sessions</div>
    <div id="ws-history-filters"></div>
    <div class="ws-history-wrap"><div id="ws-history-list"></div></div>`;
  renderHistory();
}

window.wsOpenDetail = (id) => {
  const s = completedSessions.find((x) => x.id === id);
  if (!s) return;
  let el = document.getElementById('ws-detail-modal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ws-detail-modal';
    el.className = 'pg-modal';
    el.addEventListener('click', (e) => { if (e.target === el) el.classList.remove('open'); });
    document.body.appendChild(el);
  }
  const body = s.exercises.map((ex) => {
    const done = stats.doneSets(ex);
    return `
      <div class="pg-exercise-item">
        <div class="pg-exercise-name">${esc(ex.name)}</div>
        <div class="pg-exercise-meta">${done.length
          ? done.map((set) => fmtSet(set, ex.mode)).join(', ') + (ex.mode === 'reps' && done.some((d) => d.weightKg > 0) ? ` (${weightUnit})` : '')
          : 'No sets completed'}</div>
      </div>`;
  }).join('');
  el.innerHTML = `
    <div class="pg-modal-box">
      <div class="pg-modal-header">
        <div>
          <div class="pg-modal-title">${esc(sessionTitle(s))}</div>
          <div class="pg-modal-subtitle">${dateLongY(s.date)} · ${plural(doneCount(s), 'set')}</div>
        </div>
        <button class="pg-close-btn" onclick="document.getElementById('ws-detail-modal').classList.remove('open')">×</button>
      </div>
      <div class="pg-modal-body">${body || '<div class="pg-empty-day">No exercises.</div>'}</div>
      <div class="pg-modal-footer">
        <button class="ghost-btn pg-delete-btn" onclick="window.wsDeleteSession('${s.id}')">Delete</button>
        <div style="display:flex;gap:8px;">
          <button class="ghost-btn" onclick="document.getElementById('ws-detail-modal').classList.remove('open')">Close</button>
          <button class="add-btn" onclick="window.wsEditSession('${s.id}')">Edit</button>
        </div>
      </div>
    </div>`;
  el.classList.add('open');
};

window.wsEditSession = (id) => {
  const s = completedSessions.find((x) => x.id === id);
  if (!s) return;
  document.getElementById('ws-detail-modal')?.classList.remove('open');
  openView(structuredClone(s), 'edit');
};

window.wsDeleteSession = async (id) => {
  const s = completedSessions.find((x) => x.id === id);
  if (!s) return;
  if (!(await showConfirm(`Delete the ${sessionTitle(s)} workout from ${formatDateShort(s.date)}? This cannot be undone.`, 'Delete'))) return;
  await workouts.deleteCompletedSession(id);
  document.getElementById('ws-detail-modal')?.classList.remove('open');
  await reloadSessions();
  renderLog();
};

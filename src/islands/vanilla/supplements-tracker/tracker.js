import * as db from "../../../lib/db.js";
import { todayStr } from "../../../lib/dates.js";
import {
  SUPPLEMENT_ITEMS,
  KNOWN_SUPPLEMENTS,
  KNOWN_MEDICATIONS,
  loadSupplementItems,
  saveSupplementItem,
  deleteSupplementItemFromDB,
} from "../../../lib/supplements.js";
import { esc, showConfirm, showDbError } from "../../../lib/ui.js";

// ═══════════════════════════════════════════════════════════════════
// TODAY'S DOSE LOG — session state for doses logged today. Each entry
// is its own snapshot ({ itemId, name, amount, unit, loggedAt }) taken
// at the moment of logging, never a live reference back to
// SUPPLEMENT_ITEMS — so editing a supplement's amount/unit mid-day
// never changes doses already logged earlier that same day. This
// mirrors the "frozen forever" snapshot principle in today.js's
// buildLoggedItems()/persistState().
// ═══════════════════════════════════════════════════════════════════
let doseLog = [];
let editingSupplementId = null;
let activeTab = "log"; // "log" | "history"

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDateWithYear(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function loggedTodayCount(itemId) {
  const today = todayStr();
  return doseLog.filter((d) => d.itemId === itemId && todayStr(new Date(d.loggedAt)) === today).length;
}

// Whether every supplement logged on a given day (from a supplementDays
// snapshot) met its target — evaluated against each item's CURRENT target
// in SUPPLEMENT_ITEMS (target is a live "goal," never snapshotted per dose,
// same rule the Log tab's "X of Y today" counter already follows). Items
// deleted since that day are skipped since their target is no longer known.
// Returns true/false, or null if no logged item's target can still be
// determined (e.g. every item logged that day has since been deleted).
function computeDayTargetStatus(doseLogEntries) {
  const countsByItem = {};
  doseLogEntries.forEach((d) => {
    countsByItem[d.itemId] = (countsByItem[d.itemId] || 0) + 1;
  });
  let anyKnown = false;
  let allMet = true;
  Object.keys(countsByItem).forEach((itemId) => {
    const item = SUPPLEMENT_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    anyKnown = true;
    if (countsByItem[itemId] < item.target) allMet = false;
  });
  if (!anyKnown) return null;
  return allMet;
}

function targetStatusIcon(status) {
  if (status === true) return '<span style="color:var(--protein);">✓</span>';
  if (status === false) return '<span style="color:var(--warn);">✗</span>';
  return '<span style="color:var(--muted);">–</span>';
}

// ═══════════════════════════════════════════════════════════════════
// PERSIST — save today's dose log snapshot to IndexedDB + localStorage
// ═══════════════════════════════════════════════════════════════════
async function persistDoseLog() {
  db.saveSuppTrackerLS(todayStr(), doseLog);
  const snapshot = { date: todayStr(), doseLog: [...doseLog] };
  try {
    await db.dbPut("supplementDays", snapshot);
  } catch (e) {
    showDbError();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SUPPLEMENT FORM MODAL (add / edit)
// ═══════════════════════════════════════════════════════════════════
function ensureSupplementModal() {
  if (!document.getElementById("supplement-form-modal")) {
    const el = document.createElement("div");
    el.id = "supplement-form-modal";
    el.className = "pg-modal";
    el.addEventListener("click", (e) => { if (e.target === el) closeSupplementModal(); });
    document.body.appendChild(el);
  }
}

function knownOptionsHtml() {
  const suppOpts = KNOWN_SUPPLEMENTS.map((s) => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join("");
  const medOpts = KNOWN_MEDICATIONS.map((m) => `<option value="${esc(m.name)}">${esc(m.name)}</option>`).join("");
  return `
    <option value="" selected disabled>Choose a supplement…</option>
    <optgroup label="Supplements">${suppOpts}</optgroup>
    <optgroup label="Approved Medications">${medOpts}</optgroup>
  `;
}

function openSupplementModal(isEdit) {
  ensureSupplementModal();
  const modal = document.getElementById("supplement-form-modal");
  modal.innerHTML = `
    <div class="pg-modal-box">
      <div class="pg-modal-header">
        <div class="pg-modal-title">${isEdit ? "Edit Supplement" : "Add Supplement"}</div>
        <button class="pg-close-btn" onclick="window.closeSupplementModal()">×</button>
      </div>
      <div class="pg-modal-body">
        <div class="field-group" style="margin-bottom:12px;">
          <span class="field-label">Supplement List</span>
          <select id="supp-known-select" onchange="window.handleKnownSupplementSelect()">
            ${knownOptionsHtml()}
          </select>
          <span class="field-hint">Not in the list? Enter it yourself below</span>
        </div>
        <div class="add-row add-row-2">
          <div class="field-group">
            <span class="field-label">Name</span>
            <input id="supp-name" type="text" placeholder="e.g. Creatine" />
          </div>
          <div class="field-group">
            <span class="field-label">Dose</span>
            <input id="supp-amount" type="number" placeholder="500" min="0" step="any" />
          </div>
          <div class="field-group">
            <span class="field-label">Unit</span>
            <select id="supp-unit">
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="IU">IU</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Dose/Day</span>
            <input id="supp-target" type="number" placeholder="1" min="1" step="1" />
          </div>
        </div>
      </div>
      <div class="pg-modal-footer">
        ${isEdit ? '<button class="ghost-btn pg-delete-btn" id="supplement-modal-delete-btn">Delete</button>' : "<div></div>"}
        <div style="display:flex;gap:8px;">
          <button class="ghost-btn" onclick="window.closeSupplementModal()">Cancel</button>
          <button id="supplement-modal-submit" class="add-btn" ${isEdit ? "" : 'onclick="window.handleAddSupplementItem(event)"'}>${isEdit ? "Update" : "+ Add"}</button>
        </div>
      </div>
    </div>
  `;
  modal.classList.add("open");
}
window.openSupplementModal = openSupplementModal;

function closeSupplementModal() {
  const modal = document.getElementById("supplement-form-modal");
  if (modal) modal.classList.remove("open");
  editingSupplementId = null;
}
window.closeSupplementModal = closeSupplementModal;

function handleKnownSupplementSelect() {
  const select = document.getElementById("supp-known-select");
  const name = select.value;
  if (!name) return;
  document.getElementById("supp-name").value = name;
}
window.handleKnownSupplementSelect = handleKnownSupplementSelect;

async function handleAddSupplementItem(e) {
  if (e) e.preventDefault();
  const name = document.getElementById("supp-name").value.trim();
  if (!name) return;
  const amount = Math.max(0, parseFloat(document.getElementById("supp-amount").value) || 0);
  const unit = document.getElementById("supp-unit").value;
  const targetRaw = document.getElementById("supp-target").value;
  const target = Math.max(1, targetRaw === "" ? 1 : (parseInt(targetRaw, 10) || 0));
  if (!await showConfirm(`Add "${name}" to your tracker?`, "Add")) return;
  const newItem = { id: "sup_" + Date.now(), name, amount, unit, target, inactive: false };
  SUPPLEMENT_ITEMS.push(newItem);
  await saveSupplementItem(newItem);
  closeSupplementModal();
  renderSupplementCards();
}
window.handleAddSupplementItem = handleAddSupplementItem;

function fillSupplementForm(id) {
  const item = SUPPLEMENT_ITEMS.find((i) => i.id === id);
  if (!item) return;
  document.getElementById("supp-known-select").value = "";
  document.getElementById("supp-name").value = item.name;
  document.getElementById("supp-amount").value = item.amount;
  document.getElementById("supp-unit").value = item.unit;
  document.getElementById("supp-target").value = item.target;
  document.getElementById("supplement-modal-delete-btn").onclick = async function () {
    if (!await showConfirm("Delete this supplement?", "Delete")) return;
    const idx = SUPPLEMENT_ITEMS.findIndex((i) => i.id === id);
    if (idx !== -1) SUPPLEMENT_ITEMS.splice(idx, 1);
    await deleteSupplementItemFromDB(id);
    closeSupplementModal();
    renderSupplementCards();
  };
  document.getElementById("supplement-modal-submit").onclick = async function (e) {
    if (e) e.preventDefault();
    const updatedName = document.getElementById("supp-name").value.trim();
    if (!updatedName) return;
    if (!await showConfirm(`Save changes to "${updatedName}"?`, "Save")) return;
    item.name = updatedName;
    item.amount = Math.max(0, parseFloat(document.getElementById("supp-amount").value) || 0);
    item.unit = document.getElementById("supp-unit").value;
    const targetRaw = document.getElementById("supp-target").value;
    item.target = Math.max(1, targetRaw === "" ? 1 : (parseInt(targetRaw, 10) || 0));
    await saveSupplementItem(item);
    closeSupplementModal();
    renderSupplementCards();
  };
}

function editSupplementItem(id) {
  editingSupplementId = id;
  openSupplementModal(true);
  fillSupplementForm(id);
}
window.editSupplementItem = editSupplementItem;

async function deleteSupplementItem(id) {
  if (!await showConfirm("Delete this supplement?", "Delete")) return;
  const idx = SUPPLEMENT_ITEMS.findIndex((i) => i.id === id);
  if (idx !== -1) SUPPLEMENT_ITEMS.splice(idx, 1);
  await deleteSupplementItemFromDB(id);
  renderSupplementCards();
}
window.deleteSupplementItem = deleteSupplementItem;

// ═══════════════════════════════════════════════════════════════════
// DOSE LOGGING — one "+" tap logs exactly one dose event, snapshotting
// the item's current name/amount/unit by value.
// ═══════════════════════════════════════════════════════════════════
function logDose(itemId) {
  const item = SUPPLEMENT_ITEMS.find((i) => i.id === itemId);
  if (!item) return;
  if (loggedTodayCount(itemId) >= item.target) return;
  doseLog.push({
    itemId,
    name: item.name,
    amount: item.amount,
    unit: item.unit,
    loggedAt: new Date().toISOString(),
  });
  persistDoseLog();
  renderSupplementCards();
}
window.logDose = logDose;

// Undoes the most recently logged dose for this item today — for
// correcting an accidental tap, not a general history editor (only
// ever removes from today's in-memory doseLog, never a past day).
function removeLastDose(itemId) {
  for (let i = doseLog.length - 1; i >= 0; i--) {
    if (doseLog[i].itemId === itemId) {
      doseLog.splice(i, 1);
      persistDoseLog();
      renderSupplementCards();
      return;
    }
  }
}
window.removeLastDose = removeLastDose;

// ═══════════════════════════════════════════════════════════════════
// TABS — Log / History sub-nav, mirrors the VO2 Max calculator's
// in-page nav-tabs pattern (reuses the site's nav-tabs/nav-tab classes).
// ═══════════════════════════════════════════════════════════════════
function renderTabs() {
  const el = document.getElementById("supp-tabs");
  el.innerHTML = `
    <nav class="nav-tabs" style="margin-bottom:16px;">
      <button class="nav-tab ${activeTab === "log" ? "active" : ""}" onclick="window.suppSetTab('log')">Log</button>
      <button class="nav-tab ${activeTab === "history" ? "active" : ""}" onclick="window.suppSetTab('history')">History</button>
    </nav>
  `;
}

function renderActivePanel() {
  document.getElementById("supp-panel-log").hidden = activeTab !== "log";
  document.getElementById("supp-panel-history").hidden = activeTab !== "history";
  const infoBanners = document.getElementById("supp-info-banners");
  if (infoBanners) {
    infoBanners.style.display = activeTab === "log" ? "" : "none";
  }
  if (activeTab === "history") renderHistory();
}

function suppSetTab(tab) {
  activeTab = tab;
  renderTabs();
  renderActivePanel();
}
window.suppSetTab = suppSetTab;

// ═══════════════════════════════════════════════════════════════════
// HISTORY — past days read straight from the frozen supplementDays
// snapshots (never re-derived from the current SUPPLEMENT_ITEMS
// catalog), same principle as history.js's day-detail modal.
//
// Three view modes:
//   "day"   (default) — most-recent-first flat list, paginated via an
//           explicit "Load More" button (no infinite-scroll listener).
//   "month" — pick Month (+ Year, only if data spans more than one
//           calendar year) and see every day logged that month.
//   "year"  — pick a Year and see every day logged that year.
// The full day list is fetched once per History-tab visit and cached in
// historyAllDays; switching mode/year/month re-filters that cache
// in-memory instead of re-querying IndexedDB.
// ═══════════════════════════════════════════════════════════════════
const HISTORY_PAGE_SIZE = 30;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let historyAllDays = [];
let historyMode = "day"; // "day" | "month" | "year"
let historyYear = "";
let historyMonth = "";
let historyDayLimit = HISTORY_PAGE_SIZE;

async function renderHistory() {
  let allDays = [];
  try {
    allDays = await db.dbGetAll("supplementDays");
  } catch (e) {
    allDays = [];
  }
  historyAllDays = allDays
    .filter((d) => d.doseLog && d.doseLog.length)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  historyDayLimit = HISTORY_PAGE_SIZE;
  renderHistoryFilters();
  renderHistoryList();
}

function historyYearsAvailable() {
  return [...new Set(historyAllDays.map((d) => d.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
}

function renderHistoryFilters() {
  const el = document.getElementById("supplement-history-filters");
  if (!historyAllDays.length) {
    el.innerHTML = "";
    return;
  }
  const years = historyYearsAvailable();
  if ((historyMode === "month" || historyMode === "year") && !historyYear) {
    historyYear = years[0] || "";
  }

  let extraSelects = "";
  const showYearSelect = historyMode === "year" || (historyMode === "month" && years.length > 1);
  if (showYearSelect) {
    extraSelects += `<select id="supp-history-year" onchange="window.suppSetHistoryYear(this.value)">
      ${years.map((y) => `<option value="${y}" ${y === historyYear ? "selected" : ""}>${y}</option>`).join("")}
    </select>`;
  }
  if (historyMode === "month") {
    const monthsWithData = [...new Set(
      historyAllDays.filter((d) => d.date.slice(0, 4) === historyYear).map((d) => d.date.slice(5, 7))
    )].sort();
    if (!historyMonth || !monthsWithData.includes(historyMonth)) {
      historyMonth = monthsWithData[monthsWithData.length - 1] || "";
    }
    extraSelects += `<select id="supp-history-month" onchange="window.suppSetHistoryMonth(this.value)">
      ${monthsWithData.map((m) => `<option value="${m}" ${m === historyMonth ? "selected" : ""}>${MONTH_NAMES[parseInt(m, 10) - 1]}</option>`).join("")}
    </select>`;
  }

  el.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
      <div class="wt-toggle">
        <button class="wt-toggle-btn ${historyMode === "day" ? "active" : ""}" onclick="window.suppSetHistoryMode('day')">Day</button>
        <button class="wt-toggle-btn ${historyMode === "month" ? "active" : ""}" onclick="window.suppSetHistoryMode('month')">Month</button>
        <button class="wt-toggle-btn ${historyMode === "year" ? "active" : ""}" onclick="window.suppSetHistoryMode('year')">Year</button>
      </div>
      ${extraSelects}
    </div>
  `;
}

function filteredHistoryDays() {
  if (historyMode === "month") {
    return historyAllDays.filter((d) => d.date.slice(0, 4) === historyYear && d.date.slice(5, 7) === historyMonth);
  }
  if (historyMode === "year") {
    return historyAllDays.filter((d) => d.date.slice(0, 4) === historyYear);
  }
  return historyAllDays;
}

function renderHistoryList() {
  const list = document.getElementById("supplement-history-list");
  if (!historyAllDays.length) {
    list.innerHTML = '<div style="color:var(--muted);padding:20px 0;">No supplement history yet — logged doses will show up here.</div>';
    return;
  }
  const days = filteredHistoryDays();
  if (!days.length) {
    list.innerHTML = '<div style="color:var(--muted);padding:20px 0;">No doses logged in this period.</div>';
    return;
  }
  const visible = historyMode === "day" ? days.slice(0, historyDayLimit) : days;
  const rowsHtml = visible
    .map((day) => {
      const itemCount = new Set(day.doseLog.map((d) => d.itemId)).size;
      const status = computeDayTargetStatus(day.doseLog);
      return `<tr class="day-row" onclick="window.openSupplementDayDetail('${day.date}')">
        <td><span class="day-date">${formatDate(day.date)}</span></td>
        <td>${itemCount}</td>
        <td>${day.doseLog.length}</td>
        <td>${targetStatusIcon(status)}</td>
      </tr>`;
    })
    .join("");
  const loadMoreHtml = historyMode === "day" && days.length > historyDayLimit
    ? `<button class="ghost-btn" style="margin-top:10px;" onclick="window.suppLoadMoreHistory()">Load More</button>`
    : "";
  list.innerHTML = `
    <table class="days-table">
      <thead>
        <tr><th>Date</th><th>Supplements</th><th>Doses Logged</th><th>Target Met</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    ${loadMoreHtml}
  `;
}

function suppSetHistoryMode(mode) {
  historyMode = mode;
  historyYear = "";
  historyMonth = "";
  renderHistoryFilters();
  renderHistoryList();
}
window.suppSetHistoryMode = suppSetHistoryMode;

function suppSetHistoryYear(year) {
  historyYear = year;
  historyMonth = "";
  renderHistoryFilters();
  renderHistoryList();
}
window.suppSetHistoryYear = suppSetHistoryYear;

function suppSetHistoryMonth(month) {
  historyMonth = month;
  renderHistoryList();
}
window.suppSetHistoryMonth = suppSetHistoryMonth;

function suppLoadMoreHistory() {
  historyDayLimit += HISTORY_PAGE_SIZE;
  renderHistoryList();
}
window.suppLoadMoreHistory = suppLoadMoreHistory;

function ensureSupplementDayDetailModal() {
  if (!document.getElementById("supplement-day-detail-modal")) {
    const el = document.createElement("div");
    el.id = "supplement-day-detail-modal";
    el.className = "pg-modal";
    el.addEventListener("click", (e) => { if (e.target === el) el.classList.remove("open"); });
    document.body.appendChild(el);
  }
}

async function openSupplementDayDetail(dateStr) {
  let day = null;
  try {
    day = await db.dbGet("supplementDays", dateStr);
  } catch (e) {
    day = null;
  }
  const doses = (day && day.doseLog) || [];
  ensureSupplementDayDetailModal();
  const modal = document.getElementById("supplement-day-detail-modal");

  // Group doses by itemId (preserving first-seen order) so each supplement
  // shows one combined block — its count vs. current target, plus every
  // individual dose's own snapshotted amount/unit/time underneath.
  const groups = [];
  const groupByItem = {};
  doses.forEach((d) => {
    if (!groupByItem[d.itemId]) {
      groupByItem[d.itemId] = { itemId: d.itemId, name: d.name, doses: [] };
      groups.push(groupByItem[d.itemId]);
    }
    groupByItem[d.itemId].doses.push(d);
  });

  const overallStatus = computeDayTargetStatus(doses);
  const bodyHTML = groups.length
    ? groups
        .map((g) => {
          const item = SUPPLEMENT_ITEMS.find((i) => i.id === g.itemId);
          const targetLabel = item ? `${g.doses.length}/${item.target}` : `${g.doses.length} dose${g.doses.length === 1 ? "" : "s"}`;
          const status = item ? (g.doses.length >= item.target) : null;
          const doseListLabel = g.doses.map((d) => `${d.amount}${esc(d.unit)} @ ${formatTime(d.loggedAt)}`).join(" · ");
          return `
      <div class="day-detail-item">
        <div class="day-detail-item-top">
          <span class="day-detail-item-name">${esc(g.name)}</span>
          <span class="day-detail-item-servings">${targetLabel} ${targetStatusIcon(status)}</span>
        </div>
        <div class="day-detail-item-macros">${doseListLabel}</div>
      </div>
    `;
        })
        .join("")
    : '<p class="day-detail-unavailable">No doses logged this day.</p>';
  modal.innerHTML = `
    <div class="pg-modal-box">
      <div class="pg-modal-header">
        <div>
          <div class="pg-modal-title">${formatDateWithYear(dateStr)}</div>
          <div class="pg-modal-subtitle">${doses.length} dose${doses.length === 1 ? "" : "s"} logged · ${overallStatus ? "all targets met" : "targets not met"} ${targetStatusIcon(overallStatus)}</div>
        </div>
        <button class="pg-close-btn" onclick="document.getElementById('supplement-day-detail-modal').classList.remove('open')">×</button>
      </div>
      <div class="pg-modal-body">${bodyHTML}</div>
    </div>
  `;
  modal.classList.add("open");
}
window.openSupplementDayDetail = openSupplementDayDetail;

// ═══════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════
function renderHeader() {
  document.getElementById("supp-hdr-date").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
}

function renderSupplementCards() {
  const list = document.getElementById("supplement-cards-list");
  list.innerHTML = "";
  if (!SUPPLEMENT_ITEMS.length) {
    list.innerHTML = '<div class="no-foods" style="color:var(--muted);padding:20px 0;">No supplements saved yet. Tap "+ Add Supplement" to start tracking.</div>';
    return;
  }
  SUPPLEMENT_ITEMS.forEach((item) => {
    const count = loggedTodayCount(item.id);
    const met = count >= item.target;
    const countClass = met ? "met" : "under";
    const card = document.createElement("div");
    card.className = "mgmt-card";
    card.innerHTML = `
      <div class="mgmt-card-top">
        <div>
          <div class="mgmt-card-name">${esc(item.name)}</div>
          <div class="mgmt-card-sub">${item.amount}${esc(item.unit)}/dose · target ${item.target}/day</div>
        </div>
        <button class="mgmt-edit-btn" onclick="window.editSupplementItem('${item.id}')">Edit</button>
      </div>
      <div class="serving-ctrl" style="flex-direction:row;justify-content:center;gap:10px;">
        <button class="srv-btn" ${met ? "disabled" : ""} onclick="window.logDose('${item.id}')">+</button>
        <div class="srv-count">
          <div class="current ${countClass}">${count}</div>
          <div class="target">/ ${item.target}</div>
        </div>
        <button class="srv-btn" ${count === 0 ? "disabled" : ""} onclick="window.removeLastDose('${item.id}')">−</button>
      </div>
      <div class="mgmt-card-actions">
        <button class="mgmt-delete-btn" onclick="window.deleteSupplementItem('${item.id}')">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════════
// INIT — mirrors today.js's init()/midnight-reset pattern exactly,
// since no shared/importable reset function exists to call instead.
// ═══════════════════════════════════════════════════════════════════
async function init() {
  await db.openDB();
  await loadSupplementItems();

  const saved = db.loadSuppTrackerLS(todayStr());
  doseLog.length = 0;
  if (saved && saved.doseLog) doseLog.push(...saved.doseLog);

  renderHeader();
  renderTabs();
  renderActivePanel();
  renderSupplementCards();

  // Auto-reset daily dose log at midnight — same live in-tab rollover
  // mechanism as today.js's init().
  let lastDate = todayStr();
  setInterval(() => {
    const nowDate = todayStr();
    if (nowDate !== lastDate) {
      lastDate = nowDate;
      doseLog.length = 0;
      persistDoseLog();
      renderHeader();
      renderSupplementCards();
    }
  }, 5 * 60 * 1000);
}

init();

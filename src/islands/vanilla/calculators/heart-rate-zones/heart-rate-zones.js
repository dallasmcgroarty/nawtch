import { showAlert } from "../../../../lib/ui.js";
import "../../../../lib/nav.js";
import "../../../../lib/settingsHint.js";

// Intensity bands: ACSM's Guidelines for Exercise Testing and Prescription
// (11th ed., 2020) as reproduced in Bishop et al. 2025 (ACSM/ESSA), Table 1.
// lo/hi are whole-percent bounds; null = open-ended. Near-maximal %HRmax is
// taken as everything above the 77–95% vigorous band.
const BANDS = {
  hrmax: [
    { name: "Very light", lo: null, hi: 56 },
    { name: "Light", lo: 57, hi: 63 },
    { name: "Moderate", lo: 64, hi: 76 },
    { name: "Vigorous", lo: 77, hi: 95 },
    { name: "Near-maximal", lo: 96, hi: null },
  ],
  hrr: [
    { name: "Very light", lo: null, hi: 29 },
    { name: "Light", lo: 30, hi: 39 },
    { name: "Moderate", lo: 40, hi: 59 },
    { name: "Vigorous", lo: 60, hi: 89 },
    { name: "Near-maximal", lo: 90, hi: null },
  ],
};

let method = "hrmax"; // 'hrmax' (% of max HR) | 'hrr' (heart rate reserve / Karvonen)
let ageVal = "";
let restVal = "";
let maxVal = ""; // optional measured max HR — overrides the age estimate
let result = null; // { hrMax, tanaka, fox, measured, rest, method }

function tanakaMax(age) {
  return 208 - 0.7 * age;
}

function foxMax(age) {
  return 220 - age;
}

// Target HR for a given percent. %HRmax: pct × max. Karvonen: rest + pct × (max − rest).
function targetHr(pct, r) {
  if (r.method === "hrr") return r.rest + (pct / 100) * (r.hrMax - r.rest);
  return (pct / 100) * r.hrMax;
}

function bandPctLabel(b) {
  if (b.lo === null) return `&lt;${b.hi + 1}%`;
  if (b.hi === null) return `≥${b.lo}%`;
  return `${b.lo}–${b.hi}%`;
}

function bandBpmLabel(b, r) {
  if (b.lo === null) return `below ${Math.round(targetHr(b.hi + 1, r))}`;
  if (b.hi === null) return `${Math.round(targetHr(b.lo, r))}–${Math.round(r.hrMax)}`;
  return `${Math.round(targetHr(b.lo, r))}–${Math.round(targetHr(b.hi, r))}`;
}

function renderHrzTab() {
  const el = document.getElementById("calc-hrz");
  const isHrr = method === "hrr";

  el.innerHTML = `
    <div class="settings-section">
      <h2 class="settings-section-title">Heart Rate Zones Calculator</h2>
      <div class="settings-section-body">
        <div class="wt-toggle" style="margin-bottom:14px;">
          <button class="wt-toggle-btn ${!isHrr ? "active" : ""}" onclick="window.calcHrzSetMethod('hrmax')">% of Max HR</button>
          <button class="wt-toggle-btn ${isHrr ? "active" : ""}" onclick="window.calcHrzSetMethod('hrr')">Heart Rate Reserve</button>
        </div>
        <div class="add-row ${isHrr ? "add-row-3" : "add-row-2"}">
          <div class="field-group">
            <span class="field-label">Age</span>
            <input type="number" id="calc-hrz-age" min="18" max="100" step="1" placeholder="30" value="${ageVal}" oninput="window.calcHrzSetAge(this.value)" />
          </div>
          ${
            isHrr
              ? `<div class="field-group">
            <span class="field-label">Resting Heart Rate (bpm)</span>
            <input type="number" id="calc-hrz-rest" min="30" max="120" step="1" placeholder="60" value="${restVal}" oninput="window.calcHrzSetRest(this.value)" />
          </div>`
              : ""
          }
          <div class="field-group">
            <span class="field-label">Measured Max HR (optional)</span>
            <input type="number" id="calc-hrz-max" min="100" max="230" step="1" placeholder="Leave blank to estimate" value="${maxVal}" oninput="window.calcHrzSetMax(this.value)" />
          </div>
        </div>
        <span class="field-hint" style="display:block;margin-top:10px;">${
          isHrr
            ? "Resting heart rate: measure first thing in the morning, lying down, before caffeine, for the most consistent reading."
            : "Only enter a max heart rate if it came from a supervised max test — otherwise leave it blank and we'll estimate it from your age."
        }</span>
        <button class="add-btn" style="margin-top:16px;" onclick="window.calcRunHrz()">Calculate</button>
      </div>
    </div>
    ${result !== null ? renderHrzResult() : ""}
  `;
}

function renderHrzResult() {
  const r = result;
  const bands = BANDS[r.method];
  const isHrr = r.method === "hrr";
  const maxSub = r.measured ? "your measured max" : `Tanaka estimate · 220 − age gives ${Math.round(r.fox)}`;

  return `
    <div class="settings-section">
      <div class="settings-section-title">Your Heart Rate Zones</div>
      <div class="settings-section-body">
        <div class="totals-grid" style="grid-template-columns:${isHrr ? "1fr 1fr" : "1fr"};margin-bottom:0;">
          <div class="total-card">
            <div class="val">${Math.round(r.hrMax)}</div>
            <div class="lbl">Max HR (bpm)</div>
            <div class="sub">${maxSub}</div>
          </div>
          ${
            isHrr
              ? `<div class="total-card">
            <div class="val">${Math.round(r.hrMax - r.rest)}</div>
            <div class="lbl">Heart Rate Reserve (bpm)</div>
            <div class="sub">max ${Math.round(r.hrMax)} − resting ${Math.round(r.rest)}</div>
          </div>`
              : ""
          }
        </div>
        <div style="overflow-x:auto;">
        <table class="load-table" style="margin-top:12px;">
          <thead><tr><th>Intensity</th><th>${isHrr ? "% of HR Reserve" : "% of Max HR"}</th><th>Target (bpm)</th></tr></thead>
          <tbody>
            ${bands.map((b) => `<tr><td>${b.name}</td><td>${bandPctLabel(b)}</td><td>${bandBpmLabel(b, r)}</td></tr>`).join("")}
          </tbody>
        </table>
        </div>
        <span class="field-hint" style="display:block;margin-top:10px;">Estimates only — a predicted max heart rate is based on group averages and may not match yours, so treat these as starting ranges, not hard limits.</span>
      </div>
    </div>
  `;
}

window.calcHrzSetMethod = function (m) {
  if (m === method) return;
  method = m;
  result = null;
  renderHrzTab();
};
window.calcHrzSetAge = function (v) {
  ageVal = v;
};
window.calcHrzSetRest = function (v) {
  restVal = v;
};
window.calcHrzSetMax = function (v) {
  maxVal = v;
};

window.calcRunHrz = function () {
  const age = parseFloat(ageVal);
  if (!age || age <= 0) return showAlert("Missing Info", "Enter your age to calculate.");
  if (age < 18) return showAlert("Adults Only", "This calculator is built for adults (18+) — the max heart rate equation it uses was developed in adults.");

  const measuredRaw = parseFloat(maxVal);
  const measured = !isNaN(measuredRaw) && measuredRaw > 0 ? measuredRaw : null;
  const tanaka = tanakaMax(age);
  const hrMax = measured ?? tanaka;

  let rest = null;
  if (method === "hrr") {
    rest = parseFloat(restVal);
    if (!rest || rest <= 0) return showAlert("Missing Info", "Enter your resting heart rate to use the heart rate reserve method.");
    if (rest >= hrMax) return showAlert("Check Your Numbers", "Resting heart rate needs to be lower than max heart rate.");
  }

  result = { hrMax, tanaka, fox: foxMax(age), measured: measured !== null, rest, method };
  renderHrzTab();
};

renderHrzTab();

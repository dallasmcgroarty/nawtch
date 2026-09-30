// "Manage privacy choices" buttons ([data-privacy-choices]) stay hidden unless
// Google's EU regulations consent message applies to this visitor (EEA/UK/CH).
// Clicking one reopens that message so the visitor can change their decision.
// API: https://developers.google.com/funding-choices/fc-api-docs

window.googlefc = window.googlefc || {};
window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

window.googlefc.callbackQueue.push({
  CONSENT_API_READY: () => {
    if (typeof window.__tcfapi !== "function") return;
    window.__tcfapi("addEventListener", 2.2, (tcData, success) => {
      if (!success || !tcData.gdprApplies) return;
      document.querySelectorAll("[data-privacy-choices]").forEach((el) => { el.hidden = false; });
    });
  },
});

document.querySelectorAll("[data-privacy-choices] button").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.googlefc.callbackQueue.push(() => window.googlefc.showRevocationMessage());
  });
});

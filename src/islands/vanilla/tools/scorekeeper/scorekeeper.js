import { showConfirm } from "../../../../lib/ui.js";

// Every player is stored under this prefix so "Delete All Players" only ever
// touches scorekeeper data — localStorage is shared with the rest of the app
// (today/week streaks, barcode scan rate limiting live there too).
const STORAGE_PREFIX = "nawtch-scorekeeper:";

document.getElementById("player-input").addEventListener("submit", (event) => {
  event.preventDefault();
  checkPlayer();
});

document.getElementById("clear-all-btn").addEventListener("click", async (event) => {
  event.preventDefault();
  if (!(await showConfirm("Delete all players? This cannot be undone.", "Delete All"))) return;
  clearAllPlayers();
});

document.getElementById("reset-all-btn").addEventListener("click", async (event) => {
  event.preventDefault();
  if (!(await showConfirm("Reset all player scores to 0?", "Reset All"))) return;
  resetAllScores();
});

document.getElementById("plus").addEventListener("click", (event) => {
  event.preventDefault();
  addScore();
});

document.getElementById("minus").addEventListener("click", (event) => {
  event.preventDefault();
  subtractScore();
});

retrieveAllPlayers();

function updateEmptyState() {
  const target = document.getElementById("card-set");
  let hint = document.getElementById("sk-empty-hint");
  if (target.querySelector(".sk-player-card")) {
    hint?.remove();
    return;
  }
  if (!hint) {
    hint = document.createElement("p");
    hint.id = "sk-empty-hint";
    hint.className = "sk-empty-hint";
    hint.textContent = "No players yet — add one above to get started.";
    target.appendChild(hint);
  }
}

// Each card carries its localStorage key (dataset.key) and is looked up
// directly — no element IDs derived from the name, so "Mary Jane" and
// "Mary-Jane" are different players and no name can collide with another
// player's score element. Names go in via textContent, never as HTML.
//
// Records saved before this change stored a hyphenated handle as userName
// ("Mary Jane" → "Mary-Jane") with no version field; those still display with
// spaces, the way they always did.
function addNewPlayer(key, name, score) {
  const target = document.getElementById("card-set");

  const card = document.createElement("div");
  card.className = "sk-player-card";
  card.dataset.key = key;
  const nameEl = document.createElement("div");
  nameEl.className = "sk-player-name";
  nameEl.textContent = name;
  const scoreEl = document.createElement("div");
  scoreEl.className = "sk-player-score";
  scoreEl.textContent = String(score);
  card.append(nameEl, scoreEl);

  card.addEventListener("click", () => {
    document.querySelectorAll(".sk-player-card.selected").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
  });

  target.appendChild(card);
  updateEmptyState();
}

function readPlayer(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

function writeScore(key, score) {
  const player = readPlayer(key) || {};
  player.userScore = String(score);
  localStorage.setItem(key, JSON.stringify(player));
}

// Get all players currently in localStorage so cards persist across reloads
function retrieveAllPlayers() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    const player = readPlayer(key);
    if (player && player.userName) {
      const name = player.v === 2 ? player.userName : player.userName.replace(/-/g, " ");
      addNewPlayer(key, name, player.userScore);
    }
  }
  orderPlayers(true);
  updateEmptyState();
}

// check if player name and score exist then call addNewPlayer
function checkPlayer() {
  const name = document.getElementById("player-name").value.trim();
  let score = document.getElementById("player-score").value;
  const key = STORAGE_PREFIX + name;
  const nameTaken = Array.from(document.querySelectorAll(".sk-player-name")).some((el) => el.textContent === name);

  if (!name) {
    // nothing entered
  } else if (nameTaken || localStorage.getItem(key)) {
    // player already exists
  } else {
    if (score === "") {
      score = 0;
    }
    localStorage.setItem(key, JSON.stringify({ v: 2, userName: name, userScore: score }));
    addNewPlayer(key, name, score);
  }
  document.getElementById("player-name").value = "";
  document.getElementById("player-score").value = "";
}

// Clear all players from the DOM and from localStorage
function clearAllPlayers() {
  document.querySelectorAll(".sk-player-card").forEach((card) => {
    localStorage.removeItem(card.dataset.key);
    card.remove();
  });
  updateEmptyState();
}

// reset all player scores back to 0
function resetAllScores() {
  document.querySelectorAll(".sk-player-card").forEach((card) => {
    card.querySelector(".sk-player-score").textContent = "0";
    writeScore(card.dataset.key, 0);
  });
}

// apply a +/- score increment to the selected player
function changeScore(sign) {
  const card = getTarget();
  if (!card) return;

  const scoreIncrement = Number(document.getElementById("score-update").value);
  if (!scoreIncrement) return;

  const scoreEl = card.querySelector(".sk-player-score");
  const totalScore = Number(scoreEl.textContent) + sign * scoreIncrement;
  scoreEl.textContent = totalScore;
  writeScore(card.dataset.key, totalScore);

  orderPlayers(false);
}

function subtractScore() {
  changeScore(-1);
}

function addScore() {
  changeScore(1);
}

// order players highest score to lowest; skips the slide-down animation
// after the initial load so re-sorting on a score change doesn't re-animate.
function orderPlayers(animate) {
  const target = document.getElementById("card-set");
  const cards = Array.from(document.querySelectorAll(".sk-player-card"));

  cards.forEach((card) => card.classList.toggle("no-animate", !animate));

  cards.sort((a, b) => {
    const x = Number(a.querySelector(".sk-player-score").textContent);
    const y = Number(b.querySelector(".sk-player-score").textContent);
    return y - x;
  });

  cards.forEach((card) => target.appendChild(card));
}

// currently selected player card, or null if none
function getTarget() {
  return document.querySelector(".sk-player-card.selected");
}

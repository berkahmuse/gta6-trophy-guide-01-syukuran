// Platinum Road boot: load the atlas data, wire the views, filters, tracker and save page.
import { loadState, saveState, exportState, importState } from "./store.js";
import { filterTrophies } from "./filters.js";
import { trophyRow, renderDetail, renderRoadmap } from "./views.js";

const data = await (await fetch("data/trophies.json")).json();
const trophies = data.trophies;
let state = loadState();
let kind = "all";
let selected = null;

const listEl = document.getElementById("trophyList");
const missableEl = document.getElementById("missableList");
const detailEl = document.getElementById("detailPane");
const searchEl = document.getElementById("search");
const gradeEl = document.getElementById("gradeFilter");
const spoilerEls = [document.getElementById("spoilerToggle"), document.getElementById("spoilerToggle2")];

function persist() { saveState(state); }

function toggleEarned(trophy, on) {
  state.earned = on
    ? [...new Set([...state.earned, trophy.name])]
    : state.earned.filter((n) => n !== trophy.name);
  persist();
  renderAll();
}

function changeCount(trophy, delta) {
  const now = state.counts[trophy.name] ?? 0;
  const next = Math.max(0, Math.min(trophy.target ?? 0, now + delta * (trophy.target >= 1000 ? 5000 : 1)));
  state.counts[trophy.name] = next;
  if (trophy.target && next >= trophy.target && !state.earned.includes(trophy.name)) {
    state.earned.push(trophy.name);
  }
  persist();
  renderAll();
}

function rowHandlers() {
  return {
    onToggle: toggleEarned,
    onSelect: (t) => { selected = t; renderAll(); },
    onCount: changeCount,
  };
}

function renderTracker() {
  const visible = filterTrophies(trophies, { kind, grade: gradeEl.value, query: searchEl.value });
  listEl.replaceChildren(...visible.map((t) => {
    const row = trophyRow(t, state, rowHandlers());
    if (selected && t.name === selected.name) row.classList.add("selected");
    return row;
  }));
  if (!visible.length) {
    const li = document.createElement("li");
    li.className = "trophy-row";
    li.textContent = "No trophy matches those filters. Clear the search or pick another kind.";
    listEl.append(li);
  }
  if (selected) renderDetail(detailEl, selected, state);
}

function renderProgress() {
  const pct = Math.round((state.earned.length / trophies.length) * 100);
  document.getElementById("ringPct").textContent = `${pct}%`;
  document.getElementById("progressLine").textContent = `${state.earned.length} of ${trophies.length} earned`;
  document.title = `Platinum Road — ${state.earned.length}/55 trophies (${pct}%)`;
}

function renderAll() {
  renderProgress();
  renderTracker();
  missableEl.replaceChildren(...trophies.filter((t) => t.missable).map((t) => trophyRow(t, state, rowHandlers())));
  renderRoadmap(document.getElementById("roadmapStages"), trophies, state);
  for (const el of spoilerEls) el.checked = state.spoiler;
}

document.getElementById("kindChips").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-kind]");
  if (!btn) return;
  kind = btn.dataset.kind;
  for (const b of document.querySelectorAll("#kindChips .chip")) b.classList.toggle("active", b === btn);
  renderTracker();
});
searchEl.addEventListener("input", renderTracker);
gradeEl.addEventListener("change", renderTracker);
for (const el of spoilerEls) {
  el.addEventListener("change", () => { state.spoiler = el.checked; persist(); renderAll(); });
}

for (const btn of document.querySelectorAll(".view-btn")) {
  btn.addEventListener("click", () => {
    for (const b of document.querySelectorAll(".view-btn")) b.classList.toggle("active", b === btn);
    for (const v of document.querySelectorAll(".view")) v.hidden = v.id !== `view-${btn.dataset.view}`;
  });
}

document.getElementById("exportBtn").addEventListener("click", () => exportState(state));
document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    state = await importState(file);
    persist();
    renderAll();
  } catch {
    alert("That file is not a Platinum Road progress export.");
  }
});
document.getElementById("resetBtn").addEventListener("click", () => {
  state = { earned: [], counts: {}, spoiler: state.spoiler };
  persist();
  renderAll();
});

// Start with a story trophy open so the guide pane is never empty on first load.
selected = trophies.find((t) => t.name === "Trust") ?? trophies[0];
renderAll();

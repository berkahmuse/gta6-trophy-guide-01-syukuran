// Platinum Road views: trophy rows, the detail pane, the roadmap and the missable list.
import { isSpoilerHidden, STAGES } from "./filters.js";

export function gradeBadge(trophy) {
  const span = document.createElement("span");
  span.className = `badge ${trophy.grade}`;
  span.textContent = trophy.grade;
  return span;
}

function tag(text, cls = "") {
  const span = document.createElement("span");
  span.className = `tag ${cls}`;
  span.textContent = text;
  return span;
}

export function trophyRow(trophy, state, { onToggle, onSelect, onCount }) {
  const li = document.createElement("li");
  li.className = "trophy-row";
  li.title = trophy.name;
  if (state.earned.includes(trophy.name)) li.classList.add("earned");
  const hidden = isSpoilerHidden(trophy, state);

  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = state.earned.includes(trophy.name);
  box.setAttribute("aria-label", `Mark ${trophy.name} earned`);
  box.addEventListener("click", (e) => e.stopPropagation());
  box.addEventListener("change", () => onToggle(trophy, box.checked));
  li.append(box);

  const main = document.createElement("div");
  main.className = "row-main";
  const name = document.createElement("div");
  name.className = "row-name";
  if (hidden) {
    name.innerHTML = "";
    const s = document.createElement("span");
    s.className = "spoiler-name";
    s.textContent = "Hidden story trophy — spoiler shield on";
    name.append(s);
  } else {
    name.textContent = trophy.name;
  }
  const desc = document.createElement("div");
  desc.className = "row-desc";
  desc.textContent = hidden ? "Earn it, or turn the spoiler shield off in Save & settings, to reveal it." : trophy.description;
  const meta = document.createElement("div");
  meta.className = "row-meta";
  meta.append(gradeBadge(trophy));
  if (trophy.missable) meta.append(tag("MISSABLE", "missable"));
  if (trophy.hidden) meta.append(tag("hidden on PSN", "hidden-tag"));
  meta.append(tag(`Stage ${trophy.stage}`));
  for (const k of trophy.kinds) meta.append(tag(k));
  if (trophy.target) {
    const counter = document.createElement("span");
    counter.className = "counter";
    const minus = document.createElement("button");
    minus.type = "button"; minus.textContent = "−";
    minus.addEventListener("click", (e) => { e.stopPropagation(); onCount(trophy, -1); });
    const plus = document.createElement("button");
    plus.type = "button"; plus.textContent = "+";
    plus.addEventListener("click", (e) => { e.stopPropagation(); onCount(trophy, 1); });
    const label = document.createElement("span");
    const value = state.counts[trophy.name] ?? 0;
    label.textContent = `${value} / ${trophy.target} ${trophy.unit}`;
    counter.append(minus, label, plus);
    meta.append(counter);
  }
  main.append(name, desc, meta);
  li.append(main);
  li.addEventListener("click", () => onSelect(trophy));
  return li;
}

export function renderDetail(pane, trophy, state) {
  pane.replaceChildren();
  const hidden = isSpoilerHidden(trophy, state);
  const kicker = document.createElement("p");
  kicker.className = "kicker";
  kicker.textContent = `TROPHY ${trophy.id} OF 55 · STAGE ${trophy.stage}${trophy.missable ? " · MISSABLE" : ""}`;
  const h = document.createElement("h2");
  h.textContent = hidden ? "Hidden story trophy" : trophy.name;
  const official = document.createElement("p");
  official.className = "official";
  official.textContent = hidden ? "Its official name and description stay hidden until you earn it (spoiler shield is on)." : `“${trophy.description}” — official description`;
  pane.append(kicker, h, official);
  const meta = document.createElement("div");
  meta.className = "row-meta";
  meta.append(gradeBadge(trophy));
  if (trophy.missable) meta.append(tag("MISSABLE — see the missables view", "missable"));
  if (trophy.hidden) meta.append(tag("hidden on PSN", "hidden-tag"));
  for (const k of trophy.kinds) meta.append(tag(k));
  if (trophy.target) meta.append(tag(`PSN count: ${trophy.target} ${trophy.unit}`));
  pane.append(meta);

  const guideH = document.createElement("h3");
  guideH.textContent = "Guide — in our own words";
  const guide = document.createElement("p");
  guide.textContent = hidden ? "Earn this trophy, or switch the spoiler shield off, to read its guide." : trophy.guide;
  const srcH = document.createElement("h3");
  srcH.textContent = "Sources";
  const src = document.createElement("p");
  src.textContent = trophy.sources;
  const stageH = document.createElement("h3");
  stageH.textContent = "Roadmap place";
  const stage = document.createElement("p");
  const stageInfo = STAGES.find((s) => s.n === trophy.stage);
  stage.textContent = stageInfo ? `${stageInfo.title}. ${stageInfo.note}` : "";
  pane.append(guideH, guide, srcH, src, stageH, stage);
}

export function renderRoadmap(container, trophies, state) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const inStage = trophies.filter((t) => t.stage === stage.n);
    const done = inStage.filter((t) => state.earned.includes(t.name)).length;
    const card = document.createElement("div");
    card.className = "stage-card";
    const h = document.createElement("h3");
    h.textContent = `${stage.title} — ${done}/${inStage.length}`;
    const note = document.createElement("p");
    note.textContent = stage.note;
    const bar = document.createElement("div");
    bar.className = "stage-bar";
    const fill = document.createElement("i");
    fill.style.width = `${inStage.length ? Math.round((done / inStage.length) * 100) : 0}%`;
    bar.append(fill);
    const names = document.createElement("p");
    names.className = "stage-names";
    names.textContent = inStage.map((t) => t.name).join(" · ");
    card.append(h, note, bar, names);
    container.append(card);
  }
}

// Platinum Road store: progress lives in localStorage, export/import as a JSON file.
export const STORAGE_KEY = "platinum-road-leonida-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: [], counts: {}, spoiler: true };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      spoiler: parsed.spoiler !== false,
    };
  } catch {
    return { earned: [], counts: {}, spoiler: true };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "platinum-road-progress.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importState(file) {
  const parsed = JSON.parse(await file.text());
  if (!parsed || !Array.isArray(parsed.earned)) throw new Error("not a Platinum Road progress file");
  const counts = {};
  if (parsed.counts && typeof parsed.counts === "object") {
    for (const [name, value] of Object.entries(parsed.counts)) {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) counts[name] = Math.floor(value);
    }
  }
  return {
    earned: parsed.earned.filter((n) => typeof n === "string"),
    counts,
    spoiler: parsed.spoiler !== false,
  };
}

// Platinum Road filters: kind chips, grade select, search, and the spoiler rule.
// Spoiler rule: with the shield on, a story trophy that is hidden on PlayStation and
// not yet earned shows neither its name nor its official description.
export function isSpoilerHidden(trophy, state) {
  return Boolean(state.spoiler && trophy.hidden && trophy.kinds.includes("story") && !state.earned.includes(trophy.name));
}

export function matchesKind(trophy, kind) {
  if (kind === "all") return true;
  if (kind === "missable") return trophy.missable === true;
  return trophy.kinds.includes(kind);
}

export function filterTrophies(trophies, { kind, grade, query }) {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!matchesKind(t, kind)) return false;
    if (grade !== "all" && t.grade !== grade) return false;
    if (!q) return true;
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kinds.join(" ")} stage ${t.stage}`.toLowerCase();
    return hay.includes(q);
  });
}

export const STAGES = [
  { n: 1, title: "Stage 1 — The story, carefully", note: "Chapters 1-4, the final mission, and the six named-mission trophies. Six of the nine missables live here: finish Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked and Snow Storm inside their missions." },
  { n: 2, title: "Stage 2 — The people of Leonida", note: "Stranger strands and their finales (Andy, Kenton, Billy, Randy, Tyrone), Cal's fishing challenge and Bret's hunt. Eight finished strands also clear the silver Strangers & Freaks." },
  { n: 3, title: "Stage 3 — See the whole state", note: "Exploration and collectibles: 52 areas, 18 meditation spots, 3 card sets, 100 WAiNK locations, 100 vehicles, 8 garages, 10 Scooter Bros registrations, and a cocktail on Ocean Beach." },
  { n: 4, title: "Stage 4 — Activities and counters", note: "250 stunts, 42 gold range challenges, 14 drone-race wins, 20 different race wins, 50 challenges, one arcade game, and a bowling follow-through at Kolt & Associates." },
  { n: 5, title: "Stage 5 — Heat, heists and money", note: "Partner heat trophies, vaults, trucks, gangs and showrooms, plus the two remaining missables: Actions Speak Louder (choices cannot be unmade; PSN counts 500) and Bad Luck, I Guess (fail once, then succeed). Ends with $250,000 laundered and $100,000 spent." },
  { n: 6, title: "Stage 6 — 100% and the platinum", note: "Sweep the completion percentage to 100% for the gold A Long Road; the platinum Vice Got a Price! unlocks with your last trophy." },
];

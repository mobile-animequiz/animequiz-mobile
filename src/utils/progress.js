// Pure helpers for the player's level progress (no React / React Native dependencies).

/**
 * XP progress inside the current level.
 * @param {{ xp: number, levelStartXp: number, nextLevelXp: number }} stats
 * @returns {{ ratio: number, percent: number, remainingXp: number }}
 */
export function getLevelProgress({ xp, levelStartXp, nextLevelXp }) {
  const span = Math.max(nextLevelXp - levelStartXp, 1);
  const ratio = Math.min(Math.max((xp - levelStartXp) / span, 0), 1);

  return {
    ratio,
    percent: Math.round(ratio * 100),
    remainingXp: Math.max(nextLevelXp - xp, 0),
  };
}

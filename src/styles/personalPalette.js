import { colors } from './colors';
export const ACCENTS = { violet: colors.accent, cyan: '#7CE5DF', rose: '#FFB1D2', amber: '#FFD166', mint: '#83E6BD', coral: '#FFB3A7' };
export const THEMES = {
  midnight: [colors.backgroundTop, colors.backgroundBottom],
  eclipse: ['#180F1D', '#352038'],
  ocean: ['#081A2C', '#133D57'],
  forest: ['#0A201D', '#174538'],
};
export function getPersonalColors(theme, accent) {
  const background = THEMES[theme] ?? THEMES.midnight;
  return { ...colors, backgroundTop: background[0], backgroundBottom: background[1],
    accent: ACCENTS[accent] ?? ACCENTS.violet, link: ACCENTS[accent] ?? ACCENTS.violet };
}

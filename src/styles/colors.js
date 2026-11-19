// Colors measured from the Figma prototype (dark theme).

export const colors = {
  // Background gradient ends (Figma palette #0F0F18 -> #21295A)
  backgroundTop: '#0F0F18',
  backgroundBottom: '#21295A',

  // Inputs and the dark full-width buttons (Figma #262B44, slightly translucent)
  fieldFill: 'rgba(38, 43, 68, 0.85)',
  fieldFillFocused: 'rgba(38, 43, 68, 0.12)',
  fieldBorderFocused: '#444F8C',

  // Periwinkle pill ("Continue with Google") and text links
  accent: '#7C92FA',
  link: '#6F82E8',

  textPrimary: '#FFFFFF',
  textOnLight: '#131338',
  pillLight: '#FFFFFF',

  // Not in the prototype: only shown when validation / a request fails
  error: '#FF6B81',

  // Home / dashboard. The Figma file has no Home screen, so these are derived from the
  // same palette: gray copy, a hairline around translucent cards and the XP bar track.
  textSecondary: 'rgba(255, 255, 255, 0.64)',
  surfaceBorder: 'rgba(124, 146, 250, 0.18)',
  progressTrack: 'rgba(255, 255, 255, 0.12)',

  // Quiz difficulty indicators (functional colors, softened for the dark background)
  difficultyEasy: '#6FD3A0',
  difficultyMedium: '#F2C46D',
  difficultyHard: '#FF6B81',
};

// The gradient is flat at the top, ramps down to #21295A and is flat again at
// the bottom. Mid stops were sampled from the prototype.
export const backgroundGradient = {
  colors: [
    colors.backgroundTop,
    colors.backgroundTop,
    '#111224',
    '#141735',
    '#1B2247',
    colors.backgroundBottom,
    colors.backgroundBottom,
  ],
  locations: [0, 0.15, 0.34, 0.53, 0.72, 0.9, 1],
};

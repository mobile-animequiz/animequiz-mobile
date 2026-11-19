import { colors } from './colors';

// Text styles measured from the Figma prototype. The system font is used
// (Roboto on Android, San Francisco on iOS).
export const textStyles = {
  // "Create Account", "Log In", "Reset Password" and the Welcome slogan
  title: {
    color: colors.textPrimary,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
  },
  // Field text / placeholders, buttons, "Forgot Password"
  body: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '400',
  },
  button: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  // Terms / privacy text, Reset Password instructions, "Already have an account?"
  small: {
    color: colors.textPrimary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '400',
  },
  // Home: section titles, card titles, player name (15 sp sits between the 13 and 19 of the prototype)
  heading: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  // Home: secondary gray copy (rank, meta, hints)
  caption: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  // Validation / request errors (not in the prototype)
  error: {
    color: colors.error,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
};

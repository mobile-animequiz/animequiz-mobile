// Pure validation helpers (no React / React Native dependencies).

export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BIRTH_DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const MIN_BIRTH_YEAR = 1900;

export function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value).trim());
}

export function isValidPassword(value) {
  const password = String(value);
  const bytes = Array.from(password).reduce((total, character) => {
    const code = character.codePointAt(0);
    return total + (code > 0xffff ? 4 : code > 0x7ff ? 3 : code > 0x7f ? 2 : 1);
  }, 0);
  return password.length >= PASSWORD_MIN_LENGTH && bytes <= 72;
}

// Expects the DD/MM/YYYY format produced by formatBirthDateInput().
export function isValidBirthDate(value) {
  const match = BIRTH_DATE_REGEX.exec(String(value));
  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  // Building the date and reading it back rejects impossible dates (e.g. 31/02).
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealDate && year >= MIN_BIRTH_YEAR && date <= new Date();
}

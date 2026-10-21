// Pure formatting helpers (no React / React Native dependencies).

export const BIRTH_DATE_PLACEHOLDER = 'DD/MM/YYYY';

// Applies the DD/MM/YYYY mask while the user types: "12031998" -> "12/03/1998".
export function formatBirthDateInput(rawValue) {
  const digits = String(rawValue).replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// Thousands separator in pt-BR style, without depending on Intl: 2450 -> "2.450".
export function formatNumber(value) {
  return String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// "1 questão" / "10 questões"
export function formatQuestionCount(count) {
  return `${count} ${count === 1 ? 'questão' : 'questões'}`;
}

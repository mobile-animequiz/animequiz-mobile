export function remainingSeconds(deadline, now) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

// Retry identifier; this is not a credential or a security token.
export function createAttemptKey() {
  return `mobile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

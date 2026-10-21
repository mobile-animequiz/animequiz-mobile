// Authentication service layer.
//
// The backend is not available yet, so the email flows below only simulate a
// network round trip. Replace the bodies with real requests when the API is
// ready, e.g.:
//   const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, { ... });
// The hooks in src/hooks only depend on the signatures (and thrown errors) here.

const MOCK_DELAY_MS = 900;

const PROVIDER_LABELS = {
  google: 'Google',
};

function wait(milliseconds = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** @param {{ email: string, password: string }} credentials */
export async function login(credentials) {
  await wait();
  return { email: credentials.email };
}

/** @param {{ birthDate: string, email: string, password: string }} data */
export async function register(data) {
  await wait();
  return { email: data.email };
}

/** @param {{ email: string }} data */
export async function sendPasswordResetLink(data) {
  await wait();
  return { email: data.email };
}

/** @param {'google'} provider */
export async function signInWithProvider(provider) {
  // Real social sign-in needs provider credentials (Google / Apple console).
  // Failing loudly is better than pretending the user was authenticated.
  throw new Error(`Sign in with ${PROVIDER_LABELS[provider] ?? provider} is not configured yet.`);
}

import { useState } from 'react';

import { login } from '../services/authService';
import { isValidEmail } from '../utils/validators';

// State + validation + submit logic of the Log In screen.
// `onSuccess` is injected by the screen so this hook stays navigation-agnostic.
export default function useLoginForm({ onSuccess } = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function clearError(field) {
    setErrors((current) => (current[field] || current.form ? { ...current, [field]: undefined, form: undefined } : current));
  }

  function handleEmailChange(value) {
    setEmail(value);
    clearError('email');
  }

  function handlePasswordChange(value) {
    setPassword(value);
    clearError('password');
  }

  function validate() {
    const nextErrors = {};

    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Enter your password.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (isLoading || !validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      onSuccess?.();
    } catch (error) {
      setErrors({ form: error.message || 'Could not log in. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    password,
    errors,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}

import { useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { formatBirthDateInput } from '../utils/formatters';
import { PASSWORD_MIN_LENGTH, isValidBirthDate, isValidEmail, isValidPassword } from '../utils/validators';

// State + validation + submit logic of the Create Account screen.
// `onSuccess` is injected by the screen so this hook stays navigation-agnostic.
export default function useCreateAccountForm({ onSuccess } = {}) {
  const { signUp } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function clearError(field) {
    setErrors((current) => (current[field] || current.form ? { ...current, [field]: undefined, form: undefined } : current));
  }

  function handleBirthDateChange(value) {
    setBirthDate(formatBirthDateInput(value));
    clearError('birthDate');
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

    if (!isValidBirthDate(birthDate)) {
      nextErrors.birthDate = 'Enter a valid date (DD/MM/YYYY).';
    }
    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!isValidPassword(password)) {
      nextErrors.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
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
      await signUp({ birthDate, email: email.trim(), password });
      onSuccess?.();
    } catch (error) {
      setErrors({ form: error.message || 'Could not create the account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    birthDate,
    email,
    password,
    errors,
    isLoading,
    handleBirthDateChange,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}

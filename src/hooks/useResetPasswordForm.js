import { useState } from 'react';

import { sendPasswordResetLink } from '../services/authService';
import { isValidEmail } from '../utils/validators';

// State + validation + submit logic of the Reset Password screen.
// `onSuccess` is injected by the screen so this hook stays navigation-agnostic.
export default function useResetPasswordForm({ onSuccess } = {}) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function handleEmailChange(value) {
    setEmail(value);
    setErrors((current) => (current.email || current.form ? {} : current));
  }

  async function handleSubmit() {
    if (isLoading) {
      return;
    }

    if (!isValidEmail(email)) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetLink({ email: email.trim() });
      onSuccess?.(email.trim());
    } catch (error) {
      setErrors({ form: error.message || 'Could not send the link. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    errors,
    isLoading,
    handleEmailChange,
    handleSubmit,
  };
}

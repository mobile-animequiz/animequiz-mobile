import { Alert, StyleSheet, View } from 'react-native';

import AppButton from '../components/AppButton';
import FormError from '../components/FormError';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import TextField from '../components/TextField';
import useGoBack from '../hooks/useGoBack';
import useResetPasswordForm from '../hooks/useResetPasswordForm';

const INSTRUCTIONS =
  'To recover your account, please enter the email address linked to your account.\n' +
  'We’ll send you instructions to reset your password.';

export default function ResetPasswordScreen() {
  const goBack = useGoBack();

  const form = useResetPasswordForm({
    onSuccess: (email) => {
      Alert.alert('Check your email', `We sent password reset instructions to ${email}.`, [
        { text: 'OK', onPress: goBack },
      ]);
    },
  });

  return (
    <ScreenContainer>
      <ScreenHeader title="Reset Password" subtitle={INSTRUCTIONS} onBackPress={goBack} />

      <TextField
        placeholder="Email"
        value={form.email}
        onChangeText={form.handleEmailChange}
        error={form.errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        autoFocus
        onSubmitEditing={form.handleSubmit}
      />

      <FormError message={form.errors.form} style={styles.formError} />

      <View style={styles.action}>
        <AppButton title="Send link" onPress={form.handleSubmit} isLoading={form.isLoading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formError: {
    marginTop: 12,
  },
  action: {
    marginTop: 20,
    marginBottom: 24,
  },
});

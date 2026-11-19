import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { Alert, StyleSheet, View } from 'react-native';

import AppButton from '../components/AppButton';
import FormError from '../components/FormError';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import TextField from '../components/TextField';
import useGoBack from '../hooks/useGoBack';
import useResetPasswordForm from '../hooks/useResetPasswordForm';

export default function ResetPasswordScreen() {
  useI18n();
  const goBack = useGoBack();

  const form = useResetPasswordForm({
    onSuccess: () => {
      Alert.alert(t("Check your email"), t('resetGeneric'), [
        { text: 'OK', onPress: goBack },
      ]);
    },
  });

  return (
    <ScreenContainer>
      <ScreenHeader title={t("Reset Password")} subtitle={t('resetInstructions')} onBackPress={goBack} />

      <TextField
        placeholder={t("Email")}
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
        <AppButton title={t("Send link")} onPress={form.handleSubmit} isLoading={form.isLoading} />
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

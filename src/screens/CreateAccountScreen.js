import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import AppButton from '../components/AppButton';
import FormError from '../components/FormError';
import InfoButton from '../components/InfoButton';
import LegalText from '../components/LegalText';
import PasswordField from '../components/PasswordField';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import TextField from '../components/TextField';
import useCreateAccountForm from '../hooks/useCreateAccountForm';
import useGoBack from '../hooks/useGoBack';
import { metrics } from '../styles/theme';
import { handleAuthSuccess } from '../utils/authFlow';

export default function CreateAccountScreen() {
  useI18n();
  const goBack = useGoBack();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const form = useCreateAccountForm({ onSuccess: handleAuthSuccess });

  function showBirthDateInfo() {
    Alert.alert(t("Date of Birth"), t('birthHelp'));
  }

  return (
    <ScreenContainer>
      <ScreenHeader title={t("Create Account")} onBackPress={goBack} />

      <View style={styles.fields}>
        <TextField
          placeholder={t("Date of Birth")}
          value={form.birthDate}
          onChangeText={form.handleBirthDateChange}
          error={form.errors.birthDate}
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="next"
          onSubmitEditing={() => emailInputRef.current?.focus()}
          rightElement={<InfoButton onPress={showBirthDateInfo} accessibilityLabel={t("Date of Birth format")} />}
        />

        <TextField
          placeholder={t("Email")}
          inputRef={emailInputRef}
          value={form.email}
          onChangeText={form.handleEmailChange}
          error={form.errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />

        <PasswordField
          inputRef={passwordInputRef}
          value={form.password}
          onChangeText={form.handlePasswordChange}
          error={form.errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={form.handleSubmit}
        />
      </View>

      <View style={styles.legal}>
        <LegalText />
      </View>

      <FormError message={form.errors.form} style={styles.formError} />

      <View style={styles.action}>
        <AppButton title={t("Create Account")} onPress={form.handleSubmit} isLoading={form.isLoading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: metrics.fieldGap,
  },
  legal: {
    marginTop: 27,
  },
  formError: {
    marginTop: 12,
  },
  action: {
    marginTop: 27,
    marginBottom: 24,
  },
});

import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppButton from '../components/AppButton';
import FormError from '../components/FormError';
import PasswordField from '../components/PasswordField';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import SocialPillButton from '../components/SocialPillButton';
import TextField from '../components/TextField';
import useGoBack from '../hooks/useGoBack';
import useLoginForm from '../hooks/useLoginForm';
import useSocialSignIn from '../hooks/useSocialSignIn';
import { colors, metrics, textStyles } from '../styles/theme';
import { handleAuthSuccess } from '../utils/authFlow';

export default function LoginScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const passwordInputRef = useRef(null);

  const form = useLoginForm({ onSuccess: handleAuthSuccess });
  const { loadingProvider, signIn } = useSocialSignIn();
  const isBusy = form.isLoading || loadingProvider !== null;

  return (
    <ScreenContainer>
      <ScreenHeader title="Log In" onBackPress={goBack} />

      <View style={styles.fields}>
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
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />

        <PasswordField
          inputRef={passwordInputRef}
          value={form.password}
          onChangeText={form.handlePasswordChange}
          error={form.errors.password}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={form.handleSubmit}
        />
      </View>

      <FormError message={form.errors.form} style={styles.formError} />

      <View style={styles.action}>
        <AppButton
          title="Log in"
          onPress={form.handleSubmit}
          isLoading={form.isLoading}
          disabled={loadingProvider !== null}
        />
      </View>

      <Pressable
        onPress={() => router.push('/reset-password')}
        hitSlop={12}
        style={styles.forgotButton}
        accessibilityRole="link"
        accessibilityLabel="Forgot Password"
      >
        <Text style={styles.forgotText}>Forgot Password</Text>
      </Pressable>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <SocialPillButton
          title="Continue with Google"
          icon="google"
          onPress={() => signIn('google')}
          isLoading={loadingProvider === 'google'}
          disabled={isBusy}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: metrics.fieldGap,
  },
  formError: {
    marginTop: 12,
  },
  action: {
    marginTop: 33,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 32,
  },
  forgotText: {
    ...textStyles.body,
    color: colors.link,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  // Bottom gap of the prototype (~94 dp) minus the system gesture area.
  footer: {
    paddingBottom: 64,
  },
});

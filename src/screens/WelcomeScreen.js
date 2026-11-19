import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import LegalText from '../components/LegalText';
import AppButton from '../components/AppButton';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import ScreenContainer from '../components/ScreenContainer';
import SocialPillButton from '../components/SocialPillButton';
import useSocialSignIn from '../hooks/useSocialSignIn';
import { colors, textStyles } from '../styles/theme';

export default function WelcomeScreen() {
  useI18n();
  const router = useRouter();
  const { sessionError, retryRestore } = useAuth();
  const { loadingProvider, signIn } = useSocialSignIn();
  const isBusy = loadingProvider !== null;

  const buttons = [
    {
      id: 'google',
      title: t("Continue with Google"),
      icon: 'google',
      variant: 'accent',
      onPress: () => signIn('google'),
    },
    {
      id: 'email',
      title: t('createEmail'),
      icon: 'gmail',
      variant: 'light',
      onPress: () => router.push('/create-account'),
    },
  ];

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.topSpacer} />

        <View style={styles.group}>
          <Logo />
          {sessionError ? <View style={{ gap: 12, marginVertical: 16 }}><Text style={textStyles.error}>{sessionError}</Text><AppButton title={t('Tentar novamente')} onPress={retryRestore} /></View> : null}

          <Text style={styles.slogan}>{t("Ready to test your anime knowledge?")}</Text>

          <View style={styles.legal}>
            <LegalText />
          </View>

          <View style={styles.pills}>
            {buttons.map((button) => (
              <SocialPillButton
                key={button.id}
                title={button.title}
                icon={button.icon}
                variant={button.variant}
                onPress={button.onPress}
                isLoading={loadingProvider === button.id}
                disabled={isBusy}
              />
            ))}
          </View>

          <Text style={styles.footerText}> {t("Already have an account?")}{' '}
            <Text
              style={styles.footerLink}
              accessibilityRole="link"
              onPress={() => router.push('/login')}
            > {t("Log in")} </Text>
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScreenContainer>
  );
}

// Vertical rhythm measured from the prototype; the two spacers keep the group
// at ~44% / 56% of the free space on taller or shorter screens.
const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  topSpacer: {
    flex: 7,
  },
  bottomSpacer: {
    flex: 9,
  },
  group: {
    alignItems: 'center',
  },
  slogan: {
    ...textStyles.title,
    marginTop: 8,
    maxWidth: 260,
    textAlign: 'center',
  },
  legal: {
    marginTop: 5.5,
  },
  pills: {
    alignSelf: 'stretch',
    marginTop: 28,
    gap: 17,
  },
  footerText: {
    ...textStyles.small,
    marginTop: 21,
  },
  footerLink: {
    color: colors.link,
  },
});

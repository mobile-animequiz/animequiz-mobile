import { t } from '../i18n/runtime';
import { Alert, Linking } from 'react-native';

// EXPO_PUBLIC_* variables must be referenced statically so Expo can inline them.
const LEGAL_LINKS = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL,
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL,
};

export async function openLegalLink(type) {
  const url = LEGAL_LINKS[type];

  if (!url) {
    Alert.alert(t("Link unavailable"), t("This page has not been configured yet."));
    return;
  }

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(t("Could not open the link"), url);
  }
}

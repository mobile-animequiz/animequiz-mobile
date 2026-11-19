import Constants from 'expo-constants';
import { TurboModuleRegistry } from 'react-native';
import { t } from '../i18n/runtime';
export async function getGoogleIdToken() {
  if (Constants.executionEnvironment === 'storeClient' || !TurboModuleRegistry.get('RNGoogleSignin')) {
    throw new Error(t('googleNative'));
  }
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) throw new Error(t('googleConfig'));
  // Import only after checking the binary. The SDK enforces its native module
  // during evaluation, so a top-level import crashes every Router screen.
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({ webClientId, offlineAccess: false });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== 'success') return null;
  if (!result.data.idToken) throw new Error(t('googleFailed'));
  return result.data.idToken;
}

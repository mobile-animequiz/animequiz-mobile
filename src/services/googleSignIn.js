import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { t } from '../i18n/runtime';
export async function getGoogleIdToken() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) throw new Error(t('googleConfig'));
  if (Constants.executionEnvironment === 'storeClient') throw new Error(t('googleNative'));
  GoogleSignin.configure({ webClientId, offlineAccess: false });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== 'success') return null;
  if (!result.data.idToken) throw new Error(t('googleFailed'));
  return result.data.idToken;
}

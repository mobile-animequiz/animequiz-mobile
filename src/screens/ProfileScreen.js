import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../contexts/AccountContext';
import { apiPost } from '../services/apiClient';
import { getGoogleIdToken } from '../services/googleSignIn';
import useI18n from '../hooks/useI18n';
import useProfileData from '../hooks/useProfileData';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import AccountAvatar from '../components/AccountAvatar';
import AppButton from '../components/AppButton';
import TextField from '../components/TextField';
import AnimatedEntrance from '../components/AnimatedEntrance';
import { textStyles } from '../styles/theme';
import { getAppearanceChoices } from '../utils/accountPreferences';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const account = useAccount();
  const { settings, colors, busy, loading, error, refresh } = account;
  const blocked = busy || loading || Boolean(error);
  const { profile, progress, hitRate, error: statsError } = useProfileData();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function choosePhoto() {
    if (photoBusy || busy) return;
    setPhotoBusy(true); setMessage('');
    try {
      // The system photo picker grants access only to the selected image.
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85, exif: false });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const context = ImageManipulator.manipulate(asset.uri);
      const side = Math.min(asset.width, asset.height);
      if (side > 0) context.crop({ originX: Math.floor((asset.width-side)/2), originY: Math.floor((asset.height-side)/2), width: side, height: side });
      context.resize({ width: 512, height: 512 });
      const image = await context.renderAsync();
      const resized = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
      const updated = await account.uploadPhoto(resized);
      if (updated) setMessage(t('profileSaved'));
    } catch (failure) { Alert.alert(t('saveFailed'), ['ApiError', 'ApiConnectionError', 'AvatarValidationError'].includes(failure.name) ? failure.message : t('photoFailed')); }
    finally { setPhotoBusy(false); }
  }
  async function removePhoto() {
    try { const updated = await account.removePhoto(); if (updated) setMessage(t('profileSaved')); }
    catch (failure) { Alert.alert(t('saveFailed'), failure.message); }
  }
  async function linkGoogle() {
    setGoogleBusy(true);
    try {
      const idToken = await getGoogleIdToken();
      if (!idToken) return;
      await apiPost('auth/google/link', { idToken });
      await refresh();
      setMessage(t('googleLinked'));
    } catch (failure) { Alert.alert(t('googleFailed'), failure.status === 409 ? t('googleConflict') : failure.message); }
    finally { setGoogleBusy(false); }
  }
  async function logout() {
    try { await signOut(); router.replace('/welcome'); }
    catch (failure) { Alert.alert(t('Não foi possível sair'), failure.message); }
  }
  function confirmLogout() {
    Alert.alert(t('Sair da conta?'), t('Você precisará entrar novamente para jogar.'), [
      { text: t('Cancelar'), style: 'cancel' }, { text: t('Sair'), style: 'destructive', onPress: logout },
    ]);
  }
  return <ScreenContainer>
    <ScreenHeader title={t('Perfil')} onBackPress={() => router.back()} />
    <AnimatedEntrance style={{ gap: 18, paddingBottom: 32 }}>
      {loading ? <Text style={textStyles.body}>{t('Carregando perfil...')}</Text> : null}
      {error ? <><Text style={textStyles.error}>{error}</Text><AppButton title={t('Tentar novamente')} onPress={refresh} /></> : null}
      <View style={{ alignItems: 'center', gap: 12 }}>
        <AccountAvatar size={88} />
        <Text style={textStyles.title}>{settings.displayName || user?.username}</Text>
        <Text style={textStyles.caption}>{user?.email}</Text>
      </View>
      <AppButton title={t('choosePhoto')} onPress={choosePhoto} isLoading={photoBusy} disabled={blocked} />
      {settings.hasAvatar ? <AppButton title={t('removePhoto')} onPress={removePhoto} disabled={blocked || photoBusy} /> : null}
      <NameEditor key={String(user?.id) + ':' + settings.displayName} initial={settings.displayName} onSave={account.update} disabled={blocked} onSaved={() => setMessage(t('profileSaved'))} />
      {message ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[textStyles.body, { color: colors.difficultyEasy }]}>{message}</Text> : null}
      <View style={{ padding: 18, gap: 8, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 20, backgroundColor: colors.fieldFill }}>
        <Text style={textStyles.heading}>{t('Nível')} {profile.level} · {t(profile.rankTitle)}</Text>
        <Text style={textStyles.body}>{profile.xp} XP · {profile.completedQuizzes} {t('Quizzes concluídos')}</Text>
        <Text style={textStyles.caption}>{t('Taxa de acertos')}: {hitRate}% · {progress.percent}% {t('levelProgress')}</Text>
        {statsError ? <Text style={textStyles.error}>{statsError}</Text> : null}
      </View>
      <AppButton title={t('myFavorites')} onPress={() => router.push('/favorites')} />
      <Text style={textStyles.heading}>{t('appearance')}</Text>
      <Text style={textStyles.caption}>{t('personalAppearance')}</Text>
      <ChoiceRow label={t('theme')} value={settings.theme} options={getAppearanceChoices('theme')} disabled={blocked} onChange={(theme) => account.update({ theme })} />
      <ChoiceRow label={t('accent')} value={settings.accent} options={getAppearanceChoices('accent')} disabled={blocked} onChange={(accent) => account.update({ accent })} />
      <ChoiceRow label={t('language')} value={settings.locale} options={[['pt-BR', 'Português (Brasil)'], ['en', 'English'], ['device', t('deviceLanguage')]]} disabled={blocked} onChange={(locale) => account.update({ locale })} />
      <Text style={textStyles.caption}>{t('questionLanguage')}</Text>
      <AppButton title={t(settings.googleLinked ? 'googleLinked' : 'linkGoogle')} onPress={linkGoogle} isLoading={googleBusy} disabled={settings.googleLinked || blocked} />
      <AppButton title={t('Sair da conta')} onPress={confirmLogout} />
    </AnimatedEntrance>
  </ScreenContainer>;
}
function NameEditor({ initial, onSave, onSaved, disabled }) {
  const { t } = useI18n();
  const [name, setName] = useState(initial || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function save() {
    const displayName = name.trim();
    if (displayName.length < 2 || displayName.length > 50 || /[\u0000-\u001f\u007f]/.test(displayName)) { setError(t('invalidName')); return; }
    setSaving(true); setError('');
    try { const updated = await onSave({ displayName }); if (updated) onSaved(); }
    catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  }
  return <View style={{ gap: 10 }}><Text style={textStyles.body}>{t('displayName')}</Text>
    <TextField value={name} onChangeText={setName} placeholder={t('displayName')} error={error} maxLength={50} editable={!disabled && !saving} accessibilityLabel={t('displayName')} />
    <AppButton title={t('saveProfile')} onPress={save} isLoading={saving} disabled={disabled} />
  </View>;
}
function ChoiceRow({ label, value, options, disabled, onChange }) {
  const { colors } = useAccount();
  const { t } = useI18n();
  async function choose(next) { try { await onChange(next); } catch (failure) { Alert.alert(t('saveFailed'), failure.message); } }
  return <View style={{ gap: 10 }}><Text style={textStyles.body}>{label}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
    {options.map(([id, name]) => <Pressable key={id} onPress={() => choose(id)} disabled={disabled} accessibilityRole="radio" accessibilityState={{ checked: value === id, disabled }}
      style={{ minHeight: 48, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 16, borderWidth: 2, borderColor: value === id ? colors.accent : colors.surfaceBorder, backgroundColor: colors.fieldFill }}>
      <Text style={[textStyles.body, value === id && { color: colors.accent }]}>{name}</Text>
    </Pressable>)}
  </View></View>;
}

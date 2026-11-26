import { getDisplayName } from '../utils/displayName';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../contexts/AccountContext';
import { getApiBaseUrl } from '../services/apiConfig';
import useI18n from '../hooks/useI18n';
export default function AccountAvatar({ size = 64 }) {
  const { token, user } = useAuth();
  const { settings, colors } = useAccount();
  const { t } = useI18n();
  const [photo, setPhoto] = useState(null);
  const [failed, setFailed] = useState(null);
  const [retry, setRetry] = useState(0);
  const key = user?.id + ':' + settings.avatarVersion + ':' + token + ':' + retry;
  useEffect(() => {
    if (!settings.hasAvatar || !token) return undefined;
    const controller = new AbortController();
    let objectUrl;
    fetch(getApiBaseUrl() + '/users/me/avatar', { headers: { Authorization: 'Bearer ' + token, 'X-API-Version': '2' }, cache: 'no-store', signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.blob(); })
      .then((blob) => { if (controller.signal.aborted) return; objectUrl = URL.createObjectURL(blob); setPhoto({ key, uri: objectUrl }); }).catch(() => { if (!controller.signal.aborted) setFailed(key); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [key, token, settings.hasAvatar]);
  const name = getDisplayName(user, settings) || '?';
  return <Pressable disabled={!settings.hasAvatar || failed !== key} onPress={() => setRetry(value => value + 1)}
    accessibilityRole={failed === key ? 'button' : 'image'} accessibilityLabel={t(failed === key ? 'retryPhoto' : 'Avatar do jogador')} style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fieldFill, borderWidth: 2, borderColor: colors.accent }}>
    {settings.hasAvatar && photo?.key === key ? <Image source={{ uri: photo.uri }} style={{ width: size, height: size }} accessibilityLabel={t('Avatar do jogador')} />
      : <Text style={{ color: colors.accent, fontSize: size / 3, fontWeight: '700' }} accessibilityLabel={t('Avatar do jogador')}>{name.slice(0, 2).toUpperCase()}</Text>}
    {settings.hasAvatar && token && photo?.key !== key && failed !== key ? <View style={{position:'absolute'}}><ActivityIndicator color={colors.accent} /></View> : null}
  </Pressable>;
}

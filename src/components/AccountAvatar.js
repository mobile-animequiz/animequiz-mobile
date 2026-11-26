import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../contexts/AccountContext';
import { avatarSource } from '../utils/avatarSource';
import { getDisplayName } from '../utils/displayName';
import useI18n from '../hooks/useI18n';
export default function AccountAvatar({ size = 64 }) {
  const { token, user } = useAuth();
  const { settings, colors } = useAccount();
  const { t } = useI18n();
  const [failed, setFailed] = useState(null);
  const [loaded, setLoaded] = useState(null);
  const [retry, setRetry] = useState(0);
  const key = `${user?.id}:${settings.avatarVersion}:${token}:${retry}`;
  const name = getDisplayName(user, settings) || '?';
  return <Pressable disabled={!settings.hasAvatar || failed !== key} onPress={() => setRetry(value => value + 1)} accessibilityRole={failed === key ? 'button' : 'image'}
    accessibilityLabel={t(failed === key ? 'retryPhoto' : 'Avatar do jogador')}
    style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fieldFill, borderWidth: 2, borderColor: colors.accent }}>
    {settings.hasAvatar && token && failed !== key ? <Image key={key} source={avatarSource(user.id, settings.avatarVersion, token, retry)}
      style={{ width: size, height: size }} accessibilityLabel={t('Avatar do jogador')} onLoad={() => setLoaded(key)} onError={() => setFailed(key)} />
      : <Text style={{ color: colors.accent, fontSize: size / 3, fontWeight: '700' }} accessibilityLabel={t('Avatar do jogador')}>{name.slice(0, 2).toUpperCase()}</Text>}
    {settings.hasAvatar && token && failed !== key && loaded !== key ? <View style={{ position: 'absolute' }}><ActivityIndicator color={colors.accent} /></View> : null}
  </Pressable>;
}

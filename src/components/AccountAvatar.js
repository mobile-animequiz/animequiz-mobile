import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../contexts/AccountContext';
import { getApiBaseUrl } from '../services/apiConfig';
import useI18n from '../hooks/useI18n';
export default function AccountAvatar({ size = 64 }) {
  const { token, user } = useAuth();
  const { settings, colors } = useAccount();
  const { t } = useI18n();
  const [failed, setFailed] = useState(null);
  const key = String(user?.id) + ':' + settings.avatarVersion;
  const name = settings.displayName || user?.username || '?';
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fieldFill, borderWidth: 2, borderColor: colors.accent }}>
    {settings.hasAvatar && failed !== key ? <Image key={key} source={{ uri: getApiBaseUrl() + '/users/me/avatar?v=' + encodeURIComponent(key), headers: { Authorization: 'Bearer ' + token }, cache: 'reload' }}
      style={{ width: size, height: size }} accessibilityLabel={t('Avatar do jogador')} onError={() => setFailed(key)} />
      : <Text style={{ color: colors.accent, fontSize: size / 3, fontWeight: '700' }} accessibilityLabel={t('Avatar do jogador')}>{name.slice(0, 2).toUpperCase()}</Text>}
  </View>;
}

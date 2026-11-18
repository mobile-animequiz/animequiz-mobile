import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApiVersion } from '../contexts/ApiVersionContext';
import { colors, textStyles } from '../styles/theme';

export default function ApiVersionSelector() {
  const { version, switchVersion, isChecking, connection, error } = useApiVersion();
  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <Text style={styles.title}>Versão da API</Text>
        <View style={styles.row} accessibilityRole="radiogroup">
          {['1', '2'].map((value) => (
            <Pressable key={value} disabled={isChecking} onPress={() => switchVersion(value)}
              accessibilityRole="radio" accessibilityLabel={`Usar API V${value}`}
              accessibilityState={{ selected: version === value, disabled: isChecking }}
              style={[styles.choice, version === value && styles.selected]}>
              <Text style={styles.label}>V{value}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={styles.detail}>{version === '2' ? 'Perguntas com imagens e tempo sugerido' : 'Perguntas no formato original'}</Text>
      <Pressable disabled={isChecking} onPress={() => switchVersion(version)} accessibilityRole="button"
        accessibilityState={{ disabled: isChecking }} style={styles.check}>
        {isChecking ? <ActivityIndicator size="small" color={colors.accent} /> : null}
        <Text style={styles.checkLabel}>{isChecking ? 'Verificando servidor…' : 'Verificar conexão'}</Text>
      </Pressable>
      {connection ? <Text style={styles.success} accessibilityLiveRegion="polite">{connection}</Text> : null}
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 18, marginTop: 20, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { ...textStyles.body, fontWeight: '700', flexShrink: 1 },
  choice: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.fieldFill },
  selected: { backgroundColor: '#3C4A93', borderColor: colors.accent, borderWidth: 2 },
  label: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  detail: { ...textStyles.body, fontSize: 14, color: colors.textSecondary },
  check: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 44 },
  checkLabel: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  success: { color: colors.difficultyEasy, fontSize: 14 },
  error: { color: colors.error, fontSize: 14 },
});

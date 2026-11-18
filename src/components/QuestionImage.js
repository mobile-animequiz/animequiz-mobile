import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../styles/theme';

// The caller keys by question ID so loading/error state resets for each image.
export default function QuestionImage({ uri, description }) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  if (!uri) return null;
  return (
    <View style={styles.frame}>
      {failed ? <Text style={styles.fallback}>Imagem indisponível. Você pode continuar respondendo.</Text> : (
        <Image source={{ uri }} style={styles.image} resizeMode="contain" accessibilityLabel={description}
          onLoadEnd={() => setLoading(false)} onError={() => { setFailed(true); setLoading(false); }} />
      )}
      {loading && !failed ? <ActivityIndicator color={colors.accent} style={styles.loader} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 200, width: '100%', borderRadius: 18, overflow: 'hidden', backgroundColor: '#14182D', justifyContent: 'center', marginBottom: 18 },
  image: { width: '100%', height: '100%' },
  fallback: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, textAlign: 'center', padding: 24 },
  loader: { position: 'absolute', alignSelf: 'center' },
});

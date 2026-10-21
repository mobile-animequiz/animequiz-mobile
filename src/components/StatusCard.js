import { StyleSheet, Text, View } from 'react-native';

import { colors, metrics, textStyles } from '../styles/theme';
import { formatNumber } from '../utils/formatters';

// Player status: level, rank title, total XP and progress towards the next level.
// `player.progress` comes from getLevelProgress() (see utils/progress.js).
export default function StatusCard({ player }) {
  const { level, rankTitle, xp, progress } = player;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{level}</Text>
        </View>

        <View style={styles.levelInfo}>
          <Text style={textStyles.heading}>Nível {level}</Text>
          <Text style={textStyles.caption}>{rankTitle}</Text>
        </View>

        <View style={styles.xpInfo}>
          <Text style={styles.xpValue}>{formatNumber(xp)} XP</Text>
          <Text style={textStyles.caption}>pontuação total</Text>
        </View>
      </View>

      <View
        style={styles.track}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Progresso para o nível ${level + 1}`}
        accessibilityValue={{ min: 0, max: 100, now: progress.percent }}
      >
        <View style={[styles.fill, { width: `${progress.percent}%` }]} />
      </View>

      <View style={styles.row}>
        <Text style={[textStyles.caption, styles.grow]}>
          {formatNumber(progress.remainingXp)} XP para o nível {level + 1}
        </Text>
        <Text style={textStyles.caption}>{progress.percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: metrics.cardPadding,
    gap: metrics.cardGap,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.fieldFill,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.cardGap,
  },
  grow: {
    flex: 1,
  },
  levelBadge: {
    width: metrics.levelBadgeSize,
    height: metrics.levelBadgeSize,
    borderRadius: metrics.levelBadgeSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  levelBadgeText: {
    ...textStyles.title,
  },
  levelInfo: {
    flex: 1,
  },
  xpInfo: {
    alignItems: 'flex-end',
  },
  xpValue: {
    ...textStyles.heading,
    color: colors.accent,
  },
  track: {
    height: metrics.progressHeight,
    borderRadius: metrics.progressHeight / 2,
    overflow: 'hidden',
    backgroundColor: colors.progressTrack,
  },
  fill: {
    height: '100%',
    borderRadius: metrics.progressHeight / 2,
    backgroundColor: colors.accent,
  },
});

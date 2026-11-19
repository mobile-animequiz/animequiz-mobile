import useI18n from '../hooks/useI18n';
import { t } from '../i18n/runtime';
import { StyleSheet, Text, View } from 'react-native';

import AnimatedProgress from './AnimatedProgress';
import { useAccount } from '../contexts/AccountContext';
import { colors, metrics, textStyles } from '../styles/theme';
import { formatNumber } from '../utils/formatters';

// Player status: level, rank title, total XP and progress towards the next level.
// `player.progress` comes from getLevelProgress() (see utils/progress.js).
export default function StatusCard({ player }) {
  useI18n();
  const { level, rankTitle, xp, progress } = player;
  const { colors: personal } = useAccount();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.levelBadge, { backgroundColor: personal.accent }]}>
          <Text style={styles.levelBadgeText}>{level}</Text>
        </View>

        <View style={styles.levelInfo}>
          <Text style={textStyles.heading}>{t("Nível")} {level}</Text>
          <Text style={textStyles.caption}>{t(rankTitle)}</Text>
        </View>

        <View style={styles.xpInfo}>
          <Text style={[styles.xpValue, { color: personal.accent }]}>{formatNumber(xp)} XP</Text>
          <Text style={textStyles.caption}>{t("pontuação total")}</Text>
        </View>
      </View>

      <AnimatedProgress value={progress.percent / 100} label={t('Progresso para o próximo nível')} />

      <View style={styles.row}>
        <Text style={[textStyles.caption, styles.grow]}>
          {formatNumber(progress.remainingXp)} {t("XP para o nível")} {level + 1}
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

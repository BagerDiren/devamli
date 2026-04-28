import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { riskLabel } from '../utils/attendance';

const palette = {
  safe: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  critical: { bg: colors.dangerSoft, fg: colors.danger },
  failed: { bg: colors.danger, fg: '#FFFFFF' },
};

export default function RiskBadge({ risk }) {
  const c = palette[risk] || palette.safe;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{riskLabel(risk)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  text: {
    ...typography.tiny,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

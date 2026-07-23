import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { PressableScale } from './PressableScale';
import { colors, radius, spacing, typography } from '../theme';

export type QuickActionVariant = 'default' | 'primary';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  variant?: QuickActionVariant;
  testID?: string;
}

const discColors: Record<QuickActionVariant, string> = {
  default: colors.accentSoft,
  primary: colors.primary,
};

/**
 * Circular quick action with a label underneath — the Revolut home pattern.
 * Labels wrap to two lines so longer translations never truncate.
 */
export const QuickAction = ({
  icon,
  label,
  onPress,
  variant = 'default',
  testID,
}: QuickActionProps) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    scaleTo={0.92}
    testID={testID}
    style={styles.container}>
    <View style={[styles.disc, { backgroundColor: discColors[variant] }]}>
      {icon}
    </View>
    <Text style={styles.label} numberOfLines={2}>
      {label}
    </Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 92,
    gap: spacing.sm,
  },
  disc: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.captionMedium,
    color: colors.ink,
    textAlign: 'center',
  },
});

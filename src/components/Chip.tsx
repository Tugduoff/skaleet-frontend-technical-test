import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { PressableScale } from './PressableScale';
import { colors, radius, spacing, typography } from '../theme';

interface ChipProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Selectable pill used for one-of-many choices (recipient picker, quick
 * amounts) — friendlier on mobile than a dropdown.
 */
export const Chip = ({
  label,
  onPress,
  selected = false,
  leading,
  style,
  testID,
}: ChipProps) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    testID={testID}
    style={[
      styles.container,
      selected ? styles.selected : styles.unselected,
      style,
    ]}>
    {leading}
    <View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  </PressableScale>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
  },
  selected: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: 'transparent',
  },
  label: {
    ...typography.bodyMedium,
    color: colors.ink,
  },
});

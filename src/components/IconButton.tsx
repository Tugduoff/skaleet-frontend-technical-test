import React from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { PressableScale } from './PressableScale';
import { colors, radius } from '../theme';

export type IconButtonVariant = 'default' | 'danger' | 'onDark';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  /** Icon-only buttons must stay accessible; also used by tests and e2e. */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const backgroundColors: Record<IconButtonVariant, string> = {
  default: colors.primarySoft,
  danger: colors.dangerSoft,
  onDark: 'rgba(255, 255, 255, 0.12)',
};

/**
 * Circular icon-only button used for compact row actions (edit, delete,
 * toggles). Always requires an accessibilityLabel since it has no text.
 */
export const IconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'default',
  size = 40,
  style,
  testID,
}: IconButtonProps) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    scaleTo={0.9}
    testID={testID}
    style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundColor: backgroundColors[variant],
      },
      style,
    ]}>
    {icon}
  </PressableScale>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

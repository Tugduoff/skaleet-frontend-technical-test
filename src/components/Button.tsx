import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { PressableScale } from './PressableScale';
import { colors, radius, spacing, typography } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const containerColors: Record<ButtonVariant, string> = {
  primary: colors.primary,
  secondary: colors.primarySoft,
  ghost: 'transparent',
  danger: colors.dangerSoft,
};

const labelColors: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.primary,
  ghost: colors.inkMuted,
  danger: colors.danger,
};

/**
 * The app's single button. Variants cover every context (filled action,
 * tinted secondary, quiet text, destructive) and disabled/pressed feedback
 * comes built in.
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  testID,
}: ButtonProps) => (
  <PressableScale
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    testID={testID}
    style={[
      styles.container,
      { backgroundColor: containerColors[variant] },
      disabled && styles.disabled,
      style,
    ]}>
    {icon}
    <Text style={[styles.label, { color: labelColors[variant] }]}>{title}</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.title,
  },
});

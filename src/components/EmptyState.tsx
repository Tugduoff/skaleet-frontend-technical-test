import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
}

/**
 * Friendly placeholder for empty lists so no screen is ever a dead end:
 * an icon disc, a short explanation, and usually a way forward.
 */
export const EmptyState = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionTestID,
}: EmptyStateProps) => (
  <View style={styles.container}>
    <View style={styles.disc}>{icon}</View>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {actionLabel && onAction ? (
      <Button
        title={actionLabel}
        onPress={onAction}
        style={styles.action}
        testID={actionTestID}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl * 2,
  },
  disc: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  action: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
});

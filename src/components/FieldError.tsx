import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WarningCircle } from 'phosphor-react-native';

import { colors, spacing, typography } from '../theme';

interface FieldErrorProps {
  /** Nothing renders while the message is empty, unless reserveSpace is set. */
  message?: string;
  /**
   * Keeps the row's space (invisible) while there is no message, so the
   * layout does not jump when the error appears.
   */
  reserveSpace?: boolean;
}

/** Inline validation message with an icon, shown under form fields. */
export const FieldError = ({
  message,
  reserveSpace = false,
}: FieldErrorProps) => {
  if (!message && !reserveSpace) {
    return null;
  }
  const visible = Boolean(message);
  return (
    <View
      style={[styles.row, !visible && styles.hidden]}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
      <WarningCircle size={14} color={colors.danger} weight="fill" />
      <Text style={styles.text}>{message ?? ''}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  hidden: {
    opacity: 0,
  },
  text: {
    color: colors.danger,
    ...typography.caption,
  },
});

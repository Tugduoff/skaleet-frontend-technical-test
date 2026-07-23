import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Avatar } from './Avatar';
import { FadeInView } from './FadeInView';
import { PressableScale } from './PressableScale';
import { formatAmount } from '../utils/amount';
import { formatDate } from '../utils/date';
import { colors, spacing, typography } from '../theme';
import type { Transaction } from '../types';

interface TransactionRowProps {
  transaction: Transaction;
  index: number;
  showSeparator: boolean;
  onPress?: () => void;
  testID?: string;
}

/**
 * One transaction in a history list: avatar, recipient, date, signed amount.
 * Tappable when onPress is provided.
 */
export const TransactionRow = ({
  transaction,
  index,
  showSeparator,
  onPress,
  testID,
}: TransactionRowProps) => {
  const content = (
    <>
      <Avatar name={transaction.account.name} />
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>
          {transaction.account.name}
        </Text>
        <Text style={styles.rowDate}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <Text style={styles.rowAmount}>
        {formatAmount(-transaction.amountCents)}
      </Text>
    </>
  );
  return (
    <FadeInView delay={Math.min(index, 6) * 60}>
      {onPress ? (
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={transaction.account.name}
          scaleTo={0.98}
          testID={testID}
          style={styles.row}>
          {content}
        </PressableScale>
      ) : (
        <View style={styles.row} testID={testID}>
          {content}
        </View>
      )}
      {showSeparator && <View style={styles.separator} />}
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    ...typography.bodyMedium,
    color: colors.ink,
  },
  rowDate: {
    ...typography.caption,
    color: colors.inkMuted,
    marginTop: 2,
  },
  rowAmount: {
    ...typography.title,
    fontVariant: ['tabular-nums'],
    color: colors.ink,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
});

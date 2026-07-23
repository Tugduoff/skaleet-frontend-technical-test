import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { XIcon } from 'phosphor-react-native';

import { Chip } from './Chip';
import { FieldError } from './FieldError';
import { IconButton } from './IconButton';
import { addCentsToAmountInput, formatAmount } from '../utils/amount';
import { t } from '../i18n';
import { colors, spacing, typography } from '../theme';

/** One-tap amounts offered under the input, in cents. */
const QUICK_AMOUNTS_CENTS = [1000, 2000, 5000, 10000] as const;

interface AmountInputProps {
  amount: string;
  onChangeAmount: (amount: string) => void;
  error?: string;
}

/** Large centered amount entry with a clear button and quick-add chips. */
export const AmountInput = ({
  amount,
  onChangeAmount,
  error,
}: AmountInputProps) => (
  <View style={styles.amountBlock}>
    <View style={styles.amountRow}>
      <View style={styles.amountSide} />
      <View style={styles.amountCenter}>
        <Text style={styles.amountCurrency}>€</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={onChangeAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.inkFaint}
        />
      </View>
      <View style={styles.amountSide}>
        {amount !== '' && (
          <IconButton
            icon={<XIcon size={16} color={colors.ink} />}
            onPress={() => onChangeAmount('')}
            accessibilityLabel={t('transaction.clearAmount')}
            size={36}
            testID="clear-amount"
          />
        )}
      </View>
    </View>
    <FieldError message={error} reserveSpace />
    <View style={styles.quickRow}>
      {QUICK_AMOUNTS_CENTS.map(cents => (
        <Chip
          key={cents}
          label={`+${formatAmount(cents)}`}
          onPress={() => onChangeAmount(addCentsToAmountInput(amount, cents))}
          testID={`quick-add-${cents}`}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  amountBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSide: {
    width: 40,
    alignItems: 'center',
  },
  amountCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCurrency: {
    ...typography.hero,
    color: colors.accent,
    marginRight: spacing.sm,
  },
  amountInput: {
    ...typography.hero,
    color: colors.ink,
    paddingVertical: 0,
    minWidth: 120,
    textAlign: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});

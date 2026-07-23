import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BankIcon, UserIcon } from 'phosphor-react-native';

import { TextField } from './TextField';
import { t } from '../i18n';
import { colors, spacing } from '../theme';

interface ManualRecipientFieldsProps {
  name: string;
  onChangeName: (name: string) => void;
  nameError?: string;
  iban: string;
  onChangeIban: (iban: string) => void;
  ibanError?: string;
}

/** Name and IBAN inputs shown when the recipient isn't a saved beneficiary. */
export const ManualRecipientFields = ({
  name,
  onChangeName,
  nameError,
  iban,
  onChangeIban,
  ibanError,
}: ManualRecipientFieldsProps) => (
  <View style={styles.manualFields}>
    <TextField
      icon={<UserIcon size={20} color={colors.inkFaint} />}
      value={name}
      onChangeText={onChangeName}
      placeholder={t('transaction.recipientName')}
      autoCapitalize="words"
      error={nameError}
    />
    <TextField
      icon={<BankIcon size={20} color={colors.inkFaint} />}
      value={iban}
      onChangeText={onChangeIban}
      placeholder={t('transaction.recipientIban')}
      autoCapitalize="characters"
      autoCorrect={false}
      error={ibanError}
      style={styles.manualField}
    />
  </View>
);

const styles = StyleSheet.create({
  manualFields: {
    marginTop: spacing.md,
  },
  manualField: {
    marginTop: spacing.md,
  },
});

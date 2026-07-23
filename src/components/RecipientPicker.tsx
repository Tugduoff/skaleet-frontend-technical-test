import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PlusIcon } from 'phosphor-react-native';

import { RecipientCircle } from './RecipientCircle';
import { getBeneficiaryFullName } from '../utils/beneficiaries';
import { t } from '../i18n';
import { colors, radius, spacing, typography } from '../theme';
import type { Beneficiary } from '../types';

interface RecipientPickerProps {
  beneficiaries: Beneficiary[];
  useManualEntry: boolean;
  selectedBeneficiary: Beneficiary | null;
  onSelect: (id: number | 'manual') => void;
}

/** Recipient label, saved-beneficiary grid and manual-entry tile. */
export const RecipientPicker = ({
  beneficiaries,
  useManualEntry,
  selectedBeneficiary,
  onSelect,
}: RecipientPickerProps) => (
  <>
    <Text style={styles.label}>{t('transaction.recipientLabel')}</Text>
    {beneficiaries.length > 0 ? (
      <View style={styles.recipientGrid}>
        {beneficiaries.map(beneficiary => {
          const fullName = getBeneficiaryFullName(beneficiary);
          return (
            <RecipientCircle
              key={beneficiary.id}
              name={fullName}
              selected={
                !useManualEntry && selectedBeneficiary?.id === beneficiary.id
              }
              onPress={() => onSelect(beneficiary.id)}
              testID={`beneficiary-option-${beneficiary.id}`}
            />
          );
        })}
        <Pressable
          onPress={() => onSelect('manual')}
          accessibilityRole="button"
          accessibilityState={{ selected: useManualEntry }}
          accessibilityLabel={t('transaction.manualEntry')}
          testID="beneficiary-option-manual"
          style={({ pressed }) => [
            styles.recipient,
            pressed && styles.pressed,
          ]}>
          <View
            style={[
              styles.recipientRing,
              useManualEntry && styles.recipientSelected,
            ]}>
            <View style={styles.manualDisc}>
              <PlusIcon size={24} color={colors.accent} />
            </View>
          </View>
          <Text style={styles.recipientName} numberOfLines={2}>
            {t('transaction.manualEntry')}
          </Text>
        </Pressable>
      </View>
    ) : (
      <Text style={styles.hint}>{t('transaction.manualHint')}</Text>
    )}
  </>
);

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  recipientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
    paddingVertical: spacing.md,
  },
  recipient: {
    alignItems: 'flex-start',
    width: '20%',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  recipientRing: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.full,
    padding: 3,
  },
  recipientSelected: {
    borderColor: colors.ink,
  },
  manualDisc: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientName: {
    ...typography.captionMedium,
    color: colors.ink,
    textAlign: 'center',
    width: 66,
  },
  hint: {
    ...typography.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
});

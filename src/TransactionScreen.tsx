import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { PaperPlaneTiltIcon } from 'phosphor-react-native';

import { useTransactionScreen } from './hooks/useTransactionScreen';
import { useTabSwipe } from './hooks/useTabSwipe';
import { AmountInput } from './components/AmountInput';
import { Button } from './components/Button';
import { ManualRecipientFields } from './components/ManualRecipientFields';
import { RecipientPicker } from './components/RecipientPicker';
import { splitFullName } from './utils/beneficiaries';
import { parseAmountToCents } from './utils/amount';
import { t, useLanguage } from './i18n';
import { colors, spacing } from './theme';
import { normalizeIban } from './utils/iban';
import type { RootStackParamList, RootTabParamList } from './types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Transaction'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TransactionScreen = ({ navigation, route }: Props) => {
  useLanguage();
  const {
    amount,
    amountError,
    beneficiaries,
    iban,
    ibanError,
    isSubmitting,
    name,
    nameError,
    selectedBeneficiary,
    useManualEntry,
    setAmount,
    setIban,
    setName,
    setSelection,
    submit,
  } = useTransactionScreen(route.params?.prefillBeneficiaryId);
  const swipeHandlers = useTabSwipe(navigation, 'Transaction');
  const amountCents = parseAmountToCents(amount);
  const canSubmit =
    amountCents !== null &&
    amountCents > 0 &&
    (useManualEntry
      ? name.trim() !== '' && iban.trim() !== ''
      : selectedBeneficiary !== null);

  const handleTransaction = () => {
    if (!submit()) {
      return;
    }
    const recipientSaved = beneficiaries.some(
      beneficiary => beneficiary.iban === normalizeIban(iban),
    );
    if (!useManualEntry || recipientSaved) {
      navigation.navigate('Home');
      return;
    }

    // Add a new beneficiary after sending to them, if they don't already exist.
    const { firstName, lastName } = splitFullName(name);
    Alert.alert(
      t('transaction.saveTitle'),
      t('transaction.saveMessage', { name: name.trim() }),
      [
        {
          text: t('transaction.saveDecline'),
          style: 'cancel',
          onPress: () => navigation.navigate('Home'),
        },
        {
          text: t('transaction.saveConfirm'),
          onPress: () =>
            navigation.navigate('BeneficiaryForm', {
              prefillFirstName: firstName,
              prefillLastName: lastName,
              prefillIban: iban,
            }),
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      {...swipeHandlers}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <AmountInput
          amount={amount}
          onChangeAmount={setAmount}
          error={amountError}
        />

        <RecipientPicker
          beneficiaries={beneficiaries}
          useManualEntry={useManualEntry}
          selectedBeneficiary={selectedBeneficiary}
          onSelect={setSelection}
        />
        {useManualEntry && (
          <ManualRecipientFields
            name={name}
            onChangeName={setName}
            nameError={nameError}
            iban={iban}
            onChangeIban={setIban}
            ibanError={ibanError}
          />
        )}
      </ScrollView>
      {canSubmit && (
        <View style={styles.ctaBar}>
          <Button
            title={t('transaction.submit')}
            icon={
              <PaperPlaneTiltIcon
                size={20}
                color={colors.white}
                weight="bold"
              />
            }
            onPress={handleTransaction}
            disabled={isSubmitting}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  ctaBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default TransactionScreen;

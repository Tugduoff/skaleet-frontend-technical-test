import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Bank, PaperPlaneTilt, Plus, User, X } from 'phosphor-react-native';

import { useTransactionScreen } from './hooks/useTransactionScreen';
import { useTabSwipe } from './hooks/useTabSwipe';
import { Avatar } from './components/Avatar';
import { Button } from './components/Button';
import { Chip } from './components/Chip';
import { FieldError } from './components/FieldError';
import { IconButton } from './components/IconButton';
import { TextField } from './components/TextField';
import { getBeneficiaryFullName, splitFullName } from './utils/beneficiaries';
import {
  addCentsToAmountInput,
  formatAmount,
  parseAmountToCents,
} from './utils/amount';
import { t, useLanguage } from './i18n';
import { colors, radius, spacing, typography } from './theme';
import { normalizeIban } from './utils/iban';
import type { RootStackParamList, RootTabParamList } from './types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Transaction'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** One-tap amounts offered under the input, in cents. */
const QUICK_AMOUNTS_CENTS = [1000, 2000, 5000, 10000] as const;

/** Circular recipient with its name underneath; selected gets a black ring.
 *  A plain Pressable: PressableScale styles an inner view, so a percentage
 *  column width would never reach the layout — the whole column stays
 *  tappable and the name wraps inside it. */
const RecipientCircle = ({
  name,
  selected,
  onPress,
  testID,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={name}
    testID={testID}
    style={({ pressed }) => [styles.recipient, pressed && styles.pressed]}>
    <View style={[styles.recipientRing, selected && styles.recipientSelected]}>
      <Avatar name={name} size={56} />
    </View>
    <Text style={styles.recipientName} numberOfLines={2}>
      {name}
    </Text>
  </Pressable>
);

const TransactionScreen = ({ navigation }: Props) => {
  useLanguage();
  const {
    amount,
    setAmount,
    name,
    setName,
    iban,
    setIban,
    setSelection,
    amountError,
    nameError,
    ibanError,
    isSubmitting,
    useManualEntry,
    selectedBeneficiary,
    beneficiaries,
    submit,
  } = useTransactionScreen();
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
    // Manual recipient not yet saved: offer to reuse it next time.
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
      // Android pans the window instead (adjustPan in the manifest).
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      {...swipeHandlers}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.amountBlock}>
          <View style={styles.amountRow}>
            {/* Equal side slots keep the amount optically centred; the
                right one holds the clear button once an amount is entered. */}
            <View style={styles.amountSide} />
            <View style={styles.amountCenter}>
              <Text style={styles.amountCurrency}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.inkFaint}
              />
            </View>
            <View style={styles.amountSide}>
              {amount !== '' && (
                <IconButton
                  icon={<X size={16} color={colors.ink} />}
                  onPress={() => setAmount('')}
                  accessibilityLabel={t('transaction.clearAmount')}
                  size={36}
                  testID="clear-amount"
                />
              )}
            </View>
          </View>
          <FieldError message={amountError} reserveSpace />
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS_CENTS.map(cents => (
              <Chip
                key={cents}
                label={`+${formatAmount(cents)}`}
                onPress={() => setAmount(addCentsToAmountInput(amount, cents))}
                testID={`quick-add-${cents}`}
              />
            ))}
          </View>
        </View>

        <Text style={styles.label}>{t('transaction.recipientLabel')}</Text>
        {beneficiaries.length > 0 ? (
          // Fixed 20%-wide columns: exactly five recipients per row, the
          // rest wrap onto the rows below — no horizontal scrolling.
          <View style={styles.recipientGrid}>
            {beneficiaries.map(beneficiary => {
              const fullName = getBeneficiaryFullName(beneficiary);
              return (
                <RecipientCircle
                  key={beneficiary.id}
                  name={fullName}
                  selected={
                    !useManualEntry &&
                    selectedBeneficiary?.id === beneficiary.id
                  }
                  onPress={() => setSelection(beneficiary.id)}
                  testID={`beneficiary-option-${beneficiary.id}`}
                />
              );
            })}
            <Pressable
              onPress={() => setSelection('manual')}
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
                  <Plus size={24} color={colors.accent} />
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
        {useManualEntry && (
          <View style={styles.manualFields}>
            <TextField
              icon={<User size={20} color={colors.inkFaint} />}
              value={name}
              onChangeText={setName}
              placeholder={t('transaction.recipientName')}
              autoCapitalize="words"
              error={nameError}
            />
            <TextField
              icon={<Bank size={20} color={colors.inkFaint} />}
              value={iban}
              onChangeText={setIban}
              placeholder={t('transaction.recipientIban')}
              autoCapitalize="characters"
              autoCorrect={false}
              error={ibanError}
              style={styles.manualField}
            />
          </View>
        )}
      </ScrollView>
      {canSubmit && (
        <View style={styles.ctaBar}>
          <Button
            title={t('transaction.submit')}
            icon={
              <PaperPlaneTilt size={20} color={colors.white} weight="bold" />
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
    fontSize: 32,
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
    fontSize: 12,
    color: colors.ink,
    textAlign: 'center',
    // Ring width (56 avatar + padding + border), so the name stays
    // centered under its circle rather than under the whole slot.
    width: 66,
  },
  hint: {
    ...typography.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  manualFields: {
    marginTop: spacing.md,
  },
  manualField: {
    marginTop: spacing.md,
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

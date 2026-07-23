import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PencilSimple,
  PaperPlaneTilt,
  Receipt,
  Trash,
} from 'phosphor-react-native';

import { useBeneficiaryDetailScreen } from './hooks/useBeneficiaryDetailScreen';
import { Avatar } from './components/Avatar';
import { EmptyState } from './components/EmptyState';
import { GradientBackground } from './components/GradientBackground';
import { QuickAction } from './components/QuickAction';
import { TransactionRow } from './components/TransactionRow';
import { getBeneficiaryFullName } from './utils/beneficiaries';
import { formatIban } from './utils/iban';
import { t, useLanguage } from './i18n';
import { colors, spacing, typography } from './theme';
import type { RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'BeneficiaryDetail'>;

const BeneficiaryDetailScreen = ({ navigation, route }: Props) => {
  useLanguage();
  const { beneficiary, transactions, confirmDelete } =
    useBeneficiaryDetailScreen(route.params.beneficiaryId);
  const insets = useSafeAreaInsets();

  if (!beneficiary) {
    // Stale deep link or the beneficiary was deleted while the screen was open.
    navigation.goBack();
    return null;
  }

  const fullName = getBeneficiaryFullName(beneficiary);

  const handleSend = () => {
    navigation.navigate('Tabs', {
      screen: 'Transaction',
      params: { prefillBeneficiaryId: beneficiary.id },
    });
  };

  const handleEdit = () => {
    navigation.navigate('BeneficiaryForm', { beneficiaryId: beneficiary.id });
  };

  const handleDelete = () => {
    confirmDelete(beneficiary, () => navigation.goBack());
  };

  const listHeader = (
    <>
      <View style={styles.header}>
        <Avatar name={fullName} size={96} />
        <Text
          style={styles.name}
          numberOfLines={2}
          testID="beneficiary-detail-name">
          {fullName}
        </Text>
        <Text style={styles.iban} testID="beneficiary-detail-iban">
          {formatIban(beneficiary.iban)}
        </Text>
      </View>
      <View style={styles.actions}>
        <QuickAction
          icon={<PaperPlaneTilt size={22} color={colors.white} weight="bold" />}
          label={t('beneficiaryDetail.send')}
          onPress={handleSend}
          variant="primary"
          testID="beneficiary-detail-send"
        />
        <QuickAction
          icon={<PencilSimple size={22} color={colors.primary} />}
          label={t('common.edit')}
          onPress={handleEdit}
          testID="beneficiary-detail-edit"
        />
        <QuickAction
          icon={<Trash size={22} color={colors.danger} />}
          label={t('common.delete')}
          onPress={handleDelete}
          testID="beneficiary-detail-delete"
        />
      </View>
      <Text style={styles.sectionTitle}>{t('beneficiaryDetail.history')}</Text>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Opaque backdrop so the previous screen does not show through during
          the push transition; without it both transparent screens blend for
          the whole animation. */}
      <GradientBackground />
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <TransactionRow
            transaction={item}
            index={index}
            showSeparator={index < transactions.length - 1}
            testID={`beneficiary-transaction-${item.id}`}
          />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState
            icon={<Receipt size={40} color={colors.accent} />}
            title={t('beneficiaryDetail.empty')}
            subtitle={t('beneficiaryDetail.emptySubtitle')}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  name: {
    ...typography.heading,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  iban: {
    ...typography.body,
    color: colors.inkMuted,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
});

export default BeneficiaryDetailScreen;

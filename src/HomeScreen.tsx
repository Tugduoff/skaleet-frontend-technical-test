import React, { useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowCounterClockwiseIcon,
  EyeIcon,
  EyeSlashIcon,
  HandCoinsIcon,
  PaperPlaneTiltIcon,
  ReceiptIcon,
  UsersIcon,
} from 'phosphor-react-native';

import { useHomeScreen } from './hooks/useHomeScreen';
import { useTabSwipe } from './hooks/useTabSwipe';
import { EmptyState } from './components/EmptyState';
import { IconButton } from './components/IconButton';
import { LanguageToggle } from './components/LanguageToggle';
import { QuickAction } from './components/QuickAction';
import { TransactionRow } from './components/TransactionRow';
import { t, useLanguage } from './i18n';
import { colors, spacing, typography } from './theme';
import { formatAmount } from './utils/amount';
import { normalizeIban } from './utils/iban';
import type { RootStackParamList, RootTabParamList } from './types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = ({ navigation }: Props) => {
  useLanguage();
  const {
    balanceCents,
    balanceHidden,
    beneficiaries,
    transactions,
    confirmReset,
    receiveDemoFunds,
    toggleBalanceHidden,
  } = useHomeScreen();
  const insets = useSafeAreaInsets();
  const swipeHandlers = useTabSwipe(navigation, 'Home');

  const lastAmountTapRef = useRef(0);
  const handleAmountPress = () => {
    const now = Date.now();
    if (now - lastAmountTapRef.current < 300) {
      toggleBalanceHidden();
      lastAmountTapRef.current = 0;
      return;
    }
    lastAmountTapRef.current = now;
  };

  const listHeader = (
    <>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <LanguageToggle />
          <IconButton
            icon={
              balanceHidden ? (
                <EyeSlashIcon size={18} color={colors.ink} />
              ) : (
                <EyeIcon size={18} color={colors.ink} />
              )
            }
            onPress={toggleBalanceHidden}
            accessibilityLabel={t(
              balanceHidden ? 'home.showBalance' : 'home.hideBalance',
            )}
            size={40}
            testID="toggle-balance"
          />
          <IconButton
            icon={<HandCoinsIcon size={18} color={colors.accent} />}
            onPress={receiveDemoFunds}
            accessibilityLabel={t('home.receiveDemo')}
            size={40}
            testID="receive-demo"
          />
          <IconButton
            icon={
              <ArrowCounterClockwiseIcon size={18} color={colors.inkMuted} />
            }
            onPress={confirmReset}
            accessibilityLabel={t('home.reset')}
            size={40}
            testID="reset-demo"
          />
        </View>
      </View>

      <View style={styles.balanceBlock}>
        <Text style={styles.balanceLabel}>{t('home.balanceLabel')}</Text>
        <Pressable
          onPress={handleAmountPress}
          accessibilityRole="button"
          accessibilityLabel={t(
            balanceHidden ? 'home.showBalance' : 'home.hideBalance',
          )}>
          <Text style={styles.balanceAmount}>
            {balanceHidden ? '••••••' : formatAmount(balanceCents)}
          </Text>
        </Pressable>
      </View>

      <View style={styles.quickActions}>
        <QuickAction
          icon={<PaperPlaneTiltIcon size={22} color={colors.accent} />}
          label={t('home.addTransaction')}
          onPress={() => navigation.navigate('Transaction')}
          testID="home-add-transaction"
        />
        <QuickAction
          icon={<UsersIcon size={22} color={colors.accent} />}
          label={t('home.beneficiaries')}
          onPress={() => navigation.navigate('Beneficiaries')}
          testID="home-beneficiaries"
        />
      </View>

      <Text style={styles.sectionTitle}>{t('home.transactions')}</Text>
    </>
  );

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      {...swipeHandlers}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => {
          const matchedBeneficiary = beneficiaries.find(
            beneficiary =>
              beneficiary.iban === normalizeIban(item.account.iban),
          );
          return (
            <TransactionRow
              transaction={item}
              index={index}
              showSeparator={index < transactions.length - 1}
              onPress={
                matchedBeneficiary
                  ? () =>
                      navigation.navigate('BeneficiaryDetail', {
                        beneficiaryId: matchedBeneficiary.id,
                      })
                  : undefined
              }
              testID={`transaction-${item.id}`}
            />
          );
        }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState
            icon={<ReceiptIcon size={40} color={colors.accent} />}
            title={t('home.empty')}
            subtitle={t('home.emptySubtitle')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceBlock: {
    marginTop: spacing.xl,
  },
  balanceLabel: {
    ...typography.bodyMedium,
    color: colors.inkMuted,
  },
  balanceAmount: {
    ...typography.hero,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.ink,
    marginTop: spacing.xxxl,
    marginBottom: spacing.sm,
  },
});

export default HomeScreen;

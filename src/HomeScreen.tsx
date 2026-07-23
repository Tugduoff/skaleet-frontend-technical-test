import React, { useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowCounterClockwise,
  Eye,
  EyeSlash,
  HandCoins,
  PaperPlaneTilt,
  Receipt,
  Users,
} from 'phosphor-react-native';

import { useHomeScreen } from './hooks/useHomeScreen';
import { useTabSwipe } from './hooks/useTabSwipe';
import { Avatar } from './components/Avatar';
import { EmptyState } from './components/EmptyState';
import { FadeInView } from './components/FadeInView';
import { IconButton } from './components/IconButton';
import { LanguageToggle } from './components/LanguageToggle';
import { PressableScale } from './components/PressableScale';
import { t, useLanguage } from './i18n';
import { colors, radius, spacing, typography } from './theme';
import { formatAmount } from './utils/amount';
import { formatDate } from './utils/date';
import type {
  Transaction,
  RootStackParamList,
  RootTabParamList,
} from './types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** Circular quick action with a label underneath — the Revolut home pattern.
 *  Labels wrap to two lines so longer translations never truncate. */
const QuickAction = ({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  testID?: string;
}) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    scaleTo={0.92}
    testID={testID}
    style={styles.quickAction}>
    <View style={styles.quickActionDisc}>{icon}</View>
    <Text style={styles.quickActionLabel} numberOfLines={2}>
      {label}
    </Text>
  </PressableScale>
);

/**
 * One transaction in the history: avatar, recipient, date, signed amount.
 * Tappable when the recipient is a saved beneficiary — leads there.
 */
const TransactionRow = ({
  transaction,
  index,
  showSeparator,
  onPress,
}: {
  transaction: Transaction;
  index: number;
  showSeparator: boolean;
  onPress?: () => void;
}) => {
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
          style={styles.row}>
          {content}
        </PressableScale>
      ) : (
        <View style={styles.row}>{content}</View>
      )}
      {showSeparator && <View style={styles.separator} />}
    </FadeInView>
  );
};

const HomeScreen = ({ navigation }: Props) => {
  useLanguage();
  const {
    transactions,
    balanceCents,
    balanceHidden,
    toggleBalanceHidden,
    confirmReset,
    receiveDemoFunds,
    beneficiaries,
  } = useHomeScreen();
  const insets = useSafeAreaInsets();
  const swipeHandlers = useTabSwipe(navigation, 'Home');

  // Double-tapping the amount toggles privacy, same as the eye button.
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
                <EyeSlash size={18} color={colors.ink} />
              ) : (
                <Eye size={18} color={colors.ink} />
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
            icon={<HandCoins size={18} color={colors.accent} />}
            onPress={receiveDemoFunds}
            accessibilityLabel={t('home.receiveDemo')}
            size={40}
            testID="receive-demo"
          />
          <IconButton
            icon={<ArrowCounterClockwise size={18} color={colors.inkMuted} />}
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
          icon={<PaperPlaneTilt size={22} color={colors.accent} />}
          label={t('home.addTransaction')}
          onPress={() => navigation.navigate('Transaction')}
          testID="home-add-transaction"
        />
        <QuickAction
          icon={<Users size={22} color={colors.accent} />}
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
          const recipientIsSaved = beneficiaries.some(
            beneficiary => beneficiary.iban === item.account.iban,
          );
          return (
            <TransactionRow
              transaction={item}
              index={index}
              showSeparator={index < transactions.length - 1}
              onPress={
                recipientIsSaved
                  ? () => navigation.navigate('Beneficiaries')
                  : undefined
              }
            />
          );
        }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState
            icon={<Receipt size={40} color={colors.accent} />}
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
  quickAction: {
    alignItems: 'center',
    width: 76,
    gap: spacing.sm,
  },
  quickActionDisc: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    ...typography.captionMedium,
    fontSize: 12,
    color: colors.ink,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.title,
    color: colors.ink,
    marginTop: spacing.xxxl,
    marginBottom: spacing.sm,
  },
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

export default HomeScreen;

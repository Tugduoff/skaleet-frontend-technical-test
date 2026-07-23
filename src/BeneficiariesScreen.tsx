import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { PlusIcon, UsersIcon } from 'phosphor-react-native';

import { useTabSwipe } from './hooks/useTabSwipe';
import { Avatar } from './components/Avatar';
import { Button } from './components/Button';
import { EmptyState } from './components/EmptyState';
import { FadeInView } from './components/FadeInView';
import { getBeneficiaryFullName } from './utils/beneficiaries';
import { formatIban } from './utils/iban';
import { t, useLanguage } from './i18n';
import { colors, spacing, typography } from './theme';
import type {
  Beneficiary,
  RootStackParamList,
  RootTabParamList,
} from './types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTransactions } from './TransactionContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Beneficiaries'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BeneficiariesScreen = ({ navigation }: Props) => {
  useLanguage();
  const { beneficiaries } = useTransactions();
  const swipeHandlers = useTabSwipe(navigation, 'Beneficiaries');

  const renderItem = ({
    item,
    index,
  }: {
    item: Beneficiary;
    index: number;
  }) => {
    const fullName = getBeneficiaryFullName(item);
    return (
      <FadeInView delay={Math.min(index, 6) * 60}>
        <Pressable
          onPress={() =>
            navigation.navigate('BeneficiaryDetail', {
              beneficiaryId: item.id,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={fullName}
          testID={`beneficiary-row-${item.id}`}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <Avatar name={fullName} size={48} />
          <View style={styles.rowBody}>
            <Text style={styles.rowName} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={styles.rowIban} numberOfLines={1}>
              {formatIban(item.iban)}
            </Text>
          </View>
        </Pressable>
        {index < beneficiaries.length - 1 && <View style={styles.separator} />}
      </FadeInView>
    );
  };

  return (
    <View style={styles.container} {...swipeHandlers}>
      <FlatList
        style={styles.list}
        data={beneficiaries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon={<UsersIcon size={40} color={colors.accent} />}
            title={t('beneficiaries.empty')}
            subtitle={t('beneficiaries.emptySubtitle')}
          />
        }
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.ctaBar}>
        <Button
          title={t('beneficiaries.add')}
          icon={<PlusIcon size={20} color={colors.white} weight="bold" />}
          onPress={() => navigation.navigate('BeneficiaryForm')}
          testID="add-beneficiary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.6,
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.ink,
  },
  rowIban: {
    ...typography.caption,
    color: colors.inkMuted,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 64,
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

export default BeneficiariesScreen;

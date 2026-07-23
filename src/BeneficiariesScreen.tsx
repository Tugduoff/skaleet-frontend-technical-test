import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Plus, Trash, Users } from 'phosphor-react-native';

import { useBeneficiariesScreen } from './hooks/useBeneficiariesScreen';
import { useTabSwipe } from './hooks/useTabSwipe';
import { Avatar } from './components/Avatar';
import { Button } from './components/Button';
import { EmptyState } from './components/EmptyState';
import { FadeInView } from './components/FadeInView';
import { IconButton } from './components/IconButton';
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

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Beneficiaries'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BeneficiariesScreen = ({ navigation }: Props) => {
  useLanguage();
  const { beneficiaries, confirmDelete } = useBeneficiariesScreen();
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
        <View style={styles.row}>
          {/* Avatar, name and body all lead to edit; delete stays separate. */}
          <Pressable
            onPress={() =>
              navigation.navigate('BeneficiaryForm', {
                beneficiaryId: item.id,
              })
            }
            accessibilityRole="button"
            accessibilityLabel={t('beneficiaries.edit')}
            testID={`beneficiary-edit-${item.id}`}
            style={({ pressed }) => [
              styles.rowMain,
              pressed && styles.pressed,
            ]}>
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
          <IconButton
            icon={<Trash size={18} color={colors.danger} />}
            onPress={() => confirmDelete(item)}
            accessibilityLabel={t('beneficiaries.delete')}
            variant="danger"
            size={36}
            testID={`beneficiary-delete-${item.id}`}
          />
        </View>
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
            icon={<Users size={40} color={colors.accent} />}
            title={t('beneficiaries.empty')}
            subtitle={t('beneficiaries.emptySubtitle')}
          />
        }
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.ctaBar}>
        <Button
          title={t('beneficiaries.add')}
          icon={<Plus size={20} color={colors.white} weight="bold" />}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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

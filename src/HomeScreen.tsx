import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHomeScreen } from './hooks/useHomeScreen';
import { t } from './i18n';
import { formatDate } from './utils/date';
import type { RootStackParamList, Transaction } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { transactions, balanceCents, formatAmount, confirmReset } =
    useHomeScreen();
  // The stack header covers the top inset; keep content off the gesture bar.
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        {t('home.transactionId', { id: String(item.id) })}
      </Text>
      <Text style={styles.itemText}>
        {t('home.amount', { amount: `$${formatAmount(item.amountCents)}` })}
      </Text>
      <Text style={styles.itemText}>
        {t('home.to', { name: item.account.name })}
      </Text>
      <Text style={styles.itemText}>
        {t('home.iban', { iban: item.account.iban })}
      </Text>
      <Text style={styles.itemText}>
        {t('home.date', { date: formatDate(item.createdAt) })}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Text style={styles.balanceText}>
        {t('home.balance', { amount: `$${formatAmount(balanceCents)}` })}
      </Text>
      <Button
        title={t('home.addTransaction')}
        onPress={() => navigation.navigate('Transaction')}
      />
      <Button
        title={t('home.beneficiaries')}
        onPress={() => navigation.navigate('Beneficiaries')}
      />
      <Button title={t('home.reset')} onPress={confirmReset} />
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('home.empty')}</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default HomeScreen;

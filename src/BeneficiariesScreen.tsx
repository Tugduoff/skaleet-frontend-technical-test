import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

import { useBeneficiariesScreen } from './hooks/useBeneficiariesScreen';
import { getBeneficiaryFullName } from './utils/beneficiaries';
import type { Beneficiary, RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Beneficiaries'>;

const BeneficiariesScreen = ({ navigation }: Props) => {
  const { beneficiaries, confirmDelete } = useBeneficiariesScreen();

  const renderItem = ({ item }: { item: Beneficiary }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{getBeneficiaryFullName(item)}</Text>
      <Text style={styles.itemText}>IBAN: {item.iban}</Text>
      <View style={styles.actions}>
        <Button
          title="Edit"
          onPress={() =>
            navigation.navigate('BeneficiaryForm', {
              beneficiaryId: item.id,
            })
          }
        />
        <Button title="Delete" onPress={() => confirmDelete(item)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={beneficiaries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No beneficiaries yet</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.footer}>
        <Button
          title="Add Beneficiary"
          onPress={() => navigation.navigate('BeneficiaryForm')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});

export default BeneficiariesScreen;

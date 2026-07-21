import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from 'react-native';

import { useTransactions } from './TransactionContext';
import { isValidIban } from './utils/iban';
import type { Beneficiary } from './types';

const BeneficiariesScreen = () => {
  const { beneficiaries, addBeneficiary } = useTransactions();
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [nameError, setNameError] = useState('');
  const [ibanError, setIbanError] = useState('');

  const handleAdd = () => {
    if (name.trim() === '') {
      setNameError('Please enter a name');
      return;
    }
    if (!isValidIban(iban)) {
      setIbanError('Please enter a valid IBAN');
      return;
    }
    setNameError('');
    setIbanError('');
    addBeneficiary(name.trim(), iban.trim());
    setName('');
    setIban('');
  };

  const renderItem = ({ item }: { item: Beneficiary }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>IBAN: {item.iban}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={beneficiaries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No beneficiaries yet</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          onChangeText={setName}
          value={name}
          placeholder="Beneficiary name"
        />
        {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
        <TextInput
          style={styles.input}
          onChangeText={setIban}
          value={iban}
          placeholder="Beneficiary IBAN"
        />
        {ibanError ? <Text style={styles.error}>{ibanError}</Text> : null}
        <Button title="Add Beneficiary" onPress={handleAdd} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  form: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});

export default BeneficiariesScreen;

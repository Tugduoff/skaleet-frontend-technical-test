import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from 'react-native';

import { useBeneficiariesScreen } from './hooks/useBeneficiariesScreen';
import { getBeneficiaryFullName } from './utils/beneficiaries';
import type { Beneficiary } from './types';

const BeneficiariesScreen = () => {
  const {
    beneficiaries,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    iban,
    setIban,
    firstNameError,
    lastNameError,
    ibanError,
    handleAdd,
  } = useBeneficiariesScreen();

  const renderItem = ({ item }: { item: Beneficiary }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{getBeneficiaryFullName(item)}</Text>
      <Text style={styles.itemText}>IBAN: {item.iban}</Text>
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
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          onChangeText={setFirstName}
          value={firstName}
          placeholder="First name"
        />
        {firstNameError ? (
          <Text style={styles.error}>{firstNameError}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          onChangeText={setLastName}
          value={lastName}
          placeholder="Last name"
        />
        {lastNameError ? (
          <Text style={styles.error}>{lastNameError}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          onChangeText={setIban}
          value={iban}
          placeholder="IBAN"
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

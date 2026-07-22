import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useTransactionScreen } from './hooks/useTransactionScreen';
import type { RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Transaction'>;

const TransactionScreen = ({ navigation }: Props) => {
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

  const handleTransaction = () => {
    if (submit()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setAmount}
        value={amount}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      {amountError ? <Text style={styles.error}>{amountError}</Text> : null}
      {beneficiaries.length > 0 && (
        <Picker
          testID="beneficiary-picker"
          selectedValue={useManualEntry ? 'manual' : selectedBeneficiary?.id}
          onValueChange={(value: number | 'manual') => setSelection(value)}
          style={styles.picker}>
          {beneficiaries.map(beneficiary => (
            <Picker.Item
              key={beneficiary.id}
              label={`${beneficiary.name} - ${beneficiary.iban}`}
              value={beneficiary.id}
            />
          ))}
          <Picker.Item label="Enter manually…" value="manual" />
        </Picker>
      )}
      {useManualEntry && (
        <>
          {beneficiaries.length === 0 && (
            <Text style={styles.hint}>
              No saved beneficiaries — enter the recipient manually
            </Text>
          )}
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="Recipient Name"
          />
          {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
          <TextInput
            style={styles.input}
            onChangeText={setIban}
            value={iban}
            placeholder="Recipient IBAN"
          />
          {ibanError ? <Text style={styles.error}>{ibanError}</Text> : null}
        </>
      )}
      <Button
        title="Submit Transaction"
        onPress={handleTransaction}
        disabled={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginVertical: 8,
  },
  picker: {
    width: '80%',
  },
  hint: {
    marginVertical: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});

export default TransactionScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useTransactions } from './TransactionContext';
import { isValidIban } from './utils/iban';
import type { RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Transaction'>;

const TransactionScreen = ({ navigation }: Props) => {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [ibanError, setIbanError] = useState('');
  const { addTransaction } = useTransactions();

  const handleTransaction = () => {
    if (!isValidIban(iban)) {
      setIbanError('Please enter a valid IBAN');
      return;
    }
    setIbanError('');
    const accountDetails = { name, iban };
    addTransaction(amount, accountDetails);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          width: '80%',
          marginVertical: 8,
        }}
        onChangeText={setAmount}
        value={amount}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          width: '80%',
          marginVertical: 8,
        }}
        onChangeText={setName}
        value={name}
        placeholder="Recipient Name"
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          width: '80%',
          marginVertical: 8,
        }}
        onChangeText={setIban}
        value={iban}
        placeholder="Recipient IBAN"
      />
      {ibanError ? (
        <Text style={{ color: 'red', marginBottom: 8 }}>{ibanError}</Text>
      ) : null}
      <Button title="Submit Transaction" onPress={handleTransaction} />
    </View>
  );
};

export default TransactionScreen;

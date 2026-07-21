import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTransactions } from './TransactionContext';
import { getAmountError } from './utils/amount';
import { getSelectedBeneficiary } from './utils/beneficiaries';
import type { RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Transaction'>;

const TransactionScreen = ({ navigation }: Props) => {
  const [amount, setAmount] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [amountError, setAmountError] = useState('');
  const { addTransaction, balance, beneficiaries } = useTransactions();

  const selectedBeneficiary = getSelectedBeneficiary(beneficiaries, selectedId);

  const handleTransaction = () => {
    setAmountError('');
    const amountErrorMessage = getAmountError(amount, balance);
    if (amountErrorMessage) {
      setAmountError(amountErrorMessage);
      return;
    }
    if (!selectedBeneficiary) {
      return;
    }
    addTransaction(amount, {
      name: selectedBeneficiary.name,
      iban: selectedBeneficiary.iban,
    });
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
      {amountError ? (
        <Text style={{ color: 'red', marginBottom: 8 }}>{amountError}</Text>
      ) : null}
      {beneficiaries.length === 0 ? (
        <>
          <Text style={{ marginVertical: 8 }}>
            Add a beneficiary before making a transaction
          </Text>
          <Button
            title="Go to Beneficiaries"
            onPress={() => navigation.navigate('Beneficiaries')}
          />
        </>
      ) : (
        <>
          <Picker
            selectedValue={selectedBeneficiary?.id}
            onValueChange={value => setSelectedId(value)}
            style={{ width: '80%' }}>
            {beneficiaries.map(beneficiary => (
              <Picker.Item
                key={beneficiary.id}
                label={`${beneficiary.name} - ${beneficiary.iban}`}
                value={beneficiary.id}
              />
            ))}
          </Picker>
          <Button title="Submit Transaction" onPress={handleTransaction} />
        </>
      )}
    </View>
  );
};

export default TransactionScreen;

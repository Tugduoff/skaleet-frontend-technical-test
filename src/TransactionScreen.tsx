import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTransactions } from './TransactionContext';
import { getAmountError } from './utils/amount';
import { isValidIban } from './utils/iban';
import { getSelectedBeneficiary } from './utils/beneficiaries';
import type { RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Transaction'>;

const TransactionScreen = ({ navigation }: Props) => {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [selection, setSelection] = useState<number | 'manual' | null>(null);
  const [amountError, setAmountError] = useState('');
  const [nameError, setNameError] = useState('');
  const [ibanError, setIbanError] = useState('');
  const { addTransaction, balance, beneficiaries } = useTransactions();

  const useManualEntry = selection === 'manual' || beneficiaries.length === 0;
  const selectedBeneficiary = getSelectedBeneficiary(
    beneficiaries,
    typeof selection === 'number' ? selection : null,
  );

  const handleTransaction = () => {
    setAmountError('');
    setNameError('');
    setIbanError('');
    const amountErrorMessage = getAmountError(amount, balance);
    if (amountErrorMessage) {
      setAmountError(amountErrorMessage);
      return;
    }
    if (useManualEntry) {
      if (name.trim() === '') {
        setNameError('Please enter a name');
        return;
      }
      if (!isValidIban(iban)) {
        setIbanError('Please enter a valid IBAN');
        return;
      }
      addTransaction(amount, { name: name.trim(), iban: iban.trim() });
    } else if (selectedBeneficiary) {
      addTransaction(amount, {
        name: selectedBeneficiary.name,
        iban: selectedBeneficiary.iban,
      });
    }
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
      {beneficiaries.length > 0 && (
        <Picker
          selectedValue={useManualEntry ? 'manual' : selectedBeneficiary?.id}
          onValueChange={(value: number | 'manual') => setSelection(value)}
          style={{ width: '80%' }}>
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
            <Text style={{ marginVertical: 8 }}>
              No saved beneficiaries — enter the recipient manually
            </Text>
          )}
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
          {nameError ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{nameError}</Text>
          ) : null}
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
        </>
      )}
      <Button title="Submit Transaction" onPress={handleTransaction} />
    </View>
  );
};

export default TransactionScreen;

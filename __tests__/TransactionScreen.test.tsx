import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TransactionScreen from '../src/TransactionScreen';
import { TransactionProvider } from '../src/TransactionContext';
import type { RootStackParamList } from '../src/types';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

type Navigation = NativeStackScreenProps<
  RootStackParamList,
  'Transaction'
>['navigation'];

const seedBeneficiary = () =>
  AsyncStorage.setItem(
    'app-state',
    JSON.stringify({
      version: 2,
      transactions: [],
      balanceCents: 100000,
      beneficiaries: [
        { id: 1, name: 'Jane Doe', iban: 'GB29NWBK60161331926819' },
      ],
    }),
  );

const renderScreen = () => {
  const navigation = { goBack: jest.fn() };
  render(
    <TransactionProvider>
      <TransactionScreen
        navigation={navigation as unknown as Navigation}
        route={{
          key: 'transaction-test',
          name: 'Transaction',
          params: undefined,
        }}
      />
    </TransactionProvider>,
  );
  return navigation;
};

describe('TransactionScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows a manual-entry hint when there are no beneficiaries', async () => {
    renderScreen();
    expect(
      await screen.findByText(
        'No saved beneficiaries — enter the recipient manually',
      ),
    ).toBeTruthy();
  });

  it('rejects an empty amount', async () => {
    const navigation = renderScreen();
    await screen.findByText('Submit Transaction');
    fireEvent.press(screen.getByText('Submit Transaction'));
    expect(screen.getByText('Please enter an amount')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('rejects an amount exceeding the balance', async () => {
    renderScreen();
    await screen.findByText('Submit Transaction');
    fireEvent.changeText(screen.getByPlaceholderText('Enter amount'), '1001');
    fireEvent.press(screen.getByText('Submit Transaction'));
    expect(screen.getByText('Amount exceeds current balance')).toBeTruthy();
  });

  it('rejects an invalid recipient IBAN', async () => {
    renderScreen();
    await screen.findByText('Submit Transaction');
    fireEvent.changeText(screen.getByPlaceholderText('Enter amount'), '10');
    fireEvent.changeText(
      screen.getByPlaceholderText('Recipient Name'),
      'John Doe',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Recipient IBAN'),
      'not-an-iban',
    );
    fireEvent.press(screen.getByText('Submit Transaction'));
    expect(screen.getByText('Please enter a valid IBAN')).toBeTruthy();
  });

  it('submits a manual transaction and navigates back', async () => {
    const navigation = renderScreen();
    await screen.findByText('Submit Transaction');
    fireEvent.changeText(screen.getByPlaceholderText('Enter amount'), '10.50');
    fireEvent.changeText(
      screen.getByPlaceholderText('Recipient Name'),
      'John Doe',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Recipient IBAN'),
      VALID_IBAN,
    );
    fireEvent.press(screen.getByText('Submit Transaction'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('shows the picker when beneficiaries exist and submits for the default selection', async () => {
    await seedBeneficiary();
    const navigation = renderScreen();
    // Picker item labels are native props, not text nodes: wait for the
    // Picker itself to appear once beneficiaries have loaded.
    await waitFor(() => screen.UNSAFE_getByType(Picker));
    // Manual entry fields are hidden while a beneficiary is selected.
    expect(screen.queryByPlaceholderText('Recipient Name')).toBeNull();
    fireEvent.changeText(screen.getByPlaceholderText('Enter amount'), '10');
    fireEvent.press(screen.getByText('Submit Transaction'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('reveals manual entry when the picker is switched to manual', async () => {
    await seedBeneficiary();
    renderScreen();
    await waitFor(() => screen.UNSAFE_getByType(Picker));
    fireEvent(screen.UNSAFE_getByType(Picker), 'onValueChange', 'manual');
    expect(screen.getByPlaceholderText('Recipient Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Recipient IBAN')).toBeTruthy();
  });
});

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  render,
  screen,
  fireEvent,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
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

const renderScreen = async () => {
  const navigation = { goBack: jest.fn() };
  await render(
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
    await renderScreen();
    expect(
      await screen.findByText(
        'No saved beneficiaries — enter the recipient manually',
      ),
    ).toBeTruthy();
  });

  it('rejects an empty amount', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await user.press(await screen.findByText('Submit Transaction'));
    expect(await screen.findByText('Please enter an amount')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('rejects an amount exceeding the balance', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByPlaceholderText('Enter amount'), '1001');
    await user.press(screen.getByText('Submit Transaction'));
    expect(
      await screen.findByText('Amount exceeds current balance'),
    ).toBeTruthy();
  });

  it('rejects an invalid recipient IBAN', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByPlaceholderText('Enter amount'), '10');
    await user.type(screen.getByPlaceholderText('Recipient Name'), 'John Doe');
    await user.type(
      screen.getByPlaceholderText('Recipient IBAN'),
      'not-an-iban',
    );
    await user.press(screen.getByText('Submit Transaction'));
    expect(await screen.findByText('Please enter a valid IBAN')).toBeTruthy();
  });

  it('submits a manual transaction and navigates back', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await user.type(screen.getByPlaceholderText('Enter amount'), '10.50');
    await user.type(screen.getByPlaceholderText('Recipient Name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Recipient IBAN'), VALID_IBAN);
    await user.press(screen.getByText('Submit Transaction'));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  });

  it('shows the picker when beneficiaries exist and submits for the default selection', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    const navigation = await renderScreen();
    await screen.findByTestId('beneficiary-picker');
    // Manual entry fields are hidden while a beneficiary is selected.
    expect(screen.queryByPlaceholderText('Recipient Name')).toBeNull();
    await user.type(screen.getByPlaceholderText('Enter amount'), '10');
    await user.press(screen.getByText('Submit Transaction'));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  });

  it('reveals manual entry when the picker is switched to manual', async () => {
    await seedBeneficiary();
    await renderScreen();
    const picker = await screen.findByTestId('beneficiary-picker');
    fireEvent(picker, 'onValueChange', 'manual');
    expect(await screen.findByPlaceholderText('Recipient Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Recipient IBAN')).toBeTruthy();
  });
});

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from '../src/HomeScreen';
import { TransactionProvider } from '../src/TransactionContext';
import type { RootStackParamList } from '../src/types';

type Navigation = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>['navigation'];

const buildNavigation = () => ({
  navigate: jest.fn(),
});

const renderScreen = async () => {
  const navigation = buildNavigation();
  await render(
    <TransactionProvider>
      <HomeScreen
        navigation={navigation as unknown as Navigation}
        route={{ key: 'home-test', name: 'Home', params: undefined }}
      />
    </TransactionProvider>,
  );
  return navigation;
};

describe('HomeScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows the initial balance', async () => {
    await renderScreen();
    expect(await screen.findByText('Current Balance: $1000.00')).toBeTruthy();
  });

  it('shows an empty state when there are no transactions', async () => {
    await renderScreen();
    expect(await screen.findByText('No transactions yet')).toBeTruthy();
  });

  it('renders persisted transactions', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 2,
        transactions: [
          {
            id: 1,
            amountCents: 4250,
            account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
          },
        ],
        balanceCents: 95750,
        beneficiaries: [],
      }),
    );
    await renderScreen();
    expect(await screen.findByText('Current Balance: $957.50')).toBeTruthy();
    expect(screen.getByText('Amount: $42.50')).toBeTruthy();
    expect(screen.getByText('To: John Doe')).toBeTruthy();
    expect(screen.getByText('IBAN: GB29NWBK60161331926819')).toBeTruthy();
  });

  it('shows transactions newest-first with their dates', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
        transactions: [
          {
            id: 1,
            amountCents: 1000,
            account: { name: 'Older', iban: 'GB29NWBK60161331926819' },
            createdAt: '2026-07-20T09:05:00',
          },
          {
            id: 2,
            amountCents: 2000,
            account: { name: 'Newer', iban: 'DE89370400440532013000' },
            createdAt: '2026-07-22T14:30:00',
          },
        ],
        balanceCents: 100000,
        beneficiaries: [],
      }),
    );
    await renderScreen();
    await screen.findByText('To: Newer');
    const recipients = screen.getAllByText(/^To: /);
    expect(recipients.map(row => row.props.children.join(''))).toEqual([
      'To: Newer',
      'To: Older',
    ]);
    expect(screen.getByText('Date: 2026-07-22 14:30')).toBeTruthy();
    expect(screen.getByText('Date: 2026-07-20 09:05')).toBeTruthy();
  });

  it('navigates to the transaction and beneficiaries screens', async () => {
    const navigation = await renderScreen();
    await screen.findByText('Add Transaction');
    fireEvent.press(screen.getByText('Add Transaction'));
    expect(navigation.navigate).toHaveBeenCalledWith('Transaction');
    fireEvent.press(screen.getByText('Beneficiaries'));
    expect(navigation.navigate).toHaveBeenCalledWith('Beneficiaries');
  });
});

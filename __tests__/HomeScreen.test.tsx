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

  it('navigates to the transaction and beneficiaries screens', async () => {
    const navigation = await renderScreen();
    await screen.findByText('Add Transaction');
    fireEvent.press(screen.getByText('Add Transaction'));
    expect(navigation.navigate).toHaveBeenCalledWith('Transaction');
    fireEvent.press(screen.getByText('Beneficiaries'));
    expect(navigation.navigate).toHaveBeenCalledWith('Beneficiaries');
  });
});

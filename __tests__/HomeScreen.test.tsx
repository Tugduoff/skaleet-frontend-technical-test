import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from '../src/HomeScreen';
import {
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';
import type { RootStackParamList, RootTabParamList } from '../src/types';

type Navigation = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
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
    expect(await screen.findByText('Current balance')).toBeTruthy();
    expect(screen.getByText('€1,000.00')).toBeTruthy();
  });

  it('hides and reveals the balance from the eye toggle', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByText('€1,000.00');
    await user.press(screen.getByTestId('toggle-balance'));
    expect(screen.queryByText('€1,000.00')).toBeNull();
    expect(screen.getByText('••••••')).toBeTruthy();
    await user.press(screen.getByTestId('toggle-balance'));
    expect(await screen.findByText('€1,000.00')).toBeTruthy();
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
    expect(await screen.findByText('€957.50')).toBeTruthy();
    expect(screen.getByText('-€42.50')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
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
    await screen.findByText('Newer');
    const recipients = screen.getAllByText(/^(Newer|Older)$/);
    expect(recipients.map(row => row.props.children)).toEqual([
      'Newer',
      'Older',
    ]);
    expect(screen.getByText('2026-07-22 14:30')).toBeTruthy();
    expect(screen.getByText('2026-07-20 09:05')).toBeTruthy();
  });

  it('navigates to the transaction and beneficiaries screens', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await screen.findByText('Add Transaction');
    await user.press(screen.getByText('Add Transaction'));
    expect(navigation.navigate).toHaveBeenCalledWith('Transaction');
    await user.press(screen.getByText('Beneficiaries'));
    expect(navigation.navigate).toHaveBeenCalledWith('Beneficiaries');
  });

  it('resets the demo data after confirmation', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);
    let context: ReturnType<typeof useTransactions>;
    const Probe = () => {
      context = useTransactions();
      return null;
    };
    const navigation = buildNavigation();
    await render(
      <TransactionProvider>
        <Probe />
        <HomeScreen
          navigation={navigation as unknown as Navigation}
          route={{ key: 'home-test', name: 'Home', params: undefined }}
        />
      </TransactionProvider>,
    );
    await screen.findByText('€1,000.00');
    // Drive the state through the context rather than seeding storage:
    // deterministic regardless of writes in flight from earlier tests.
    await act(async () => {
      context.addTransaction('42.50', {
        name: 'John Doe',
        iban: 'GB29 NWBK 6016 1331 9268 19',
      });
    });
    await screen.findByText('€957.50');
    const user = userEvent.setup();
    await user.press(screen.getByTestId('reset-demo'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Reset demo data',
      'Restore the initial balance and clear all transactions and beneficiaries?',
      expect.any(Array),
    );
    const buttons = alertSpy.mock.calls[0][2];
    const confirm = buttons?.find(button => button.text === 'Reset');
    await act(async () => {
      confirm?.onPress?.();
    });
    expect(await screen.findByText('€1,000.00')).toBeTruthy();
    expect(await screen.findByText('No transactions yet')).toBeTruthy();
    alertSpy.mockRestore();
  });

  it('orders same-timestamp transactions by descending id', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
        transactions: [
          {
            id: 1,
            amountCents: 1000,
            account: { name: 'OlderId', iban: 'GB29NWBK60161331926819' },
            createdAt: '2026-07-22T12:00:00',
          },
          {
            id: 2,
            amountCents: 2000,
            account: { name: 'NewerId', iban: 'DE89370400440532013000' },
            createdAt: '2026-07-22T12:00:00',
          },
        ],
        balanceCents: 100000,
        beneficiaries: [],
      }),
    );
    await renderScreen();
    await screen.findByText('NewerId');
    const recipients = screen.getAllByText(/^(NewerId|OlderId)$/);
    expect(recipients.map(row => row.props.children)).toEqual([
      'NewerId',
      'OlderId',
    ]);
  });

  it('opens the beneficiary detail screen only for transactions to saved recipients', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 4,
        transactions: [
          {
            id: 1,
            amountCents: 4250,
            account: { name: 'Jane Doe', iban: 'GB29NWBK60161331926819' },
            createdAt: '2026-07-22T14:30:00',
          },
          {
            id: 2,
            amountCents: 1000,
            account: {
              name: 'Manual Bob',
              iban: 'FR1420041010050500013M02606',
            },
            createdAt: '2026-07-21T09:00:00',
          },
        ],
        balanceCents: 94750,
        beneficiaries: [
          {
            id: 1,
            firstName: 'Jane',
            lastName: 'Doe',
            iban: 'GB29NWBK60161331926819',
          },
        ],
      }),
    );
    const navigation = await renderScreen();
    await screen.findByText('Jane Doe');
    const user = userEvent.setup();
    await user.press(screen.getByTestId('transaction-1'));
    expect(navigation.navigate).toHaveBeenCalledWith('BeneficiaryDetail', {
      beneficiaryId: 1,
    });
    navigation.navigate.mockClear();
    // A manual, unsaved recipient is not tappable.
    await user.press(screen.getByText('Manual Bob'));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('hides and reveals the balance by double-tapping the amount', async () => {
    const user = userEvent.setup();
    await renderScreen();
    const amount = await screen.findByText('€1,000.00');
    await user.press(amount);
    await user.press(amount);
    expect(screen.queryByText('€1,000.00')).toBeNull();
    expect(screen.getByText('••••••')).toBeTruthy();
    const hidden = screen.getByText('••••••');
    await user.press(hidden);
    await user.press(hidden);
    expect(await screen.findByText('€1,000.00')).toBeTruthy();
  });

  it('tops up the balance with the demo receive button', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByText('€1,000.00');
    await user.press(screen.getByTestId('receive-demo'));
    expect(await screen.findByText('€2,000.00')).toBeTruthy();
  });
});

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BeneficiariesScreen from '../src/BeneficiariesScreen';
import { TransactionProvider } from '../src/TransactionContext';
import type { RootStackParamList, RootTabParamList } from '../src/types';

type Navigation = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Beneficiaries'>,
  NativeStackScreenProps<RootStackParamList>
>['navigation'];

const seedBeneficiary = () =>
  AsyncStorage.setItem(
    'app-state',
    JSON.stringify({
      version: 3,
      transactions: [],
      balanceCents: 100000,
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

const renderScreen = async () => {
  const navigation = { navigate: jest.fn() };
  await render(
    <TransactionProvider>
      <BeneficiariesScreen
        navigation={navigation as unknown as Navigation}
        route={{ key: 'beneficiaries-test', name: 'Beneficiaries' }}
      />
    </TransactionProvider>,
  );
  return navigation;
};

describe('BeneficiariesScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows an empty state when there are no beneficiaries', async () => {
    await renderScreen();
    expect(await screen.findByText('No beneficiaries yet')).toBeTruthy();
  });

  it('navigates to the form when the add button is pressed', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await user.press(await screen.findByTestId('add-beneficiary'));
    expect(navigation.navigate).toHaveBeenCalledWith('BeneficiaryForm');
  });

  it('lists beneficiaries and navigates to the detail screen', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    const navigation = await renderScreen();
    expect(await screen.findByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('GB29 NWBK 6016 1331 9268 19')).toBeTruthy();
    await user.press(screen.getByTestId('beneficiary-row-1'));
    expect(navigation.navigate).toHaveBeenCalledWith('BeneficiaryDetail', {
      beneficiaryId: 1,
    });
  });
});

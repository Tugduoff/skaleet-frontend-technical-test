import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BeneficiariesScreen from '../src/BeneficiariesScreen';
import { TransactionProvider } from '../src/TransactionContext';
import type { RootStackParamList } from '../src/types';

type Navigation = NativeStackScreenProps<
  RootStackParamList,
  'Beneficiaries'
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
  let alertSpy: jest.SpiedFunction<typeof Alert.alert>;

  beforeEach(async () => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('shows an empty state when there are no beneficiaries', async () => {
    await renderScreen();
    expect(await screen.findByText('No beneficiaries yet')).toBeTruthy();
  });

  it('navigates to the form when Add Beneficiary is pressed', async () => {
    const user = userEvent.setup();
    const navigation = await renderScreen();
    await user.press(await screen.findByText('Add Beneficiary'));
    expect(navigation.navigate).toHaveBeenCalledWith('BeneficiaryForm');
  });

  it('lists beneficiaries and navigates to edit with the beneficiary id', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    const navigation = await renderScreen();
    expect(await screen.findByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('IBAN: GB29NWBK60161331926819')).toBeTruthy();
    await user.press(screen.getByText('Edit'));
    expect(navigation.navigate).toHaveBeenCalledWith('BeneficiaryForm', {
      beneficiaryId: 1,
    });
  });

  it('asks for confirmation before deleting a beneficiary', async () => {
    const user = userEvent.setup();
    await seedBeneficiary();
    await renderScreen();
    await user.press(await screen.findByText('Delete'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete beneficiary',
      'Remove Jane Doe from your beneficiaries?',
      expect.any(Array),
    );
  });
});

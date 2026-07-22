import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';
import { beforeEach, describe, expect, it } from '@jest/globals';

import BeneficiariesScreen from '../src/BeneficiariesScreen';
import { TransactionProvider } from '../src/TransactionContext';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';

const renderScreen = async () =>
  await render(
    <TransactionProvider>
      <BeneficiariesScreen />
    </TransactionProvider>,
  );

describe('BeneficiariesScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows an empty state when there are no beneficiaries', async () => {
    await renderScreen();
    expect(await screen.findByText('No beneficiaries yet')).toBeTruthy();
  });

  it('rejects an empty name', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.press(await screen.findByText('Add Beneficiary'));
    expect(await screen.findByText('Please enter a name')).toBeTruthy();
  });

  it('rejects an invalid IBAN', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(
      screen.getByPlaceholderText('Beneficiary name'),
      'John Doe',
    );
    await user.type(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      'not-an-iban',
    );
    await user.press(screen.getByText('Add Beneficiary'));
    expect(await screen.findByText('Please enter a valid IBAN')).toBeTruthy();
  });

  it('adds a beneficiary, shows it in the list and clears the form', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(
      screen.getByPlaceholderText('Beneficiary name'),
      'John Doe',
    );
    await user.type(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      VALID_IBAN,
    );
    await user.press(screen.getByText('Add Beneficiary'));
    expect(await screen.findByText('John Doe')).toBeTruthy();
    expect(screen.getByText('IBAN: GB29NWBK60161331926819')).toBeTruthy();
    expect(screen.queryByText('No beneficiaries yet')).toBeNull();
  });

  it('rejects a duplicate IBAN', async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.type(
      screen.getByPlaceholderText('Beneficiary name'),
      'John Doe',
    );
    await user.type(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      VALID_IBAN,
    );
    await user.press(screen.getByText('Add Beneficiary'));
    await screen.findByText('John Doe');

    await user.type(
      screen.getByPlaceholderText('Beneficiary name'),
      'Jane Doe',
    );
    await user.type(
      screen.getByPlaceholderText('Beneficiary IBAN'),
      'gb29nwbk60161331926819',
    );
    await user.press(screen.getByText('Add Beneficiary'));
    expect(
      await screen.findByText('This beneficiary already exists'),
    ).toBeTruthy();
    // Jane was not added: the list still shows only John.
    expect(screen.queryByText('Jane Doe')).toBeNull();
  });
});

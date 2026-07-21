import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { loadState, saveState } from '../src/utils/storage';

const state = {
  transactions: [
    {
      id: 1,
      amountCents: 4250,
      account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
    },
  ],
  balanceCents: 95750,
  beneficiaries: [{ id: 2, name: 'John Doe', iban: 'GB29NWBK60161331926819' }],
};

describe('storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when nothing is stored', async () => {
    expect(await loadState()).toBeNull();
  });

  it('round-trips the state with a version field', async () => {
    await saveState(state);
    expect(await loadState()).toEqual({ version: 2, ...state });
  });

  it('returns null for a payload with a different version', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({ version: 999, ...state }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null for corrupted JSON', async () => {
    await AsyncStorage.setItem('app-state', '{not json');
    expect(await loadState()).toBeNull();
  });

  it('returns null when stored fields are missing', async () => {
    await AsyncStorage.setItem('app-state', JSON.stringify({ version: 2 }));
    expect(await loadState()).toBeNull();
  });

  it('returns null when stored fields have wrong types', async () => {
    await AsyncStorage.setItem(
      'app-state',
      JSON.stringify({
        version: 2,
        transactions: {},
        balanceCents: 'lots',
        beneficiaries: [],
      }),
    );
    expect(await loadState()).toBeNull();
  });

  it('returns null when the read fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error());
    expect(await loadState()).toBeNull();
  });

  it('does not throw when the write fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error());
    await expect(saveState(state)).resolves.toBeUndefined();
  });
});

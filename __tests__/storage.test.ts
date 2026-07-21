import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { loadState, saveState } from '../src/utils/storage';

const state = {
  transactions: [
    {
      id: 1,
      amount: 42.5,
      account: { name: 'John Doe', iban: 'GB29NWBK60161331926819' },
    },
  ],
  balance: 957.5,
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
    expect(await loadState()).toEqual({ version: 1, ...state });
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
});

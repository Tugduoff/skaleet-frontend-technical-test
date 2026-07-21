import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Beneficiary, Transaction } from '../types';

const STORAGE_KEY = 'app-state';
const STORAGE_VERSION = 1;

export interface PersistedState {
  version: number;
  transactions: Transaction[];
  balance: number;
  beneficiaries: Beneficiary[];
}

/** Loads the persisted state, or null when nothing valid is stored. */
export const loadState = async (): Promise<PersistedState | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed.version === STORAGE_VERSION ? parsed : null;
  } catch {
    return null;
  }
};

export const saveState = async (
  state: Omit<PersistedState, 'version'>,
): Promise<void> => {
  const payload: PersistedState = { version: STORAGE_VERSION, ...state };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

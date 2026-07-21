import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Beneficiary, Transaction } from '../types';

const STORAGE_KEY = 'app-state';
const STORAGE_VERSION = 2;

export interface PersistedState {
  version: number;
  transactions: Transaction[];
  /** Integer cents. */
  balanceCents: number;
  beneficiaries: Beneficiary[];
}

const isPersistedState = (parsed: unknown): parsed is PersistedState => {
  if (typeof parsed !== 'object' || parsed === null) {
    return false;
  }
  const state = parsed as Record<string, unknown>;
  return (
    state.version === STORAGE_VERSION &&
    Array.isArray(state.transactions) &&
    typeof state.balanceCents === 'number' &&
    Array.isArray(state.beneficiaries)
  );
};

/**
 * Loads the persisted state, or null when nothing valid is stored.
 * Never rejects: corrupted data or read failures mean "start fresh".
 */
export const loadState = async (): Promise<PersistedState | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isPersistedState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Persists the state with a version field for future migrations.
 * Never rejects: a failed save must not crash the app, the state
 * stays in memory and is retried on the next change.
 */
export const saveState = async (
  state: Omit<PersistedState, 'version'>,
): Promise<void> => {
  try {
    const payload: PersistedState = { version: STORAGE_VERSION, ...state };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // intentionally swallowed, see above
  }
};

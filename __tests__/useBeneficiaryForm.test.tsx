import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  TransactionProvider,
  useTransactions,
} from '../src/TransactionContext';
import { useBeneficiaryForm } from '../src/hooks/useBeneficiaryForm';
import type { BeneficiaryFormParams } from '../src/hooks/useBeneficiaryForm';
import type { Beneficiary } from '../src/types';

const VALID_IBAN = 'GB29 NWBK 6016 1331 9268 19';
const OTHER_IBAN = 'DE89 3704 0044 0532 0130 00';

let hook: ReturnType<typeof useBeneficiaryForm>;
let context: ReturnType<typeof useTransactions>;
let params: BeneficiaryFormParams;

const Probe = () => {
  hook = useBeneficiaryForm(params);
  context = useTransactions();
  return null;
};

// The app only mounts screens once loading finished; mirror that here so
// the form mounts with the persisted beneficiaries already available.
const Gate = () => {
  const { isLoading } = useTransactions();
  return isLoading ? null : <Probe />;
};

const renderHook = async () => {
  await act(async () => {
    renderer.create(
      <TransactionProvider>
        <Gate />
      </TransactionProvider>,
    );
  });
};

const seedBeneficiaries = (beneficiaries: Beneficiary[]) =>
  AsyncStorage.setItem(
    'app-state',
    JSON.stringify({
      version: 3,
      transactions: [],
      balanceCents: 100000,
      beneficiaries,
    }),
  );

const fillValidForm = () => {
  act(() => {
    hook.setFirstName('John');
    hook.setLastName('Doe');
    hook.setIban(VALID_IBAN);
  });
};

describe('useBeneficiaryForm', () => {
  beforeEach(async () => {
    params = {};
    await AsyncStorage.clear();
  });

  it('starts empty in create mode', async () => {
    await renderHook();
    expect(hook.isEditMode).toBe(false);
    expect(hook.firstName).toBe('');
    expect(hook.lastName).toBe('');
    expect(hook.iban).toBe('');
  });

  it('starts prefilled from route params', async () => {
    params = {
      prefillFirstName: 'John',
      prefillLastName: 'Doe',
      prefillIban: VALID_IBAN,
    };
    await renderHook();
    expect(hook.isEditMode).toBe(false);
    expect(hook.firstName).toBe('John');
    expect(hook.lastName).toBe('Doe');
    expect(hook.iban).toBe(VALID_IBAN);
  });

  it('rejects an empty first name', async () => {
    await renderHook();
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.firstNameError).toBe('Please enter a first name');
  });

  it('rejects an empty last name', async () => {
    await renderHook();
    act(() => {
      hook.setFirstName('John');
    });
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.lastNameError).toBe('Please enter a last name');
  });

  it('rejects an invalid IBAN', async () => {
    await renderHook();
    act(() => {
      hook.setFirstName('John');
      hook.setLastName('Doe');
      hook.setIban('invalid');
    });
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.ibanError).toBe('Please enter a valid IBAN');
  });

  it('rejects a duplicate IBAN', async () => {
    await renderHook();
    act(() => {
      context.addBeneficiary({
        firstName: 'Jane',
        lastName: 'Doe',
        iban: VALID_IBAN,
      });
    });
    fillValidForm();
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.ibanError).toBe('This beneficiary already exists');
    expect(context.beneficiaries).toHaveLength(1);
  });

  it('creates a beneficiary and returns true', async () => {
    await renderHook();
    fillValidForm();
    let ok = false;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(true);
    expect(context.beneficiaries).toHaveLength(1);
    expect(context.beneficiaries[0]).toEqual({
      id: expect.any(Number),
      firstName: 'John',
      lastName: 'Doe',
      iban: 'GB29NWBK60161331926819',
    });
  });

  it('prefills from the beneficiary in edit mode and updates it', async () => {
    await seedBeneficiaries([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        iban: 'GB29NWBK60161331926819',
      },
    ]);
    params = { beneficiaryId: 1 };
    await renderHook();
    expect(hook.isEditMode).toBe(true);
    expect(hook.firstName).toBe('John');
    expect(hook.lastName).toBe('Doe');
    expect(hook.iban).toBe('GB29NWBK60161331926819');
    act(() => {
      hook.setLastName('Smith');
    });
    let ok = false;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(true);
    expect(context.beneficiaries[0].lastName).toBe('Smith');
  });

  it('allows keeping the same IBAN in edit mode', async () => {
    await seedBeneficiaries([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        iban: 'GB29NWBK60161331926819',
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        iban: 'DE89370400440532013000',
      },
    ]);
    params = { beneficiaryId: 1 };
    await renderHook();
    // Same IBAN as the edited beneficiary: not a duplicate.
    let ok = false;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(true);
    // But taking the other beneficiary's IBAN is rejected.
    act(() => {
      hook.setIban(OTHER_IBAN);
    });
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(hook.ibanError).toBe('This beneficiary already exists');
  });

  it('returns false in edit mode when the beneficiary no longer exists', async () => {
    params = { beneficiaryId: 999 };
    await renderHook();
    fillValidForm();
    let ok = true;
    act(() => {
      ok = hook.submit();
    });
    expect(ok).toBe(false);
    expect(context.beneficiaries).toHaveLength(0);
  });
});

export interface Account {
  name: string;
  iban: string;
}

export interface Beneficiary {
  id: number;
  firstName: string;
  lastName: string;
  iban: string;
}

export interface Transaction {
  id: number;
  /** Integer cents, e.g. 1050 for 10.50. */
  amountCents: number;
  account: Account;
}

export type RootStackParamList = {
  Home: undefined;
  Transaction: undefined;
  Beneficiaries: undefined;
  BeneficiaryForm:
    | {
        /** Present to edit an existing beneficiary, absent to create one. */
        beneficiaryId?: number;
        prefillFirstName?: string;
        prefillLastName?: string;
        prefillIban?: string;
      }
    | undefined;
};

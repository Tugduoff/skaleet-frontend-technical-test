/** English strings — the source of truth for translation keys. */
export const en = {
  'screens.home': 'Home',
  'screens.transaction': 'Transaction',
  'screens.beneficiaries': 'Beneficiaries',
  'screens.addBeneficiary': 'Add Beneficiary',
  'screens.editBeneficiary': 'Edit Beneficiary',

  'common.cancel': 'Cancel',

  'home.balance': 'Current Balance: {{amount}}',
  'home.addTransaction': 'Add Transaction',
  'home.beneficiaries': 'Beneficiaries',
  'home.reset': 'Reset demo data',
  'home.empty': 'No transactions yet',
  'home.transactionId': 'Transaction ID: {{id}}',
  'home.amount': 'Amount: {{amount}}',
  'home.to': 'To: {{name}}',
  'home.iban': 'IBAN: {{iban}}',
  'home.date': 'Date: {{date}}',
  'home.resetTitle': 'Reset demo data',
  'home.resetMessage':
    'Restore the initial balance and clear all transactions and beneficiaries?',
  'home.resetConfirm': 'Reset',

  'transaction.amountPlaceholder': 'Enter amount',
  'transaction.submit': 'Submit Transaction',
  'transaction.recipientName': 'Recipient Name',
  'transaction.recipientIban': 'Recipient IBAN',
  'transaction.manualEntry': 'Enter manually…',
  'transaction.manualHint':
    'No saved beneficiaries — enter the recipient manually',
  'transaction.saveTitle': 'Save recipient',
  'transaction.saveMessage': 'Add {{name}} to your beneficiaries?',
  'transaction.saveDecline': 'No thanks',
  'transaction.saveConfirm': 'Save',
  'transaction.submitFailed':
    'Transaction could not be completed, please try again',

  'beneficiaries.empty': 'No beneficiaries yet',
  'beneficiaries.add': 'Add Beneficiary',
  'beneficiaries.edit': 'Edit',
  'beneficiaries.delete': 'Delete',
  'beneficiaries.iban': 'IBAN: {{iban}}',
  'beneficiaries.deleteTitle': 'Delete beneficiary',
  'beneficiaries.deleteMessage': 'Remove {{name}} from your beneficiaries?',
  'beneficiaries.deleteConfirm': 'Delete',

  'form.firstName': 'First name',
  'form.lastName': 'Last name',
  'form.iban': 'IBAN',
  'form.save': 'Save Beneficiary',

  'errors.firstNameRequired': 'Please enter a first name',
  'errors.lastNameRequired': 'Please enter a last name',
  'errors.nameRequired': 'Please enter a name',
  'errors.ibanInvalid': 'Please enter a valid IBAN',
  'errors.ibanDuplicate': 'This beneficiary already exists',
  'errors.amountRequired': 'Please enter an amount',
  'errors.amountInvalid': 'Please enter a valid amount',
  'errors.amountPositive': 'Amount must be greater than 0',
  'errors.amountExceeds': 'Amount exceeds current balance',

  'errorBoundary.title': 'Something went wrong',
  'errorBoundary.retry': 'Try again',
} as const;

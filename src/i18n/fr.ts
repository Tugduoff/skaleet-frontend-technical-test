import type { en } from './en';

/**
 * French translations. Typed as a complete record over the English keys:
 * a missing key is a compile error.
 */
export const fr: Record<keyof typeof en, string> = {
  'screens.home': 'Accueil',
  'screens.transaction': 'Transaction',
  'screens.beneficiaries': 'Bénéficiaires',
  'screens.addBeneficiary': 'Ajouter un bénéficiaire',
  'screens.editBeneficiary': 'Modifier le bénéficiaire',

  'common.cancel': 'Annuler',

  'home.balance': 'Solde actuel : {{amount}}',
  'home.addTransaction': 'Ajouter une transaction',
  'home.beneficiaries': 'Bénéficiaires',
  'home.reset': 'Réinitialiser la démo',
  'home.empty': 'Aucune transaction pour le moment',
  'home.transactionId': 'Transaction n° {{id}}',
  'home.amount': 'Montant : {{amount}}',
  'home.to': 'Destinataire : {{name}}',
  'home.iban': 'IBAN : {{iban}}',
  'home.date': 'Date : {{date}}',
  'home.resetTitle': 'Réinitialiser la démo',
  'home.resetMessage':
    'Restaurer le solde initial et effacer toutes les transactions et tous les bénéficiaires ?',
  'home.resetConfirm': 'Réinitialiser',

  'transaction.amountPlaceholder': 'Saisir le montant',
  'transaction.submit': 'Valider la transaction',
  'transaction.recipientName': 'Nom du destinataire',
  'transaction.recipientIban': 'IBAN du destinataire',
  'transaction.manualEntry': 'Saisie manuelle…',
  'transaction.manualHint':
    'Aucun bénéficiaire enregistré — saisissez le destinataire manuellement',
  'transaction.saveTitle': 'Enregistrer le destinataire',
  'transaction.saveMessage': 'Ajouter {{name}} à vos bénéficiaires ?',
  'transaction.saveDecline': 'Non merci',
  'transaction.saveConfirm': 'Enregistrer',
  'transaction.submitFailed':
    "La transaction n'a pas abouti, veuillez réessayer",

  'beneficiaries.empty': 'Aucun bénéficiaire pour le moment',
  'beneficiaries.add': 'Ajouter un bénéficiaire',
  'beneficiaries.edit': 'Modifier',
  'beneficiaries.delete': 'Supprimer',
  'beneficiaries.iban': 'IBAN : {{iban}}',
  'beneficiaries.deleteTitle': 'Supprimer le bénéficiaire',
  'beneficiaries.deleteMessage': 'Retirer {{name}} de vos bénéficiaires ?',
  'beneficiaries.deleteConfirm': 'Supprimer',

  'form.firstName': 'Prénom',
  'form.lastName': 'Nom',
  'form.iban': 'IBAN',
  'form.save': 'Enregistrer le bénéficiaire',

  'errors.firstNameRequired': 'Veuillez saisir un prénom',
  'errors.lastNameRequired': 'Veuillez saisir un nom',
  'errors.nameRequired': 'Veuillez saisir un nom',
  'errors.ibanInvalid': 'Veuillez saisir un IBAN valide',
  'errors.ibanDuplicate': 'Ce bénéficiaire existe déjà',
  'errors.amountRequired': 'Veuillez saisir un montant',
  'errors.amountInvalid': 'Veuillez saisir un montant valide',
  'errors.amountPositive': 'Le montant doit être supérieur à 0',
  'errors.amountExceeds': 'Le montant dépasse le solde actuel',

  'errorBoundary.title': 'Une erreur est survenue',
  'errorBoundary.retry': 'Réessayer',
};

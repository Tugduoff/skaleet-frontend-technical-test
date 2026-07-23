import type { en } from './en';

export const fr: Record<keyof typeof en, string> = {
  'screens.home': 'Accueil',
  'screens.transaction': 'Transaction',
  'screens.beneficiaries': 'Bénéficiaires',
  'screens.addBeneficiary': 'Ajouter un bénéficiaire',
  'screens.editBeneficiary': 'Modifier le bénéficiaire',
  'screens.beneficiaryDetail': 'Bénéficiaire',
  'screens.cards': 'Cartes',

  'common.cancel': 'Annuler',
  'common.edit': 'Modifier',
  'common.delete': 'Supprimer',

  'tabs.home': 'Accueil',
  'tabs.transfer': 'Virement',
  'tabs.beneficiaries': 'Bénéficiaires',

  'home.balanceLabel': 'Solde actuel',
  'home.showBalance': 'Afficher le solde',
  'home.hideBalance': 'Masquer le solde',
  'home.transactions': 'Transactions récentes',
  'home.addTransaction': 'Ajouter une transaction',
  'home.beneficiaries': 'Bénéficiaires',
  'home.reset': 'Réinitialiser la démo',
  'home.receiveDemo': 'Recevoir 1 000 €',
  'home.empty': 'Aucune transaction pour le moment',
  'home.emptySubtitle': 'Effectuez votre première transaction pour la voir ici',
  'home.resetTitle': 'Réinitialiser la démo',
  'home.resetMessage':
    'Restaurer le solde initial et effacer toutes les transactions et tous les bénéficiaires ?',
  'home.resetConfirm': 'Réinitialiser',

  'transaction.amountLabel': 'Montant',
  'transaction.clearAmount': 'Effacer le montant',
  'transaction.recipientLabel': 'Destinataire',
  'transaction.submit': 'Valider la transaction',
  'transaction.recipientName': 'Nom du destinataire',
  'transaction.recipientIban': 'IBAN du destinataire',
  'transaction.manualEntry': 'Saisie manuelle',
  'transaction.manualHint':
    'Aucun bénéficiaire enregistré — saisissez le destinataire manuellement',
  'transaction.saveTitle': 'Enregistrer le destinataire',
  'transaction.saveMessage': 'Ajouter {{name}} à vos bénéficiaires ?',
  'transaction.saveDecline': 'Non merci',
  'transaction.saveConfirm': 'Enregistrer',
  'transaction.submitFailed':
    "La transaction n'a pas abouti, veuillez réessayer",

  'beneficiaries.empty': 'Aucun bénéficiaire pour le moment',
  'beneficiaries.emptySubtitle':
    'Enregistrez des destinataires pour leur envoyer de l’argent plus vite',
  'beneficiaries.add': 'Ajouter un bénéficiaire',
  'beneficiaries.edit': 'Modifier',
  'beneficiaries.delete': 'Supprimer',
  'beneficiaries.deleteTitle': 'Supprimer le bénéficiaire',
  'beneficiaries.deleteMessage': 'Retirer {{name}} de vos bénéficiaires ?',
  'beneficiaries.deleteConfirm': 'Supprimer',

  'beneficiaryDetail.send': 'Envoyer de l’argent',
  'beneficiaryDetail.history': 'Historique',
  'beneficiaryDetail.empty': 'Aucune transaction pour le moment',
  'beneficiaryDetail.emptySubtitle':
    'Envoyez de l’argent à ce destinataire pour voir l’historique ici',

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

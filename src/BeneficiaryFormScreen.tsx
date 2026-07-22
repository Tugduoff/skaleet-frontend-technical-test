import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBeneficiaryForm } from './hooks/useBeneficiaryForm';
import { t } from './i18n';
import type { RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'BeneficiaryForm'>;

const BeneficiaryFormScreen = ({ navigation, route }: Props) => {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    iban,
    setIban,
    firstNameError,
    lastNameError,
    ibanError,
    submit,
  } = useBeneficiaryForm(route.params ?? {});
  // The stack header covers the top inset; keep content off the gesture bar.
  const insets = useSafeAreaInsets();

  const handleSave = () => {
    if (submit()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <TextInput
        style={styles.input}
        onChangeText={setFirstName}
        value={firstName}
        placeholder={t('form.firstName')}
      />
      {firstNameError ? (
        <Text style={styles.error}>{firstNameError}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        onChangeText={setLastName}
        value={lastName}
        placeholder={t('form.lastName')}
      />
      {lastNameError ? <Text style={styles.error}>{lastNameError}</Text> : null}
      <TextInput
        style={styles.input}
        onChangeText={setIban}
        value={iban}
        placeholder={t('form.iban')}
      />
      {ibanError ? <Text style={styles.error}>{ibanError}</Text> : null}
      <Button title={t('form.save')} onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});

export default BeneficiaryFormScreen;

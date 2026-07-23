import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bank, Check, User } from 'phosphor-react-native';

import { useBeneficiaryForm } from './hooks/useBeneficiaryForm';
import { Avatar } from './components/Avatar';
import { Button } from './components/Button';
import { GradientBackground } from './components/GradientBackground';
import { TextField } from './components/TextField';
import { t, useLanguage } from './i18n';
import { colors, radius, spacing } from './theme';
import type { RootStackParamList } from './types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'BeneficiaryForm'>;

const BeneficiaryFormScreen = ({ navigation, route }: Props) => {
  useLanguage();
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

  const previewName = `${firstName} ${lastName}`.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // Android pans the window instead (adjustPan in the manifest).
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Paints an opaque backdrop inside the screen itself: without it the
          transparent screen lets the previous one show through during the
          push transition, blending both for the whole animation. */}
      <GradientBackground />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.preview}>
          {previewName === '' ? (
            <View style={styles.previewPlaceholder}>
              <User size={34} color={colors.accent} />
            </View>
          ) : (
            <Avatar name={previewName} size={84} />
          )}
        </View>
        <TextField
          icon={<User size={20} color={colors.inkFaint} />}
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t('form.firstName')}
          autoCapitalize="words"
          error={firstNameError}
        />
        <TextField
          icon={<User size={20} color={colors.inkFaint} />}
          value={lastName}
          onChangeText={setLastName}
          placeholder={t('form.lastName')}
          autoCapitalize="words"
          error={lastNameError}
          style={styles.field}
        />
        <TextField
          icon={<Bank size={20} color={colors.inkFaint} />}
          value={iban}
          onChangeText={setIban}
          placeholder={t('form.iban')}
          autoCapitalize="characters"
          autoCorrect={false}
          error={ibanError}
          style={styles.field}
        />
        <Button
          title={t('form.save')}
          icon={<Check size={20} color={colors.white} weight="bold" />}
          onPress={handleSave}
          style={styles.save}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: spacing.lg,
  },
  preview: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  previewPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    marginTop: spacing.md,
  },
  save: {
    marginTop: spacing.xl,
  },
});

export default BeneficiaryFormScreen;

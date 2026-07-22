import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './HomeScreen';
import TransactionScreen from './TransactionScreen';
import BeneficiariesScreen from './BeneficiariesScreen';
import BeneficiaryFormScreen from './BeneficiaryFormScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { TransactionProvider, useTransactions } from './TransactionContext';
import { t } from './i18n';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { isLoading } = useTransactions();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: t('screens.home') }}
        />
        <Stack.Screen
          name="Transaction"
          component={TransactionScreen}
          options={{ title: t('screens.transaction') }}
        />
        <Stack.Screen
          name="Beneficiaries"
          component={BeneficiariesScreen}
          options={{ title: t('screens.beneficiaries') }}
        />
        <Stack.Screen
          name="BeneficiaryForm"
          component={BeneficiaryFormScreen}
          options={({ route }) => ({
            title:
              route.params?.beneficiaryId !== undefined
                ? t('screens.editBeneficiary')
                : t('screens.addBeneficiary'),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <TransactionProvider>
          <AppContent />
        </TransactionProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;

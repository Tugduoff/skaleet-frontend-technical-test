import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './HomeScreen';
import TransactionScreen from './TransactionScreen';
import BeneficiariesScreen from './BeneficiariesScreen';
import BeneficiaryFormScreen from './BeneficiaryFormScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { GradientBackground } from './components/GradientBackground';
import { TabBar } from './components/TabBar';
import { TransactionProvider, useTransactions } from './TransactionContext';
import { t, useLanguage } from './i18n';
import { colors, typography } from './theme';
import type { RootStackParamList, RootTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Navigation colors aligned with the app theme. Backgrounds stay
 * transparent so the app-wide gradient shows through every screen.
 */
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
    text: colors.ink,
    primary: colors.primary,
    border: 'transparent',
  },
};

const headerOptions = {
  headerShadowVisible: false,
  headerTintColor: colors.ink,
  headerStyle: { backgroundColor: 'transparent' },
  headerTitleStyle: { ...typography.title },
} as const;

const Tabs = () => {
  // The stack memoizes this scene (its options never change), so it must
  // subscribe itself for the tab header titles to follow the UI language.
  useLanguage();

  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        ...headerOptions,
        animation: 'shift',
        sceneStyle: { backgroundColor: 'transparent' },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        // Home renders its own custom header (balance actions).
        options={{ title: t('screens.home'), headerShown: false }}
      />
      <Tab.Screen
        name="Transaction"
        component={TransactionScreen}
        options={{ title: t('screens.transaction') }}
      />
      <Tab.Screen
        name="Beneficiaries"
        component={BeneficiariesScreen}
        options={{ title: t('screens.beneficiaries') }}
      />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const { isLoading } = useTransactions();
  useLanguage();

  return (
    <View style={styles.shell}>
      <GradientBackground />
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
          />
          <Stack.Navigator
            screenOptions={{
              ...headerOptions,
              contentStyle: { backgroundColor: 'transparent' },
            }}>
            <Stack.Screen
              name="Tabs"
              component={Tabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BeneficiaryForm"
              component={BeneficiaryFormScreen}
              options={({ route }) => ({
                title:
                  route.params?.beneficiaryId !== undefined
                    ? t('screens.editBeneficiary')
                    : t('screens.addBeneficiary'),
                headerStyle: { backgroundColor: colors.gradientTop },
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </View>
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

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;

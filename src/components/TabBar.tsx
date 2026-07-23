import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, PaperPlaneTilt, Users } from 'phosphor-react-native';

import { PressableScale } from './PressableScale';
import { t, useLanguage } from '../i18n';
import { colors, shadows, spacing, typography } from '../theme';

const TABS = {
  Home: {
    icon: House,
    label: () => t('tabs.home'),
    testID: 'tab-home',
  },
  Transaction: {
    // Same glyph as the Home quick action: one transfer icon everywhere.
    icon: PaperPlaneTilt,
    label: () => t('tabs.transfer'),
    testID: 'tab-transfer',
  },
  Beneficiaries: {
    icon: Users,
    label: () => t('tabs.beneficiaries'),
    testID: 'tab-beneficiaries',
  },
} as const;

/**
 * Minimal bottom navigation bar with three evenly-spaced tabs.
 * The active route lights up in the accent colour, inactive routes fade
 * to grey. A hairline separates the bar from the content.
 */
export const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  useLanguage();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = TABS[route.name as keyof typeof TABS];
        const Icon = config.icon;
        const color = focused ? colors.accent : colors.inkFaint;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          // Each tab lives in an exact one-third slot: the pressable sizes
          // to its content, so the slot — not the label width — sets the
          // compartment and keeps the bar evenly divided.
          <View key={route.key} style={styles.tabSlot}>
            <PressableScale
              onPress={onPress}
              scaleTo={0.95}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={config.label()}
              testID={config.testID}
              style={styles.tab}>
              <Icon
                size={26}
                color={color}
                weight={focused ? 'fill' : 'regular'}
              />
              <Text style={[styles.tabLabel, { color }]}>{config.label()}</Text>
            </PressableScale>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    ...shadows.bar,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    gap: 6,
  },
  tabLabel: {
    ...typography.captionMedium,
  },
});

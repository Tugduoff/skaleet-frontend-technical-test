import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from './PressableScale';
import { setLanguage, useLanguage } from '../i18n';
import type { Language } from '../i18n';
import { colors, radius, spacing, typography } from '../theme';

const LANGUAGES: ReadonlyArray<{ code: Language; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
];

/**
 * Segmented EN/FR switch. The active segment reads as a raised white pill
 * on the warm track, matching the rest of the design system.
 */
export const LanguageToggle = () => {
  const active = useLanguage();

  return (
    <View style={styles.container}>
      {LANGUAGES.map(({ code, label }) => {
        const selected = code === active;
        return (
          <PressableScale
            key={code}
            onPress={() => setLanguage(code)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            scaleTo={0.94}
            testID={`language-${code}`}
            style={[styles.segment, selected && styles.segmentActive]}>
            <Text style={[styles.label, selected && styles.labelActive]}>
              {label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    gap: 2,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  segmentActive: {
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  label: {
    ...typography.captionMedium,
    fontSize: 12,
    color: colors.inkMuted,
  },
  labelActive: {
    color: colors.ink,
    fontWeight: '700',
  },
});

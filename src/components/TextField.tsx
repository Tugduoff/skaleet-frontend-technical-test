import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { FieldError } from './FieldError';
import { colors, radius, spacing, typography } from '../theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  icon?: React.ReactNode;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The app's single text input: rounded container, optional leading icon,
 * focus ring, and an inline error slot.
 */
export const TextField = ({
  icon,
  error,
  style,
  ...inputProps
}: TextFieldProps) => {
  const [focused, setFocused] = useState(false);
  const { onFocus, onBlur, ...restInputProps } = inputProps;

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          focused && styles.focused,
          Boolean(error) && styles.errored,
        ]}>
        {icon}
        <TextInput
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...restInputProps}
        />
      </View>
      <FieldError message={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  focused: {
    borderColor: colors.ink,
  },
  errored: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: colors.ink,
    ...typography.body,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Avatar } from './Avatar';
import { colors, radius, spacing, typography } from '../theme';

interface RecipientCircleProps {
  name: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

/** Circular recipient with its name underneath; selected gets a black ring.
 *  A plain Pressable: PressableScale styles an inner view, so a percentage
 *  column width would never reach the layout — the whole column stays
 *  tappable and the name wraps inside it. */
export const RecipientCircle = ({
  name,
  selected,
  onPress,
  testID,
}: RecipientCircleProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={name}
    testID={testID}
    style={({ pressed }) => [styles.recipient, pressed && styles.pressed]}>
    <View style={[styles.recipientRing, selected && styles.recipientSelected]}>
      <Avatar name={name} size={56} />
    </View>
    <Text style={styles.recipientName} numberOfLines={2}>
      {name}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  recipient: {
    alignItems: 'flex-start',
    width: '20%',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  recipientRing: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.full,
    padding: 3,
  },
  recipientSelected: {
    borderColor: colors.ink,
  },
  recipientName: {
    ...typography.captionMedium,
    color: colors.ink,
    textAlign: 'center',
    width: 66,
  },
});

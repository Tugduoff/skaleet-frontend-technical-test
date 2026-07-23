import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { radius } from '../theme';

/**
 * Warm-leaning pastel pairs chosen to sit well next to the app's orange
 * accent: peach, amber and rose harmonise with it, eucalyptus, sky and
 * lilac balance it. Cycled through by name hash.
 */
const PALETTE: ReadonlyArray<{ background: string; foreground: string }> = [
  { background: '#FFE3D3', foreground: '#A03D00' },
  { background: '#FDEEC8', foreground: '#7A5800' },
  { background: '#FBDCE0', foreground: '#9D2B3F' },
  { background: '#D9EEE4', foreground: '#1E6B4F' },
  { background: '#DCEBF7', foreground: '#1D5A8C' },
  { background: '#E7E2F5', foreground: '#5840A0' },
  { background: '#E7EDCF', foreground: '#5A6B1F' },
];

/**
 * Returns the up-to-two-letter initials of a name ("John Doe" -> "JD",
 * "madonna" -> "M"). Blank names yield "?".
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  return parts
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
};

interface AvatarProps {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Initials disc with a stable pastel color derived from the first initial:
 * the same person always looks the same across lists, and the color does
 * not flicker while a name is being typed keystroke by keystroke.
 */
export const Avatar = ({ name, size = 44, style }: AvatarProps) => {
  const initials = getInitials(name);
  const hash = initials === '?' ? 0 : initials.charCodeAt(0);
  const { background, foreground } = PALETTE[hash % PALETTE.length];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: background,
        },
        style,
      ]}>
      <Text
        style={{
          color: foreground,
          fontSize: size * 0.36,
          fontWeight: '600',
        }}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale applied while pressed. */
  scaleTo?: number;
}

/**
 * Pressable that gently scales its content down while pressed, giving every
 * tappable surface the same tactile feedback.
 */
export const PressableScale = ({
  children,
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  return (
    <Pressable
      {...rest}
      onPressIn={event => {
        animateTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        animateTo(1);
        onPressOut?.(event);
      }}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

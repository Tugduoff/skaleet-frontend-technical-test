import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '../theme';

/**
 * App-wide backdrop: a whisper of warm orange at the top fading to white
 * at the bottom. Rendered once behind the navigation container — screens
 * keep transparent backgrounds so the gradient shows through everywhere.
 */
export const GradientBackground = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="app-background" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.gradientTop} />
          <Stop offset="1" stopColor={colors.background} />
        </LinearGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#app-background)"
      />
    </Svg>
  </View>
);

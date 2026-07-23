import { useRef } from 'react';
import { PanResponder } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';

import type { RootTabParamList } from '../types';

const TAB_ORDER: ReadonlyArray<keyof RootTabParamList> = [
  'Home',
  'Transaction',
  'Beneficiaries',
];

const CLAIM_THRESHOLD = 32;
const TRIGGER_THRESHOLD = 48;
const HORIZONTAL_DOMINANCE = 2.5;

/**
 * Horizontal swipe between tabs: drag left for the next tab, right for the
 * previous one. The claim is deliberately strict — far past tap slop and
 * strongly horizontal — so thumb taps (which drift a little) and diagonal
 * scrolls always keep working. No capture either: scrollable children get
 * the gesture first.
 */
export const useTabSwipe = (
  navigation: NavigationProp<RootTabParamList>,
  routeName: keyof RootTabParamList,
) => {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dx) > CLAIM_THRESHOLD &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * HORIZONTAL_DOMINANCE,
      onPanResponderRelease: (_event, gesture) => {
        const index = TAB_ORDER.indexOf(routeName);
        if (gesture.dx <= -TRIGGER_THRESHOLD && index < TAB_ORDER.length - 1) {
          navigation.navigate(TAB_ORDER[index + 1]);
        } else if (gesture.dx >= TRIGGER_THRESHOLD && index > 0) {
          navigation.navigate(TAB_ORDER[index - 1]);
        }
      },
    }),
  ).current;

  return panResponder.panHandlers;
};

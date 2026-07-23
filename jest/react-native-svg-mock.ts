import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

/** Every svg element (Svg, Path, Circle...) renders as a plain View. */
const SvgHostComponent = (props: ViewProps) => React.createElement(View, props);

/**
 * Proxy module standing in for react-native-svg: whichever export
 * phosphor-react-native imports, it gets a harmless host component.
 */
export const mockReactNativeSvg = new Proxy(
  { __esModule: true, default: SvgHostComponent },
  {
    get: (target, prop) =>
      prop in target ? Reflect.get(target, prop) : SvgHostComponent,
  },
);

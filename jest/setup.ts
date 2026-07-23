import { jest } from '@jest/globals';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import { mockReactNativeSvg } from './react-native-svg-mock';

// The shipped mock only has a default export; re-export it as the whole
// module so named imports (SafeAreaProvider, useSafeAreaInsets, ...) work.
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Icons are rendered as plain views in tests.
jest.mock('react-native-svg', () => mockReactNativeSvg);

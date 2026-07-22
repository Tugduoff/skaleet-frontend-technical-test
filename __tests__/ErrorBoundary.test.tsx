import React from 'react';
import { Text } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { ErrorBoundary } from '../src/ErrorBoundary';

let shouldThrow = false;

const Bomb = () => {
  if (shouldThrow) {
    throw new Error('boom');
  }
  return <Text>all good</Text>;
};

describe('ErrorBoundary', () => {
  let errorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    shouldThrow = false;
    // React logs caught errors; keep the output quiet.
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders the children when nothing throws', async () => {
    await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(await screen.findByText('all good')).toBeTruthy();
  });

  it('shows the fallback and recovers on retry', async () => {
    const user = userEvent.setup();
    shouldThrow = true;
    await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(await screen.findByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('boom')).toBeTruthy();

    shouldThrow = false;
    await user.press(screen.getByText('Try again'));
    expect(await screen.findByText('all good')).toBeTruthy();
  });
});

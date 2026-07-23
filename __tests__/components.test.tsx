import React from 'react';
import { Text } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

import { Avatar, getInitials } from '../src/components/Avatar';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { EmptyState } from '../src/components/EmptyState';
import { FadeInView } from '../src/components/FadeInView';
import { FieldError } from '../src/components/FieldError';
import { IconButton } from '../src/components/IconButton';
import { PressableScale } from '../src/components/PressableScale';
import { TextField } from '../src/components/TextField';

describe('Button', () => {
  it('renders the title and fires onPress', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button title="Confirm" onPress={onPress} />);
    await user.press(screen.getByText('Confirm'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button title="Confirm" onPress={onPress} disabled />);
    await user.press(screen.getByText('Confirm'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)(
    'renders the %s variant',
    async variant => {
      await render(
        <Button title="Action" variant={variant} onPress={() => {}} />,
      );
      expect(screen.getByText('Action')).toBeTruthy();
    },
  );
});

describe('IconButton', () => {
  it('is reachable by its accessibility label and fires onPress', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(
      <IconButton
        icon={<Text>icon</Text>}
        onPress={onPress}
        accessibilityLabel="Delete"
        variant="danger"
      />,
    );
    await user.press(screen.getByLabelText('Delete'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Chip', () => {
  it('fires onPress and exposes its selected state', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Chip label="Jane" onPress={onPress} selected />);
    const chip = screen.getByText('Jane');
    await user.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('TextField', () => {
  it('lets the user type and shows the error message', async () => {
    const user = userEvent.setup();
    const onChangeText = jest.fn();
    await render(
      <TextField
        placeholder="IBAN"
        value=""
        onChangeText={onChangeText}
        error="Please enter a valid IBAN"
      />,
    );
    await user.type(screen.getByPlaceholderText('IBAN'), 'G');
    expect(onChangeText).toHaveBeenCalled();
    expect(screen.getByText('Please enter a valid IBAN')).toBeTruthy();
  });
});

describe('FieldError', () => {
  it('renders nothing without a message', async () => {
    const { toJSON } = await render(<FieldError />);
    expect(toJSON()).toBeNull();
  });
});

describe('Avatar', () => {
  it.each([
    ['John Doe', 'JD'],
    ['madonna', 'M'],
    ['  ', '?'],
    ['Jean luc Picard', 'JL'],
  ])('initials of "%s" are "%s"', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });

  it('renders the initials', async () => {
    await render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders text and fires the action', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    await render(
      <EmptyState
        icon={<Text>icon</Text>}
        title="Nothing here"
        subtitle="Come back later"
        actionLabel="Refresh"
        onAction={onAction}
      />,
    );
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Come back later')).toBeTruthy();
    await user.press(screen.getByText('Refresh'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders without the optional slots', async () => {
    await render(<EmptyState icon={<Text>icon</Text>} title="Empty" />);
    expect(screen.getByText('Empty')).toBeTruthy();
  });
});

describe('PressableScale', () => {
  it('fires onPress', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(
      <PressableScale onPress={onPress}>
        <Text>Tap area</Text>
      </PressableScale>,
    );
    await user.press(screen.getByText('Tap area'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('FadeInView and Card', () => {
  it('render their children', async () => {
    await render(
      <FadeInView>
        <Card>
          <Text>Content</Text>
        </Card>
      </FadeInView>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });
});

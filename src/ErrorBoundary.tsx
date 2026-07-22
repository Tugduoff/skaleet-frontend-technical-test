import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from './i18n';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Fallback shown instead of a white screen; renders without a header. */
const Fallback = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <Text style={styles.title}>{t('errorBoundary.title')}</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Button title={t('errorBoundary.retry')} onPress={onRetry} />
    </View>
  );
};

/**
 * Root error boundary: shows a fallback screen instead of a white screen
 * when a render error escapes, with a retry that re-renders the children.
 * Wire crash reporting into componentDidCatch if a tool gets adopted.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  private readonly handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return <Fallback error={error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
});

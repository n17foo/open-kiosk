import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LoggerFactory } from '../../services/logger/LoggerFactory';
import { lightColors, typographyPresets, spacing, borderRadius } from '../../utils/theme';

const logger = LoggerFactory.getInstance().createLogger('ErrorBoundary');

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error({ message: 'Uncaught error in component tree', metadata: { componentStack: errorInfo.componentStack } }, error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container} accessibilityRole="alert">
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message ?? 'An unexpected error occurred'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry} accessibilityLabel="Retry" accessibilityRole="button">
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xLarge,
    backgroundColor: lightColors.background,
  },
  title: {
    ...typographyPresets.h2,
    color: lightColors.error,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  message: {
    ...typographyPresets.body,
    color: lightColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  retryButton: {
    backgroundColor: lightColors.primary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.xLarge,
    borderRadius: borderRadius.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  retryText: {
    ...typographyPresets.button,
    color: '#FFFFFF',
  },
});

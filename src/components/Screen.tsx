import React from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { createStyles } from '../theme/styles';

interface ScreenProps extends ViewProps {
  scrollable?: boolean;
  children: React.ReactNode;
  padded?: boolean;
  containerProps?: ScrollViewProps;
}

export const Screen: React.FC<ScreenProps> = ({
  scrollable,
  children,
  padded = true,
  containerProps,
  ...rest
}) => {
  if (scrollable) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, padded && styles.padded]}
        {...containerProps}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, padded && styles.padded]} {...rest}>
      {children}
    </View>
  );
};

const styles = createStyles(t => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    padding: t.spacing.lg,
  },
}));

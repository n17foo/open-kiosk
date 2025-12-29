import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Screen } from '../../components/Screen';
import { KioskButton } from '../../components/KioskButton';
import { useAuth } from '../../hooks';
import type { RootStackParamList } from '../../navigation/types';
import { createStyles } from '../../theme/styles';

const SignInScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) {
      return;
    }

    try {
      await login(username, password);
      navigation.replace('Products', {});
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Screen scrollable containerProps={{ contentInsetAdjustmentBehavior: 'never' }}>
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sign in to continue</Text>
            <Text style={styles.subtitle}>
              Enter your kiosk account details to access saved favourites, loyalty benefits, and faster checkout.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
                keyboardAppearance="light"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                keyboardAppearance="light"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.actions}>
            <KioskButton label="Cancel" variant="ghost" onPress={handleCancel} disabled={isLoading} />
            <View style={styles.actionSpacing} />
            <KioskButton label="Sign in" onPress={handleSubmit} loading={isLoading} />
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </TouchableWithoutFeedback>
  );
};

export default SignInScreen;

const styles = createStyles(t => ({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: t.spacing.xl,
  },
  header: {
    marginBottom: t.spacing.xxl,
  },
  title: {
    color: t.colors.text,
    fontSize: t.typography.heading,
    fontWeight: '700',
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    marginTop: t.spacing.md,
    lineHeight: t.typography.base * 1.5,
  },
  form: {
    gap: t.spacing.lg,
  },
  formGroup: {
    gap: t.spacing.sm,
  },
  label: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    color: t.colors.text,
    fontSize: t.typography.base,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  errorText: {
    color: t.colors.error,
    fontSize: t.typography.base - 2,
  },
  actions: {
    marginTop: t.spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionSpacing: {
    width: t.spacing.md,
  },
}));

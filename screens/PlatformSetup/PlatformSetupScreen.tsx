import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Screen } from '../../components/Screen';
import { KioskButton } from '../../components/KioskButton';
import { usePlatform } from '../../context/PlatformContext';
import type { RootStackParamList } from '../../navigation/types';
import type { PlatformType, PlatformConfig } from '../../services/interfaces';
import { createStyles } from '../../theme/styles';

const PLATFORM_OPTIONS: { type: PlatformType; name: string; description: string; available: boolean }[] = [
  { type: 'inmemory', name: 'In-Memory Demo', description: 'Use mock data for testing and development', available: true },
  { type: 'shopify', name: 'Shopify', description: 'Connect to a Shopify store', available: true },
  { type: 'woocommerce', name: 'WooCommerce', description: 'Connect to a WooCommerce store', available: true },
  { type: 'magento', name: 'Magento', description: 'Connect to a Magento store', available: true },
  { type: 'bigcommerce', name: 'BigCommerce', description: 'Connect to a BigCommerce store', available: true },
  { type: 'sylius', name: 'Sylius', description: 'Connect to a Sylius store', available: true },
  { type: 'wix', name: 'Wix', description: 'Connect to a Wix store', available: true },
  { type: 'prestashop', name: 'PrestaShop', description: 'Connect to a PrestaShop store', available: true },
  { type: 'squarespace', name: 'Squarespace', description: 'Connect to a Squarespace store', available: true },
  { type: 'custom', name: 'Custom Integration', description: 'Connect to a custom ecommerce platform', available: false },
];

const PAYMENT_PROCESSORS = [
  {
    type: 'mock' as const,
    name: 'Mock Payment',
    description: 'For testing and development',
  },
  {
    type: 'stripe' as const,
    name: 'Stripe',
    description: 'Accept payments with Stripe',
  },
  {
    type: 'square' as const,
    name: 'Square',
    description: 'Square Terminal for PED payments',
  },
  {
    type: 'adyen' as const,
    name: 'Adyen',
    description: 'Adyen Terminal for PED payments',
  },
];

const PlatformSetupScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { switchPlatform, isLoading, error } = usePlatform();

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [selectedPaymentProcessor, setSelectedPaymentProcessor] = useState<'stripe' | 'square' | 'adyen' | 'mock' | null>(null);
  const [config, setConfig] = useState<Partial<PlatformConfig>>({});

  const handlePlatformSelect = (platformType: PlatformType) => {
    const option = PLATFORM_OPTIONS.find(p => p.type === platformType);
    if (!option?.available) return;
    setSelectedPlatform(platformType);
    setConfig({ type: platformType, name: option.name });
  };

  const handlePaymentProcessorSelect = (processorType: 'stripe' | 'square' | 'adyen' | 'mock') => {
    setSelectedPaymentProcessor(processorType);
    setConfig((prev: Partial<PlatformConfig>) => ({
      ...prev,
      paymentProcessor: {
        type: processorType,
        config: {},
      },
    }));
  };

  const handlePaymentConfigChange = (field: string, value: string) => {
    setConfig((prev: Partial<PlatformConfig>) => {
      const paymentProcessor = prev.paymentProcessor || { type: 'mock' as const, config: {} };
      const currentConfig = paymentProcessor.config || {};
      return {
        ...prev,
        paymentProcessor: {
          ...paymentProcessor,
          config: {
            ...currentConfig,
            [field]: value,
          },
        },
      };
    });
  };

  const handleConfigChange = (field: keyof PlatformConfig, value: string) => {
    setConfig((prev: Partial<PlatformConfig>) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedPlatform || !config.name) {
      Alert.alert('Error', 'Please select a platform and provide a name');
      return;
    }

    if (!selectedPaymentProcessor) {
      Alert.alert('Error', 'Please select a payment processor');
      return;
    }

    try {
      const platformConfig: PlatformConfig = {
        ...config,
        type: selectedPlatform,
        name: config.name,
        paymentProcessor: {
          type: selectedPaymentProcessor,
          config: config.paymentProcessor?.config || {},
        },
      } as PlatformConfig;

      await switchPlatform(platformConfig);

      Alert.alert('Success', `Connected to ${platformConfig.name} with ${selectedPaymentProcessor} payments`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to connect to platform. Please check your configuration.');
    }
  };

  const renderPlatformFields = () => {
    if (!selectedPlatform || selectedPlatform === 'inmemory') {
      return null;
    }

    return (
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Configuration</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Store Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter store name"
            value={config.name || ''}
            onChangeText={value => handleConfigChange('name', value)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Base URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://yourstore.com"
            value={config.baseUrl || ''}
            onChangeText={value => handleConfigChange('baseUrl', value)}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {selectedPlatform === 'shopify' && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Shopify API key"
                value={config.apiKey || ''}
                onChangeText={value => handleConfigChange('apiKey', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Access Token</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter access token"
                value={config.accessToken || ''}
                onChangeText={value => handleConfigChange('accessToken', value)}
                secureTextEntry
              />
            </View>
          </>
        )}

        {(selectedPlatform === 'woocommerce' || selectedPlatform === 'custom') && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Consumer Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter consumer key"
                value={config.apiKey || ''}
                onChangeText={value => handleConfigChange('apiKey', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Consumer Secret</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter consumer secret"
                value={config.apiSecret || ''}
                onChangeText={value => handleConfigChange('apiSecret', value)}
                secureTextEntry
              />
            </View>
          </>
        )}
      </View>
    );
  };

  const renderPaymentProcessorFields = () => {
    if (!selectedPaymentProcessor) {
      return null;
    }

    return (
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Payment Processor Configuration</Text>

        {selectedPaymentProcessor === 'stripe' && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Stripe API key"
                value={config.paymentProcessor?.config?.apiKey || ''}
                onChangeText={value => handlePaymentConfigChange('apiKey', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Publishable Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Stripe publishable key"
                value={config.paymentProcessor?.config?.publishableKey || ''}
                onChangeText={value => handlePaymentConfigChange('publishableKey', value)}
                secureTextEntry
              />
            </View>
          </>
        )}

        {selectedPaymentProcessor === 'square' && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Application ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Square Application ID"
                value={config.paymentProcessor?.config?.applicationId || ''}
                onChangeText={value => handlePaymentConfigChange('applicationId', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Access Token</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Square Access Token"
                value={config.paymentProcessor?.config?.accessToken || ''}
                onChangeText={value => handlePaymentConfigChange('accessToken', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Location ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Square Location ID"
                value={config.paymentProcessor?.config?.locationId || ''}
                onChangeText={value => handlePaymentConfigChange('locationId', value)}
                secureTextEntry
              />
            </View>
          </>
        )}

        {selectedPaymentProcessor === 'adyen' && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Adyen API key"
                value={config.paymentProcessor?.config?.apiKey || ''}
                onChangeText={value => handlePaymentConfigChange('apiKey', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Merchant Account</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Adyen Merchant Account"
                value={config.paymentProcessor?.config?.merchantAccount || ''}
                onChangeText={value => handlePaymentConfigChange('merchantAccount', value)}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Terminal ID (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Terminal ID"
                value={config.paymentProcessor?.config?.terminalId || ''}
                onChangeText={value => handlePaymentConfigChange('terminalId', value)}
              />
            </View>
          </>
        )}

        {selectedPaymentProcessor === 'mock' && (
          <View style={styles.field}>
            <Text style={styles.label}>Test Mode</Text>
            <Text style={styles.description}>Mock payments will simulate real payment processing for testing</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Platform Setup</Text>
        <Text style={styles.subtitle}>Choose your ecommerce platform, payment processor and configure the connection</Text>

        <View style={styles.platformSection}>
          <Text style={styles.sectionTitle}>Select Platform</Text>
          {PLATFORM_OPTIONS.map(platform => (
            <TouchableOpacity
              key={platform.type}
              style={[
                styles.platformOption,
                selectedPlatform === platform.type && styles.selectedPlatform,
                !platform.available && styles.platformDisabled,
              ]}
              onPress={() => handlePlatformSelect(platform.type)}
              disabled={!platform.available}
              activeOpacity={platform.available ? 0.7 : 1}
            >
              <View style={styles.platformInfo}>
                <Text style={[styles.platformName, !platform.available && styles.platformNameDisabled]}>{platform.name}</Text>
                <Text style={styles.platformDescription}>{platform.description}</Text>
              </View>
              {!platform.available && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              )}
              {selectedPlatform === platform.type && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.platformSection}>
          <Text style={styles.sectionTitle}>Select Payment Processor</Text>
          {PAYMENT_PROCESSORS.map(processor => (
            <TouchableOpacity
              key={processor.type}
              style={[styles.platformOption, selectedPaymentProcessor === processor.type && styles.selectedPlatform]}
              onPress={() => handlePaymentProcessorSelect(processor.type)}
            >
              <View style={styles.platformInfo}>
                <Text style={styles.platformName}>{processor.name}</Text>
                <Text style={styles.platformDescription}>{processor.description}</Text>
              </View>
              {selectedPaymentProcessor === processor.type && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {renderPlatformFields()}

        {renderPaymentProcessorFields()}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <KioskButton label="Cancel" variant="ghost" onPress={() => navigation.goBack()} disabled={isLoading} />
          <View style={styles.actionSpacing} />
          <KioskButton label="Connect" onPress={handleSave} loading={isLoading} disabled={!selectedPlatform || !selectedPaymentProcessor} />
        </View>
      </ScrollView>
    </Screen>
  );
};

export default PlatformSetupScreen;

const styles = createStyles(t => ({
  container: {
    flex: 1,
  },
  content: {
    padding: t.spacing.xl,
  },
  title: {
    color: t.colors.text,
    fontSize: t.typography.heading,
    fontWeight: '700',
    marginBottom: t.spacing.sm,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    marginBottom: t.spacing.xl,
    lineHeight: t.typography.base * 1.5,
  },
  platformSection: {
    marginBottom: t.spacing.xl,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '600',
    marginBottom: t.spacing.lg,
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: t.spacing.lg,
    borderRadius: t.radius.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
    marginBottom: t.spacing.md,
    backgroundColor: t.colors.surface,
  },
  selectedPlatform: {
    borderColor: t.colors.primary,
    backgroundColor: t.colors.primary + '10', // 10% opacity
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '600',
    marginBottom: t.spacing.xs,
  },
  platformDescription: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
  },
  checkmark: {
    color: t.colors.primary,
    fontSize: t.typography.heading,
    fontWeight: 'bold',
  },
  platformDisabled: {
    opacity: 0.5,
  },
  platformNameDisabled: {
    color: t.colors.textSecondary,
  },
  comingSoonBadge: {
    paddingHorizontal: t.spacing.sm,
    paddingVertical: 3,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.muted,
    borderWidth: 1,
    borderColor: t.colors.border,
    marginRight: t.spacing.sm,
  },
  comingSoonText: {
    color: t.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  configSection: {
    marginBottom: t.spacing.xl,
  },
  field: {
    marginBottom: t.spacing.lg,
  },
  label: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: t.spacing.sm,
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
  description: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base - 2,
    marginTop: t.spacing.xs,
  },
  errorContainer: {
    marginBottom: t.spacing.lg,
    padding: t.spacing.md,
    backgroundColor: t.colors.error + '20',
    borderRadius: t.radius.xl,
  },
  errorText: {
    color: t.colors.error,
    fontSize: t.typography.base - 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: t.spacing.xl,
  },
  actionSpacing: {
    width: t.spacing.md,
  },
}));

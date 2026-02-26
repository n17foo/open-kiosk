import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingProvider';
import { ECommercePlatform, PLATFORM_DISPLAY_NAMES, isOnlinePlatform } from '../../utils/platforms';
import { useLogger } from '../../hooks/useLogger';
import { lightColors, spacing, typographyPresets, borderRadius } from '../../utils/theme';

// Platforms supported by ServiceFactory — BigCommerce, Sylius etc. have no implementation yet
const SUPPORTED_PLATFORMS = [
  ECommercePlatform.SHOPIFY,
  ECommercePlatform.WOOCOMMERCE,
  ECommercePlatform.MAGENTO,
  ECommercePlatform.OFFLINE,
];

const OnboardingScreen: React.FC = () => {
  const logger = useLogger('OnboardingScreen');
  const { currentStep, totalSteps, nextStep, prevStep, complete, selectedPlatform, setSelectedPlatform, credentials, setCredentials } =
    useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsCredentials = selectedPlatform ? isOnlinePlatform(selectedPlatform) : false;
  // Effective visible steps: online = 3, offline = 2 (credentials skipped)
  const visibleSteps = needsCredentials ? totalSteps : totalSteps - 1;
  const visibleStep = currentStep > 1 ? currentStep - 1 : currentStep; // collapse hidden step
  const displayStep = Math.min(visibleStep + 1, visibleSteps);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await complete();
    } catch (err) {
      Alert.alert('Setup failed', err instanceof Error ? err.message : 'Please try again.');
      logger.error({ message: 'Onboarding complete failed' }, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAdvanceFromStep1 = currentStep === 1 && selectedPlatform !== null;
  const canAdvanceFromStep2 =
    currentStep === 2 && (!needsCredentials || (credentials.baseUrl.trim().length > 0 && credentials.apiKey.trim().length > 0));

  const isLastStep = needsCredentials ? currentStep === totalSteps - 1 : currentStep === 1;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🛍️</Text>
            <Text style={styles.heading}>Welcome to OpenKiosk</Text>
            <Text style={styles.body}>
              Set up your self-service kiosk in a few steps. Guest customers can browse and purchase without ever signing in.
            </Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.heading}>Choose Your Platform</Text>
            <Text style={styles.body}>Connect to your store or run in offline demo mode.</Text>
            <View style={styles.platformList}>
              {SUPPORTED_PLATFORMS.map(platform => (
                <TouchableOpacity
                  key={platform}
                  style={[styles.platformOption, selectedPlatform === platform && styles.platformSelected]}
                  onPress={() => setSelectedPlatform(platform)}
                  accessibilityLabel={`Select ${PLATFORM_DISPLAY_NAMES[platform]}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedPlatform === platform }}
                >
                  <Text style={[styles.platformText, selectedPlatform === platform && styles.platformTextSelected]}>
                    {PLATFORM_DISPLAY_NAMES[platform]}
                  </Text>
                  {platform === ECommercePlatform.OFFLINE && (
                    <Text style={styles.platformSubtext}>Uses demo data — no internet required</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.heading}>{PLATFORM_DISPLAY_NAMES[selectedPlatform!]} Credentials</Text>
            <Text style={styles.body}>Enter your store URL and API key. These are stored locally on this device only.</Text>
            <View style={styles.form}>
              <Text style={styles.label}>Store URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://your-store.myshopify.com"
                value={credentials.baseUrl}
                onChangeText={text => setCredentials({ baseUrl: text.trim() })}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                accessibilityLabel="Store URL"
              />
              <Text style={styles.label}>API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Your platform API key"
                value={credentials.apiKey}
                onChangeText={text => setCredentials({ apiKey: text.trim() })}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                accessibilityLabel="API Key"
              />
              <Text style={styles.hint}>
                The kiosk uses read-only access to fetch your product catalogue. No customer data is stored on the platform during guest
                checkout.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const canContinue = currentStep === 0 || canAdvanceFromStep1 || canAdvanceFromStep2 || isLastStep;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(displayStep / visibleSteps) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {displayStep} / {visibleSteps}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>

      <View style={styles.buttonRow}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.spacer} />
        {isLastStep ? (
          <TouchableOpacity
            style={[styles.primaryButton, (!canContinue || isSubmitting) && styles.primaryButtonDisabled]}
            onPress={handleComplete}
            disabled={!canContinue || isSubmitting}
            accessibilityLabel="Complete setup"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{isSubmitting ? 'Setting up…' : 'Complete Setup'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
            onPress={nextStep}
            disabled={!canContinue}
            accessibilityLabel="Continue"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingTop: spacing.medium,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: lightColors.primary,
    borderRadius: 2,
  },
  progressText: {
    marginLeft: spacing.small,
    fontSize: typographyPresets.caption.fontSize,
    color: lightColors.textSecondary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xLarge,
    paddingVertical: spacing.xLarge,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 52,
    marginBottom: spacing.medium,
  },
  heading: {
    ...typographyPresets.h1,
    color: lightColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  body: {
    ...typographyPresets.body,
    color: lightColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xLarge,
  },
  platformList: {
    width: '100%',
    maxWidth: 400,
  },
  platformOption: {
    padding: spacing.medium,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: spacing.small,
    minHeight: 48,
    justifyContent: 'center',
  },
  platformSelected: {
    borderColor: lightColors.primary,
    backgroundColor: '#E3F2FD',
  },
  platformText: {
    ...typographyPresets.body,
    color: lightColors.textPrimary,
    textAlign: 'center',
  },
  platformTextSelected: {
    color: lightColors.primary,
    fontWeight: '600',
  },
  platformSubtext: {
    fontSize: 12,
    color: lightColors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.small,
  },
  label: {
    ...typographyPresets.body,
    color: lightColors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    fontSize: 16,
    color: lightColors.textPrimary,
    backgroundColor: '#FAFAFA',
    minHeight: 48,
  },
  hint: {
    fontSize: 12,
    color: lightColors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.large,
    paddingTop: spacing.medium,
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.large,
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    ...typographyPresets.body,
    color: lightColors.textSecondary,
  },
  primaryButton: {
    backgroundColor: lightColors.primary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.xLarge,
    borderRadius: borderRadius.md,
    minHeight: 48,
    justifyContent: 'center',
    marginLeft: spacing.small,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    ...typographyPresets.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

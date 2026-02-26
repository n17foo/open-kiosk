import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingProvider';
import { ECommercePlatform, PLATFORM_DISPLAY_NAMES } from '../../utils/platforms';
import { useLogger } from '../../hooks/useLogger';
import { lightColors, spacing, typographyPresets, borderRadius } from '../../utils/theme';

const PLATFORMS = Object.values(ECommercePlatform);

const OnboardingScreen: React.FC = () => {
  const logger = useLogger('OnboardingScreen');
  const { currentStep, totalSteps, nextStep, prevStep, setIsOnboarded, selectedPlatform, setSelectedPlatform } = useOnboarding();

  const handleComplete = async () => {
    try {
      await setIsOnboarded(true);
      logger.info('Onboarding completed');
    } catch (err) {
      logger.error({ message: 'Failed to complete onboarding' }, err instanceof Error ? err : new Error(String(err)));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.heading}>Welcome to OpenKiosk</Text>
            <Text style={styles.body}>Set up your self-service kiosk in a few simple steps.</Text>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.heading}>Select Platform</Text>
            <Text style={styles.body}>Choose your e-commerce platform or use offline mode.</Text>
            <View style={styles.platformList}>
              {PLATFORMS.map(platform => (
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
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.heading}>Step {currentStep + 1}</Text>
            <Text style={styles.body}>This step will be configured during development.</Text>
          </View>
        );
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((currentStep + 1) / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} / {totalSteps}
        </Text>
      </View>

      <View style={styles.content}>{renderStep()}</View>

      <View style={styles.buttonRow}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.spacer} />
        {isLastStep ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleComplete}
            accessibilityLabel="Complete setup"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Complete Setup</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleComplete}
              accessibilityLabel="Skip for now"
              accessibilityRole="button"
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={nextStep} accessibilityLabel="Continue" accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xLarge,
  },
  stepContainer: {
    alignItems: 'center',
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
  primaryButtonText: {
    ...typographyPresets.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.large,
    minHeight: 48,
    justifyContent: 'center',
  },
  skipButtonText: {
    ...typographyPresets.body,
    color: lightColors.textSecondary,
  },
});

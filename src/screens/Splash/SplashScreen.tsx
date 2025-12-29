import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  ImageBackground,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { usePlatform } from '../../context/PlatformContext';
import type { SplashScreenData } from '../../services/types';
import { createStyles } from '../../theme/styles';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { service: platformService } = usePlatform();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [splashData, setSplashData] = useState<SplashScreenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch splash screen data from CMS
  useEffect(() => {
    const fetchSplashData = async () => {
      if (!platformService?.cms) {
        // Fallback if no CMS service available
        setSplashData({
          backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          brandName: 'LibreKiosk',
          brandIcon: '🛍️',
          title: 'Shop. Browse. Discover.',
          subtitle: 'Find what you\'re looking for with just a few taps',
          primaryColor: '#FFFFFF',
          secondaryColor: '#F5F5F5',
        });
        setIsLoading(false);
        return;
      }

      try {
        const data = await platformService.cms.getSplashScreenData();
        setSplashData(data);
      } catch (err) {
        console.error('Failed to fetch splash data:', err);
        setError('Failed to load splash screen data');
        // Use fallback data
        setSplashData({
          backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          brandName: 'LibreKiosk',
          brandIcon: '🛍️',
          title: 'Shop. Browse. Discover.',
          subtitle: 'Find what you\'re looking for with just a few taps',
          primaryColor: '#FFFFFF',
          secondaryColor: '#F5F5F5',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSplashData();
  }, [platformService]);

  useEffect(() => {
    if (!isLoading && splashData) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Pulse animation for "Tap to start"
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [fadeAnim, pulseAnim, isLoading, splashData]);

  const handlePress = () => {
    // Navigate directly to Products screen for retail kiosk
    navigation.replace('Products', {});
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!splashData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load splash screen</Text>
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.retryButton}>
            <Text style={styles.retryText}>Continue</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: splashData.backgroundImage,
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoIcon}>{splashData.brandIcon}</Text>
              </View>
              <Text style={[styles.brandName, splashData.primaryColor && { color: splashData.primaryColor }]}>
                {splashData.brandName}
              </Text>
            </View>
            
            <View style={styles.heroText}>
              <Text style={[styles.title, splashData.primaryColor && { color: splashData.primaryColor }]}>
                {splashData.title}
              </Text>
              <Text style={[styles.subtitle, splashData.secondaryColor && { color: splashData.secondaryColor }]}>
                {splashData.subtitle}
              </Text>
            </View>

            <Animated.View style={[styles.tapPrompt, { opacity: pulseAnim }]}>
              <View style={styles.tapCircle}>
                <Text style={styles.tapIcon}>👆</Text>
              </View>
              <Text style={[styles.tapText, splashData.secondaryColor && { color: splashData.secondaryColor }]}>
                Tap anywhere to start shopping
              </Text>
            </Animated.View>
          </Animated.View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SplashScreen;

const styles = createStyles(t => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: t.spacing.xxl * 2,
    paddingHorizontal: t.spacing.xxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 28,
  },
  brandName: {
    color: t.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroText: {
    gap: t.spacing.lg,
  },
  title: {
    color: t.colors.text,
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -1,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.subheading,
    maxWidth: 400,
    lineHeight: t.typography.subheading * 1.4,
  },
  tapPrompt: {
    alignItems: 'center',
    gap: t.spacing.md,
  },
  tapCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapIcon: {
    fontSize: 32,
  },
  tapText: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: t.colors.background,
  },
  loadingText: {
    marginTop: t.spacing.md,
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: t.colors.background,
    paddingHorizontal: t.spacing.xl,
  },
  errorText: {
    color: t.colors.error,
    fontSize: t.typography.subheading,
    textAlign: 'center',
    marginBottom: t.spacing.xl,
  },
  retryButton: {
    backgroundColor: t.colors.primary,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.xl,
  },
  retryText: {
    color: t.colors.onPrimary,
    fontSize: t.typography.base + 2,
    fontWeight: '700',
  },
}));

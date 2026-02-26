import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, View, Animated } from 'react-native';
import { createStyles } from '../../theme/styles';
import { formatMoney } from '../../services/utils';

interface BasketFABProps {
  itemCount: number;
  total: number;
  onPress: () => void;
  bounce?: boolean;
}

const BasketFAB: React.FC<BasketFABProps> = ({ itemCount, total, onPress, bounce = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (bounce && itemCount > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.18, duration: 120, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.94, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [itemCount, bounce, scaleAnim]);

  if (itemCount === 0) return null;

  return (
    <Animated.View style={[styles.fabWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.icon}>🛒</Text>
        <View style={styles.textGroup}>
          <Text style={styles.count}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.total}>{formatMoney(total)}</Text>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default BasketFAB;

const styles = createStyles(t => ({
  fabWrapper: {
    position: 'absolute',
    bottom: t.spacing.xl,
    right: t.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 100,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.primary,
    borderRadius: 40,
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    gap: t.spacing.sm,
    minWidth: 180,
  },
  icon: {
    fontSize: 24,
  },
  textGroup: {
    flex: 1,
  },
  count: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  total: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
}));

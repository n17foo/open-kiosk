import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { createStyles } from '../../theme/styles';
import { formatMoney } from '../../services/utils';
import type { Product } from '../../services/types';

interface CrossSellStripProps {
  products: Product[];
  onAdd: (product: Product) => void;
  title?: string;
}

const CrossSellStrip: React.FC<CrossSellStripProps> = ({ products, onAdd, title = '💡 You might also like' }) => {
  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {products.map(product => (
          <View key={product.id} style={styles.card}>
            <View style={styles.imageBox}>
              <Text style={styles.emoji}>{product.emoji ?? '📦'}</Text>
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.price}>{formatMoney(product.price.amount)}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(product)} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CrossSellStrip;

const styles = createStyles(t => ({
  container: {
    backgroundColor: t.colors.surface,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    paddingTop: t.spacing.md,
    paddingBottom: t.spacing.sm,
  },
  title: {
    color: t.colors.text,
    fontSize: t.typography.base,
    fontWeight: '700',
    paddingHorizontal: t.spacing.lg,
    marginBottom: t.spacing.sm,
  },
  scroll: {
    paddingHorizontal: t.spacing.lg,
    gap: t.spacing.md,
  },
  card: {
    width: 140,
    backgroundColor: t.colors.muted,
    borderRadius: t.radius.md,
    padding: t.spacing.sm,
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    color: t.colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  price: {
    color: t.colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  addBtn: {
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.md,
    paddingVertical: t.spacing.xs,
    paddingHorizontal: t.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
}));

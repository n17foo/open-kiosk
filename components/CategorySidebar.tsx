import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { Category } from '../services/types';
import { createStyles } from '../theme/styles';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string | undefined;
  onCategorySelect: (categoryId: string) => void;
  getCategoryIcon: (categoryId: string) => string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ categories, selectedCategoryId, onCategorySelect, getCategoryIcon }) => {
  // Get main categories (those without parentId)
  const mainCategories = categories.filter(cat => !cat.parentId);

  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Categories</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {mainCategories.map(category => {
          const isActive = category.id === selectedCategoryId;

          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryItem, isActive && styles.categoryItemActive]}
              onPress={() => onCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>{getCategoryIcon(category.id)}</Text>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>{category.name}</Text>
              {isActive && <View style={styles.categoryIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = createStyles(t => ({
  sidebar: {
    width: 220,
    backgroundColor: t.colors.surfaceElevated,
    paddingVertical: t.spacing.lg,
    borderRightWidth: 1,
    borderRightColor: t.colors.border,
  },
  sidebarTitle: {
    color: t.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: t.spacing.lg,
    marginBottom: t.spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    marginHorizontal: t.spacing.sm,
    marginBottom: t.spacing.xs,
    borderRadius: t.radius.md,
    position: 'relative',
  },
  categoryItemActive: {
    backgroundColor: t.colors.surface,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryLabel: {
    color: t.colors.textSecondary,
    fontSize: t.typography.base,
    fontWeight: '500',
    flex: 1,
  },
  categoryLabelActive: {
    color: t.colors.text,
    fontWeight: '700',
  },
  categoryIndicator: {
    position: 'absolute',
    left: 0,
    top: t.spacing.sm,
    bottom: t.spacing.sm,
    width: 3,
    backgroundColor: t.colors.primary,
    borderRadius: 2,
  },
}));

export default CategorySidebar;

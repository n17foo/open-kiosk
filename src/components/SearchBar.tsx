import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { createStyles } from '../theme/styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search products...'
}) => {
  return (
    <View style={styles.searchContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearSearch}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = createStyles(t => ({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: t.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: t.colors.text,
    fontSize: t.typography.base,
    paddingVertical: t.spacing.xs,
  },
  clearSearch: {
    color: t.colors.textSecondary,
    fontSize: 16,
    padding: t.spacing.xs,
  },
}));

export default SearchBar;

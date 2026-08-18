/**
 * KONEX TagInput Component
 * Billion Dollar Code - Production Ready
 * 
 * A component for adding and removing tags
 * 
 * Usage:
 * <TagInput
 *   tags={tags}
 *   onTagsChange={setTags}
 *   placeholder="Add tags..."
 * />
 */

import React, { useState } from 'react';
import {
    FlatList,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Chip from '../atoms/Chip';
import Icon from '../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface TagInputProps {
  /** Array of tags */
  tags: string[];
  /** On tags change handler */
  onTagsChange: (tags: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum number of tags */
  maxTags?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom input style */
  inputStyle?: TextStyle;
  /** Custom tag style */
  tagStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Add tag...',
  maxTags = 10,
  disabled = false,
  style,
  inputStyle,
  tagStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [inputValue, setInputValue] = useState<string>('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onTagsChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter') {
      addTag();
    }
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    backgroundColor: colors.surface,
    minHeight: 48,
  };

  const inputStyleCombined: TextStyle = {
    flex: 1,
    minWidth: 100,
    fontSize: 16,
    color: colors.text,
    padding: 4,
    ...inputStyle,
  };

  const tagListStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
  };

  const tagItemStyle: ViewStyle = {
    marginRight: 6,
    marginBottom: 6,
    ...tagStyle,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <View style={inputContainerStyle}>
        <FlatList
          data={tags}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              label={item}
              onClose={() => removeTag(item)}
              size="md"
              style={tagItemStyle}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tagListStyle}
        />
        {tags.length < maxTags && (
          <TextInput
            style={inputStyleCombined}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={addTag}
            onKeyPress={handleKeyPress}
            editable={!disabled}
            testID={testID}
          />
        )}
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={addTag}>
            <Icon name="plus-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TagInput;
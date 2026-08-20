/**
 * KONEX Pagination Component
 * Billion Dollar Code - Production Ready
 * 
 * A pagination component with page numbers and navigation
 * 
 * Usage:
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 * />
 */

import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface PaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** On page change handler */
  onPageChange: (page: number) => void;
  /** Number of visible page numbers */
  visiblePages?: number;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom button style */
  buttonStyle?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Custom active text style */
  activeTextStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  visiblePages = 5,
  style,
  buttonStyle,
  textStyle,
  activeTextStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getVisiblePages = (): number[] => {
    const half = Math.floor(visiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + visiblePages - 1);

    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const renderPageButton = (page: number) => {
    const isActive = page === currentPage;

    const buttonStyleCombined: ViewStyle = {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isActive ? colors.primary : 'transparent',
      borderWidth: isActive ? 0 : 1,
      borderColor: colors.border,
      ...buttonStyle,
    };

    const textStyleCombined: TextStyle = {
      fontSize: 14,
      color: isActive ? '#FFFFFF' : colors.text,
      fontWeight: isActive ? '600' : '400',
      ...(isActive ? activeTextStyle : textStyle),
    };

    return (
      <TouchableOpacity
        key={page}
        style={buttonStyleCombined}
        onPress={() => onPageChange(page)}
      >
        <Text style={textStyleCombined}>{page}</Text>
      </TouchableOpacity>
    );
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const navButtonStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...buttonStyle,
  };

  const navTextStyle: TextStyle = {
    fontSize: 14,
    color: colors.text,
    ...textStyle,
  };

  if (totalPages <= 1) return null;

  return (
    <View style={containerStyle} testID={testID}>
      <TouchableOpacity
        style={navButtonStyle}
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <Icon
          name="chevron-left"
          size={20}
          color={currentPage === 1 ? colors.textMuted : colors.text}
        />
      </TouchableOpacity>

      {getVisiblePages().map(renderPageButton)}

      <TouchableOpacity
        style={navButtonStyle}
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <Icon
          name="chevron-right"
          size={20}
          color={currentPage === totalPages ? colors.textMuted : colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Pagination;
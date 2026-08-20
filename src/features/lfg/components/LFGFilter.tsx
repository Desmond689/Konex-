/**
 * KONEX LFGFilter Component
 * Billion Dollar Code - Production Ready
 * 
 * Filter options for LFG posts
 * 
 * Usage:
 * <LFGFilter
 *   filters={filters}
 *   onFilterChange={handleFilterChange}
 * />
 */

import React from 'react';
import {
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface LFGFilters {
  gameMode?: string;
  rankRequirement?: string;
  micRequired?: boolean;
  status?: 'active' | 'filled' | 'all';
}

export interface LFGFilterProps {
  /** Current filters */
  filters: LFGFilters;
  /** On filter change handler */
  onFilterChange: (filters: LFGFilters) => void;
  /** Available game modes */
  gameModes?: string[];
  /** Available rank requirements */
  rankRequirements?: string[];
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LFGFilter: React.FC<LFGFilterProps> = ({
  filters,
  onFilterChange,
  gameModes = [],
  rankRequirements = [],
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    paddingVertical: 8,
    ...style,
  };

  const sectionStyle: ViewStyle = {
    marginBottom: 12,
  };

  const sectionLabelStyle: TextStyle = {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const chipContainerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  };

  const chipStyle = (isActive: boolean): ViewStyle => ({
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: isActive ? colors.primary : colors.border,
  });

  const chipTextStyle = (isActive: boolean): TextStyle => ({
    fontSize: 12,
    fontWeight: '500',
    color: isActive ? '#FFFFFF' : colors.text,
  });

  const isFilterActive = (key: keyof LFGFilters, value: any): boolean => {
    return filters[key] === value;
  };

  const toggleFilter = (key: keyof LFGFilters, value: any) => {
    const currentValue = filters[key];
    const newValue = currentValue === value ? undefined : value;
    onFilterChange({ ...filters, [key]: newValue });
  };

  const renderChips = (
    key: keyof LFGFilters,
    items: string[],
    label: string
  ) => {
    if (items.length === 0) return null;

    return (
      <View style={sectionStyle}>
        <Text style={sectionLabelStyle}>{label}</Text>
        <View style={chipContainerStyle}>
          {items.map((item) => {
            const isActive = isFilterActive(key, item);
            return (
              <TouchableOpacity
                key={item}
                style={chipStyle(isActive)}
                onPress={() => toggleFilter(key, item)}
              >
                <Text style={chipTextStyle(isActive)}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const statusOptions = ['all', 'active', 'filled'];

  return (
    <ScrollView
      style={containerStyle}
      horizontal
      showsHorizontalScrollIndicator={false}
      testID={testID}
    >
      <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 4 }}>
        {/* Status */}
        <View style={sectionStyle}>
          <Text style={sectionLabelStyle}>Status</Text>
          <View style={chipContainerStyle}>
            {statusOptions.map((status) => {
              const isActive = filters.status === status || (status === 'all' && !filters.status);
              return (
                <TouchableOpacity
                  key={status}
                  style={chipStyle(isActive)}
                  onPress={() => onFilterChange({
                    ...filters,
                    status: status === 'all' ? undefined : status as 'active' | 'filled',
                  })}
                >
                  <Text style={chipTextStyle(isActive)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Game Modes */}
        {renderChips('gameMode', gameModes, 'Game Modes')}

        {/* Rank Requirements */}
        {renderChips('rankRequirement', rankRequirements, 'Rank')}

        {/* Mic Required */}
        <View style={sectionStyle}>
          <Text style={sectionLabelStyle}>Mic</Text>
          <View style={chipContainerStyle}>
            {['Required', 'Optional'].map((option) => {
              const isActive = option === 'Required' 
                ? filters.micRequired === true
                : filters.micRequired === false;
              return (
                <TouchableOpacity
                  key={option}
                  style={chipStyle(isActive)}
                  onPress={() => {
                    const value = option === 'Required' ? true : false;
                    onFilterChange({
                      ...filters,
                      micRequired: filters.micRequired === value ? undefined : value,
                    });
                  }}
                >
                  <Text style={chipTextStyle(isActive)}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Clear Filters */}
        {Object.values(filters).some(v => v !== undefined) && (
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => onFilterChange({})}
          >
            <Icon name="x" size={16} color={colors.textMuted} />
            <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default LFGFilter;
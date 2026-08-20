/**
 * KONEX NavigationHeader Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable navigation header with title, back button, and actions
 * 
 * Usage:
 * <NavigationHeader
 *   title="Home"
 *   showBack={true}
 *   onBackPress={() => navigation.goBack()}
 *   rightActions={[
 *     { icon: 'search', onPress: () => {} },
 *     { icon: 'bell', onPress: () => {}, badge: 3 },
 *   ]}
 * />
 */

import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface HeaderAction {
  /** Icon name */
  icon: string;
  /** Icon family */
  iconFamily?: 'feather' | 'ionicons' | 'material' | 'antdesign' | 'fontawesome';
  /** On press handler */
  onPress: () => void;
  /** Badge count */
  badge?: number;
  /** Accessibility label */
  accessibilityLabel?: string;
}

export interface NavigationHeaderProps {
  /** Title text */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** On back press handler */
  onBackPress?: () => void;
  /** Right actions */
  rightActions?: HeaderAction[];
  /** Left actions (overrides back button) */
  leftActions?: HeaderAction[];
  /** Custom container style */
  style?: ViewStyle;
  /** Custom title style */
  titleStyle?: TextStyle;
  /** Show bottom border */
  showBorder?: boolean;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightActions = [],
  leftActions = [],
  style,
  titleStyle,
  showBorder = true,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: showBorder ? 1 : 0,
    borderBottomColor: colors.border,
    ...style,
  };

  const titleStyleCombined: TextStyle = {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    ...titleStyle,
  };

  const renderAction = (action: HeaderAction, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={action.onPress}
      style={{ marginLeft: index > 0 ? 12 : 0, position: 'relative' }}
      accessibilityLabel={action.accessibilityLabel || action.icon}
    >
      <Icon
        name={action.icon}
        size={24}
        color={colors.text}
        family={action.iconFamily}
      />
      {action.badge !== undefined && action.badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -6,
          }}
        >
          <Badge count={action.badge} size="xs" variant="error" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderLeftActions = () => {
    if (leftActions.length > 0) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 40 }}>
          {leftActions.map(renderAction)}
        </View>
      );
    }

    if (showBack) {
      return (
        <TouchableOpacity
          onPress={onBackPress}
          style={{ padding: 4 }}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    return <View style={{ minWidth: 40 }} />;
  };

  const renderTitle = () => {
    if (title) {
      return (
        <Text style={titleStyleCombined} numberOfLines={1}>
          {title}
        </Text>
      );
    }
    return <View style={{ flex: 1 }} />;
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.surface }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={containerStyle} testID={testID}>
        {renderLeftActions()}
        {renderTitle()}
        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 40 }}>
          {rightActions.map(renderAction)}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NavigationHeader;
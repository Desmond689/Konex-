/**
 * KONEX BottomTabs Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable bottom tab navigation component with badge support
 * 
 * Usage:
 * <BottomTabs
 *   tabs={[
 *     { route: 'Home', label: 'Home', icon: 'home' },
 *     { route: 'Chat', label: 'Chat', icon: 'message-circle', badge: 3 },
 *   ]}
 *   activeRoute={activeRoute}
 *   onTabPress={(route) => navigate(route)}
 * />
 */

import React from 'react';
import {
    Dimensions,
    SafeAreaView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// 1. TYPES
// ============================================

export interface TabItem {
  /** Route name */
  route: string;
  /** Label text */
  label: string;
  /** Icon name */
  icon: string;
  /** Icon family */
  iconFamily?: 'feather' | 'ionicons' | 'material' | 'antdesign' | 'fontawesome';
  /** Badge count */
  badge?: number;
  /** Is the tab active */
  isActive?: boolean;
}

export interface BottomTabsProps {
  /** Array of tabs */
  tabs: TabItem[];
  /** Active route */
  activeRoute: string;
  /** On tab press handler */
  onTabPress: (route: string) => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom tab style */
  tabStyle?: ViewStyle;
  /** Custom active tab style */
  activeTabStyle?: ViewStyle;
  /** Custom label style */
  labelStyle?: TextStyle;
  /** Custom active label style */
  activeLabelStyle?: TextStyle;
  /** Show labels */
  showLabels?: boolean;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const BottomTabs: React.FC<BottomTabsProps> = ({
  tabs,
  activeRoute,
  onTabPress,
  style,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
  showLabels = true,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
    paddingTop: 4,
    ...style,
  };

  const getTabStyles = (tab: TabItem) => {
    const isActive = tab.route === activeRoute || tab.isActive;

    const baseTabStyle: ViewStyle = {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      ...tabStyle,
      ...(isActive ? activeTabStyle : {}),
    };

    const iconColor = isActive ? colors.primary : colors.textMuted;
    const labelColor = isActive ? colors.primary : colors.textMuted;

    const labelTextStyle: TextStyle = {
      fontSize: 10,
      fontWeight: isActive ? '600' : '400',
      color: labelColor,
      marginTop: 2,
      ...labelStyle,
      ...(isActive ? activeLabelStyle : {}),
    };

    return {
      tab: baseTabStyle,
      iconColor,
      labelStyle: labelTextStyle,
      isActive,
    };
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.surface }}>
      <View style={containerStyle} testID={testID}>
        {tabs.map((tab) => {
          const styles = getTabStyles(tab);

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tab}
              onPress={() => onTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={{ position: 'relative' }}>
                <Icon
                  name={tab.icon}
                  size={24}
                  color={styles.iconColor}
                  family={tab.iconFamily}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                    }}
                  >
                    <Badge count={tab.badge} size="xs" variant="error" />
                  </View>
                )}
              </View>
              {showLabels && (
                <Text style={styles.labelStyle}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default BottomTabs;
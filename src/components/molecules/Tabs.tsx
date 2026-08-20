/**
 * KONEX Tabs Component
 * Billion Dollar Code - Production Ready
 * 
 * A tab component with horizontal scrolling support
 * 
 * Usage:
 * <Tabs
 *   tabs={['Feed', 'Squads', 'Members']}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 */

import React from 'react';
import {
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export interface TabsProps {
  /** Array of tabs */
  tabs: Tab[] | string[];
  /** Active tab ID or index */
  activeTab: string | number;
  /** On tab change handler */
  onTabChange: (tabId: string | number) => void;
  /** Tab variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Custom container style */
  style?: ViewStyle;
  /** Custom tab style */
  tabStyle?: ViewStyle;
  /** Custom active tab style */
  activeTabStyle?: ViewStyle;
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

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  style,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const tabsArray: Tab[] = tabs.map((tab) => {
    if (typeof tab === 'string') {
      return { id: tab, label: tab };
    }
    return tab;
  });

  const getTabStyles = (tabId: string) => {
    const isActive = activeTab === tabId || activeTab === tabsArray.findIndex((tab) => tab.id === tabId);

    let baseStyle: ViewStyle = {
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 4,
    };

    let textBaseStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
      color: isActive ? colors.primary : colors.textSecondary,
    };

    switch (variant) {
      case 'pills':
        baseStyle = {
          ...baseStyle,
          borderRadius: 20,
          backgroundColor: isActive ? colors.primary : 'transparent',
        };
        textBaseStyle = {
          ...textBaseStyle,
          color: isActive ? '#FFFFFF' : colors.textSecondary,
        };
        break;

      case 'underline':
        baseStyle = {
          ...baseStyle,
          borderBottomWidth: isActive ? 2 : 0,
          borderBottomColor: isActive ? colors.primary : 'transparent',
        };
        break;

      default:
        baseStyle = {
          ...baseStyle,
          borderBottomWidth: isActive ? 2 : 0,
          borderBottomColor: isActive ? colors.primary : 'transparent',
        };
        break;
    }

    return {
      tab: { ...baseStyle, ...tabStyle, ...(isActive ? activeTabStyle : {}) },
      text: { ...textBaseStyle, ...textStyle, ...(isActive ? activeTextStyle : {}) },
      isActive,
    };
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    ...style,
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={containerStyle}
      testID={testID}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      {tabsArray.map((tab, index) => {
        const styles = getTabStyles(tab.id);
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.text}>{tab.label}</Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    marginLeft: 6,
                    minWidth: 20,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '600' }}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default Tabs;
/**
 * KONEX HeaderWithTabs Component
 * Billion Dollar Code - Production Ready
 * 
 * Header with integrated tabs below
 * 
 * Usage:
 * <HeaderWithTabs
 *   title="Profile"
 *   tabs={[{ label: 'Posts', key: 'posts' }]}
 *   activeTab="posts"
 *   onTabChange={setActiveTab}
 * />
 */

import React from 'react';
import {
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Tabs, { TabItem } from '../molecules/Tabs';
import Header from './Header';

// ============================================
// 1. TYPES
// ============================================

export interface HeaderWithTabsProps {
  /** Header title */
  title?: string;
  /** Left icon */
  leftIcon?: string;
  /** On left press */
  onLeftPress?: () => void;
  /** Right icon */
  rightIcon?: string;
  /** On right press */
  onRightPress?: () => void;
  /** Show back button */
  showBack?: boolean;
  /** On back press */
  onBackPress?: () => void;
  /** Tabs */
  tabs: TabItem[];
  /** Active tab */
  activeTab: string;
  /** On tab change */
  onTabChange: (key: string) => void;
  /** Scrollable tabs */
  scrollable?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const HeaderWithTabs: React.FC<HeaderWithTabsProps> = ({
  title,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  showBack = false,
  onBackPress,
  tabs,
  activeTab,
  onTabChange,
  scrollable = false,
  containerStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyleCombined: ViewStyle = {
    backgroundColor: colors.background,
    ...containerStyle,
  };

  const tabsContainerStyle: ViewStyle = {
    paddingHorizontal: 12,
    paddingBottom: 4,
  };

  return (
    <View style={containerStyleCombined} testID={testID}>
      <Header
        title={title}
        leftIcon={leftIcon}
        onLeftPress={onLeftPress}
        rightIcon={rightIcon}
        onRightPress={onRightPress}
        showBack={showBack}
        onBackPress={onBackPress}
      />
      <View style={tabsContainerStyle}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          scrollable={scrollable}
          variant="underline"
          size="sm"
        />
      </View>
    </View>
  );
};

export default HeaderWithTabs;
/**
 * KONEX DashboardTemplate Component
 * Billion Dollar Code - Production Ready
 * 
 * A dashboard layout template with sidebar, header, and content area
 * 
 * Usage:
 * <DashboardTemplate
 *   header={<Header />}
 *   sidebar={<Sidebar />}
 *   content={<Content />}
 * />
 */

import React from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import NavigationHeader from '../navigation/NavigationHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// 1. TYPES
// ============================================

export interface DashboardTemplateProps {
  /** Header component */
  header?: React.ReactNode;
  /** Sidebar component */
  sidebar?: React.ReactNode;
  /** Content component */
  content: React.ReactNode;
  /** Page title */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** On back press handler */
  onBackPress?: () => void;
  /** Right header actions */
  headerActions?: Array<{
    icon: string;
    onPress: () => void;
    badge?: number;
  }>;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom content style */
  contentStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  header,
  sidebar,
  content,
  title,
  showBack = false,
  onBackPress,
  headerActions = [],
  style,
  contentStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...style,
  };

  const contentContainerStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    ...contentStyle,
  };

  const mainContentStyle: ViewStyle = {
    flex: 1,
    padding: 16,
  };

  const sidebarWidth = SCREEN_WIDTH * 0.25;

  const renderHeader = () => {
    if (header) {
      return header;
    }

    return (
      <NavigationHeader
        title={title}
        showBack={showBack}
        onBackPress={onBackPress}
        rightActions={headerActions}
      />
    );
  };

  return (
    <SafeAreaView style={containerStyle} testID={testID}>
      {renderHeader()}
      <View style={contentContainerStyle}>
        {sidebar && (
          <View style={{ width: sidebarWidth, borderRightWidth: 1, borderRightColor: colors.border }}>
            {sidebar}
          </View>
        )}
        <ScrollView
          style={mainContentStyle}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {content}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DashboardTemplate;
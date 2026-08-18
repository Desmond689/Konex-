/**
 * KONEX ModerationQueueScreen
 * Billion Dollar Code - Production Ready
 * 
 * Main moderation queue screen
 * 
 * Usage:
 * <ModerationQueueScreen navigation={navigation} />
 */

import React from 'react';
import {
    SafeAreaView,
    View,
    ViewStyle
} from 'react-native';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import Tabs from '../../../components/molecules/Tabs';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useTheme } from '../../../hooks/useTheme';
import ModerationHistory from '../components/ModerationHistory';
import ModerationQueue from '../components/ModerationQueue';
import { useModeration } from '../hooks/useModeration';

// ============================================
// 1. TYPES
// ============================================

export interface ModerationQueueScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ModerationQueueScreen: React.FC<ModerationQueueScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'appeals'>('queue');

  const {
    reports,
    pendingReports,
    actions,
    isLoading,
    isRefreshing,
    resolveReport,
    dismissReport,
    reviewAppeal,
    refresh,
  } = useModeration({ autoFetch: true });

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    padding: 16,
  };

  if (isLoading && reports.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="🛡️ Moderation"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <Tabs
        tabs={['Queue', 'History', 'Appeals']}
        activeTab={activeTab === 'queue' ? 0 : activeTab === 'history' ? 1 : 2}
        onTabChange={(tab) => {
          if (tab === 'Queue') setActiveTab('queue');
          else if (tab === 'History') setActiveTab('history');
          else setActiveTab('appeals');
        }}
      />

      <View style={contentStyle}>
        {activeTab === 'queue' && (
          <ModerationQueue
            reports={pendingReports}
            onResolve={resolveReport}
            onDismiss={dismissReport}
            onViewContent={(report) => {
              navigation.navigate('ReportDetail', { reportId: report.id });
            }}
          />
        )}

        {activeTab === 'history' && (
          <ModerationHistory
            history={actions}
            onFilterChange={() => {}}
          />
        )}

        {activeTab === 'appeals' && (
          <View>
            {/* Appeals list would go here */}
            <EmptyState
              title="Appeals"
              description="User appeals will appear here"
              icon="📋"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ModerationQueueScreen;
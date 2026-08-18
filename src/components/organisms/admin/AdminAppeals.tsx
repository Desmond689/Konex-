/**
 * KONEX AdminAppeals Component
 * Billion Dollar Code - Production Ready
 * 
 * Admin component for managing user appeals
 * 
 * Usage:
 * <AdminAppeals
 *   appeals={appeals}
 *   onReview={handleReview}
 * />
 */

import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Text,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Modal from '../../atoms/Modal';
import Tag from '../../atoms/Tag';
import TextArea from '../../atoms/TextArea';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface Appeal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  moderationActionId: string;
  actionType: 'warning' | 'suspension' | 'ban';
  reason: string;
  details: string;
  evidence: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface AdminAppealsProps {
  appeals: Appeal[];
  onReview: (appealId: string, decision: 'approved' | 'denied', notes?: string) => Promise<void>;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AdminAppeals: React.FC<AdminAppealsProps> = ({
  appeals,
  onReview,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (decision: 'approved' | 'denied') => {
    if (!selectedAppeal) return;

    try {
      setIsSubmitting(true);
      await onReview(selectedAppeal.id, decision, reviewNotes);
      setIsReviewModalVisible(false);
      setSelectedAppeal(null);
      setReviewNotes('');
      Alert.alert('Success', `Appeal ${decision} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to review appeal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setIsReviewModalVisible(true);
  };

  const getStatusColor = (status: Appeal['status']): string => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'denied':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = (status: Appeal['status']): string => {
    switch (status) {
      case 'pending':
        return '⏳ Pending';
      case 'approved':
        return '✅ Approved';
      case 'denied':
        return '❌ Denied';
      default:
        return 'Unknown';
    }
  };

  const getActionTypeLabel = (type: Appeal['actionType']): string => {
    switch (type) {
      case 'warning':
        return '⚠️ Warning';
      case 'suspension':
        return '⏸️ Suspension';
      case 'ban':
        return '🚫 Ban';
      default:
        return 'Unknown';
    }
  };

  const renderItem = ({ item }: { item: Appeal }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              {item.userName}
            </Text>
            <Tag label={getStatusLabel(item.status)} variant={item.status === 'pending' ? 'warning' : item.status === 'approved' ? 'success' : 'error'} size="sm" />
            <Tag label={getActionTypeLabel(item.actionType)} variant="neutral" size="sm" />
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            {item.userEmail}
          </Text>
          <Text style={{ fontSize: 14, color: colors.text, marginTop: 8 }}>
            {item.reason}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }} numberOfLines={2}>
            {item.details}
          </Text>
          {item.evidence && (
            <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4 }}>
              📎 Evidence attached
            </Text>
          )}
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
            Submitted: {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
          </Text>
        </View>
        {item.status === 'pending' && (
          <Button title="Review" variant="primary" size="sm" onPress={() => openReviewModal(item)} />
        )}
      </View>
    </Card>
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
        Appeals ({appeals.filter((a) => a.status === 'pending').length} pending)
      </Text>

      {appeals.length === 0 ? (
        <EmptyState title="No Appeals" description="No appeals to review" icon="📋" />
      ) : (
        <FlatList
          data={appeals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Review Appeal Modal */}
      <Modal
        visible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        title="Review Appeal"
        contentStyle={{ maxWidth: 500 }}
      >
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>User</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{selectedAppeal?.userName}</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>{selectedAppeal?.userEmail}</Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Action</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{getActionTypeLabel(selectedAppeal?.actionType || 'warning')}</Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Reason</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{selectedAppeal?.reason}</Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Details</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{selectedAppeal?.details}</Text>
        </View>
        {selectedAppeal?.evidence && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Evidence</Text>
            <Text style={{ fontSize: 14, color: colors.primary }}>{selectedAppeal.evidence}</Text>
          </View>
        )}
        <TextArea
          label="Review Notes"
          value={reviewNotes}
          onChangeText={setReviewNotes}
          placeholder="Add notes about your decision..."
          numberOfLines={3}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setIsReviewModalVisible(false)}
            style={{ marginRight: 8 }}
          />
          <Button
            title="Deny"
            variant="danger"
            onPress={() => handleReview('denied')}
            loading={isSubmitting}
            style={{ marginRight: 8 }}
          />
          <Button
            title="Approve"
            variant="success"
            onPress={() => handleReview('approved')}
            loading={isSubmitting}
          />
        </View>
      </Modal>
    </View>
  );
};

export default AdminAppeals;
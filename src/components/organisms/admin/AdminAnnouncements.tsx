/**
 * KONEX AdminAnnouncements Component
 * Billion Dollar Code - Production Ready
 * 
 * Admin component for managing announcements
 * 
 * Usage:
 * <AdminAnnouncements
 *   announcements={announcements}
 *   onCreate={handleCreate}
 *   onDelete={handleDelete}
 * />
 */

import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';
import Input from '../../atoms/Input';
import Modal from '../../atoms/Modal';
import TextArea from '../../atoms/TextArea';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'community' | 'event' | 'maintenance' | 'general';
  target: 'all' | 'specific_squad' | 'specific_game';
  targetId?: string;
  publishedAt: string;
  isActive: boolean;
  createdBy: string;
}

export interface AdminAnnouncementsProps {
  announcements: Announcement[];
  onCreate: (data: Omit<Announcement, 'id' | 'publishedAt' | 'createdBy'>) => Promise<void>;
  onDelete: (announcementId: string) => Promise<void>;
  onUpdate?: (announcementId: string, data: Partial<Announcement>) => Promise<void>;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({
  announcements,
  onCreate,
  onDelete,
  onUpdate,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as Announcement['type'],
    target: 'all' as Announcement['target'],
    targetId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreate(formData);
      setFormData({
        title: '',
        message: '',
        type: 'general',
        target: 'all',
        targetId: '',
      });
      setIsCreateModalVisible(false);
      Alert.alert('Success', 'Announcement created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;

    try {
      await onDelete(selectedAnnouncement.id);
      setIsDeleteModalVisible(false);
      setSelectedAnnouncement(null);
      Alert.alert('Success', 'Announcement deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete announcement');
    }
  };

  const confirmDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteModalVisible(true);
  };

  const toggleStatus = async (announcement: Announcement) => {
    if (onUpdate) {
      try {
        await onUpdate(announcement.id, { isActive: !announcement.isActive });
      } catch (error) {
        Alert.alert('Error', 'Failed to update announcement status');
      }
    }
  };

  const getTypeColor = (type: Announcement['type']): string => {
    switch (type) {
      case 'community':
        return colors.primary;
      case 'event':
        return colors.success;
      case 'maintenance':
        return colors.warning;
      case 'general':
      default:
        return colors.info;
    }
  };

  const getTypeLabel = (type: Announcement['type']): string => {
    switch (type) {
      case 'community':
        return 'Community';
      case 'event':
        return 'Event';
      case 'maintenance':
        return 'Maintenance';
      case 'general':
      default:
        return 'General';
    }
  };

  const getTargetLabel = (target: Announcement['target']): string => {
    switch (target) {
      case 'all':
        return 'All Users';
      case 'specific_squad':
        return 'Specific Squad';
      case 'specific_game':
        return 'Specific Game';
      default:
        return 'All Users';
    }
  };

  const renderItem = ({ item }: { item: Announcement }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: getTypeColor(item.type),
                marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{getTypeLabel(item.type)}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>
              • {getTargetLabel(item.target)}
            </Text>
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: item.isActive ? colors.success + '20' : colors.error + '20',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: item.isActive ? colors.success : colors.error,
                }}
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{item.title}</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
            Published: {format(new Date(item.publishedAt), 'MMM dd, yyyy HH:mm')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => toggleStatus(item)} style={{ padding: 4, marginRight: 4 }}>
            <Icon name={item.isActive ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={{ padding: 4 }}>
            <Icon name="trash-2" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          Announcements ({announcements.length})
        </Text>
        <Button title="Create Announcement" variant="primary" size="sm" onPress={() => setIsCreateModalVisible(true)} />
      </View>

      {announcements.length === 0 ? (
        <EmptyState
          title="No Announcements"
          description="Create your first announcement to communicate with users"
          actionText="Create Announcement"
          onAction={() => setIsCreateModalVisible(true)}
          icon="📢"
        />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Create Announcement Modal */}
      <Modal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        title="Create Announcement"
        contentStyle={{ maxWidth: 500 }}
      >
        <Input
          label="Title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="Enter announcement title"
          required
        />
        <TextArea
          label="Message"
          value={formData.message}
          onChangeText={(text) => setFormData({ ...formData, message: text })}
          placeholder="Enter announcement message"
          numberOfLines={4}
          required
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
              Type
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['community', 'event', 'maintenance', 'general'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFormData({ ...formData, type })}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: formData.type === type ? colors.primary : colors.surfaceSecondary,
                    borderWidth: 1,
                    borderColor: formData.type === type ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: formData.type === type ? '#FFFFFF' : colors.text,
                    }}
                  >
                    {getTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
              Target
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['all', 'specific_squad', 'specific_game'] as const).map((target) => (
                <TouchableOpacity
                  key={target}
                  onPress={() => setFormData({ ...formData, target, targetId: '' })}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: formData.target === target ? colors.primary : colors.surfaceSecondary,
                    borderWidth: 1,
                    borderColor: formData.target === target ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: formData.target === target ? '#FFFFFF' : colors.text,
                    }}
                  >
                    {getTargetLabel(target)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        {formData.target !== 'all' && (
          <Input
            label="Target ID"
            value={formData.targetId}
            onChangeText={(text) => setFormData({ ...formData, targetId: text })}
            placeholder={formData.target === 'specific_squad' ? 'Enter Squad ID' : 'Enter Game ID'}
          />
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setIsCreateModalVisible(false)} style={{ marginRight: 8 }} />
          <Button title="Create" variant="primary" onPress={handleCreate} loading={isSubmitting} />
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Delete Announcement"
        contentStyle={{ maxWidth: 400 }}
      >
        <Text style={{ fontSize: 16, color: colors.text, marginBottom: 16 }}>
          Are you sure you want to delete "{selectedAnnouncement?.title}"?
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
          This action cannot be undone.
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button title="Cancel" variant="ghost" onPress={() => setIsDeleteModalVisible(false)} style={{ marginRight: 8 }} />
          <Button title="Delete" variant="danger" onPress={handleDelete} />
        </View>
      </Modal>
    </View>
  );
};

export default AdminAnnouncements;
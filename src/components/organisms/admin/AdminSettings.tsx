/**
 * KONEX AdminSettings Component
 * Billion Dollar Code - Production Ready
 * 
 * Admin component for platform settings
 * 
 * Usage:
 * <AdminSettings
 *   settings={settings}
 *   onUpdate={handleUpdate}
 * />
 */

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Input from '../../atoms/Input';

// ============================================
// 1. TYPES
// ============================================

export interface PlatformSettings {
  // General
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  
  // Moderation
  autoModeration: boolean;
  reportThreshold: number;
  suspensionDurations: string;
  
  // Community
  maxSquadMembers: number;
  maxPostLength: number;
  maxImageUploadSize: number;
  
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  
  // Privacy
  defaultPrivacy: 'public' | 'friends' | 'private';
}

export interface AdminSettingsProps {
  settings: PlatformSettings;
  onUpdate: (settings: Partial<PlatformSettings>) => Promise<void>;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onUpdate,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      await onUpdate(formData);
      Alert.alert('Success', 'Settings updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setFormData({ ...formData, [key]: value });
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  return (
    <ScrollView style={containerStyle} testID={testID} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
        Platform Settings
      </Text>

      {/* General Settings */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          General
        </Text>
        <Input
          label="App Name"
          value={formData.appName}
          onChangeText={(text) => handleChange('appName', text)}
        />
        <Input
          label="App Version"
          value={formData.appVersion}
          onChangeText={(text) => handleChange('appVersion', text)}
          editable={false}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: colors.text }}>Maintenance Mode</Text>
          <Switch
            value={formData.maintenanceMode}
            onValueChange={(value) => handleChange('maintenanceMode', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </Card>

      {/* Moderation Settings */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Moderation
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: colors.text }}>Auto Moderation</Text>
          <Switch
            value={formData.autoModeration}
            onValueChange={(value) => handleChange('autoModeration', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <Input
          label="Report Threshold"
          value={String(formData.reportThreshold)}
          onChangeText={(text) => handleChange('reportThreshold', parseInt(text) || 0)}
          keyboardType="numeric"
        />
        <Input
          label="Suspension Durations (days)"
          value={formData.suspensionDurations}
          onChangeText={(text) => handleChange('suspensionDurations', text)}
          placeholder="e.g., 1,3,7,14"
        />
      </Card>

      {/* Community Settings */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Community
        </Text>
        <Input
          label="Max Squad Members"
          value={String(formData.maxSquadMembers)}
          onChangeText={(text) => handleChange('maxSquadMembers', parseInt(text) || 20)}
          keyboardType="numeric"
        />
        <Input
          label="Max Post Length"
          value={String(formData.maxPostLength)}
          onChangeText={(text) => handleChange('maxPostLength', parseInt(text) || 10000)}
          keyboardType="numeric"
        />
        <Input
          label="Max Image Upload Size (MB)"
          value={String(formData.maxImageUploadSize)}
          onChangeText={(text) => handleChange('maxImageUploadSize', parseInt(text) || 5)}
          keyboardType="numeric"
        />
      </Card>

      {/* Notification Settings */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Notifications
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: colors.text }}>Push Notifications</Text>
          <Switch
            value={formData.pushNotifications}
            onValueChange={(value) => handleChange('pushNotifications', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: colors.text }}>Email Notifications</Text>
          <Switch
            value={formData.emailNotifications}
            onValueChange={(value) => handleChange('emailNotifications', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </Card>

      {/* Privacy Settings */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Privacy
        </Text>
        <Text style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>Default Privacy</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['public', 'friends', 'private'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleChange('defaultPrivacy', option)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: formData.defaultPrivacy === option ? colors.primary : colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: formData.defaultPrivacy === option ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: formData.defaultPrivacy === option ? '#FFFFFF' : colors.text,
                  textTransform: 'capitalize',
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Button
        title="Save Settings"
        variant="primary"
        onPress={handleUpdate}
        loading={isSubmitting}
        fullWidth
        style={{ marginBottom: 24 }}
      />
    </ScrollView>
  );
};

export default AdminSettings;
/**
 * KONEX ReportButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Report button with modal
 * 
 * Usage:
 * <ReportButton
 *   onReport={handleReport}
 * />
 */

import React, { useState } from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Icon from '../../atoms/Icon';
import Modal from '../../atoms/Modal';
import RadioButton from '../../atoms/RadioButton';
import TextArea from '../../atoms/TextArea';

// ============================================
// 1. TYPES
// ============================================

export interface ReportButtonProps {
  /** On report handler */
  onReport: (reason: string, details?: string) => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ReportButton: React.FC<ReportButtonProps> = ({
  onReport,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Harassment',
    'Spam',
    'Offensive Content',
    'NSFW',
    'Violence',
    'Impersonation',
    'Self-Harm',
    'Cheating/Hacks',
    'Copyright',
    'Scam/Fraud',
    'Other',
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason');
      return;
    }

    try {
      setIsSubmitting(true);
      await onReport(selectedReason, details || undefined);
      setIsModalVisible(false);
      setSelectedReason('');
      setDetails('');
      Alert.alert('Success', 'Report submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={{ padding: 4 }}
      >
        <Icon name="flag" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Report"
        contentStyle={{ maxWidth: 400 }}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
          Why are you reporting this?
        </Text>

        {reportReasons.map((reason) => (
          <RadioButton
            key={reason}
            label={reason}
            selected={selectedReason === reason}
            onPress={() => setSelectedReason(reason)}
            style={{ marginBottom: 6 }}
          />
        ))}

        <TextArea
          label="Additional Details (optional)"
          value={details}
          onChangeText={setDetails}
          placeholder="Provide more context..."
          numberOfLines={3}
          style={{ marginTop: 8 }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setIsModalVisible(false)}
            style={{ marginRight: 8 }}
          />
          <Button
            title="Submit"
            variant="primary"
            onPress={handleSubmit}
            loading={isSubmitting}
          />
        </View>
      </Modal>
    </View>
  );
};

export default ReportButton;
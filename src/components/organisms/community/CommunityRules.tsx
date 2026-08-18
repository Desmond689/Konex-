/**
 * KONEX CommunityRules Component
 * Billion Dollar Code - Production Ready
 * 
 * A component for displaying community rules
 * 
 * Usage:
 * <CommunityRules
 *   rules={rules}
 *   editable={true}
 *   onUpdate={handleUpdate}
 * />
 */

import React, { useState } from 'react';
import {
    Alert,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';
import Input from '../../atoms/Input';
import Modal from '../../atoms/Modal';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityRulesProps {
  /** List of rules */
  rules: string[];
  /** Is editable */
  editable?: boolean;
  /** On update rules handler */
  onUpdate?: (rules: string[]) => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityRules: React.FC<CommunityRulesProps> = ({
  rules,
  editable = false,
  onUpdate,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editRules, setEditRules] = useState<string[]>(rules);
  const [newRule, setNewRule] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setEditRules([...editRules, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setEditRules(editRules.filter((_, i) => i !== index));
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= editRules.length) return;
    const newRules = [...editRules];
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
    setEditRules(newRules);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    try {
      setIsSubmitting(true);
      await onUpdate(editRules);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Rules updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update rules');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  const ruleItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const ruleNumberStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    width: 24,
  };

  const ruleTextStyle: TextStyle = {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
          📋 Community Rules ({rules.length})
        </Text>
        {editable && (
          <Button
            title="Edit Rules"
            variant="ghost"
            size="sm"
            onPress={() => {
              setEditRules(rules);
              setIsEditModalVisible(true);
            }}
          />
        )}
      </View>

      {rules.length === 0 ? (
        <EmptyState title="No Rules" description="No rules have been set" icon="📋" />
      ) : (
        <Card>
          {rules.map((rule, index) => (
            <View key={index} style={ruleItemStyle}>
              <Text style={ruleNumberStyle}>{index + 1}.</Text>
              <Text style={ruleTextStyle}>{rule}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Edit Rules Modal */}
      <Modal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        title="Edit Rules"
        contentStyle={{ maxWidth: 500 }}
      >
        <View style={{ marginBottom: 16 }}>
          <Input
            placeholder="Add a new rule..."
            value={newRule}
            onChangeText={setNewRule}
            onSubmitEditing={handleAddRule}
            rightIcon="plus"
            onRightIconPress={handleAddRule}
          />
        </View>

        {editRules.length === 0 ? (
          <EmptyState title="No Rules" description="Add rules for your community" icon="📋" />
        ) : (
          editRules.map((rule, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={ruleNumberStyle}>{index + 1}.</Text>
              <Text style={{ flex: 1, fontSize: 14, color: colors.text }}>
                {rule}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => handleMoveRule(index, 'up')}
                  disabled={index === 0}
                  style={{ padding: 4 }}
                >
                  <Icon
                    name="chevron-up"
                    size={18}
                    color={index === 0 ? colors.textMuted : colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMoveRule(index, 'down')}
                  disabled={index === editRules.length - 1}
                  style={{ padding: 4 }}
                >
                  <Icon
                    name="chevron-down"
                    size={18}
                    color={index === editRules.length - 1 ? colors.textMuted : colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveRule(index)}
                  style={{ padding: 4 }}
                >
                  <Icon name="x" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setIsEditModalVisible(false)}
            style={{ marginRight: 8 }}
          />
          <Button
            title="Save Rules"
            variant="primary"
            onPress={handleSave}
            loading={isSubmitting}
          />
        </View>
      </Modal>
    </View>
  );
};

export default CommunityRules;
/**
 * KONEX Moderation Constants
 * Billion Dollar Code - Production Ready
 * 
 * Defines moderation rules, actions, and severity levels
 * 
 * Usage:
 * import { MODERATION_ACTIONS, MODERATION_SEVERITY, getActionByType } from '@constants/moderation';
 */

// ============================================
// 1. TYPES
// ============================================

export interface ModerationAction {
  id: string;
  type: 'warning' | 'suspension' | 'ban' | 'unban';
  label: string;
  description: string;
  icon: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  defaultDuration?: number;
  requiresReason: boolean;
  requiresModerator: boolean;
  canAppeal: boolean;
}

export interface ModerationSeverity {
  id: 'low' | 'medium' | 'high' | 'critical';
  label: string;
  description: string;
  color: string;
  defaultActions: string[];
}

// ============================================
// 2. MODERATION SEVERITY
// ============================================

export const MODERATION_SEVERITY: ModerationSeverity[] = [
  {
    id: 'low',
    label: 'Low',
    description: 'Minor violations that require minimal action',
    color: '#10B981',
    defaultActions: ['warning'],
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Moderate violations that require action',
    color: '#F59E0B',
    defaultActions: ['warning', 'suspension'],
  },
  {
    id: 'high',
    label: 'High',
    description: 'Serious violations that require strong action',
    color: '#EF4444',
    defaultActions: ['suspension', 'ban'],
  },
  {
    id: 'critical',
    label: 'Critical',
    description: 'Severe violations that require immediate action',
    color: '#7F1D1D',
    defaultActions: ['ban'],
  },
];

// ============================================
// 3. MODERATION ACTIONS
// ============================================

export const MODERATION_ACTIONS: ModerationAction[] = [
  {
    id: 'warning',
    type: 'warning',
    label: 'Warning',
    description: 'Issue a formal warning to the user',
    icon: '⚠️',
    severity: 'low',
    requiresReason: true,
    requiresModerator: true,
    canAppeal: true,
  },
  {
    id: 'suspension_1d',
    type: 'suspension',
    label: 'Suspension (1 Day)',
    description: 'Suspend the user for 1 day',
    icon: '⏸️',
    severity: 'medium',
    defaultDuration: 1,
    requiresReason: true,
    requiresModerator: true,
    canAppeal: true,
  },
  {
    id: 'suspension_3d',
    type: 'suspension',
    label: 'Suspension (3 Days)',
    description: 'Suspend the user for 3 days',
    icon: '⏸️',
    severity: 'medium',
    defaultDuration: 3,
    requiresReason: true,
    requiresModerator: true,
    canAppeal: true,
  },
  {
    id: 'suspension_7d',
    type: 'suspension',
    label: 'Suspension (7 Days)',
    description: 'Suspend the user for 7 days',
    icon: '⏸️',
    severity: 'high',
    defaultDuration: 7,
    requiresReason: true,
    requiresModerator: true,
    canAppeal: true,
  },
  {
    id: 'suspension_14d',
    type: 'suspension',
    label: 'Suspension (14 Days)',
    description: 'Suspend the user for 14 days',
    icon: '⏸️',
    severity: 'high',
    defaultDuration: 14,
    requiresReason: true,
    requiresModerator: true,
    canAppeal: true,
  },
  {
    id: 'ban_permanent',
    type: 'ban',
    label: 'Permanent Ban',
    description: 'Permanently ban the user',
    icon: '🚫',
    severity: 'critical',
    requiresReason: true,
    requiresModerator: true,
    canAppeal: true,
  },
  {
    id: 'unban',
    type: 'unban',
    label: 'Unban',
    description: 'Remove the ban from the user',
    icon: '✅',
    severity: 'low',
    requiresReason: true,
    requiresModerator: true,
    canAppeal: false,
  },
];

// ============================================
// 4. REPORT REASONS
// ============================================

export const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment', description: 'Bullying, threats, intimidation' },
  { id: 'spam', label: 'Spam', description: 'Repetitive content, scams, phishing' },
  { id: 'offensive_content', label: 'Offensive Content', description: 'Hate speech, slurs, discrimination' },
  { id: 'nsfw', label: 'NSFW', description: 'Inappropriate sexual content' },
  { id: 'violence', label: 'Violence', description: 'Threatening harm, promoting violence' },
  { id: 'impersonation', label: 'Impersonation', description: 'Pretending to be someone else' },
  { id: 'self_harm', label: 'Self-Harm', description: 'Suicidal content, self-injury' },
  { id: 'cheating', label: 'Cheating/Hacks', description: 'Promoting hacks, exploits, mods' },
  { id: 'copyright', label: 'Copyright', description: 'Stolen content, unauthorized use' },
  { id: 'scam', label: 'Scam/Fraud', description: 'Fake giveaways, phishing' },
  { id: 'other', label: 'Other', description: 'Something not listed' },
];

// ============================================
// 5. HELPER FUNCTIONS
// ============================================

/**
 * Get action by ID
 */
export const getActionById = (id: string): ModerationAction | undefined => {
  return MODERATION_ACTIONS.find((action) => action.id === id);
};

/**
 * Get actions by severity
 */
export const getActionsBySeverity = (severity: ModerationAction['severity']): ModerationAction[] => {
  return MODERATION_ACTIONS.filter((action) => action.severity === severity);
};

/**
 * Get actions by type
 */
export const getActionsByType = (type: ModerationAction['type']): ModerationAction[] => {
  return MODERATION_ACTIONS.filter((action) => action.type === type);
};

/**
 * Get default action for severity
 */
export const getDefaultActionForSeverity = (severity: ModerationAction['severity']): ModerationAction | undefined => {
  const severityConfig = MODERATION_SEVERITY.find((s) => s.id === severity);
  if (!severityConfig || severityConfig.defaultActions.length === 0) return undefined;
  return getActionById(severityConfig.defaultActions[0]);
};

/**
 * Get report reason by ID
 */
export const getReportReasonById = (id: string) => {
  return REPORT_REASONS.find((reason) => reason.id === id);
};

/**
 * Get report reasons for dropdown
 */
export const getReportReasonOptions = () => {
  return REPORT_REASONS.map((reason) => ({
    label: reason.label,
    value: reason.id,
    description: reason.description,
  }));
};

// ============================================
// 6. DEFAULT EXPORT
// ============================================

export default {
  MODERATION_ACTIONS,
  MODERATION_SEVERITY,
  REPORT_REASONS,
  getActionById,
  getActionsBySeverity,
  getActionsByType,
  getDefaultActionForSeverity,
  getReportReasonById,
  getReportReasonOptions,
};
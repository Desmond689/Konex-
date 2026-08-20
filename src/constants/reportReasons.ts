/**
 * KONEX Report Reasons Constants
 * Billion Dollar Code - Production Ready
 * 
 * Defines all report reasons for different content types
 * 
 * Usage:
 * import { REPORT_REASONS, getReasonsByContentType } from '@constants/reportReasons';
 */

// ============================================
// 1. TYPES
// ============================================

export interface ReportReason {
  id: string;
  label: string;
  description: string;
  icon: string;
  contentType: ('user' | 'post' | 'comment' | 'story' | 'squad' | 'dm' | 'chat')[];
}

export interface ReportCategory {
  id: string;
  label: string;
  icon: string;
  reasons: ReportReason[];
}

// ============================================
// 2. REPORT REASONS
// ============================================

export const REPORT_REASONS: ReportReason[] = [
  {
    id: 'harassment',
    label: 'Harassment',
    description: 'Bullying, threats, or intimidation',
    icon: '👊',
    contentType: ['user', 'post', 'comment', 'story', 'squad', 'dm', 'chat'],
  },
  {
    id: 'spam',
    label: 'Spam',
    description: 'Repetitive content, scams, or phishing',
    icon: '📨',
    contentType: ['user', 'post', 'comment', 'story', 'squad', 'dm', 'chat'],
  },
  {
    id: 'offensive_content',
    label: 'Offensive Content',
    description: 'Hate speech, slurs, or discrimination',
    icon: '⚠️',
    contentType: ['user', 'post', 'comment', 'story', 'squad', 'dm', 'chat'],
  },
  {
    id: 'nsfw',
    label: 'NSFW',
    description: 'Inappropriate sexual content',
    icon: '🔞',
    contentType: ['user', 'post', 'comment', 'story', 'squad'],
  },
  {
    id: 'violence',
    label: 'Violence',
    description: 'Threatening harm or promoting violence',
    icon: '💀',
    contentType: ['user', 'post', 'comment', 'story', 'squad', 'dm', 'chat'],
  },
  {
    id: 'impersonation',
    label: 'Impersonation',
    description: 'Pretending to be someone else',
    icon: '🎭',
    contentType: ['user', 'post', 'comment', 'squad'],
  },
  {
    id: 'self_harm',
    label: 'Self-Harm',
    description: 'Suicidal content or self-injury',
    icon: '🆘',
    contentType: ['user', 'post', 'comment', 'story', 'dm'],
  },
  {
    id: 'cheating',
    label: 'Cheating/Hacks',
    description: 'Promoting hacks, exploits, or mods',
    icon: '🎮',
    contentType: ['user', 'post', 'comment', 'squad'],
  },
  {
    id: 'copyright',
    label: 'Copyright',
    description: 'Stolen content or unauthorized use',
    icon: '©️',
    contentType: ['post', 'comment', 'story'],
  },
  {
    id: 'scam',
    label: 'Scam/Fraud',
    description: 'Fake giveaways, phishing, or fraud',
    icon: '💰',
    contentType: ['user', 'post', 'comment', 'squad', 'dm'],
  },
  {
    id: 'fake_news',
    label: 'Fake News',
    description: 'Misinformation or false information',
    icon: '📰',
    contentType: ['post', 'comment'],
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Something not listed',
    icon: '❓',
    contentType: ['user', 'post', 'comment', 'story', 'squad', 'dm', 'chat'],
  },
];

// ============================================
// 3. REPORT CATEGORIES
// ============================================

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'user',
    label: 'User',
    icon: '👤',
    reasons: REPORT_REASONS.filter((r) => r.contentType.includes('user')),
  },
  {
    id: 'post',
    label: 'Post',
    icon: '📱',
    reasons: REPORT_REASONS.filter((r) => r.contentType.includes('post')),
  },
  {
    id: 'comment',
    label: 'Comment',
    icon: '💬',
    reasons: REPORT_REASONS.filter((r) => r.contentType.includes('comment')),
  },
  {
    id: 'story',
    label: 'Story',
    icon: '📸',
    reasons: REPORT_REASONS.filter((r) => r.contentType.includes('story')),
  },
  {
    id: 'squad',
    label: 'Squad',
    icon: '🛡️',
    reasons: REPORT_REASONS.filter((r) => r.contentType.includes('squad')),
  },
  {
    id: 'dm',
    label: 'Direct Message',
    icon: '💬',
    reasons: REPORT_REASONS.filter((r) => r.contentType.includes('dm')),
  },
  {
    id: 'chat',
    label: 'Community Chat',
    icon: '🌐',
    reasons: REPORT_REASONS.filter((r) => r.contentType.includes('chat')),
  },
];

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

/**
 * Get report reason by ID
 */
export const getReportReasonById = (id: string): ReportReason | undefined => {
  return REPORT_REASONS.find((reason) => reason.id === id);
};

/**
 * Get reasons by content type
 */
export const getReasonsByContentType = (contentType: ReportReason['contentType'][0]): ReportReason[] => {
  return REPORT_REASONS.filter((reason) => reason.contentType.includes(contentType));
};

/**
 * Get report category by content type
 */
export const getReportCategoryByContentType = (contentType: ReportReason['contentType'][0]): ReportCategory | undefined => {
  return REPORT_CATEGORIES.find((category) => category.id === contentType);
};

/**
 * Get report reason options for dropdown
 */
export const getReportReasonOptions = (contentType?: ReportReason['contentType'][0]) => {
  const reasons = contentType ? getReasonsByContentType(contentType) : REPORT_REASONS;
  return reasons.map((reason) => ({
    label: reason.label,
    value: reason.id,
    description: reason.description,
    icon: reason.icon,
  }));
};

/**
 * Get report categories for dropdown
 */
export const getReportCategoryOptions = () => {
  return REPORT_CATEGORIES.map((category) => ({
    label: category.label,
    value: category.id,
    icon: category.icon,
  }));
};

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default {
  REPORT_REASONS,
  REPORT_CATEGORIES,
  getReportReasonById,
  getReasonsByContentType,
  getReportCategoryByContentType,
  getReportReasonOptions,
  getReportCategoryOptions,
};
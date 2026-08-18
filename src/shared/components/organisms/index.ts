/**
 * KONEX Organisms - Main Export
 * Billion Dollar Code - Production Ready
 */

export { CommentSection } from './CommentSection';
export { Header } from './Header';
export { HeaderWithTabs } from './HeaderWithTabs';
export { PostCard } from './PostCard';
export { ProfileHeader } from './ProfileHeader';

// ============================================
// 2. TYPES EXPORT
// ============================================

export type { Comment, CommentSectionProps } from './CommentSection';
export type { HeaderProps } from './Header';
export type { HeaderWithTabsProps } from './HeaderWithTabs';
export type { PostCardProps, PostData } from './PostCard';
export type { ProfileHeaderProps, ProfileHeaderStats } from './ProfileHeader';

// ============================================
// 3. DEFAULT EXPORT
// ============================================

export default {
  Header,
  HeaderWithTabs,
  ProfileHeader,
  PostCard,
  CommentSection,
};
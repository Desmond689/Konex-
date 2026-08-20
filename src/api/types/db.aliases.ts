import { Database } from './database.types';

// Convenience type aliases for user types used by services
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type MediaAsset = Database['public']['Tables']['media_assets']['Row'];
export type Appeal = Database['public']['Tables']['appeals']['Row'];
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

/** Safe barrel - no duplicates */

export { realtimeService } from './realtime.client';
export { subscribeToMessages } from './realtime.client';
export { subscribeToNotifications } from './realtime.client';
export { subscribeToSquadUpdates } from './realtime.client';
export type { RealtimeSubscription } from './realtime.client';
export type { RealtimeEventType } from './realtime.client';
export { default as RealtimeClient } from './realtime.client';
export { StorageBuckets } from './storage.client';
export { storageService } from './storage.client';
export { uploadAvatar } from './storage.client';
export { uploadPostImage } from './storage.client';
export { uploadSquadIcon } from './storage.client';
export type { StorageBucket } from './storage.client';
export { default as StorageClient } from './storage.client';
export { getSupabaseClient } from './supabase.client';
export { supabase } from './supabase.client';
export { authClient } from './supabase.client';
export { storageClient } from './supabase.client';
export { realtimeClient } from './supabase.client';
export { checkSupabaseHealth } from './supabase.client';
export { default as SupabaseClient } from './supabase.client';

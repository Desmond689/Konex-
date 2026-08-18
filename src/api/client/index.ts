// src/api/client/index.ts
export {
    authClient, checkSupabaseHealth, getSupabaseClient, realtimeClient, storageClient, supabase
} from './supabase.client';

export {
    StorageBuckets, storageService,
    uploadAvatar,
    uploadPostImage,
    uploadSquadIcon
} from './storage.client';

export {
    realtimeService,
    subscribeToMessages,
    subscribeToNotifications,
    subscribeToSquadUpdates
} from './realtime.client';

export type { RealtimeSubscription } from './realtime.client';
export type { StorageBucket } from './storage.client';

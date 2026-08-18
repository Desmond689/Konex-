// src/api/client/realtime.client.ts
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from './supabase.client';

// ============================================
// 1. TYPES
// ============================================

export interface RealtimeSubscription {
  id: string;
  channel: RealtimeChannel;
  table: string;
  filter?: Record<string, any>;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onAll?: (payload: any) => void;
}

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// ============================================
// 2. REALTIME SERVICE
// ============================================

class RealtimeService {
  private static instance: RealtimeService;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private isReconnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {
    this.setupReconnectionHandler();
  }

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // ============================================
  // 3. SUBSCRIPTION METHODS
  // ============================================

  subscribe<T = any>(
    table: string,
    options: {
      filter?: Record<string, any>;
      onInsert?: (payload: T) => void;
      onUpdate?: (payload: T) => void;
      onDelete?: (payload: T) => void;
      onAll?: (payload: T) => void;
    }
  ): RealtimeSubscription {
    try {
      const subscriptionId = this.generateSubscriptionId(table);
      logger.info(`📡 Subscribing to ${table}`, { subscriptionId });

      let filterString = `table=${table}`;
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          filterString += `&${key}=eq.${value}`;
        });
      }

      const channel = supabase.channel(`realtime:${subscriptionId}`);

      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          this.handlePayload<T>(subscriptionId, payload, options);
        }
      );

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.debug(`✅ Subscribed to ${table}`, { subscriptionId });
        } else if (status === 'CHANNEL_ERROR') {
          logger.error(`❌ Subscription error for ${table}`, { subscriptionId });
          this.handleReconnection(subscriptionId);
        } else if (status === 'CLOSED') {
          logger.debug(`🔒 Subscription closed for ${table}`, { subscriptionId });
        }
      });

      const subscription: RealtimeSubscription = {
        id: subscriptionId,
        channel,
        table,
        filter: options.filter,
        onInsert: options.onInsert,
        onUpdate: options.onUpdate,
        onDelete: options.onDelete,
        onAll: options.onAll,
      };

      this.subscriptions.set(subscriptionId, subscription);
      return subscription;
    } catch (error) {
      logger.error('❌ Failed to subscribe', { error, table });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Subscription failed',
        'Failed to subscribe to realtime updates.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  unsubscribe(subscriptionId: string): void {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.channel.unsubscribe();
        this.subscriptions.delete(subscriptionId);
        logger.debug(`🔒 Unsubscribed from ${subscription.table}`, { subscriptionId });
      }
    } catch (error) {
      logger.error('❌ Failed to unsubscribe', { error, subscriptionId });
    }
  }

  unsubscribeAll(): void {
    try {
      this.subscriptions.forEach((subscription) => {
        subscription.channel.unsubscribe();
      });
      this.subscriptions.clear();
      logger.info('🔒 Unsubscribed from all channels');
    } catch (error) {
      logger.error('❌ Failed to unsubscribe all', { error });
    }
  }

  // ============================================
  // 4. PAYLOAD HANDLING
  // ============================================

  private handlePayload<T>(
    subscriptionId: string,
    payload: RealtimePostgresChangesPayload<T>,
    options: {
      onInsert?: (payload: T) => void;
      onUpdate?: (payload: T) => void;
      onDelete?: (payload: T) => void;
      onAll?: (payload: T) => void;
    }
  ): void {
    try {
      const eventType = payload.eventType;
      const data = payload.new as T;

      logger.debug(`📡 Received ${eventType} event`, {
        subscriptionId,
        table: payload.table,
      });

      if (options.onAll) {
        options.onAll(data);
      }

      switch (eventType) {
        case 'INSERT':
          if (options.onInsert) {
            options.onInsert(data);
          }
          break;
        case 'UPDATE':
          if (options.onUpdate) {
            options.onUpdate(data);
          }
          break;
        case 'DELETE':
          if (options.onDelete) {
            options.onDelete(data);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      logger.error('❌ Error handling payload', { error, payload });
    }
  }

  // ============================================
  // 5. RECONNECTION HANDLING
  // ============================================

  private setupReconnectionHandler(): void {
    // Network reconnection handling
  }

  private handleReconnection(subscriptionId: string): void {
    if (this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      logger.error('❌ Max reconnection attempts reached', { subscriptionId });
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    logger.info(`🔄 Reconnecting in ${delay}ms`, { subscriptionId });

    setTimeout(() => {
      this.reconnectSubscription(subscriptionId);
    }, delay);
  }

  private reconnectSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      this.isReconnecting = false;
      return;
    }

    try {
      subscription.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info(`✅ Reconnected to ${subscription.table}`, { subscriptionId });
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR') {
          this.handleReconnection(subscriptionId);
        }
      });
    } catch (error) {
      logger.error('❌ Reconnection failed', { error, subscriptionId });
      this.isReconnecting = false;
    }
  }

  // ============================================
  // 6. UTILITY METHODS
  // ============================================

  private generateSubscriptionId(table: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `${table}_${timestamp}_${random}`;
  }

  getActiveSubscriptions(): RealtimeSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  isSubscribed(subscriptionId: string): boolean {
    return this.subscriptions.has(subscriptionId);
  }

  getSubscription(subscriptionId: string): RealtimeSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }
}

// ============================================
// 7. EXPORT SINGLETON
// ============================================

export const realtimeService = RealtimeService.getInstance();

// ============================================
// 8. CONVENIENCE FUNCTIONS
// ============================================

export const subscribeToMessages = (
  chatIdOrCallback: string | ((payload: any) => void),
  onMessage?: (payload: any) => void
): RealtimeSubscription => {
  // Support (chatId, cb) or (cb) for all message inserts
  if (typeof chatIdOrCallback === 'function') {
    return realtimeService.subscribe('messages', {
      onInsert: chatIdOrCallback,
    });
  }
  return realtimeService.subscribe('messages', {
    filter: { chat_id: chatIdOrCallback },
    onInsert: onMessage,
  });
};

export const subscribeToNotifications = (
  userId: string,
  onNotification: (payload: any) => void
): RealtimeSubscription => {
  return realtimeService.subscribe('notifications', {
    filter: { user_id: userId },
    onInsert: onNotification,
  });
};

export const subscribeToSquadUpdates = (
  squadId: string,
  onUpdate: (payload: any) => void
): RealtimeSubscription => {
  return realtimeService.subscribe('squads', {
    filter: { id: squadId },
    onUpdate: onUpdate,
  });
};

export default realtimeService;
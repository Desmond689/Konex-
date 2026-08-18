/**
 * KONEX Realtime - Main Entry Point
 * Billion Dollar Code - Production Ready
 */

import { supabase } from './client';

// ============================================
// TYPES
// ============================================

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
export type RealtimeChannelStatus = 'subscribed' | 'timed_out' | 'closed' | 'channel_error';

export interface RealtimePresence {
  userId: string;
  status: 'online' | 'offline' | 'idle' | 'do_not_disturb';
  metadata: Record<string, any>;
  lastSeen: number;
}

export interface RealtimePresenceState {
  [userId: string]: RealtimePresence;
}

export interface RealtimeSubscription {
  id: string;
  channel: string;
  event: string;
  callback: (payload: any) => void;
  status: RealtimeChannelStatus;
  createdAt: Date;
}

export interface RealtimeChannelConfig {
  autoSubscribe?: boolean;
  presence?: boolean;
  broadcast?: boolean;
}

// ============================================
// REALTIME MANAGER CLASS
// ============================================

class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, any> = new Map();
  private subscriptions: Map<string, RealtimeSubscription[]> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Subscribe to a channel
   */
  subscribe(
    channelName: string,
    event: string,
    callback: (payload: any) => void,
    config?: RealtimeChannelConfig
  ): () => void {
    try {
      // Create or get channel
      let channel = this.channels.get(channelName);
      
      if (!channel) {
        channel = supabase.channel(channelName);
        this.channels.set(channelName, channel);
        
        if (config?.presence) {
          channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            this.handlePresenceUpdate(channelName, state);
          });
        }
      }

      // Store subscription
      const subId = `${channelName}_${event}_${Date.now()}`;
      const subscription: RealtimeSubscription = {
        id: subId,
        channel: channelName,
        event,
        callback,
        status: 'subscribed',
        createdAt: new Date(),
      };

      const existing = this.subscriptions.get(channelName) || [];
      existing.push(subscription);
      this.subscriptions.set(channelName, existing);

      // Subscribe to channel
      if (!channel.joinedOnce) {
        channel.subscribe((status: any, err: any) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to channel: ${channelName}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Channel error: ${channelName}`, err);
          }
        });
      }

      // Add event listener
      channel.on('broadcast', { event }, (payload: any) => {
        callback(payload.payload);
      });

      // Return unsubscribe function
      return () => {
        this.unsubscribe(channelName, event, subId);
      };
    } catch (error) {
      console.error('subscribe error:', error);
      return () => {};
    }
  }

  /**
   * Subscribe to database table changes
   */
  subscribeToTable(
    table: string,
    event: RealtimeEventType,
    callback: (payload: any) => void,
    filter?: string
  ): () => void {
    try {
      const channelName = `${table}:${event}`;
      let channel = this.channels.get(channelName);

      if (!channel) {
        channel = supabase.channel(channelName);
        this.channels.set(channelName, channel);
      }

      channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter: filter || undefined,
        },
        (payload) => {
          callback(payload);
        }
      );

      if (!channel.joinedOnce) {
        channel.subscribe();
      }

      return () => {
        this.unsubscribeFromTable(channelName);
      };
    } catch (error) {
      console.error('subscribeToTable error:', error);
      return () => {};
    }
  }

  /**
   * Broadcast message to channel
   */
  async broadcast(channelName: string, event: string, payload: any): Promise<void> {
    try {
      let channel = this.channels.get(channelName);
      
      if (!channel) {
        channel = supabase.channel(channelName);
        this.channels.set(channelName, channel);
        await channel.subscribe();
      }

      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    } catch (error) {
      console.error('broadcast error:', error);
      throw error;
    }
  }

  /**
   * Track presence
   */
  trackPresence(channelName: string, state: any): void {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.track(state);
      }
    } catch (error) {
      console.error('trackPresence error:', error);
    }
  }

  /**
   * Untrack presence
   */
  untrackPresence(channelName: string): void {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.untrack();
      }
    } catch (error) {
      console.error('untrackPresence error:', error);
    }
  }

  /**
   * Get presence state
   */
  getPresenceState(channelName: string): RealtimePresenceState | null {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        return channel.presenceState() as RealtimePresenceState;
      }
      return null;
    } catch (error) {
      console.error('getPresenceState error:', error);
      return null;
    }
  }

  /**
   * Listen to presence changes
   */
  onPresenceChange(channelName: string, callback: (state: RealtimePresenceState) => void): void {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState() as RealtimePresenceState;
          callback(state);
        });
      }
    } catch (error) {
      console.error('onPresenceChange error:', error);
    }
  }

  /**
   * Unsubscribe from channel
   */
  private unsubscribe(channelName: string, event: string, subId: string): void {
    try {
      const subscriptions = this.subscriptions.get(channelName) || [];
      const filtered = subscriptions.filter((s: any) => s.id !== subId);
      
      if (filtered.length === 0) {
        this.subscriptions.delete(channelName);
        this.removeChannel(channelName);
      } else {
        this.subscriptions.set(channelName, filtered);
      }
    } catch (error) {
      console.error('unsubscribe error:', error);
    }
  }

  /**
   * Unsubscribe from table
   */
  private unsubscribeFromTable(channelName: string): void {
    try {
      this.removeChannel(channelName);
      this.subscriptions.delete(channelName);
    } catch (error) {
      console.error('unsubscribeFromTable error:', error);
    }
  }

  /**
   * Remove channel
   */
  private removeChannel(channelName: string): void {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
    } catch (error) {
      console.error('removeChannel error:', error);
    }
  }

  /**
   * Handle presence update
   */
  private handlePresenceUpdate(channelName: string, state: any): void {
    const listeners = this.listeners.get(channelName) || [];
    listeners.forEach((callback) => callback(state));
  }

  /**
   * Remove all subscriptions
   */
  removeAll(): void {
    try {
      for (const [channelName] of this.channels) {
        this.removeChannel(channelName);
      }
      this.channels.clear();
      this.subscriptions.clear();
      this.listeners.clear();
    } catch (error) {
      console.error('removeAll error:', error);
    }
  }

  /**
   * Get channel status
   */
  getChannelStatus(channelName: string): RealtimeChannelStatus | null {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        return channel.joinedOnce ? 'subscribed' : 'closed';
      }
      return null;
    } catch (error) {
      console.error('getChannelStatus error:', error);
      return null;
    }
  }

  /**
   * Check if channel is connected
   */
  isConnected(channelName: string): boolean {
    try {
      const channel = this.channels.get(channelName);
      return channel?.joinedOnce || false;
    } catch (error) {
      console.error('isConnected error:', error);
      return false;
    }
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    try {
      const channels: string[] = [];
      for (const [name, channel] of this.channels) {
        if (channel.joinedOnce) {
          channels.push(name);
        }
      }
      return channels;
    } catch (error) {
      console.error('getActiveChannels error:', error);
      return [];
    }
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    let total = 0;
    for (const [, subs] of this.subscriptions) {
      total += subs.length;
    }
    return total;
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const realtime = RealtimeManager.getInstance();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Subscribe to user presence
 */
export const subscribeToUserPresence = (
  userIds: string[],
  callback: (presence: RealtimePresenceState) => void
): (() => void) => {
  const channelName = `presence:${userIds.join(',')}`;
  return realtime.subscribe(channelName, 'presence', callback, { presence: true });
};

/**
 * Subscribe to chat messages
 */
export const subscribeToChat = (
  chatId: string,
  callback: (payload: any) => void
): (() => void) => {
  const channelName = `chat:${chatId}`;
  return realtime.subscribe(channelName, 'message', callback);
};

/**
 * Subscribe to notifications
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (payload: any) => void
): (() => void) => {
  const channelName = `notifications:${userId}`;
  return realtime.subscribe(channelName, 'notification', callback);
};

/**
 * Subscribe to feed updates
 */
export const subscribeToFeed = (
  userId: string,
  callback: (payload: any) => void
): (() => void) => {
  const channelName = `feed:${userId}`;
  return realtime.subscribe(channelName, 'feed', callback);
};

// ============================================
// EXPORT DEFAULTS
// ============================================

export default realtime;
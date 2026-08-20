/**
 * KONEX Realtime - Main Entry Point
 * Production Ready
 */

import { supabase } from './client';

// ============================================
// TYPES
// ============================================

export type RealtimeEventType =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | '*';

export type RealtimeChannelStatus =
  | 'subscribed'
  | 'timed_out'
  | 'closed'
  | 'channel_error';

export interface RealtimePresence {
  userId: string;
  status:
    | 'online'
    | 'offline'
    | 'idle'
    | 'do_not_disturb';
  metadata: Record<string, unknown>;
  lastSeen: number;
}

export interface RealtimePresenceState {
  [userId: string]: RealtimePresence;
}

export interface RealtimeSubscription {
  id: string;
  channel: string;
  event: string;
  callback: (payload: unknown) => void;
  status: RealtimeChannelStatus;
  createdAt: Date;
}

export interface RealtimeChannelConfig {
  autoSubscribe?: boolean;
  presence?: boolean;
  broadcast?: boolean;
}

// ============================================
// INTERNAL TYPES
// ============================================

type RealtimeChannel = ReturnType<typeof supabase.channel>;

type ChannelStatusCallback = (
  status: string,
  error?: Error
) => void;

// ============================================
// REALTIME MANAGER
// ============================================

class RealtimeManager {
  private static instance: RealtimeManager;

  private channels: Map<string, RealtimeChannel> = new Map();

  private subscriptions: Map<
    string,
    RealtimeSubscription[]
  > = new Map();

  private listeners: Map<
    string,
    Array<(state: RealtimePresenceState) => void>
  > = new Map();

  private constructor() {}

  // ============================================
  // SINGLETON
  // ============================================

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance =
        new RealtimeManager();
    }

    return RealtimeManager.instance;
  }

  // ============================================
  // SUBSCRIBE TO BROADCAST
  // ============================================

  subscribe(
    channelName: string,
    event: string,
    callback: (payload: unknown) => void,
    config?: RealtimeChannelConfig
  ): () => void {
    try {
      let channel = this.channels.get(channelName);

      if (!channel) {
        channel = supabase.channel(channelName);

        this.channels.set(
          channelName,
          channel
        );

        if (config?.presence) {
          channel.on(
            'presence',
            { event: 'sync' },
            (): void => {
              const state =
                channel.presenceState();

              this.handlePresenceUpdate(
                channelName,
                state
              );
            }
          );
        }
      }

      const subId =
        `${channelName}_${event}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const subscription: RealtimeSubscription = {
        id: subId,
        channel: channelName,
        event,
        callback,
        status: 'subscribed',
        createdAt: new Date(),
      };

      const existing =
        this.subscriptions.get(channelName) ?? [];

      existing.push(subscription);

      this.subscriptions.set(
        channelName,
        existing
      );

      channel.on(
        'broadcast',
        { event },
        (payload: {
          payload?: unknown;
        }): void => {
          callback(payload?.payload);
        }
      );

      if (!channel.joinedOnce) {
        channel.subscribe(
          (
            status: string,
            error?: Error
          ): void => {
            if (status === 'SUBSCRIBED') {
              console.log(
                `Subscribed to channel: ${channelName}`
              );
            }

            if (status === 'CHANNEL_ERROR') {
              console.error(
                `Channel error: ${channelName}`,
                error
              );
            }

            if (status === 'TIMED_OUT') {
              console.error(
                `Channel timed out: ${channelName}`
              );
            }
          }
        );
      }

      return (): void => {
        this.unsubscribe(
          channelName,
          subId
        );
      };
    } catch (error) {
      console.error(
        'subscribe error:',
        error
      );

      return (): void => {};
    }
  }

  // ============================================
  // SUBSCRIBE TO DATABASE TABLE
  // ============================================

  subscribeToTable(
    table: string,
    event: RealtimeEventType,
    callback: (payload: unknown) => void,
    filter?: string
  ): () => void {
    try {
      const channelName =
        `${table}:${event}`;

      let channel =
        this.channels.get(channelName);

      if (!channel) {
        channel =
          supabase.channel(channelName);

        this.channels.set(
          channelName,
          channel
        );
      }

      channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter
            ? { filter }
            : {}),
        },
        (payload: unknown): void => {
          callback(payload);
        }
      );

      if (!channel.joinedOnce) {
        channel.subscribe(
          (
            status: string,
            error?: Error
          ): void => {
            if (status === 'SUBSCRIBED') {
              console.log(
                `Subscribed to table: ${table}`
              );
            }

            if (status === 'CHANNEL_ERROR') {
              console.error(
                `Table channel error: ${table}`,
                error
              );
            }

            if (status === 'TIMED_OUT') {
              console.error(
                `Table channel timed out: ${table}`
              );
            }
          }
        );
      }

      return (): void => {
        this.unsubscribeFromTable(
          channelName
        );
      };
    } catch (error) {
      console.error(
        'subscribeToTable error:',
        error
      );

      return (): void => {};
    }
  }

  // ============================================
  // BROADCAST
  // ============================================

  async broadcast(
    channelName: string,
    event: string,
    payload: unknown
  ): Promise<void> {
    try {
      let channel =
        this.channels.get(channelName);

      if (!channel) {
        channel =
          supabase.channel(channelName);

        this.channels.set(
          channelName,
          channel
        );
      }

      if (!channel.joinedOnce) {
        await this.waitForSubscription(
          channel
        );
      }

      const result =
        await channel.send({
          type: 'broadcast',
          event,
          payload,
        });

      if (result !== 'ok') {
        throw new Error(
          `Broadcast failed: ${result}`
        );
      }
    } catch (error) {
      console.error(
        'broadcast error:',
        error
      );

      throw error;
    }
  }

  // ============================================
  // WAIT FOR CHANNEL SUBSCRIPTION
  // ============================================

  private waitForSubscription(
    channel: RealtimeChannel
  ): Promise<void> {
    return new Promise<void>(
      (
        resolve,
        reject
      ) => {
        let settled = false;

        channel.subscribe(
          (
            status: string,
            error?: Error
          ): void => {
            if (settled) {
              return;
            }

            if (status === 'SUBSCRIBED') {
              settled = true;
              resolve();
              return;
            }

            if (
              status ===
                'CHANNEL_ERROR' ||
              status === 'TIMED_OUT'
            ) {
              settled = true;

              reject(
                error ??
                  new Error(
                    `Failed to subscribe: ${status}`
                  )
              );
            }
          }
        );
      }
    );
  }

  // ============================================
  // TRACK PRESENCE
  // ============================================

  trackPresence(
    channelName: string,
    state: unknown
  ): void {
    try {
      const channel =
        this.channels.get(channelName);

      if (!channel) {
        console.warn(
          `Channel does not exist: ${channelName}`
        );

        return;
      }

      void channel.track(state);
    } catch (error) {
      console.error(
        'trackPresence error:',
        error
      );
    }
  }

  // ============================================
  // UNTRACK PRESENCE
  // ============================================

  untrackPresence(
    channelName: string
  ): void {
    try {
      const channel =
        this.channels.get(channelName);

      if (channel) {
        void channel.untrack();
      }
    } catch (error) {
      console.error(
        'untrackPresence error:',
        error
      );
    }
  }

  // ============================================
  // GET PRESENCE STATE
  // ============================================

  getPresenceState(
    channelName: string
  ): RealtimePresenceState | null {
    try {
      const channel =
        this.channels.get(channelName);

      if (!channel) {
        return null;
      }

      return channel.presenceState() as RealtimePresenceState;
    } catch (error) {
      console.error(
        'getPresenceState error:',
        error
      );

      return null;
    }
  }

  // ============================================
  // PRESENCE CHANGE LISTENER
  // ============================================

  onPresenceChange(
    channelName: string,
    callback: (
      state: RealtimePresenceState
    ) => void
  ): () => void {
    try {
      let channel =
        this.channels.get(channelName);

      if (!channel) {
        channel =
          supabase.channel(channelName);

        this.channels.set(
          channelName,
          channel
        );
      }

      const listener =
        (): void => {
          const state =
            channel!.presenceState() as RealtimePresenceState;

          callback(state);
        };

      channel.on(
        'presence',
        { event: 'sync' },
        listener
      );

      const listeners =
        this.listeners.get(channelName) ?? [];

      listeners.push(callback);

      this.listeners.set(
        channelName,
        listeners
      );

      return (): void => {
        const current =
          this.listeners.get(channelName) ?? [];

        const filtered =
          current.filter(
            (item) => item !== callback
          );

        if (filtered.length === 0) {
          this.listeners.delete(
            channelName
          );
        } else {
          this.listeners.set(
            channelName,
            filtered
          );
        }
      };
    } catch (error) {
      console.error(
        'onPresenceChange error:',
        error
      );

      return (): void => {};
    }
  }

  // ============================================
  // UNSUBSCRIBE BROADCAST
  // ============================================

  private unsubscribe(
    channelName: string,
    subId: string
  ): void {
    try {
      const subscriptions =
        this.subscriptions.get(
          channelName
        ) ?? [];

      const filtered =
        subscriptions.filter(
          (subscription) =>
            subscription.id !== subId
        );

      if (filtered.length === 0) {
        this.subscriptions.delete(
          channelName
        );

        this.removeChannel(
          channelName
        );
      } else {
        this.subscriptions.set(
          channelName,
          filtered
        );
      }
    } catch (error) {
      console.error(
        'unsubscribe error:',
        error
      );
    }
  }

  // ============================================
  // UNSUBSCRIBE TABLE
  // ============================================

  private unsubscribeFromTable(
    channelName: string
  ): void {
    try {
      this.removeChannel(
        channelName
      );

      this.subscriptions.delete(
        channelName
      );
    } catch (error) {
      console.error(
        'unsubscribeFromTable error:',
        error
      );
    }
  }

  // ============================================
  // REMOVE CHANNEL
  // ============================================

  private removeChannel(
    channelName: string
  ): void {
    try {
      const channel =
        this.channels.get(channelName);

      if (channel) {
        void supabase.removeChannel(
          channel
        );

        this.channels.delete(
          channelName
        );
      }
    } catch (error) {
      console.error(
        'removeChannel error:',
        error
      );
    }
  }

  // ============================================
  // HANDLE PRESENCE UPDATE
  // ============================================

  private handlePresenceUpdate(
    channelName: string,
    state: unknown
  ): void {
    const listeners =
      this.listeners.get(channelName) ?? [];

    const presenceState =
      state as RealtimePresenceState;

    listeners.forEach(
      (callback) => {
        try {
          callback(
            presenceState
          );
        } catch (error) {
          console.error(
            'Presence listener error:',
            error
          );
        }
      }
    );
  }

  // ============================================
  // REMOVE ALL
  // ============================================

  removeAll(): void {
    try {
      const channelNames =
        Array.from(
          this.channels.keys()
        );

      for (const channelName of channelNames) {
        this.removeChannel(
          channelName
        );
      }

      this.channels.clear();
      this.subscriptions.clear();
      this.listeners.clear();
    } catch (error) {
      console.error(
        'removeAll error:',
        error
      );
    }
  }

  // ============================================
  // CHANNEL STATUS
  // ============================================

  getChannelStatus(
    channelName: string
  ): RealtimeChannelStatus | null {
    try {
      const channel =
        this.channels.get(channelName);

      if (!channel) {
        return null;
      }

      if (channel.joinedOnce) {
        return 'subscribed';
      }

      return 'closed';
    } catch (error) {
      console.error(
        'getChannelStatus error:',
        error
      );

      return null;
    }
  }

  // ============================================
  // CONNECTION CHECK
  // ============================================

  isConnected(
    channelName: string
  ): boolean {
    try {
      const channel =
        this.channels.get(channelName);

      return Boolean(
        channel?.joinedOnce
      );
    } catch (error) {
      console.error(
        'isConnected error:',
        error
      );

      return false;
    }
  }

  // ============================================
  // ACTIVE CHANNELS
  // ============================================

  getActiveChannels(): string[] {
    try {
      const activeChannels: string[] = [];

      for (const [
        name,
        channel,
      ] of this.channels) {
        if (channel.joinedOnce) {
          activeChannels.push(name);
        }
      }

      return activeChannels;
    } catch (error) {
      console.error(
        'getActiveChannels error:',
        error
      );

      return [];
    }
  }

  // ============================================
  // SUBSCRIPTION COUNT
  // ============================================

  getSubscriptionCount(): number {
    let total = 0;

    for (const subscriptions of this.subscriptions.values()) {
      total += subscriptions.length;
    }

    return total;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const realtime =
  RealtimeManager.getInstance();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const subscribeToUserPresence = (
  userIds: string[],
  callback: (
    presence: RealtimePresenceState
  ) => void
): (() => void) => {
  const channelName =
    `presence:${userIds.join(',')}`;

  return realtime.subscribe(
    channelName,
    'presence',
    (payload: unknown) => callback(payload as RealtimePresenceState),
    {
      presence: true,
    }
  );
};

export const subscribeToChat = (
  chatId: string,
  callback: (
    payload: unknown
  ) => void
): (() => void) => {
  const channelName =
    `chat:${chatId}`;

  return realtime.subscribe(
    channelName,
    'message',
    callback
  );
};

export const subscribeToNotifications = (
  userId: string,
  callback: (
    payload: unknown
  ) => void
): (() => void) => {
  const channelName =
    `notifications:${userId}`;

  return realtime.subscribe(
    channelName,
    'notification',
    callback
  );
};

export const subscribeToFeed = (
  userId: string,
  callback: (
    payload: unknown
  ) => void
): (() => void) => {
  const channelName =
    `feed:${userId}`;

  return realtime.subscribe(
    channelName,
    'feed',
    callback
  );
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default realtime;
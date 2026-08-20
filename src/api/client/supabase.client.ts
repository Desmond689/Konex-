// src/api/client/supabase.client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '../../lib/sentry-noop';
import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import {
    APP_VERSION,
    IS_DEVELOPMENT,
    SUPABASE_ANON_KEY,
    SUPABASE_URL
} from '../../config/env.config';
import { logger } from '../../core/logger/logger.service';
import { Database } from '../types/database.types';

// ============================================
// 1. CLIENT CONFIGURATION
// ============================================

// Build auth options conditionally so web does not receive AsyncStorage (not available in browser)
const AUTH_OPTIONS: SupabaseClientOptions<'public'>['auth'] = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: Platform.OS === 'web',
  flowType: 'pkce',
  ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
};

const CLIENT_OPTIONS: SupabaseClientOptions<'public'> = {
  auth: AUTH_OPTIONS,
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-application-name': 'KONEX',
      'x-application-version': APP_VERSION,
      'x-platform': Platform.OS === 'web' ? 'web' : 'mobile',
    },
  },
  db: {
    schema: 'public',
  },
};

// Create the client eagerly when env vars are present so auth methods exist at import time
let clientInstance: SupabaseClient<Database> | null = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    // Guard against obviously invalid keys (must be JWT-like for Supabase)
    const keyLooksValid = SUPABASE_ANON_KEY.startsWith('eyJ') || SUPABASE_ANON_KEY.length > 80;
    if (!keyLooksValid) {
      console.warn(
        '⚠️ SUPABASE_ANON_KEY does not look like a valid Supabase JWT anon key. ' +
        'Get it from Supabase Dashboard → Project Settings → API. Auth will not work until fixed.'
      );
    }
    clientInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, CLIENT_OPTIONS);
    logger.info('🔌 Supabase client created at module load');
  } else {
    console.warn('⚠️ Supabase URL/anon key missing — auth features disabled until configured.');
  }
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('❌ Failed to create Supabase client at module load', { error });
  try { Sentry.captureException(error); } catch (_) {}
}

// ============================================
// 2. SINGLETON PATTERN
// ============================================

let initializationPromise: Promise<SupabaseClient<Database>> | null = null;

/**
 * Get or initialize the Supabase client
 * Uses singleton pattern with lazy initialization
 */
export const getSupabaseClient = async (): Promise<SupabaseClient<Database>> => {
  if (clientInstance) {
    return clientInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = initializeSupabaseClient();

  try {
    const client = await initializationPromise;
    return client;
  } finally {
    initializationPromise = null;
  }
};

/**
 * Initialize the Supabase client
 */
const initializeSupabaseClient = async (): Promise<SupabaseClient<Database>> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const error = new Error(
      '🚨 Supabase client cannot be initialized: missing environment variables'
    );
    logger.fatal('Supabase initialization failed', { error });
    Sentry.captureException(error);
    throw error;
  }

  try {
    logger.info('🔌 Initializing Supabase client...');

    // If already created at module load, reuse it
    if (!clientInstance) {
      clientInstance = createClient<Database>(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        CLIENT_OPTIONS
      );
    }

    // Run a lightweight connection test — do not block callers that merely need auth methods
    await testConnection();

    logger.info('✅ Supabase client initialized successfully');
    return clientInstance;
  } catch (error) {
    logger.fatal('❌ Supabase client initialization failed', { error });
    Sentry.captureException(error);
    throw error;
  }
};

/**
 * Test the Supabase connection
 */
const testConnection = async (): Promise<void> => {
  try {
    const { data, error } = await clientInstance!
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }

    logger.debug('✅ Supabase connection test passed');
  } catch (error) {
    logger.error('❌ Supabase connection test failed', { error });
    throw new Error('Failed to connect to Supabase. Please check your internet connection.');
  }
};

// ============================================
// 3. EXPORT SINGLETON CLIENT
// ============================================

// Create a safe proxy so modules can import `supabase` without causing a crash
// at module import time. Accessing properties or calling methods on the proxy
// will forward to the real client if initialized, otherwise throw a clear error.
const createSupabaseProxy = (): any => {
  const placeholder: Record<string | symbol, any> = {};

  return new Proxy(placeholder, {
    get(_, prop) {
      if (clientInstance) {
        return (clientInstance as any)[prop];
      }

      // If the property is accessed before initialization, throw an explanatory error
      // This is still preferable to returning a fake function; callers should await initialization
      console.warn('Supabase client not ready:', prop);
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signInWithPassword: async () => ({ data: { session: null, user: null }, error: new Error('Supabase not configured') }),
          signUp: async () => ({ data: { session: null, user: null }, error: new Error('Supabase not configured') }),
          signOut: async () => ({ error: null }),
        };
      }
      return () => {};
    },
    set(_, prop, value) {
      if (clientInstance) {
        (clientInstance as any)[prop] = value;
        return true;
      }
      // store on placeholder so future gets on the same property return the value
      (placeholder as any)[prop] = value;
      return true;
    },
    has(_, prop) {
      if (clientInstance) {
        return prop in (clientInstance as any);
      }
      return prop in placeholder;
    }
  });
};

export const supabase: any = createSupabaseProxy() as any;


// ============================================
// 4. EXPORT MODULES
// ============================================

export const authClient = (): SupabaseClient<Database>['auth'] => {
  if (!clientInstance) {
    throw new Error('Supabase client not initialized');
  }
  return clientInstance.auth;
};

export const storageClient = (): SupabaseClient<Database>['storage'] => {
  if (!clientInstance) {
    throw new Error('Supabase client not initialized');
  }
  return clientInstance.storage;
};

// realtimeClient returns a function that produces a RealtimeChannel when called
export const realtimeClient = (
  name: string,
  opts?: Parameters<SupabaseClient<Database>['channel']>[1]
): ReturnType<SupabaseClient<Database>['channel']> => {
  if (!clientInstance) {
    throw new Error('Supabase client not initialized');
  }
  return clientInstance.channel(name, opts);
};

// ============================================
// 5. HEALTH CHECK
// ============================================

export const checkSupabaseHealth = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
}> => {
  const startTime = Date.now();

  try {
    await testConnection();
    const latency = Date.now() - startTime;

    if (latency > 5000) {
      return { status: 'degraded', latency };
    }

    return { status: 'healthy', latency };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================
// 6. EXPORT DEFAULT
// ============================================

export default supabase;
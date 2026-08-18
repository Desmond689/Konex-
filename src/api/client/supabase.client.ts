// src/api/client/supabase.client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
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

const CLIENT_OPTIONS: SupabaseClientOptions<'public'> = {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-application-name': 'KONEX',
      'x-application-version': APP_VERSION,
      'x-platform': 'mobile',
    },
  },
  db: {
    schema: 'public',
  },
};

// ============================================
// 2. SINGLETON PATTERN
// ============================================

let clientInstance: SupabaseClient<Database> | null = null;
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

    clientInstance = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      CLIENT_OPTIONS
    );

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

export const supabase: SupabaseClient<Database> = (() => {
  if (!clientInstance) {
    if (IS_DEVELOPMENT) {
      console.warn('⚠️ Supabase client not initialized yet. Use getSupabaseClient() for async initialization.');
    }
  }
  return clientInstance as SupabaseClient<Database>;
})();

// ============================================
// 4. EXPORT MODULES
// ============================================

export const authClient = (): ReturnType<typeof supabase.auth> => {
  if (!clientInstance) {
    throw new Error('Supabase client not initialized');
  }
  return clientInstance.auth;
};

export const storageClient = (): ReturnType<typeof supabase.storage> => {
  if (!clientInstance) {
    throw new Error('Supabase client not initialized');
  }
  return clientInstance.storage;
};

export const realtimeClient = (): ReturnType<typeof supabase.channel> => {
  if (!clientInstance) {
    throw new Error('Supabase client not initialized');
  }
  return clientInstance.channel;
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
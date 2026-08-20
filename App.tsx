/**
 * KONEX App
 * Billion Dollar Code - Production Ready
 *
 * Root application component with providers, navigation, and initialization
 */

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/molecules/ErrorBoundary';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navigation
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';

// Providers
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/providers/AppProvider';
import { ToastProvider } from './src/providers/ToastProvider';

// Store
import { useAuthStore } from './src/store/authStore';
import { useNotificationStore } from './src/store/notificationStore';
import { useUserStore } from './src/store/userStore';

// API
import { supabase } from './src/api/client/supabase.client';
import { userService } from './src/api/services/user.service';

// Core
import { logger } from './src/core/logger/logger.service';
import { initializeAnalytics } from './src/utils/analytics';
import { handleDeepLink } from './src/utils/deepLink';

// Config
import {
  APP_VERSION,
  FEATURES,
} from './src/config/env';

// ============================================
// 1. REACT QUERY CLIENT
// ============================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404 or 403
        if (error instanceof Error) {
          if (
            error.message.includes('404') ||
            error.message.includes('403')
          ) {
            return false;
          }
        }

        return failureCount < 3;
      },

      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),

      // 5 minutes
      staleTime: 1000 * 60 * 5,

      // 30 minutes
      gcTime: 1000 * 60 * 30,

      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
    },

    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

// ============================================
// 2. APP CONTENT
// ============================================

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    setAuth,
    clearAuth,
    setLoading: setAuthLoading,
    isLoading: authLoading,
  } = useAuthStore();

  const {
    setProfile,
    clear: clearUser,
  } = useUserStore();

  const {
    initializeNotifications,
  } = useNotificationStore();

  // Local loading state for app initialization
  const [isAppLoading, setIsAppLoading] = useState(true);

  // ============================================
  // APP INITIALIZATION
  // ============================================

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        logger.info('🚀 Initializing KONEX', {
          version: APP_VERSION,
        });

        // ========================================
        // CHECK EXISTING SUPABASE SESSION
        // ========================================

        // Timeout so a hung network/auth never leaves the UI blank
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('getSession timeout')), 8000)
          ),
        ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;

        const session = sessionResult?.data?.session ?? null;
        const sessionError = sessionResult?.error ?? null;

        if (sessionError) {
          logger.error(
            '❌ Failed to get Supabase session',
            {
              error: sessionError,
            }
          );

          if (isMounted) {
            clearAuth();
            clearUser();
          }

          return;
        }

        // ========================================
        // EXISTING SESSION
        // ========================================

        if (session?.user) {
          logger.info('✅ Found existing session', {
            userId: session.user.id,
          });

          if (!isMounted) {
            return;
          }

          // Set authentication state
          setAuth(session);

          // ======================================
          // FETCH USER PROFILE
          // ======================================

          try {
            const userProfile =
              await userService.getProfile(
                session.user.id
              );

            if (!isMounted) {
              return;
            }

            if (userProfile) {
              setProfile(userProfile as any);

              // ==================================
              // REALTIME
              // ==================================

              if (FEATURES.enableRealtime) {
                logger.info(
                  '📡 Realtime enabled'
                );
              }

              // ==================================
              // PUSH NOTIFICATIONS
              // ==================================

              if (
                FEATURES.enablePushNotifications
              ) {
                try {
                  await initializeNotifications();

                  logger.info(
                    '🔔 Push notifications initialized'
                  );
                } catch (notificationError) {
                  logger.error(
                    '⚠️ Failed to initialize notifications',
                    {
                      error: notificationError,
                    }
                  );
                }
              }

              // ==================================
              // ANALYTICS
              // ==================================

              try {
                await initializeAnalytics(
                  userProfile.id
                );

                logger.info(
                  '📊 Analytics initialized'
                );
              } catch (analyticsError) {
                logger.error(
                  '⚠️ Failed to initialize analytics',
                  {
                    error: analyticsError,
                  }
                );
              }
            } else {
              logger.error(
                '❌ User profile was not found',
                {
                  userId: session.user.id,
                }
              );
            }
          } catch (profileError) {
            logger.error(
              '❌ Failed to fetch user profile',
              {
                error: profileError,
              }
            );
          }
        }

        // ========================================
        // NO ACTIVE SESSION
        // ========================================

        else {
          logger.info(
            'ℹ️ No active session found'
          );

          if (isMounted) {
            clearAuth();
            clearUser();
          }
        }

        logger.info(
          '✅ App initialization complete'
        );
      } catch (error) {
        logger.error(
          '❌ App initialization failed',
          {
            error,
          }
        );

        if (isMounted) {
          clearAuth();
          clearUser();
        }
      } finally {
        if (isMounted) {
          setIsAppLoading(false);
          setAuthLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, setProfile, clearUser, initializeNotifications]);

  // ============================================
  // DEEP LINK HANDLING
  // ============================================

  useEffect(() => {
    const handleDeepLinkEvent = (url: string) => {
      logger.info('🔗 Deep link received', {
        url,
      });

      try {
        handleDeepLink(
          url,
          navigationRef
        );
      } catch (error) {
        logger.error(
          '❌ Failed to handle deep link',
          {
            error,
            url,
          }
        );
      }
    };

    /*
     * Deep-link listener can be enabled here when
     * React Native Linking integration is required.
     *
     * Example:
     *
     * const subscription = Linking.addEventListener(
     *   'url',
     *   ({ url }) => handleDeepLinkEvent(url)
     * );
     *
     * return () => subscription.remove();
     */

    // No cleanup necessary for deep-link listener since none is registered.
    // Return undefined to avoid holding references.
    return;
  }, []);

  // ============================================
  // LOADING STATE
  // ============================================

  // Show loading if either auth is loading OR app is initializing
  if (authLoading || isAppLoading) {
    // Show a simple loading shell so web is not blank and native is not stuck.
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="light" />
      </GestureHandlerRootView>
    );
  }

  // ============================================
  // MAIN APP
  // ============================================

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
    >
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style="auto" />

          <AppNavigator />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// ============================================
// 3. ROOT APP
// ============================================

const RootApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// ============================================
// 4. EXPORT
// ============================================

export default RootApp;
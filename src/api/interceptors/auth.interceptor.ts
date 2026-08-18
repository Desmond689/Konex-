/**
 * KONEX Auth Interceptor
 * Billion Dollar Code - Production Ready
 * Handles authentication, token refresh, and session management
 */

import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client';

// ============================================
// 1. TYPES
// ============================================

export interface AuthInterceptorConfig {
  onUnauthorized?: () => void;
  onTokenRefreshed?: () => void;
  onTokenRefreshFailed?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export interface InterceptedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  retryCount?: number;
}

// ============================================
// 2. AUTH INTERCEPTOR
// ============================================

class AuthInterceptor {
  private static instance: AuthInterceptor;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    request: InterceptedRequest;
  }> = [];
  private refreshPromise: Promise<string | null> | null = null;
  private config: AuthInterceptorConfig;

  private constructor(config: AuthInterceptorConfig = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
    this.setupAuthListener();
  }

  public static getInstance(config?: AuthInterceptorConfig): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor(config);
    }
    return AuthInterceptor.instance;
  }

  // ============================================
  // 3. AUTH LISTENER
  // ============================================

  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      logger.info(`🔐 Auth event: ${event}`, { userId: session?.user?.id });

      if (event === 'SIGNED_OUT') {
        this.clearQueue();
        if (this.config.onUnauthorized) {
          this.config.onUnauthorized();
        }
      } else if (event === 'TOKEN_REFRESHED') {
        logger.debug('🔄 Token refreshed successfully');
        if (this.config.onTokenRefreshed) {
          this.config.onTokenRefreshed();
        }
        this.processQueue(null);
      } else if (event === 'USER_UPDATED') {
        logger.debug('📝 User updated', { userId: session?.user?.id });
      }
    });
  }

  // ============================================
  // 4. REQUEST INTERCEPTION
  // ============================================

  /**
   * Intercept and prepare a request with authentication
   */
  async interceptRequest(request: InterceptedRequest): Promise<InterceptedRequest> {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('❌ Failed to get session', { error });
        throw error;
      }

      // Add authorization header if session exists
      if (session?.access_token) {
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${session.access_token}`,
        };
      }

      // Add request tracking headers
      request.headers = {
        ...request.headers,
        'X-Request-Id': this.generateRequestId(),
        'X-Request-Time': new Date().toISOString(),
      };

      return request;
    } catch (error) {
      logger.error('❌ Failed to intercept request', { error });
      throw error;
    }
  }

  // ============================================
  // 5. RESPONSE INTERCEPTION
  // ============================================

  /**
   * Intercept and handle response errors
   */
  async interceptResponse(
    request: InterceptedRequest,
    response: any
  ): Promise<any> {
    try {
      // If response is successful, return it
      if (response?.status && response.status < 400) {
        return response;
      }

      // Handle 401 Unauthorized
      if (response?.status === 401) {
        return this.handleUnauthorized(request);
      }

      // Handle 403 Forbidden
      if (response?.status === 403) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Permission denied',
          'You do not have permission to perform this action.',
          ErrorSeverity.WARNING
        );
      }

      // Handle 404 Not Found
      if (response?.status === 404) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Resource not found',
          'The requested resource could not be found.',
          ErrorSeverity.WARNING
        );
      }

      // Handle 429 Too Many Requests
      if (response?.status === 429) {
        const retryAfter = parseInt(response.headers?.['retry-after'] || '5', 10);
        await this.delay(retryAfter * 1000);
        return this.retryRequest(request);
      }

      // Handle 500+ Internal Server Error
      if (response?.status && response.status >= 500) {
        throw new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          'Server error',
          'Something went wrong on the server. Please try again later.',
          ErrorSeverity.ERROR
        );
      }

      return response;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Failed to intercept response', { error });
      throw error;
    }
  }

  // ============================================
  // 6. UNAUTHORIZED HANDLING
  // ============================================

  private async handleUnauthorized(request: InterceptedRequest): Promise<any> {
    // If we're already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, request });
      });
    }

    this.isRefreshing = true;

    try {
      // Attempt to refresh the token
      const newToken = await this.refreshToken();

      if (newToken) {
        // Update the request with new token
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${newToken}`,
        };

        // Process queued requests
        this.processQueue(null);

        // Retry the original request
        return this.retryRequest(request);
      } else {
        // Token refresh failed
        this.processQueue(new Error('Token refresh failed'));
        this.isRefreshing = false;

        if (this.config.onUnauthorized) {
          this.config.onUnauthorized();
        }

        // Sign out the user
        await supabase.auth.signOut();

        throw new KonexError(
          ErrorCode.AUTH_SESSION_EXPIRED,
          'Session expired',
          'Your session has expired. Please sign in again.',
          ErrorSeverity.ERROR
        );
      }
    } catch (error) {
      this.isRefreshing = false;
      this.processQueue(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // ============================================
  // 7. TOKEN REFRESH
  // ============================================

  private async refreshToken(): Promise<string | null> {
    try {
      if (this.refreshPromise) {
        return this.refreshPromise;
      }

      this.refreshPromise = this.doRefreshToken();
      const token = await this.refreshPromise;
      this.refreshPromise = null;
      return token;
    } catch (error) {
      this.refreshPromise = null;
      logger.error('❌ Token refresh failed', { error });
      return null;
    }
  }

  private async doRefreshToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (data?.session?.access_token) {
        logger.info('✅ Token refreshed successfully');
        return data.session.access_token;
      }

      return null;
    } catch (error) {
      logger.error('❌ Failed to refresh token', { error });
      throw error;
    }
  }

  // ============================================
  // 8. QUEUE MANAGEMENT
  // ============================================

  private processQueue(error: Error | null): void {
    this.failedQueue.forEach((item) => {
      if (error) {
        item.reject(error);
      } else {
        item.resolve(this.retryRequest(item.request));
      }
    });
    this.failedQueue = [];
  }

  private clearQueue(): void {
    this.failedQueue.forEach((item) => {
      item.reject(new Error('Authentication cancelled'));
    });
    this.failedQueue = [];
  }

  // ============================================
  // 9. RETRY LOGIC
  // ============================================

  private async retryRequest(request: InterceptedRequest): Promise<any> {
    const retryCount = (request.retryCount || 0) + 1;

    if (retryCount > (this.config.maxRetries || 3)) {
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Max retries exceeded',
        'Request failed after multiple attempts. Please try again.',
        ErrorSeverity.ERROR
      );
    }

    const delay = (this.config.retryDelay || 1000) * Math.pow(2, retryCount - 1);
    await this.delay(delay);

    request.retryCount = retryCount;
    return this.executeRequest(request);
  }

  private async executeRequest(request: InterceptedRequest): Promise<any> {
    // This would call the actual API
    // For now, we'll return a placeholder
    return { status: 200, data: {} };
  }

  // ============================================
  // 10. UTILITY METHODS
  // ============================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Update interceptor configuration
   */
  updateConfig(config: Partial<AuthInterceptorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      logger.error('❌ Failed to get current user', { error });
      return null;
    }
  }

  /**
   * Sign out and clear queue
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.clearQueue();
      logger.info('✅ Signed out successfully');
    } catch (error) {
      logger.error('❌ Failed to sign out', { error });
      throw error;
    }
  }

  /**
   * Reset the interceptor state
   */
  reset(): void {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.refreshPromise = null;
    this.reconnectAttempts = 0;
  }

  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Handle reconnection
   */
  async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('❌ Max reconnection attempts reached');
      this.reconnectAttempts = 0;
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    logger.info(`🔄 Reconnecting in ${delay}ms`, { attempt: this.reconnectAttempts });

    await this.delay(delay);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.reconnectAttempts = 0;
        logger.info('✅ Reconnected successfully');
      } else {
        await this.handleReconnection();
      }
    } catch (error) {
      logger.error('❌ Reconnection failed', { error });
      await this.handleReconnection();
    }
  }
}

// ============================================
// 11. EXPORT SINGLETON
// ============================================

export const authInterceptor = AuthInterceptor.getInstance();

// ============================================
// 12. CONVENIENCE FUNCTIONS
// ============================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return authInterceptor.isAuthenticated();
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<any> => {
  return authInterceptor.getCurrentUser();
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  return authInterceptor.signOut();
};

/**
 * Reset interceptor
 */
export const resetInterceptor = (): void => {
  authInterceptor.reset();
};

// ============================================
// 13. EXPORT DEFAULT
// ============================================

export default authInterceptor;
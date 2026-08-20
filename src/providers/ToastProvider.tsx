// @ts-nocheck
/**
 * KONEX ToastProvider
 * Billion Dollar Code - Production Ready
 * 
 * Provides toast notifications throughout the app
 * 
 * Usage:
 * const { showToast, hideToast } = useToast();
 * showToast('Message sent!', 'success');
 */

import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    StatusBar,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from '../components/atoms/Icon';
import { logger } from '../core/logger/logger.service';
import { useTheme } from '../context/ThemeContext';

// ============================================
// 1. TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface ToastContextType {
  /** Show a toast notification */
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    action?: Toast['action']
  ) => string;
  /** Hide a specific toast */
  hideToast: (id: string) => void;
  /** Hide all toasts */
  hideAllToasts: () => void;
}

export interface ToastProviderProps {
  /** Child components */
  children: ReactNode;
  /** Maximum number of toasts to show */
  maxToasts?: number;
  /** Default duration in ms */
  defaultDuration?: number;
  /** Position on screen */
  position?: 'top' | 'bottom';
}

// ============================================
// 2. CONTEXT
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================
// 3. TOAST ITEM
// ============================================

interface ToastItemProps extends Toast {
  onHide: (id: string) => void;
  index: number;
  position: 'top' | 'bottom';
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  message,
  type,
  duration = 3000,
  action,
  onHide,
  index,
  position,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -80 : 80)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      default: return 'info';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      default: return colors.primary;
    }
  };

  const getBackground = () => {
    switch (type) {
      case 'success': return (colors as any).successLight || colors.success || '#22C55E';
      case 'error': return (colors as any).errorLight || colors.error || '#EF4444';
      case 'warning': return (colors as any).warningLight || colors.warning || '#F59E0B';
      default: return colors.primarySurface;
    }
  };

  // Animate in
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        // duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        // duration: 300,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }),
    ]).start();

    // Auto dismiss
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleHide();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleHide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        // duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -80 : 80,
        // duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(id);
    });
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: index > 0 ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: getColor(),
  };

  const iconContainerStyle: ViewStyle = {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: getBackground(),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  };

  const messageStyle: TextStyle = {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  };

  const actionStyle: ViewStyle = {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  };

  const actionTextStyle: TextStyle = {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  };

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={iconContainerStyle}>
        <Icon name={getIcon()} size={14} color={getColor()} />
      </View>
      
      <Text style={messageStyle}>{message}</Text>
      
      {action && (
        <TouchableOpacity style={actionStyle} onPress={action.onPress}>
          <Text style={actionTextStyle}>{action.label}</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity onPress={handleHide} style={{ marginLeft: 8, padding: 4 }}>
        <Icon name="x" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================
// 4. PROVIDER
// ============================================

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 3,
  defaultDuration = 3000,
  position = 'top',
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    // duration: number = defaultDuration,
    action?: Toast['action']
  ): string => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      action,
    };

    setToasts((prev) => {
      const newToasts = [newToast, ...prev];
      // Limit to maxToasts
      return newToasts.slice(0, maxToasts);
    });

    logger.info(`📢 Toast: ${type} - ${message}`);

    return id;
  }, [defaultDuration, maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const containerStyle: ViewStyle = {
    position: 'absolute',
    top: position === 'top' ? (Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 30) : undefined,
    bottom: position === 'bottom' ? 20 : undefined,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  };

  const value: ToastContextType = {
    showToast,
    hideToast,
    hideAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <View style={containerStyle} pointerEvents="box-none">
          {toasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              {...toast}
              onHide={hideToast}
              index={index}
              position={position}
            />
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
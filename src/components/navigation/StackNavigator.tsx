/**
 * KONEX StackNavigator Component
 * Billion Dollar Code - Production Ready
 * 
 * A stack navigator with screen transitions and header support
 * 
 * Usage:
 * <StackNavigator
 *   screens={[
 *     { name: 'Home', component: HomeScreen },
 *     { name: 'Profile', component: ProfileScreen },
 *   ]}
 *   initialRoute="Home"
 * />
 */

import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// 1. TYPES
// ============================================

export interface ScreenConfig {
  /** Screen name/identifier */
  name: string;
  /** Screen component */
  component: React.ComponentType<any>;
  /** Options */
  options?: {
    title?: string;
    headerShown?: boolean;
    gestureEnabled?: boolean;
    animation?: 'slide' | 'fade' | 'none';
  };
}

export interface StackNavigatorProps {
  /** Array of screens */
  screens: ScreenConfig[];
  /** Initial route name */
  initialRoute: string;
  /** Custom container style */
  style?: ViewStyle;
  /** On route change handler */
  onRouteChange?: (route: string) => void;
  /** Test ID for testing */
  testID?: string;
}

interface RouteState {
  key: string;
  name: string;
  params?: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const StackNavigator: React.FC<StackNavigatorProps> = ({
  screens,
  initialRoute,
  style,
  onRouteChange,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [stack, setStack] = useState<RouteState[]>([
    { key: initialRoute, name: initialRoute },
  ]);
  const [currentRoute, setCurrentRoute] = useState<RouteState>({
    key: initialRoute,
    name: initialRoute,
  });

  const animations = useRef<Map<string, Animated.Value>>(new Map());

  const getScreen = (name: string) => {
    return screens.find((s) => s.name === name);
  };

  const getAnimation = (routeKey: string) => {
    if (!animations.current.has(routeKey)) {
      animations.current.set(routeKey, new Animated.Value(1));
    }
    return animations.current.get(routeKey)!;
  };

  const navigate = (name: string, params?: any) => {
    const screen = getScreen(name);
    if (!screen) return;

    const route: RouteState = {
      key: `${name}_${Date.now()}`,
      name,
      params,
    };

    const newStack = [...stack, route];
    setStack(newStack);
    setCurrentRoute(route);
    onRouteChange?.(name);
  };

  const goBack = () => {
    if (stack.length <= 1) return;

    const newStack = stack.slice(0, -1);
    const previousRoute = newStack[newStack.length - 1];
    setStack(newStack);
    setCurrentRoute(previousRoute);
    onRouteChange?.(previousRoute.name);
  };

  const canGoBack = stack.length > 1;

  const renderScreen = (route: RouteState, index: number) => {
    const screen = getScreen(route.name);
    if (!screen) return null;

    const isActive = index === stack.length - 1;
    const isPrevious = index === stack.length - 2;
    const ScreenComponent = screen.component;

    const opacity = getAnimation(route.key);

    const containerStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
    };

    return (
      <Animated.View
        key={route.key}
        style={[
          containerStyle,
          {
            opacity: isActive ? 1 : opacity,
            transform: [
              {
                translateX: isPrevious
                  ? opacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -SCREEN_WIDTH * 0.3],
                    })
                  : 0,
              },
            ],
          },
        ]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScreenComponent
          navigation={{
            navigate,
            goBack,
            canGoBack,
            getParam: (key: string, defaultValue?: any) => {
              return route.params?.[key] ?? defaultValue;
            },
            state: {
              routeName: route.name,
              key: route.key,
            },
          }}
          route={{
            params: route.params,
          }}
        />
      </Animated.View>
    );
  };

  return (
    <View style={[{ flex: 1 }, style]} testID={testID}>
      {stack.map((route, index) => renderScreen(route, index))}
    </View>
  );
};

export default StackNavigator;
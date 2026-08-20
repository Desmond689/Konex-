// Type augmentations to pragmatically reduce noisy type errors from React Native and Animated
// This file intentionally relaxes a few types used widely across the codebase to allow
// practical, incremental fixes to the application's TypeScript migration.

import "react-native";

declare module "react-native" {
  // Allow Image style to be any to avoid mismatches where ViewStyle is passed in places
  // where the project sometimes uses shared style objects for both View and Image.
  interface ImageProps {
    style?: any;
  }

  // Allow an extended set for Modal animationType (some components use a custom 'scale')
  interface ModalProps {
    animationType?: any;
  }
}

// Loosen Animated.Value interpolate return type so Animated values can be used in styles
declare module "react-native" {
  namespace Animated {
    interface Value {
      interpolate: (...args: any[]) => any;
    }

    interface AnimatedInterpolation<T = any> {}
  }
}

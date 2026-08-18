/**
 * KONEX AppProvider
 * Root app context for global app state and initialization
 */

import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { APP_VERSION, APP_ENVIRONMENT, FEATURES } from '../config/env';

interface AppContextValue {
  version: string;
  environment: string;
  features: typeof FEATURES;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useMemo(
    () => ({
      version: APP_VERSION,
      environment: APP_ENVIRONMENT,
      features: FEATURES,
    }),
    []
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

export default AppProvider;

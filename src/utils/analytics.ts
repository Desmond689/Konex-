export async function initializeAnalytics(userId?: string): Promise<void> {
  // Placeholder for Segment / analytics init
  if (__DEV__) {
    console.log('[analytics] init', userId);
  }
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (__DEV__) {
    console.log('[analytics]', name, properties);
  }
}

// Mock for web crypto
/**
 * KONEX Crypto Mock for Web
 * Production Ready
 * 
 * Mock for crypto module when running on web
 */

export default {};

// Export common crypto methods for compatibility
export const randomBytes = () => Buffer.from('mock-random-bytes');
export const createHash = () => ({
  update: () => ({ digest: () => 'mock-hash' }),
});
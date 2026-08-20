/**
 * KONEX Lib - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * Central export for all library utilities
 */

export * from './analytics';
export * from './imagePicker';
export * from './pushNotifications';
export * from './sentry';
export * from './storage';
export * from './videoPlayer';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  // Analytics
  initializeAnalytics: require('./analytics').initializeAnalytics,
  trackEvent: require('./analytics').trackEvent,
  trackScreen: require('./analytics').trackScreen,
  identifyUser: require('./analytics').identifyUser,
  resetUser: require('./analytics').resetUser,
  
  // Image Picker
  pickImage: require('./imagePicker').pickImage,
  takePhoto: require('./imagePicker').takePhoto,
  pickVideo: require('./imagePicker').pickVideo,
  
  // Push Notifications
  registerForPushNotifications: require('./pushNotifications').registerForPushNotifications,
  sendNotification: require('./pushNotifications').sendNotification,
  scheduleNotification: require('./pushNotifications').scheduleNotification,
  
  // Sentry
  initializeSentry: require('./sentry').initializeSentry,
  captureException: require('./sentry').captureException,
  captureMessage: require('./sentry').captureMessage,
  setUser: require('./sentry').setUser,
  
  // Storage
  saveFile: require('./storage').saveFile,
  getFile: require('./storage').getFile,
  deleteFile: require('./storage').deleteFile,
  clearCache: require('./storage').clearCache,
  
  // Video Player
  useVideoPlayer: require('./videoPlayer').useVideoPlayer,
  VideoPlayer: require('./videoPlayer').VideoPlayer,
};
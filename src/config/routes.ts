// src/config/routes.ts
export const ROUTES = {
  // Auth
  AUTH: {
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    ONBOARDING: 'Onboarding',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
  },

  // Main Tabs
  MAIN: {
    HOME: 'Home',
    CHAT: 'Chat',
    SQUADS: 'Squads',
    PROFILE: 'Profile',
  },

  // Home
  HOME: {
    FEED: 'Feed',
    COMMUNITY: 'Community',
  },

  // Community
  COMMUNITY: {
    MAIN: 'CommunityMain',
    POSTS: 'CommunityPosts',
    SQUADS: 'CommunitySquads',
    LFG: 'CommunityLFG',
    TOURNAMENTS: 'CommunityTournaments',
    MEMBERS: 'CommunityMembers',
  },

  // Chat
  CHAT: {
    LIST: 'ChatList',
    DM: 'DM',
    SQUAD: 'SquadChat',
    DETAILS: 'ChatDetails',
  },

  // Squads
  SQUADS: {
    LIST: 'SquadList',
    DETAIL: 'SquadDetail',
    CREATE: 'SquadCreate',
    SETTINGS: 'SquadSettings',
    MEMBERS: 'SquadMembers',
    INVITE: 'SquadInvite',
    REQUESTS: 'SquadRequests',
  },

  // Profile
  PROFILE: {
    MAIN: 'ProfileMain',
    EDIT: 'EditProfile',
    BADGES: 'Badges',
    PRIVACY: 'PrivacySettings',
    ACCOUNT: 'AccountSettings',
    FRIENDS: 'Friends',
    FOLLOWERS: 'Followers',
    FOLLOWING: 'Following',
  },

  // LFG
  LFG: {
    MAIN: 'LFGMain',
    CREATE: 'LFGCreate',
    DETAIL: 'LFGDetail',
  },

  // Tournaments
  TOURNAMENTS: {
    MAIN: 'TournamentMain',
    CREATE: 'TournamentCreate',
    DETAIL: 'TournamentDetail',
    REGISTER: 'TournamentRegister',
  },

  // Notifications
  NOTIFICATIONS: {
    MAIN: 'Notifications',
  },

  // Search
  SEARCH: {
    MAIN: 'Search',
  },

  // Stories
  STORIES: {
    VIEW: 'StoryView',
    CREATE: 'StoryCreate',
  },

  // Admin
  ADMIN: {
    DASHBOARD: 'AdminDashboard',
    REPORTS: 'AdminReports',
    USERS: 'AdminUsers',
    SQUADS: 'AdminSquads',
    APPEALS: 'AdminAppeals',
    LOGS: 'AdminLogs',
    ANNOUNCEMENTS: 'AdminAnnouncements',
    SETTINGS: 'AdminSettings',
  },

  // Moderation
  MODERATION: {
    QUEUE: 'ModerationQueue',
  },
};
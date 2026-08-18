/**
 * KONEX static assets
 * - images: brand + empty/onboarding/feature/system art
 * - icons: user-provided PNGs (original filenames preserved)
 */

export const images = {
  // Brand
  logo: require('./images/logo.png'),
  wordmark: require('./images/wordmark.png'),

  // Empty states
  emptyFeed: require('./images/empty-feed.png'),
  emptyChat: require('./images/empty-chat.png'),
  emptyNotifications: require('./images/empty-notifications.png'),
  emptySquads: require('./images/empty-squads.png'),
  emptyCommunities: require('./images/empty-communities.png'),
  emptyFriends: require('./images/empty-friends.png'),
  emptySearch: require('./images/empty-search.png'),
  emptyLfg: require('./images/empty-lfg.png'),
  emptyTournaments: require('./images/empty-tournaments.png'),
  emptyStories: require('./images/empty-stories.png'),
  emptyCalls: require('./images/empty-calls.png'),

  // Onboarding
  onboarding1: require('./images/onboarding-1.png'),
  onboarding2: require('./images/onboarding-2.png'),
  onboarding3: require('./images/onboarding-3.png'),

  // Feature
  featureSquads: require('./images/feature-squads.png'),
  featureChat: require('./images/feature-chat.png'),
  featureLfg: require('./images/feature-lfg.png'),
  featureTournaments: require('./images/feature-tournaments.png'),
  featureStories: require('./images/feature-stories.png'),

  // System
  contentRemoved: require('./images/content-removed.png'),
  userSuspended: require('./images/user-suspended.png'),
  maintenance: require('./images/maintenance.png'),
} as const;

/**
 * Semantic icon map → actual files you provided
 */
export const icons = {
  // Social / feed
  iconLike: require('./icons/heart.png'),
  iconComment: require('./icons/message-circle.png'),
  iconShare: require('./icons/share-2.png'),
  iconSave: require('./icons/save.png'),
  iconMore: require('./icons/ellipsis-vertical.png'),

  // Media
  iconPlay: require('./icons/play.png'),
  iconPause: require('./icons/pause.png'),
  iconMute: require('./icons/volume-off.png'),
  iconUnmute: require('./icons/volume.png'),
  iconPhoto: require('./icons/image.png'),
  iconVideo: require('./icons/video.png'),
  iconCamera: require('./icons/camera.png'),

  // Chat / calls
  iconSend: require('./icons/send.png'),
  iconCall: require('./icons/phone.png'),
  iconMic: require('./icons/mic.png'),
  iconSpeaker: require('./icons/speaker.png'),

  // Nav / chrome
  iconBack: require('./icons/move-left.png'),
  iconClose: require('./icons/x.png'),
  iconSearch: require('./icons/search.png'),
  iconBell: require('./icons/bell.png'),
  iconSettings: require('./icons/settings.png'),
  iconAdd: require('./icons/plus.png'),
  iconEdit: require('./icons/square-pen.png'),
  iconCheck: require('./icons/check.png'),
  iconError: require('./icons/circle-x.png'),
  iconWarning: require('./icons/triangle-alert.png'),

  // Social graph
  iconFollow: require('./icons/user-round-plus.png'),
  iconFriend: require('./icons/handshake.png'),
  iconBlock: require('./icons/shield.png'),
  iconReport: require('./icons/flag.png'),

  // Product
  iconSquad: require('./icons/shield.png'),
  iconCommunity: require('./icons/land-plot.png'),
  iconGame: require('./icons/gamepad-2.png'),
  iconTrophy: require('./icons/trophy.png'),
  iconLfg: require('./icons/user-round-plus.png'),
  iconStory: require('./icons/book-open.png'),

  // Extra raw keys (same files, alternate names)
  heart: require('./icons/heart.png'),
  messageCircle: require('./icons/message-circle.png'),
  share2: require('./icons/share-2.png'),
  gamepad2: require('./icons/gamepad-2.png'),
  landPlot: require('./icons/land-plot.png'),
  bookOpen: require('./icons/book-open.png'),
  userRoundPlus: require('./icons/user-round-plus.png'),
  triangleAlert: require('./icons/triangle-alert.png'),
  circleX: require('./icons/circle-x.png'),
  squarePen: require('./icons/square-pen.png'),
  moveLeft: require('./icons/move-left.png'),
  volumeOff: require('./icons/volume-off.png'),
  ellipsisVertical: require('./icons/ellipsis-vertical.png'),
  mosque: require('./icons/mosque.png'),
  mosqueAlt: require('./icons/mosque-(1).png'),
} as const;

export const animations = {} as const;

export type KonexImageKey = keyof typeof images;
export type KonexIconKey = keyof typeof icons;

export default { images, icons, animations };

# Changelog

## [1.0.3] - 2026-08-16

### Added / Fixed
- squadService.getMySquads(userId)
- Squad create/list/detail/members/settings wired to squadService (local fallback if API/schema fails)
- Chat list / DM / squad chat wired to chatService with optimistic local messages
- createSquad insert payload supports both schema field names (leader / leader_id)


## [1.0.2] - 2026-08-16

### Fixed
- stories/screens/index.ts no longer contains JSX (re-exports only)
- Added eslint-plugin-import and related eslint deps
- Removed duplicate src/screens/ tree (features/*/screens is source of truth)
- Removed flat src/api/client.ts and src/api/types.ts (folder versions used)
- Removed src/shared/providers/ duplicate
- Wired Squad/Chat/Main/Community/Profile/Admin navigators to feature screens
- Built vertical slice: Squad list/create/detail/members/settings + Chat list/DM/squad chat
- Added unit tests for squadStore


All notable changes to KONEX will be documented in this file.

## [1.0.0] - 2024-08-14

### Added
- Initial release of KONEX
- Authentication system (Sign up, Login, Forgot Password)
- User profiles with gaming identity
- Community system with game-specific communities
- Squad system with full management features
- Real-time chat (DM, Squad Chat)
- Feed with posts, stories, and LFG
- Tournament system
- Badge system
- Moderation and reporting
- Admin panel
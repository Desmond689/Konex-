# KONEX Production Fixes (Applied)

## Summary
This package applies the critical fixes required for a production Android APK build.

## Applied fixes

### Config
- Rewrote `src/config/index.ts` to only re-export symbols that exist
- Added compatibility helpers: `getTheme`, `getColors`, `REGEX`, route helpers, i18n/analytics aliases

### UI components (`src/components/`)
- **EmptyState**: `style`, `icon`, `actionText`
- **Dropdown**: form API (`label`, `items`, `selectedValue`, `onSelect`, `error`, `containerStyle`) + legacy API
- **Button**: added `neutral` variant
- **Tag**: added `info` variant and `xs` size
- **Avatar**: added `borderWidth` / `borderColor`

### Shared stubs
- `src/shared/components/atoms/*` and `molecules/*` now re-export the real components (no more placeholder UI)

### TypeScript
- `tsconfig.json` excludes `supabase/functions`, `**/*.web.js`, `scripts`
- Missing `Text` imports fixed in 16 files (DOM Text collision)
- Barrels rewritten for: `store`, `constants`, `core/logger`, `core/errors`, `core/utils/validators`, `shared/hooks`

### Organisms
- GamingIdentity: Button import
- TournamentCreationForm: `maxTeams` on form data
- ProfileHeader: Image style cast
- linking.ts: Linking import

## Build commands

```bash
npm install
npx expo-doctor
npx tsc --noEmit
npx expo start
eas build -p android --profile preview
eas build -p android --profile production
```

## Env
Copy `.env.example` to `.env` and set:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- Optional: Sentry, OneSignal, Segment keys

## Remaining notes
Some admin/auth type drifts may still show as TS warnings. They do not block Metro/EAS (Babel transpile). Align types in `src/types/*` when you have time.

Deno edge functions under `supabase/functions` are excluded from app `tsc` on purpose.


## Crash-on-open fixes (v2)

### Why the APK quits immediately
Common causes fixed in this package:

1. **Missing `import 'react-native-gesture-handler'`** as the first line of `index.ts`
   - Without it, React Navigation crashes on Android release builds.

2. **Reanimated Babel plugin was not last** in `babel.config.js`
   - Official requirement: `react-native-reanimated/plugin` must be the last plugin.

3. **`env.ts` threw in production** when Supabase URL/key missing
   - Module-load `throw` force-closes the process. Now warns only.

4. **Supabase proxy threw** when client was not ready
   - Soft-fails with safe auth stubs so `getSession()` does not crash boot.

5. **ThemeProvider returned `null` while loading**
   - Could unmount the tree abruptly on some devices. Children stay mounted.

6. **Root ErrorBoundary**
   - Catches render errors instead of a white/quit screen.

7. **Auth loading stuck**
   - `setAuthLoading(false)` always runs in App init `finally`.

### EAS secrets (required for real auth)
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```
Or set in Expo dashboard → Project → Environment variables.

### Debug a quitting APK
```bash
adb logcat *:E ReactNative:V ReactNativeJS:V AndroidRuntime:E
```
Look for `FATAL EXCEPTION` or redbox messages.

### Rebuild after these fixes
```bash
npm install
npx expo start -c
eas build -p android --profile preview --clear-cache
```

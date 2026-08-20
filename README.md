# KONEX

Connect. Squad. Play.

KONEX is a gaming social platform for discovering communities, finding teammates, building squads, chatting, tournaments, and sharing content.

## Stack

- React Native + Expo SDK 51
- TypeScript
- Supabase
- Zustand
- React Navigation

## Quick start (development)

```bash
npm install
cp .env.example .env
# fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

## Build Android APK (EAS)

### 1. One-time setup

```bash
npm install -g eas-cli
eas login
eas init          # links project, writes real projectId into app.json
```

Add your Supabase keys as EAS secrets (optional but recommended):

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

### 2. Build APK locally via CLI

```bash
eas build -p android --profile preview
```

### 3. Build APK automatically from GitHub

1. Create an Expo access token: https://expo.dev → Account → Access Tokens  
2. In your GitHub repo → **Settings → Secrets and variables → Actions**  
   - Name: `EXPO_TOKEN`  
   - Value: the token  
3. Push to `main` (or run the **Build Android APK** workflow manually).  
4. Download the APK from the Actions log / [expo.dev](https://expo.dev) builds page.

Profiles (see `eas.json`):

| Profile      | Output | Use case        |
|--------------|--------|-----------------|
| `preview`    | APK    | Testing / share |
| `production` | APK    | Release         |
| `development`| APK    | Dev client      |

## Supabase

See `SETUP_SUPABASE.md` and run the SQL migrations under `supabase/migrations/` in order.

## Scripts

| Command              | Description              |
|----------------------|--------------------------|
| `npm start`          | Expo dev server          |
| `npm run typecheck`  | TypeScript check         |
| `npm run lint`       | ESLint                   |
| `npm run build:apk`  | EAS preview APK          |
| `npm run build:prod` | EAS production APK       |

## License

See LICENSE.

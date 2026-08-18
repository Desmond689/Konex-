# Build APK from GitHub

## Prerequisites

1. Expo account → create **Access Token**
2. GitHub repo secret: `EXPO_TOKEN` = that token
3. Run once locally:
   ```bash
   npm install
   eas login
   eas init
   ```
   Commit the updated `app.json` (with real `extra.eas.projectId`).

## Trigger build

- Push to `main`, **or**
- GitHub → Actions → **Build Android APK** → Run workflow

APK download link appears in the workflow log and on https://expo.dev.

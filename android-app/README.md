# Android app — START HERE

This folder wraps the course into a real Android app using **Capacitor**. The app loads
`www/index.html`, which is the self-contained course page — so the app works fully offline.

## Quick build (on a machine with Android Studio or the Android SDK)

```bash
cd android-app
npm install
npm run assets          # builds ../dist and copies it to www/index.html
npx cap add android     # creates the android/ native project (once)
npx cap sync android    # copies www/ into the native project
npm run apk             # -> android/app/build/outputs/apk/debug/app-debug.apk
```

Install the APK on a phone (enable "install from unknown sources" for that file), or connect
a device and run:

```bash
cd android-app/android
./gradlew installDebug
```

## Changing the app name or icon

- **Name:** `capacitor.config.json` → `appName`.
- **Package id:** `capacitor.config.json` → `appId` (set this *before* `npx cap add android`;
  changing it later means regenerating the android folder).
- **Icon:** replace the images in `android/app/src/main/res/mipmap-*/`. The easiest way is
  `npm install -g @capacitor/assets`, drop a 1024×1024 `icon.png` and a `splash.png` in
  `resources/`, then run `npx capacitor-assets generate --android`.

## Which course goes in the app?

`npm run assets` puts **New Life in Christ** in `www/index.html`. To ship **Knowing God**
instead, copy the other file:

```bash
node ../build.js
cp ../dist/knowing-god.html www/index.html
npx cap sync android
```

You can also ship both by adding a tiny menu page, but a single course keeps it simple.

## Release build for Google Play

The debug APK is fine for sharing directly. For the Play Store you need a signed release
build:

```bash
cd android
./gradlew assembleRelease
```

Gradle needs a keystore. Create one once:

```bash
keytool -genkey -v -keystore start-here.keystore -alias starthere \
  -keyalg RSA -keysize 2048 -validity 10000
```

Then add the signing config to `android/app/build.gradle` (Capacitor leaves a commented
block for this) and keep the keystore safe — losing it means you cannot update the app.
Google Play also now requires an **AAB** (`./gradlew bundleRelease`), not an APK.

## Cloud build

You do not need Android Studio at all. Push the repo and use the workflow in
`.github/workflows/android.yml` (Actions → Build Android APK). It builds the debug APK and
uploads it as a downloadable artifact.

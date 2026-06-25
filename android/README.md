# Pip Cards — Android TV wrapper

A thin native Android **Leanback** app that hosts the Pip Cards PWA in a full-screen
WebView so it can ship to the Android TV / Google TV / Fire TV home screen. The web app
already does all the work — this wrapper just loads it, switches it into D-pad/TV mode,
keeps the screen awake, and forwards the remote's **BACK** button.

## How it works

- **Loads the hosted PWA** at `START_URL` with `?tv=1` appended. The PWA's service worker
  precaches every asset (`vite.config` Workbox `globPatterns` includes `m4a`), so after the
  first online launch the app runs **fully offline** and updates over-the-air with no APK
  release. (Bundling assets via `file://` would break the SW scope `/` and the absolute
  `/narration/…` / `/card-art/…` paths — so we load the hosted URL, not local files.)
- **TV mode** is switched on two ways (belt + suspenders): the `?tv=1` URL param (read by
  `src/adventure/tv.js`) and `window.__PIP_TV__ = true` injected on page start. Either alone
  is sufficient; together they're robust to timing.
- **D-pad arrows / OK** are NOT intercepted — Chromium WebView delivers them to the page as
  `ArrowUp/Down/Left/Right` / `Enter`, which the in-app global navigator
  (`src/adventure/hooks/useSpatialNav.js`) consumes.
- **Hardware BACK** is forwarded to the page's back bridge (`window.__pipBack`, exposed by
  `useBackButton.js`): if there's a modal/screen to pop it pops one layer; at the World root
  it `finish()`es the activity back to the launcher. No confirm dialogs, no infinite loops.
- **Audio** unlocks on the first OK press (the page's gesture primer), and on TV the app
  prefers the bundled `.m4a` narration over the (unreliable) WebView `speechSynthesis`.

## Configure before building

1. **Set your deployment URL** in `app/src/main/java/cards/pip/tv/MainActivity.kt`:
   ```kotlin
   private val startUrl = "https://YOUR-DEPLOYMENT.vercel.app/?tv=1"
   ```
2. **Add the TV banner** `app/src/main/res/drawable/banner.png` — a **320×180** px image
   (required by Google Play for TV apps; it's the home-screen tile).
3. **Add a launcher icon** at `app/src/main/res/mipmap-*/ic_launcher.png` (or run the
   Android Studio asset wizard).

## Build & run

```bash
# from this android/ directory, with Android Studio's SDK on PATH (or open in Android Studio)
./gradlew assembleDebug                       # build the APK
adb connect <tv-ip>:5555                       # pair with the TV (Developer mode → ADB debugging)
adb install app/build/outputs/apk/debug/app-debug.apk
```
Then launch "Pip Cards" from the Android TV home row and drive it with the remote.

## Manifest highlights (`app/src/main/AndroidManifest.xml`)

- `<uses-feature android:name="android.software.leanback" android:required="false"/>` and
  `android.hardware.touchscreen` `required="false"` — so the same APK installs on TVs **and**
  phones/tablets, as Google's TV-app checklist requires.
- The launcher activity declares both `LAUNCHER` and `LEANBACK_LAUNCHER` categories so it
  appears on the TV home screen.
- `android:screenOrientation="landscape"`, `android:banner`, and `keepScreenOn`.

## Verify on a TV / emulator

1. Create an **Android TV** AVD (or use a real device), launch the app.
2. Walk the whole journey with the emulator D-pad + OK + BACK: world → learn → quiz → chest;
   each Play game; a story; Paint (grid cursor). Confirm focus is always visible.
3. Toggle airplane mode after first load to confirm the service worker serves it **offline**.
4. Confirm BACK pops modals → screens → and finally exits to the launcher from the World root.

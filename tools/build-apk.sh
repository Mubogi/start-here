#!/usr/bin/env bash
# Build a signed, installable EMMAUS.apk from the offline game.
#
#   tools/build-apk.sh
#
# Needs a JDK and the Android SDK (build-tools + one platform). Set
# ANDROID_HOME, or let it find ~/tools/sdk. Output: dist/EMMAUS.apk
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${ANDROID_HOME:=${ANDROID_SDK_ROOT:-$HOME/tools/sdk}}"
JAVA_HOME="${JAVA_HOME:-$(dirname "$(dirname "$(readlink -f "$(command -v javac)")")")}"
export JAVA_HOME
PATH="$JAVA_HOME/bin:$PATH"; export PATH

BT="$ANDROID_HOME/build-tools/34.0.0"
PLATFORM="$ANDROID_HOME/platforms/android-34/android.jar"
for f in "$BT/aapt2" "$BT/d8" "$BT/zipalign" "$BT/apksigner" "$PLATFORM"; do
  [ -e "$f" ] || { echo "missing: $f"; echo "install with: sdkmanager 'platforms;android-34' 'build-tools;34.0.0'"; exit 1; }
done

APP=android
OUT=dist
B=$OUT/apk-build
NAME=EMMAUS
rm -rf "$B"; mkdir -p "$B/gen" "$B/classes" "$B/dex" "$OUT"

# 1. the game, as the app's only asset
mkdir -p "$APP/assets"
cp emmaus/index.html "$APP/assets/index.html"
echo "asset: $(wc -c < "$APP/assets/index.html") bytes"

# 2. resources
"$BT/aapt2" compile --dir "$APP/res" -o "$B/res.zip"

# 3. link: manifest + resources + assets -> an unsigned apk with no dex yet
"$BT/aapt2" link \
  -o "$B/base.apk" \
  -I "$PLATFORM" \
  --manifest "$APP/AndroidManifest.xml" \
  "$B/res.zip" \
  --java "$B/gen" \
  --min-sdk-version 21 --target-sdk-version 34 \
  --version-code 4 --version-name 1.3 \
  -A "$APP/assets"

# 4. java -> classes -> dex
javac -source 1.8 -target 1.8 -bootclasspath "$PLATFORM" -encoding UTF-8 \
  -d "$B/classes" $(find "$APP/src" "$B/gen" -name '*.java') 2> >(grep -v 'bootstrap class path' >&2 || true)
"$BT/d8" --lib "$PLATFORM" --min-api 21 --output "$B/dex" \
  $(find "$B/classes" -name '*.class')

# 5. fold the dex into the apk (python, so no zip(1) needed)
python3 - "$B/base.apk" "$B/dex/classes.dex" <<'PY'
import shutil, sys, zipfile
apk, dex = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(apk, "a", zipfile.ZIP_DEFLATED) as z:
    z.write(dex, "classes.dex")
PY

# 6. align
"$BT/zipalign" -f 4 "$B/base.apk" "$B/aligned.apk"

# 7. sign (a throwaway keystore, created once)
KS="$OUT/emmaus.keystore"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -v -keystore "$KS" -alias emmaus -keyalg RSA -keysize 2048 \
    -validity 10950 -storepass emmaus -keypass emmaus \
    -dname "CN=JD Hub, OU=jdhu tech, O=EMMAUS, L=Kampala, C=UG" >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:emmaus --key-pass pass:emmaus \
  --v1-signing-enabled true --v2-signing-enabled true \
  --out "$OUT/$NAME.apk" "$B/aligned.apk"

"$BT/apksigner" verify --print-certs "$OUT/$NAME.apk" | head -3
echo "built: $OUT/$NAME.apk  ($(wc -c < "$OUT/$NAME.apk") bytes)"

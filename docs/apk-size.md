# Why EMMAUS is 0.1 MB when Play Store apps are 20–100 MB

All figures below were measured on this machine, not estimated.

## What is actually in EMMAUS.apk (99,172 bytes)

| Part | Raw | In the download | Share |
|---|---:|---:|---:|
| `assets/index.html` — the whole game | 242,951 B | 72,311 B | 73% |
| `classes.dex` — all the code | 5,576 B | 2,879 B | 3% |
| 5 launcher icons (48–192 px) | 11,081 B | 11,081 B | 11% |
| Manifest + resources | 3,656 B | 2,323 B | 2% |
| Signature (v1+v2+v3) | 3,260 B | 2,147 B | 2% |
| **Total** | **266 KB** | **96.8 KB** | |

HTML compresses to 30% of its size, which is why a 243 KB game travels as 72 KB.

## The floor: an app with no game at all

I rebuilt the same app with the game file removed — same manifest, icons, code,
signing — and it came to **25,381 bytes**. So:

- the empty shell costs 25 KB
- the entire game costs 74 KB

Three quarters of the download is the game; the app around it is almost free.

## Measured against 5,002 real apps

Sizes taken from the F-Droid catalogue index (the smallest build of each app,
which is close to what one phone downloads).

| | Size |
|---|---:|
| **EMMAUS** | **0.10 MB** |
| smallest app in the catalogue | 0.009 MB |
| median app | 5.96 MB |
| median *game* (525 games) | 7.3 MB |
| median *religion* app (43 apps) | 16.0 MB |
| median game **with a native engine** (314) | 15.1 MB |
| median game **without native code** (211) | 3.0 MB |
| largest app in the catalogue | 1,384 MB |

EMMAUS is the 3rd percentile — smaller than 97% of the catalogue. It is about
74× smaller than the median game and 161× smaller than the median religion app.

## Where the megabytes come from

**1. Native engines — 60% of catalogue games bundle one.**

Flutter, React Native, Unity and Cordova each ship an engine binary inside the
APK. Games with a native engine have a median of 15.1 MB; those without, 3.0 MB.
That gap is the engine. EMMAUS has **zero** `.so` files — it drives the WebView
already built into Android, so the engine belongs to the phone, not the app.

**2. Recorded audio — the largest factor for this app.**

The four instrumentals are composed in code: all four `TRACKS` together are
**1,267 bytes** of note data, synthesised at play time. I rendered those same
four pieces to real audio to compare:

| Same four pieces as 3-minute recordings | Total |
|---|---:|
| WAV, uncompressed | 63.5 MB |
| MP3 @128 kbps | 11.5 MB |
| MP3 @96 kbps | 8.6 MB |
| MP3 @64 kbps | 5.8 MB |

The music as data is 1.3 KB. The music as files would be 8.6–11.5 MB — roughly
**100× the entire app**, and it would multiply by about 4.8× for a 15-minute
album.

**3. Third-party SDKs.** Analytics, ads, crash reporting and push each add
megabytes of Java and resources. EMMAUS has none.

**4. Play Store splits.** You upload an AAB and Play delivers only the code and
assets each phone needs. A "universal" APK is always larger than what a user
actually downloads, so store figures and raw APK figures are not directly
comparable.

## What would change the number

| Scenario | Size | Percentile |
|---|---:|---:|
| As shipped | 0.10 MB | 3rd |
| + four MP3s @96 kbps | 8.7 MB | 60th |
| + four MP3s @128 kbps | 11.6 MB | 66th |
| + one ad/analytics SDK (~4 MB) | 4.1 MB | 39th |
| + MP3s, an SDK and photo/audio assets | 23.6 MB | 82nd |

## Why small is right for this audience

The app installs on a phone with almost no free storage, costs nothing to
download on metered data, and runs on Android 5.0 and newer. A 97 KB download is
a feature here, not a shortfall — and it is entirely explained: no engine, no
recorded media, no SDKs.

The one thing to watch: if the music is ever replaced with recorded files, the
app grows about 100-fold. Keeping the music as note data is what holds the size
down.

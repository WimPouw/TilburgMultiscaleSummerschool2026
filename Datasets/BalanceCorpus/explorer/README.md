# Balance Corpus Explorer

A no-install, server-less viewer for **The Balance Corpus** (an audiovisual
dataset of adult–adult interactions playing a Taboo word-guessing game under
postural-stability constraints). It is a plain HTML + JavaScript page:
**double-click `index.html`** and it opens in your browser. No `.exe`, no Node,
no internet — everything runs locally in the page.


## Requirements

- A modern browser: Chrome, Edge, Safari, or Firefox.

## Use

1. Double-click `index.html` (or open it via `File ▸ Open`).
2. Click **Open corpus folder…** and select your `Corpus/` folder.
3. Pick a trial in the sidebar. Video grid, audio waveform + spectrogram,
   gyroscope plot, TextGrid tiers, metadata, and participant demographics all
   load from the local files. The gyroscope panel has a **Tilt / Acceleration**
   toggle — Tilt shows roll/pitch/yaw sway in degrees (unwrapped, zeroed to the
   trial start); Acceleration shows raw X/Y/Z in g. The choice is remembered.

### Layout controls
- **Resize the video grid**: drag the handle just below the videos up/down to
  make the videos taller (up to nearly the full viewport); double-click it to
  reset. The size is remembered.
- **Minimize a section**: click the chevron button in any panel header (Audio,
  Gyroscope, Metadata, Demographics) to collapse it; click again to expand.
  Each panel's state is remembered.

The folder is read entirely in the browser via the standard folder picker;
nothing is uploaded anywhere. Because a `file://` page cannot remember a folder
between launches, you re-pick the folder each time you open the viewer (one
click).

### Keyboard shortcuts
`Space` play/pause · `J`/`K` prev/next trial · `Shift+J`/`Shift+K` prev/next
group · `←`/`→` scrub ±2 s · `?` help.

## Expected corpus layout

```
Corpus/
  metadata.csv                       # trial table (drives everything)
  gyroscope.csv                      # flat IMU log, columns incl. group_name, trial_number
  demographics.csv                   # optional: per-participant info (keyed by participant_id)
  videos/<group>/{clue_giver,guesser}/*.mp4
  audios/<group>/*.wav
  transcriptions/<group>/*_p{1,2}.TextGrid
```

Media filenames are taken from the `metadata.csv` columns
(`video_clue_giver_cam01/02`, `video_guesser_cam01/02`, `audio_file_name`,
`textgrid_file_name`), with the `_p2` TextGrid derived from the `_p1` name.
`demographics.csv` is joined per trial via the `participant_1_id` /
`participant_2_id` columns; the Demographics panel shows the two participants
side by side and marks which was the clue-giver.

The gyroscope CSV is cut to each trial (no padding), so its timeline maps
directly onto the video/audio: sample 0 = trial start. The gyroscope panel shows
the signal as a line with a thin playback cursor that tracks the video. The
panel header toggles between three signals (choice remembered):
**Ang. vel.** (default) — angular velocity AsX/Y/Z, the board's rotation rate
(°/s); **Acceleration** — raw AccX/Y/Z (g); **Tilt** — roll/pitch/yaw
orientation, unwrapped and zeroed to the trial start (°).


## Seeing stale UI after an edit?

Browsers (and `file://`) cache the `.js`/`.css`. The local assets in
`index.html` carry a `?v=N` query string for cache-busting — bump that number
(e.g. `?v=2` → `?v=3`) on every script/style tag after changing those files, and
a normal reload will pick up the new code. A hard reload (Cmd/Ctrl+Shift+R) also
works.

## Files

- `index.html` — markup + classic `<script>` load order
- `styles.css` — copied from `review-app/public/styles.css`
- `vendor/` — uPlot (IIFE), wavesurfer + spectrogram (UMD) — all classic
  scripts so they load from `file://`
- `js/` — `util.js` (CSV + TextGrid parsing), `corpus.js` (folder picker +
  indexer + media resolver + gyro), and the UI components ported from


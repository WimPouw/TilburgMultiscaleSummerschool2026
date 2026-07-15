# Masking day — hands-on setup guide

This is the **one-page setup** for the two hands-on notebooks. Everything is **CPU-only** — no GPU
needed. Budget ~15 minutes for first-time install (mostly downloads).

There are two notebooks:

| Notebook | What it does | Where it lives |
|---|---|---|
| **Video masking** — `masking-lite.ipynb` | Full-body tracking → blur / mask / skeleton / motion traces on video | `thursday-masking/notebooks/` |
| **Audio de-identification** — `audio_deidentification.ipynb` | Redact / disguise / anonymize a voice while keeping the words | `thursday-masking/notebooks/` |

> **`masking-lite.ipynb`** is the easy, self-locating copy of the video-masking tool — open it from
> `thursday-masking/notebooks/` and it finds the corpus for you. (The full original lives at
> `Datasets/BalanceCorpus/scripts/motiontracking/Masking_Mediapiping.ipynb` and behaves identically.)

They use **different libraries**, so the cleanest path is **one small environment each**. If you
already built the NLP track's `mdig-nlp` environment, you can reuse it for the audio notebook.

---

## Getting a video to mask — VIDEODROP

Before you can mask a clip you need one. **VIDEODROP** is a small local web tool (built for this
school; **yt-dlp + ffmpeg** under the hood) that fetches source video **on your own machine** — no
upload, nothing leaves your laptop.

**Repo:** <https://github.com/babajideowoyele/videodrop>

### Run it

```powershell
git clone https://github.com/babajideowoyele/videodrop
cd videodrop
python app.py          # stdlib server, no pip install; needs yt-dlp, ffmpeg, node on PATH
```

It opens **`http://127.0.0.1:7654`** in your browser. `Ctrl+C` in the terminal stops it
(`run.ps1` does the same on Windows).

### Use it

- **Drop a URL**, click *Fetch* to see available resolutions/subtitles, then pick **resolution,
  frame rate**, or **audio-only** (MP3/M4A).
- Optionally **trim** a start→end clip or **split** into chunks (by time, count, size, or chapters)
  — handy for keeping test clips short.
- **Batch / playlist** mode takes many URLs (or a playlist link) through a job queue.
- For sign-in-gated sites it **borrows your browser's cookies** (Firefox by default; switch in the
  header, or set `VIDEODROP_BROWSER=chrome`).
- Save the resulting **`.mp4`** into `Datasets/BalanceCorpus/videos/` — the folder the video-masking
  notebook reads (see below).

> Only download material you have the right to use, and remember the whole point of the day: once
> you have a clip, **mask it before you share it**.

### Preparing & checking media — MediaPrep

A companion SYNAPSIS tool, **MediaPrep** (<https://github.com/babajideowoyele/mediaprep>), is a local
collect-and-prepare-media workbench: **transcribe** (Whisper), **archive-check** files against DANS
formats, and **scrub EXIF/GPS metadata** before deposit — one Carbon UI, nothing uploaded. Useful
between masking and the archiving step.

```powershell
git clone https://github.com/babajideowoyele/mediaprep
cd mediaprep
python app.py          # opens http://127.0.0.1:7655  (needs ffmpeg; pip install faster-whisper Pillow)
```

---

## 0 · Prerequisites

- **Python 3.9–3.12** (⚠️ **not 3.13** — MediaPipe has no 3.13 wheels yet).
- **conda** (Anaconda/Miniconda) *or* Python's built-in `venv`. Examples below show both.
- Git (to have this repository cloned locally).

Check your Python:
```bash
python --version
```

---

## 1 · Video masking notebook (MediaPipe)

### Create an environment and install

> Run these **from the repository root** — the folder that contains both `Datasets/` and
> `thursday-masking/`. (If `pip install -r …requirements.txt` says *"Could not open requirements
> file"*, you're one level down — `cd` up. Or skip this entirely: `masking-lite.ipynb` installs the
> libraries for you when you run it.)

**conda (recommended):**
```bash
conda create -n masking-video python=3.11 -y
conda activate masking-video
pip install -r Datasets/BalanceCorpus/scripts/motiontracking/requirements.txt
python -m ipykernel install --user --name masking-video --display-name "Python (masking-video)"
```

**venv (no conda):**
```bash
python -m venv .venv-masking
# Windows:  .venv-masking\Scripts\activate     macOS/Linux:  source .venv-masking/bin/activate
pip install -r Datasets/BalanceCorpus/scripts/motiontracking/requirements.txt
python -m ipykernel install --user --name masking-video --display-name "Python (masking-video)"
```

### Folder layout the notebook expects

Run from inside `Datasets/BalanceCorpus/scripts/motiontracking/`. The notebook reads and writes with
paths **relative to that folder**:

```
Datasets/BalanceCorpus/
├── videos/                     ← put the .mp4 clips to process here (searched recursively)
├── motiontracking/
│   ├── scripts/motiontracking/Masking_Mediapiping.ipynb
│   ├── Output_Videos/          ← masked videos are written here
│   └── Output_TimeSeries/      ← per-video body/hands/face .csv are written here
```

> The two `Output_*` folders are created for you if missing. Already-processed videos are **skipped**
> on re-run (delete the output file to reprocess).

### Run it

1. Open `Masking_Mediapiping.ipynb`.
2. Select the **"Python (masking-video)"** kernel (top-right kernel picker).
3. Run top to bottom. The notebook is now **broken into steps** (choose background → body mask/blur →
   face blur/mask → finger traces → skeleton → kinematics → run over all videos). Read each step,
   then run the final "Step 7" cell to process every clip in `videos/`.
4. Toggle the switches in the **Options** cell to change the masking style (the default is full-body
   blur + skeleton + finger traces).

---

## 2 · Audio de-identification notebook

This one shares its stack with the NLP track. **If you already made `mdig-nlp`, just use it** and
skip the install.

**Reuse the NLP environment:**
```bash
conda activate mdig-nlp        # already has librosa, soundfile, faster-whisper
```

**Or a fresh minimal environment:**
```bash
conda create -n masking-audio python=3.11 -y
conda activate masking-audio
pip install librosa soundfile scipy numpy matplotlib
pip install faster-whisper        # optional: the "does the content survive?" ASR check
python -m ipykernel install --user --name masking-audio --display-name "Python (masking-audio)"
```

Then open `thursday-masking/notebooks/audio_deidentification.ipynb`, pick the matching kernel, and run
top to bottom. It finds a sample clip from the corpus automatically (and falls back to a synthetic
voice if the corpus isn't present, so it runs anywhere).

> Optional Part C also uses `resemblyzer` for a real speaker-embedding privacy check
> (`pip install resemblyzer`). Without it, that one cell prints an install hint and is skipped — the
> rest runs fine.

---

## 3 · Troubleshooting

| Symptom | Fix |
|---|---|
| `ERROR: Could not find a version that satisfies mediapipe` | You're on Python 3.13 (or 3.8). Use 3.9–3.12. |
| Kernel "Python (masking-video)" not in the list | Re-run the `ipykernel install …` line, then reload the Jupyter/VS Code window. |
| `ModuleNotFoundError: mediapipe` inside the notebook | Wrong kernel selected — pick the masking-video kernel, not "base". |
| Video won't open / 0 frames | Ensure the `.mp4` is a real file (not a Git-LFS pointer). `git lfs pull` if needed. |
| Output video is empty / codec error | Some OpenCV builds lack the MP4V codec; install `opencv-python` (not `-headless`), or change the `fourcc` to `*'mp4v'`/`*'XVID'`. |
| First audio cell is slow | It's a one-time model download (Whisper / encoder). Subsequent runs are cached and fast. |

---

*Both notebooks are exploratory teaching material for the MDIG2026 summer school. The video tool is
the Masked-Piper pipeline (Owoyele et al., 2022, SoftwareX); the audio notebook implements the
VoicePrivacy McAdams baseline (Patino et al., 2021).*

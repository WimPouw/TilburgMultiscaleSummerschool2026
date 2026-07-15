# Thursday: Masking & Anonymizing Audiovisual Data

**Instructor:** Babajide Owoyele (Radboud University / SYNAPSIS)
**MDIG Multiscale Summer School · Tilburg · Thursday, 16 July 2026**

## Overview

Audiovisual data is the richest record we have of human behaviour — face, gesture, gaze, voice,
interaction — and also *personal data* that is often too sensitive to share and too valuable to
delete. This full-day session is about getting it out of the drawer, responsibly. Participants learn
to **mask** (de-identify) research video and audio with open-source tools, **measure** how much
analytic utility survives the masking, and **decide** a masking strategy they can defend for their
own data.

The day's arc, in three verbs: **mask → measure → decide.**

## What you will leave with

By 14:00 you will have:

- **A masked clip** — your own footage (or a stand-in), de-identified with MaskAnyone.
- **A number** — a MaskBench score telling you *which pose model keeps the most analytic utility* on
  your masked clip.
- **A strategy** — a masking operation you can justify for your own research.
- **A path to share** — a route from masked clip to a FAIR, deposited dataset.

## Quick start (zero to running)

New to this? Four steps from nothing to a masked video on your own laptop:

1. **Get the repo** — `git clone https://github.com/WimPouw/TilburgMultiscaleSummerschool2026` (or
   download the ZIP from GitHub).
2. **Set up** — follow **[`HANDS_ON_SETUP.md`](HANDS_ON_SETUP.md)** (one small conda/venv environment,
   ~15 min; copy-paste the commands — no coding needed). *No install at all?* Open
   `notebooks/masking-lite.ipynb` in **Google Colab** and run it there.
3. **Run the masking notebook** — open `notebooks/masking-lite.ipynb`, run each cell top to bottom,
   drop your `.mp4` into the `my_videos/` folder it creates, and re-run the last step. The masked
   video + motion-tracking CSVs land in `masking_output/`.
4. **Optional helper tools** — fetch a clip with **VIDEODROP**, and use **MediaPrep** to transcribe /
   scrub metadata / archive-check before you share (both local — see [Materials](#materials)).

## Running dataset

We use the **triadic concept-generation dataset** (CDR Stanford, Edelman 2011) as the primary
hands-on example: 14 teams of 3 students collaboratively redesigning a product, recorded from
multiple camera angles. This multi-person, gesture-rich, occlusion-heavy data presents real-world
masking challenges — you cannot simply black out the body, because *the gesture is the signal*. The
same corpus threads through the whole week (you met it on Monday).

## Schedule

| Time | Session | Format |
|------|---------|--------|
| 10:00–10:30 | SYNAPSIS infrastructure + the triadic dataset | Lecture |
| 10:30–10:55 | Why mask? The privacy–utility dilemma | Lecture + Discussion |
| 10:55–11:20 | The masking-operations taxonomy | Lecture + Demo |
| 11:20–12:05 | MaskAnyone: architecture & hands-on | Hands-on |
| 12:05–12:30 | MaskBench: which pose model keeps the most signal? | Hands-on |
| 12:30–13:00 | Lunch | |
| 13:00–13:30 | Bring-your-own-video + audio masking | Hands-on |
| 13:30–13:40 | Archiving & sharing (FAIR, DANS/Zenodo) | Lecture + Demo |
| 13:40–14:00 | Dilemmask: card session, bridging into Friday's group projects | Discussion |

## Materials

### Slides — `slides/` (Beamer package, Carbon B/W theme)

Five core decks plus two companions, each built as an animated *presenting* PDF and a flat *handout*
PDF from the same source (`make` / `make handout`; stitched masters `masking-day-full.pdf` and
`masking-day-handout.pdf`). See [`slides/README.md`](slides/README.md).

| Deck | Part |
|------|------|
| `01-synapsis-and-dataset` | SYNAPSIS & the running dataset |
| `02-why-mask` | Why mask? The privacy–utility dilemma |
| `03-taxonomy` | The masking-operations taxonomy |
| `04-toolchain` | MaskAnyone & MaskBench (hands-on) |
| `05-handson-audio-archiving` | Your video, audio, archiving, wrap-up |
| `06-case-studies` | Companion: masking case studies, lab & wild |
| `07-dilemmask` | Companion: the Dilemmask card-deck session |

Bonus companion decks (separate topics, same theme): **`bonus-nlp-101`** (NLP 101 for multimodal
communication) and **`bonus-fair-101`** (FAIR & metadata 101).

### Hands-on notebooks — `notebooks/`

All **CPU-only**, no GPU. Full setup in **[`HANDS_ON_SETUP.md`](HANDS_ON_SETUP.md)** (~15 min,
mostly downloads).

- **Video masking** — [`notebooks/masking-lite.ipynb`](notebooks/masking-lite.ipynb): full-body
  tracking → blur / mask / skeleton / motion traces (MediaPipe). Self-locating copy of the
  Masked-Piper pipeline.
- **Audio de-identification** — [`notebooks/audio_deidentification.ipynb`](notebooks/audio_deidentification.ipynb):
  redact / disguise / anonymize a voice while keeping the words (VoicePrivacy McAdams baseline).

### Getting & preparing media — VIDEODROP + MediaPrep

Two small local tools built within SYNAPSIS to help early-career researchers prepare and share data
responsibly as we meet them; both run on your own machine, nothing uploaded.

- **VIDEODROP** — a local video downloader (yt-dlp + ffmpeg): fetch any video, pick quality/fps,
  trim, split into chunks, batch/playlist. Repo: <https://github.com/babajideowoyele/videodrop> ·
  run & usage in [`HANDS_ON_SETUP.md`](HANDS_ON_SETUP.md).
- **MediaPrep** — a collect-and-prepare-media workbench: transcribe (Whisper), archive-check files
  against DANS formats, and scrub EXIF/GPS metadata before you share. Repo:
  <https://github.com/babajideowoyele/mediaprep>.

## Concepts covered

- **The dilemma** — every masking choice sits somewhere on a line from *raw video* (max utility, max
  exposure) to *deleted* (zero exposure, zero utility). The question is *where*, chosen deliberately.
- **Identity leaks from everywhere** — face and voice, but also gait, build, context, and who
  someone is *with*. Masking a face may still name the person.
- **The operations taxonomy** — blur, pixelate, replace (avatar/skeleton), remove; and whether the
  operation is *reversible*. Mask for tomorrow's models, not just today's viewer.
- **Measure, don't assume** — MaskBench runs a masked clip through several pose back-ends so you can
  choose the one that preserves the most kinematic signal (88–95% PCK survives blurring).
- **Archiving** — FAIR sharing, persistent identifiers (DOI via DataCite), deposit at DANS/Zenodo;
  *Accessible ≠ Open* (metadata can be open while masked media sits behind controlled access).

## Requirements

Participants need:

- A laptop with a modern web browser (Chrome or Firefox).
- WiFi (provided).
- For the local hands-on notebooks: **Python 3.9–3.12** (⚠️ not 3.13 — MediaPipe has no 3.13 wheels)
  and conda *or* venv. See [`HANDS_ON_SETUP.md`](HANDS_ON_SETUP.md).

**No GPU needed** — everything runs CPU-only. MaskAnyone can run **locally via Docker** or be used on
the **hosted SYNAPSIS infrastructure** (Radboud HPC / Ponyland); the notebooks run entirely on your
laptop.

## Tools

- **MaskAnyone** — open-source video masking platform (YOLO + SAM2 + pose estimation); local Docker
  or hosted.
- **MaskBench** — benchmarking framework that picks the pose estimator preserving the most analytic
  utility on masked video.
- **VIDEODROP** — local video downloader (yt-dlp + ffmpeg): <https://github.com/babajideowoyele/videodrop>
- **MediaPrep** — local media prep: transcribe, DANS archive-check, scrub EXIF/GPS metadata: <https://github.com/babajideowoyele/mediaprep>
- **SYNAPSIS infrastructure** — hosted on Radboud HPC (Ponyland).

## Key references

*Course tools (under review / dissertation):*

- Owoyele et al. (2026). MaskingOPS: A Tutorial for Masking Operations in Behavioral Research.
  *Behavior Research Methods.* (under review)
- Owoyele, Riedel, Shaik et al. (2026). MaskBench: Privacy-Preserving Pose Estimation Benchmarking.
  *Behavior Research Methods.* (under review)
- Edelman, J. (2011). Understanding Radical Breaks. PhD dissertation, Stanford University.
- Owoyele et al. (2022). Masked-Piper. *SoftwareX.* · Patino et al. (2021). VoicePrivacy McAdams baseline.

*Foundations (DOIs Crossref-verified):*

- Wilkinson et al. (2016). The FAIR Guiding Principles. *Scientific Data.* doi:10.1038/sdata.2016.18
- Newton, Sweeney & Malin (2005). Preserving privacy by de-identifying face images. *IEEE TKDE.* doi:10.1109/TKDE.2005.32
- Sweeney (2002). k-anonymity. *Int. J. Uncertainty, Fuzziness & Knowledge-Based Systems.* doi:10.1142/S0218488502001648
- Ribaric, Ariyaeeinia & Pavesic (2016). De-identification for privacy protection in multimedia content: a survey. *Signal Processing: Image Communication.* doi:10.1016/j.image.2016.05.020
- Cao et al. (2019). OpenPose. *IEEE TPAMI.* doi:10.1109/TPAMI.2019.2929257

## Connection to other days

| Day | Topic | Thursday connection |
|-----|-------|---------------------|
| Monday | Motion tracking | Masking must preserve the tracking you learned |
| Tuesday | Acoustic analysis | Audio masking connects to prosodic analysis |
| Wednesday | Pose estimation | MaskBench evaluates pose on masked video |
| **Thursday** | **Masking & anonymization** | **This day** |
| Friday | Group projects | Fold masking into your own project |

# Masking Day — SYNAPSIS Beamer package

A 5-part Beamer slide package for the Thursday masking day at the
**MDIG Multiscale Summer School** (Tilburg, 16 July 2026). Black-and-white,
IBM Carbon design language: IBM Plex fonts, Carbon greyscale tokens, Carbon
icons, and a native SYNAPSIS synapse mark.

## The five parts

| File | Part | Session (clock) |
|------|------|-----------------|
| `01-synapsis-and-dataset.tex` | 1 — SYNAPSIS & the running dataset | 10:00–10:30 |
| `02-why-mask.tex` | 2 — Why mask? The privacy–utility dilemma | 10:30–10:55 |
| `03-taxonomy.tex` | 3 — The masking operations taxonomy | 10:55–11:20 |
| `04-toolchain.tex` | 4 — MaskAnyone & MaskBench (hands-on) | 11:20–12:30 |
| `05-handson-audio-archiving.tex` | 5 — Your video, audio, archiving, wrap-up | 13:00–14:00 |
| `06-case-studies.tex` | Companion — masking case studies, lab & wild | (bonus) |
| `07-dilemmask.tex` | Companion — the Dilemmask card-deck session (5 slides) | (bonus) |

Each part is a self-contained deck with its own title page and dark section
dividers; together they cover the full day. Deck 06 is a companion case-studies
deck (design triad, teacher training / RTA, SMASHFIRE, dyadic, doctor-influencer,
politicians, coach briefings) that ends on the MaskBench → EnvisionBOX gesture-
challenge connection.

## Build

Requires **XeLaTeX** (for `fontspec` + IBM Plex) and a TeX install with TikZ,
`colortbl`, and `microtype`. IBM Plex Sans / Sans Light / Sans Text / Mono must
be available to the system.

```sh
make            # builds all deck PDFs, animated/presenting mode (two passes each)
make full       # stitch all into masking-day-full.pdf (needs pdfunite/poppler)
make handout    # flat build: overlays collapsed, one page per slide, into handout/
make handout-full  # stitch the flat decks into masking-day-handout.pdf
make clean      # remove aux files
make cleanall   # remove aux files + PDFs + handout/
```

`make full` produces `masking-day-full.pdf` — the whole day as one presenting handout.

## Presenting vs. handout (progressive reveal)

The decks build **progressively**: each slide reveals its content in 2–3 grouped
beats rather than all at once, so the audience follows one point at a time.
Not-yet-revealed groups are **dimmed to grey** (Carbon greyscale) rather than
hidden, so the slide's structure stays legible while you talk.

Both versions come from the **same `.tex` sources** — no duplicated files:

| Build | Command | Result |
|-------|---------|--------|
| **Presenting** | `make` | Animated. One PDF page per beat — click through live. |
| **Handout** | `make handout` | Flat. Every overlay collapsed to one page per slide, for printing. Lands in `handout/`. |

The handout build injects beamer's `handout` class option via
`\PassOptionsToClass{handout}{beamer}` on the command line, so it needs no
source edits.

### Reveal mechanics (how the slides are marked up)

- Content groups are wrapped in `\onslide<+->{ ... }`. `<+->` is an incremental
  per-frame counter, so each wrap becomes the next beat.
- **Constant on every slide** (never wrapped): frame titles + subtitles, the
  footline, the large decorative side icons (`\carbonicon[28mm]{...}` in a
  narrow column — the slide's visual anchor), tables and TikZ diagrams (each a
  single visual), and all hands-on/procedure steps a participant must read to
  follow along.
- **Reveals in beats**: bullet lists (whole list = one beat), `\iconlead` cards
  (the small inline icon travels *with* its label), `\begin{block}` punchlines,
  and trailing grey takeaway lines.
- **Dim vs. hide**: controlled by one line in `preamble.tex` —
  `\setbeamercovered{transparent=20}`. Raise the number for more presence, or
  comment the line out to hide future groups entirely instead of dimming them.

Or a single deck:

```sh
xelatex 02-why-mask.tex && xelatex 02-why-mask.tex
```

Two passes are needed so the title-page corner icon (TikZ overlay) and the
footline frame numbers settle.

## Files

- `synapsistheme.sty` — the B/W Carbon Beamer theme: colours, IBM Plex fonts,
  frame-title accent rule, footline, dark `\dividerframe`, custom title page,
  the native-TikZ `\synapsismark` / `\synapsislockup`, and helpers
  (`\iconlead`, `\bignum`).
- `carbonicons.sty` + `carbon-defs.tex` — IBM Carbon icons rendered as **native
  TikZ SVG paths** (`\carbonicon[size]{name}{color}`). No Inkscape / rsvg / any
  external SVG converter is needed — the path data compiles directly. Icons were
  generated from `@carbon/icons` v11 (Apache-2.0). Available names: archive,
  chartline, checkmarkoutline, datavis, document, eartheurope, facewink, group,
  idea, locked, microphone, network, result, scalestipped, security, settings,
  useravatar, video, view, viewoff, warningalt.
  Note: the `svg.path` library renders SVG coordinates vertically flipped
  (it ignores the picture's `y` unit), so `\carbonicon` corrects the orientation
  with a `scope [yscale=-1, yshift=-32pt]`.
- `preamble.tex` — shared preamble each deck `\input`s.

## Content sources

- Day programme: `../README.md` and
  `planning/events/tilburg-summerschool/thursday-masking-day.md`.
- Concepts: the SYNAPSIS video-tutorial scripts
  (`planning/dissemination/video-tutorials/`).
- Headline result (88–95% PCK): the MaskingOPS paper (`manuscripts/maskingops/`).
- Narrative metaphors (the stranger in the background, two-way mirror, what
  stays, the surgeon's hand, the library that cannot be visited): the Masking Lab
  card deck (`card-decks/masking-lab-deck/deck-cards.md`). The card-deck reflection
  session is branded **Dilemmask** (Part 5).

## Adding a Carbon icon

```sh
# fetch, then regenerate carbon-defs.tex (see the generator in this repo's history)
curl -sL https://unpkg.com/@carbon/icons@11/svg/32/NAME.svg -o icons/LOCALNAME.svg
```
Each icon macro is `\csname carbon@LOCALNAME\endcsname` drawing every `<path>`
with nonzero winding, inside a y-flipped TikZ picture. Check a new icon at large
size before use — a few Carbon glyphs rely on winding tricks that need `even odd
rule` instead.

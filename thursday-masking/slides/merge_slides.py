#!/usr/bin/env python3
"""
merge_slides.py
Merge all Thursday Masking Day Reveal.js decks into one HTML file.

Usage:
    python merge_slides.py               # writes all_sessions.html
    python merge_slides.py --out path/to/output.html

Each section gets a data-time attribute (minutes) from SESSIONS config.
Press T in the presentation to toggle the speaker-timer panel.
"""

import re
import sys
from pathlib import Path

# ── Session config ──────────────────────────────────────────────────────────
# order:    file order in the merged deck
# title:    shown in session-start divider slide
# time:     "HH:MM–HH:MM" shown in divider
# budget:   total session minutes (drives session countdown)
# slide_times: per-slide minutes, in order; last value repeats for extra slides
SESSIONS = [
    {
        "file":   "01_synapsis_infrastructure/index.html",
        "title":  "SYNAPSIS Infrastructure",
        "time":   "09:00 – 09:30",
        "budget": 30,
        "slide_times": [0, 5, 6, 5, 5, 5, 4, 3],
    },
    {
        "file":   "02_triadic_dataset/index.html",
        "title":  "The Triadic Dataset",
        "time":   "09:30 – 10:30",
        "budget": 60,
        "slide_times": [0, 5, 6, 5, 6, 5, 6, 5, 6, 5, 5],
    },
    {
        "file":   "03_privacy_utility_dilemma/index.html",
        "title":  "Privacy–Utility Dilemma",
        "time":   "15:15 – 16:00",
        "budget": 45,
        "slide_times": [0, 5, 7, 6, 5, 6, 10, 5, 5],
    },
    {
        "file":   "04_masking_taxonomy/index.html",
        "title":  "Masking Taxonomy",
        "time":   "Reference",
        "budget": 0,
        "slide_times": [0, 4, 4, 4, 4, 4, 4, 4, 4],
    },
    {
        "file":   "05_audio_masking/index.html",
        "title":  "Audio De-identification",
        "time":   "16:15 – 16:45",
        "budget": 30,
        "slide_times": [0, 4, 5, 5, 4, 5, 4, 3],
    },
]

SLIDES_DIR = Path(__file__).parent

# ── CSS shared across all decks (Carbon Design System + Reveal overrides) ──
SHARED_CSS = """
    :root {
      --cds-background:       #000000;
      --cds-layer:            #161616;
      --cds-layer-accent:     #262626;
      --cds-border-subtle:    #525252;
      --cds-text-primary:     #f4f4f4;
      --cds-text-secondary:   #c6c6c6;
      --cds-text-placeholder: #6f6f6f;
      --cds-interactive:      #0f62fe;
      --cds-support-success:  #42be65;
      --cds-support-warning:  #f1c21b;
      --cds-support-error:    #fa4d56;
      --cds-support-info:     #4589ff;
      --cds-link:             #78a9ff;
      --cds-highlight:        #0043ce;
      --font-body: "IBM Plex Sans", "Segoe UI", sans-serif;
      --font-mono: "IBM Plex Mono", "Consolas", monospace;
    }
    .reveal-viewport { background: var(--cds-background) !important; }
    .reveal { font-family: var(--font-body); font-size: 22px; color: var(--cds-text-primary); }
    .reveal h1, .reveal h2, .reveal h3, .reveal h4 {
      font-family: var(--font-body); font-weight: 300; color: var(--cds-text-primary);
      text-transform: none; letter-spacing: -0.01em; margin-bottom: 0.5em;
    }
    .reveal h1 { font-size: 2.4em; font-weight: 300; line-height: 1.15; }
    .reveal h2 { font-size: 1.4em; font-weight: 600;
                 border-bottom: 1px solid var(--cds-border-subtle); padding-bottom: 0.3em; }
    .reveal h3 { font-size: 1em; font-weight: 600; color: var(--cds-link); }
    .reveal section { padding: 0 2.5em; overflow: hidden; }
    .reveal .slides { text-align: left; }
    .reveal .slide-number { color: var(--cds-text-placeholder); font-family: var(--font-mono);
      font-size: 0.65em; background: transparent; }
    .reveal ul, .reveal ol { margin-left: 1.2em; }
    .reveal li { margin-bottom: 0.3em; font-size: 0.88em; color: var(--cds-text-secondary); }
    .reveal li strong { color: var(--cds-text-primary); font-weight: 600; }
    .reveal table { border-collapse: collapse; width: 100%; font-size: 0.72em; }
    .reveal table th { background: var(--cds-layer-accent); color: var(--cds-text-primary);
      font-weight: 600; padding: 0.5em 0.9em; text-align: left;
      border-bottom: 2px solid var(--cds-interactive); }
    .reveal table td { padding: 0.4em 0.9em; border-bottom: 1px solid var(--cds-layer-accent);
      color: var(--cds-text-secondary); }
    .reveal table tr:nth-child(even) td { background: var(--cds-layer); }
    .reveal pre { font-family: var(--font-mono); background: var(--cds-layer);
      border: 1px solid var(--cds-layer-accent); border-left: 3px solid var(--cds-interactive);
      border-radius: 0; padding: 0.8em 1em; font-size: 0.7em; box-shadow: none; width: 100%; }
    .reveal code { font-family: var(--font-mono); font-size: 0.85em; color: var(--cds-support-info);
      background: var(--cds-layer); padding: 0.1em 0.3em; border-radius: 2px; }
    .reveal pre code { color: var(--cds-text-primary); font-size: 1em; background: none; }
    .callout { display: flex; align-items: flex-start; gap: 0.7em; background: var(--cds-layer);
      border-left: 3px solid var(--cds-interactive); padding: 0.7em 1em;
      margin: 0.7em 0; font-size: 0.78em; color: var(--cds-text-secondary); }
    .callout.success { border-color: var(--cds-support-success); }
    .callout.warning { border-color: var(--cds-support-warning); }
    .callout.danger  { border-color: var(--cds-support-error); }
    .callout .icon   { flex-shrink: 0; margin-top: 0.1em; }
    .tag { display: inline-flex; align-items: center; gap: 0.3em; background: var(--cds-layer-accent);
      color: var(--cds-text-secondary); font-size: 0.65em; font-weight: 600;
      padding: 0.2em 0.6em; border-radius: 0; letter-spacing: 0.04em; text-transform: uppercase; }
    .tag.blue   { background: #002d9c; color: #a6c8ff; }
    .tag.green  { background: #022d0d; color: #6fdc8c; }
    .tag.purple { background: #1c0f30; color: #d4bbff; }
    .tag.red    { background: #2d0709; color: #ffb3b8; }
    .tag.teal   { background: #081a1c; color: #3ddbd9; }
    .tag.yellow { background: #312400; color: #f1c21b; }
    .cols   { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; align-items: start; }
    .cols-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5em; }
    .cols-13{ display: grid; grid-template-columns: 1fr 2fr; gap: 2em; align-items: start; }
    .reveal video, .reveal img.gif { max-height: 52vh; max-width: 100%; display: block; margin: 0 auto; }
    .reveal img { max-width: 100%; max-height: 52vh; }
    .small  { font-size: 0.68em; color: var(--cds-text-secondary); }
    .muted  { color: var(--cds-text-placeholder); }
    .em     { color: var(--cds-link); font-weight: 600; }
    .mono   { font-family: var(--font-mono); font-size: 0.85em; }
    .eyebrow { font-size: 0.65em; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--cds-text-placeholder); margin-bottom: 0.3em; }
    .title-slide { display: flex; flex-direction: column; justify-content: center; min-height: 65vh; }
    .title-slide h1 { font-size: 2.6em; font-weight: 300; margin-bottom: 0.2em; }
    .title-slide .subtitle { font-size: 1em; color: var(--cds-link); margin-bottom: 1em; }
    .title-slide .meta { font-size: 0.7em; color: var(--cds-text-placeholder); }
    .divider { background: var(--cds-highlight) !important; }
    .divider h2 { font-size: 2em; font-weight: 300; border: none; color: #fff; }
    .divider .eyebrow { color: rgba(255,255,255,0.6); }

    /* ── Per-deck extras (union of all deck-specific rules) ── */
    .tool-card { background: var(--cds-layer); border-top: 3px solid var(--cds-interactive); padding: 1em; }
    .tool-card.green  { border-color: var(--cds-support-success); }
    .tool-card.yellow { border-color: var(--cds-support-warning); }
    .tool-card.purple { border-color: #8a3ffc; }
    .tool-card h3 { font-size: 0.88em; margin-bottom: 0.4em; }
    .tool-card p  { font-size: 0.72em; color: var(--cds-text-secondary); margin: 0; }
    .tree-node { background: var(--cds-layer); border-left: 3px solid var(--cds-interactive);
      padding: 0.5em 0.8em; margin: 0.3em 0; font-size: 0.8em; }
    .tree-node.l1 { border-color: #0f62fe; margin-left: 0; }
    .tree-node.l2 { border-color: #78a9ff; margin-left: 1.5em; }
    .tree-node.l3 { border-color: #4589ff; margin-left: 3em; font-size: 0.75em; }
    .tree-node strong { color: var(--cds-text-primary); }
    .tree-node span   { color: var(--cds-text-secondary); }
    .method-card { background: var(--cds-layer); padding: 0.8em; font-size: 0.8em; }
    .method-card h3 { font-size: 0.9em; margin: 0 0 0.3em 0; }
    .method-card p  { font-size: 0.75em; color: var(--cds-text-secondary); margin: 0.2em 0; }
    .scale-bar { display: flex; align-items: center; gap: 0; height: 28px;
      border-radius: 2px; overflow: hidden; margin: 0.6em 0; }
    .scale-seg { flex: 1; height: 100%; display: flex; align-items: center;
      justify-content: center; font-size: 0.62em; font-weight: 600;
      color: #161616; letter-spacing: 0.04em; }
    .matrix-cell { background: var(--cds-layer); border: 1px solid var(--cds-layer-accent);
      padding: 0.8em; text-align: center; }
    .matrix-cell .val { font-size: 1.6em; font-weight: 300; display: block; margin-bottom: 0.2em; }
    .matrix-cell .lbl { font-size: 0.65em; color: var(--cds-text-placeholder); text-transform: uppercase; }
    /* wave animation from 05_audio_masking */
    .wave-pictogram { display: flex; align-items: flex-end; justify-content: center;
      gap: 4px; height: 48px; margin-bottom: 0.6em; }
    .wave-bar { width: 6px; border-radius: 3px; background: var(--cds-interactive);
      animation: wave 1.2s ease-in-out infinite; }
    @keyframes wave {
      0%, 100% { opacity: 0.3; transform: scaleY(0.4); }
      50%       { opacity: 1;   transform: scaleY(1); }
    }

    /* ── Speaker timer overlay ───────────────────────── */
    #speaker-timer {
      position: fixed; bottom: 16px; right: 16px; z-index: 9999;
      background: rgba(22,22,22,0.92);
      border: 1px solid #525252;
      border-left: 3px solid #0f62fe;
      padding: 10px 14px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 12px;
      color: #c6c6c6;
      min-width: 210px;
      backdrop-filter: blur(4px);
      transition: opacity 0.2s;
      user-select: none;
    }
    #speaker-timer.hidden { opacity: 0; pointer-events: none; }
    #speaker-timer .t-session-name {
      font-family: "IBM Plex Sans", sans-serif;
      font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: #6f6f6f; margin-bottom: 6px;
    }
    #speaker-timer .t-row {
      display: flex; justify-content: space-between; align-items: center;
      margin: 3px 0;
    }
    #speaker-timer .t-label { color: #6f6f6f; font-size: 10px; }
    #speaker-timer .t-value { font-size: 14px; font-weight: 600; color: #f4f4f4; }
    #speaker-timer .t-value.warn  { color: #f1c21b; }
    #speaker-timer .t-value.alert { color: #fa4d56; }
    #speaker-timer .t-bar-wrap {
      margin-top: 8px; height: 3px; background: #262626; border-radius: 2px;
    }
    #speaker-timer .t-bar {
      height: 100%; border-radius: 2px; background: #0f62fe;
      transition: width 0.5s linear, background 0.5s;
    }
    #speaker-timer .t-hint {
      margin-top: 7px; font-size: 9px; color: #525252; text-align: right;
    }
    /* Day clock bar at very top */
    #day-clock {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9998;
      background: rgba(22,22,22,0.85);
      border-bottom: 1px solid #262626;
      display: flex; align-items: center; justify-content: space-between;
      padding: 3px 16px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 11px; color: #6f6f6f;
      backdrop-filter: blur(4px);
      transition: opacity 0.2s;
    }
    #day-clock.hidden { opacity: 0; pointer-events: none; }
    #day-clock .dc-session { color: #78a9ff; font-weight: 600; }
    #day-clock .dc-clock   { color: #c6c6c6; }
"""

# ── Timer overlay HTML (injected into <body>) ────────────────────────────────
TIMER_HTML = """
<!-- ── Speaker timer overlay (press T to toggle) ── -->
<div id="day-clock">
  <span class="dc-session" id="dc-session-name">—</span>
  <span id="dc-schedule-time"></span>
  <span class="dc-clock" id="dc-wallclock"></span>
</div>

<div id="speaker-timer">
  <div class="t-session-name" id="t-session-name">—</div>
  <div class="t-row">
    <span class="t-label">Session</span>
    <span class="t-value" id="t-session-elapsed">0:00</span>
    <span class="t-label" id="t-session-budget"></span>
  </div>
  <div class="t-row">
    <span class="t-label">Slide</span>
    <span class="t-value" id="t-slide-elapsed">0:00</span>
    <span class="t-label" id="t-slide-budget"></span>
  </div>
  <div class="t-row">
    <span class="t-label">Day elapsed</span>
    <span class="t-value" id="t-day-elapsed">0:00</span>
  </div>
  <div class="t-bar-wrap">
    <div class="t-bar" id="t-slide-bar" style="width:0%"></div>
  </div>
  <div class="t-hint">T — toggle &nbsp;|&nbsp; R — reset session</div>
</div>
"""

# ── Timer JavaScript ─────────────────────────────────────────────────────────
TIMER_JS = """
<script>
(function () {
  'use strict';

  const panel   = document.getElementById('speaker-timer');
  const dayClock = document.getElementById('day-clock');
  let timerVisible = true;

  // State
  let dayStart     = Date.now();
  let sessionStart = Date.now();
  let slideStart   = Date.now();

  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return m + ':' + String(ss).padStart(2, '0');
  }

  function setColor(el, elapsed, budget) {
    el.classList.remove('warn', 'alert');
    if (budget <= 0) return;
    const pct = elapsed / (budget * 60 * 1000);
    if (pct >= 1.0)       el.classList.add('alert');
    else if (pct >= 0.85) el.classList.add('warn');
  }

  function tick() {
    const now = Date.now();

    // Wall clock
    const wc = new Date();
    document.getElementById('dc-wallclock').textContent =
      wc.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Day elapsed
    document.getElementById('t-day-elapsed').textContent = fmt(now - dayStart);

    // Session elapsed
    const sElapsed = now - sessionStart;
    const sBudget  = parseInt(panel.dataset.sessionBudget || '0', 10);
    const sEl = document.getElementById('t-session-elapsed');
    sEl.textContent = fmt(sElapsed);
    setColor(sEl, sElapsed, sBudget);

    // Slide elapsed
    const slElapsed = now - slideStart;
    const slBudget  = parseInt(panel.dataset.slideBudget || '0', 10);
    const slEl = document.getElementById('t-slide-elapsed');
    slEl.textContent = fmt(slElapsed);
    setColor(slEl, slElapsed, slBudget);

    // Slide progress bar
    const bar = document.getElementById('t-slide-bar');
    if (slBudget > 0) {
      const pct = Math.min(slElapsed / (slBudget * 60 * 1000) * 100, 100);
      bar.style.width = pct + '%';
      bar.style.background = pct >= 100 ? '#fa4d56' : pct >= 85 ? '#f1c21b' : '#0f62fe';
    } else {
      bar.style.width = '0%';
    }

    requestAnimationFrame(tick);
  }

  function onSlideChange(event) {
    const slide = event.currentSlide;
    slideStart = Date.now();

    // data-time (minutes per slide)
    const slMin = parseInt(slide.dataset.time || '0', 10);
    panel.dataset.slideBudget = slMin;
    document.getElementById('t-slide-budget').textContent =
      slMin > 0 ? ('/ ' + slMin + 'm') : '';

    // data-session / data-session-budget from injected divider
    const sessionName = slide.dataset.session || panel.dataset.currentSession || '—';
    const sessionBudget = parseInt(slide.dataset.sessionBudget || panel.dataset.sessionBudget || '0', 10);

    if (slide.dataset.sessionStart === '1') {
      // New session — reset session timer
      sessionStart = Date.now();
      panel.dataset.currentSession = sessionName;
      panel.dataset.sessionBudget  = sessionBudget;
    }

    document.getElementById('t-session-name').textContent  = sessionName;
    document.getElementById('dc-session-name').textContent = sessionName;
    document.getElementById('t-session-budget').textContent =
      sessionBudget > 0 ? ('/ ' + sessionBudget + 'm') : '';
    document.getElementById('dc-schedule-time').textContent =
      slide.dataset.scheduleTime || panel.dataset.scheduleTime || '';
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (e.key === 't' || e.key === 'T') {
      timerVisible = !timerVisible;
      panel.classList.toggle('hidden', !timerVisible);
      dayClock.classList.toggle('hidden', !timerVisible);
    }
    if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
      sessionStart = Date.now();
      slideStart   = Date.now();
    }
  });

  // Hook into Reveal
  Reveal.on('slidechanged', onSlideChange);
  Reveal.on('ready', function(e) { onSlideChange(e); });

  requestAnimationFrame(tick);
})();
</script>
"""

# ── Helpers ──────────────────────────────────────────────────────────────────

def extract_sections(html: str) -> list[str]:
    """
    Extract all top-level <section ...>...</section> blocks from HTML.
    Works even when sections contain nested HTML (but not nested <section>).
    """
    sections = []
    i = 0
    while True:
        start = html.find('<section', i)
        if start == -1:
            break
        # Find matching closing tag, counting nesting
        depth = 0
        pos = start
        while pos < len(html):
            open_m  = html.find('<section', pos)
            close_m = html.find('</section>', pos)
            if close_m == -1:
                break
            if open_m != -1 and open_m < close_m:
                depth += 1
                pos = open_m + len('<section')
            else:
                depth -= 1
                end = close_m + len('</section>')
                if depth == 0:
                    sections.append(html[start:end])
                    i = end
                    break
                pos = close_m + len('</section>')
        else:
            break
    return sections


def make_session_divider(session: dict, idx: int) -> str:
    """Create a between-session divider slide with session metadata."""
    budget_str = f"{session['budget']} min" if session['budget'] > 0 else "Reference"
    return (
        f'  <section data-background-color="#001141" class="divider"'
        f' data-session="{session["title"]}"'
        f' data-session-budget="{session["budget"]}"'
        f' data-session-start="1"'
        f' data-schedule-time="{session["time"]}">\n'
        f'    <p class="eyebrow" style="color:rgba(255,255,255,0.5)">'
        f'Session {idx + 1} of {len(SESSIONS)} &nbsp;·&nbsp; {session["time"]}'
        f'&nbsp;·&nbsp; {budget_str}</p>\n'
        f'    <h2 style="font-size:2.2em">{session["title"]}</h2>\n'
        f'  </section>\n'
    )


def annotate_sections(sections: list[str], session: dict) -> list[str]:
    """
    Add data-time, data-session, data-session-budget, data-schedule-time
    to each section's opening tag.
    """
    times = session["slide_times"]
    annotated = []
    for i, sec in enumerate(sections):
        t = times[i] if i < len(times) else times[-1]
        # Inject attributes into opening <section tag
        tag_match = re.match(r'(<section)([^>]*>)', sec, re.DOTALL)
        if tag_match:
            attrs_existing = tag_match.group(2)
            new_attrs = (
                f' data-time="{t}"'
                f' data-session="{session["title"]}"'
                f' data-session-budget="{session["budget"]}"'
                f' data-schedule-time="{session["time"]}"'
            )
            sec = f'{tag_match.group(1)}{new_attrs}{attrs_existing}' + sec[tag_match.end():]
        annotated.append(sec)
    return annotated


def fix_asset_paths(html: str, session_file: str) -> str:
    """
    Rewrite relative asset paths (src, href pointing to ../../ or ./)
    so they still resolve from the merged file's location (slides/).
    The merged file lives at slides/all_sessions.html.
    Each individual deck is at slides/<folder>/index.html.
    So ../../foo.gif in a deck becomes ../foo.gif in the merged file? No —
    ../../ from slides/<folder>/ = parent of slides/ which is thursday-masking/
    The merged file is at slides/ so it needs ../ to reach thursday-masking/
    ../../ from deck  → ../  from merged file (one level less)
    ./ from deck      → <folder>/ from merged file
    """
    folder = Path(session_file).parent.name  # e.g. "02_triadic_dataset"

    # ../../something → ../something
    html = re.sub(r'(src|href)=["\']\.\.\/\.\.\/', r'\1="../', html)

    # ./something → <folder>/something
    html = re.sub(r'(src|href)=["\']\.\/', rf'\1="{folder}/', html)

    # bare relative refs like src="mask_many.gif" → src="../mask_many.gif"
    # (only if not already starting with http/# and not already fixed)
    def fix_bare(m):
        attr, val = m.group(1), m.group(2)
        if val.startswith(('http', '#', '/', '../', folder + '/')):
            return m.group(0)
        return f'{attr}="../{val}"'

    html = re.sub(r'(src|href)=["\']([^"\'#>]+)["\']', fix_bare, html)
    return html


# ── Main ─────────────────────────────────────────────────────────────────────

def build_merged(output_path: Path) -> None:
    all_sections = []

    for idx, session in enumerate(SESSIONS):
        fp = SLIDES_DIR / session["file"]
        if not fp.exists():
            print(f"  WARNING: {fp} not found, skipping.")
            continue

        raw = fp.read_text(encoding="utf-8")
        raw = fix_asset_paths(raw, session["file"])
        sections = extract_sections(raw)
        sections = annotate_sections(sections, session)

        # Inject session divider before the first slide
        all_sections.append(make_session_divider(session, idx))
        all_sections.extend(f"  {s}\n" for s in sections)
        print(f"  [{idx+1}] {session['title']}: {len(sections)} slides")

    total = len(all_sections)
    print(f"\n  Total slides: {total}")

    # ── Day-overview title slide (prepended) ──────────────────────────
    day_title = """\
  <section data-time="0" data-session="Thursday Masking Day"
           data-session-budget="0" data-session-start="1"
           data-schedule-time="09:00 – 17:30">
    <div class="title-slide">
      <p class="eyebrow">Tilburg Multiscale Summerschool 2026</p>
      <h1>Thursday: Masking &amp; Anonymising Audiovisual Data</h1>
      <p class="subtitle">Full day · All sessions</p>
      <p class="meta">
        Babajide Owoyele &nbsp;·&nbsp; Radboud University / SYNAPSIS<br>
        Press <kbd style="background:#161616;border:1px solid #525252;
        padding:0.1em 0.4em;font-size:0.85em;border-radius:2px">T</kbd>
        to toggle the speaker timer &nbsp;·&nbsp;
        <kbd style="background:#161616;border:1px solid #525252;
        padding:0.1em 0.4em;font-size:0.85em;border-radius:2px">R</kbd>
        to reset session clock
      </p>

      <!-- Institution logos -->
      <div style="display:flex;align-items:center;gap:2.5em;margin-top:2em;flex-wrap:wrap">
        <img src="logos/radboud.png"
             onerror="this.style.display='none'"
             alt="Radboud University"
             style="height:36px;opacity:0.85;filter:brightness(10)">
        <img src="logos/hpi.png"
             onerror="this.style.display='none'"
             alt="Hasso Plattner Institute"
             style="height:36px;opacity:0.85;filter:brightness(10)">
        <img src="logos/tdcc.png"
             onerror="this.style.display='none'"
             alt="TDCC-SSH"
             style="height:36px;opacity:0.85;filter:brightness(10)">
        <!-- Inline text fallbacks shown while logo files are missing -->
        <span class="logo-text-fallback" style="font-size:0.62em;color:#525252;letter-spacing:0.05em;text-transform:uppercase;font-weight:600">
          Radboud University &nbsp;·&nbsp; HPI &nbsp;·&nbsp; TDCC-SSH
        </span>
      </div>
    </div>
  </section>
"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thursday Masking Day — All Sessions</title>

  <link rel="preconnect" href="https://fonts.bunny.net" />
  <link href="https://fonts.bunny.net/css?family=ibm-plex-sans:300,400,600,700|ibm-plex-mono:400,600" rel="stylesheet" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/black.css" />

  <style>
{SHARED_CSS}
  </style>
</head>
<body>

{TIMER_HTML}

<div class="reveal">
<div class="slides">

{day_title}
{''.join(all_sections)}
</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
<script>
  Reveal.initialize({{
    width: 1280, height: 720,
    margin: 0.04, minScale: 0.2, maxScale: 2.0,
    center: false, hash: true,
    slideNumber: 'c/t',
    controls: true, progress: true,
    transition: 'fade', transitionSpeed: 'fast',
    autoPlayMedia: true,
  }});
</script>

{TIMER_JS}
</body>
</html>
"""

    output_path.write_text(html, encoding="utf-8")
    print(f"\n  Written -> {output_path}")
    print(f"  Open in browser: file://{output_path.resolve()}")


if __name__ == "__main__":
    out = Path(sys.argv[sys.argv.index('--out') + 1]) if '--out' in sys.argv else \
          SLIDES_DIR / "all_sessions.html"
    print(f"Merging {len(SESSIONS)} decks -> {out.name}\n")
    build_merged(out)

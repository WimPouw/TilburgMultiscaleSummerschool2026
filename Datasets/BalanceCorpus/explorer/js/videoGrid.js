// Ported from review-app/public/components/videoGrid.js (ES module -> classic
// IIFE under BMC.videoGrid). Logic unchanged; consumes blob URLs (native mp4)
// instead of the old /media/video transcode stream.
(function (BMC) {
  "use strict";

  const TILES = [
    { key: "video_cg_cam01", label: "CG · cam01" },
    { key: "video_cg_cam02", label: "CG · cam02" },
    { key: "video_g_cam01",  label: "G · cam01"  },
    { key: "video_g_cam02",  label: "G · cam02"  },
  ];

  const SYNC_THRESHOLD = 0.1;
  const state = {
    videos: [],
    primary: null,
    timeListeners: new Set(),
    ready: new WeakSet(),
    duration: 0,
  };

  function buildVideoGrid(trial) {
    const grid = document.getElementById("video-grid");
    grid.replaceChildren();
    state.videos = [];
    state.primary = null;

    for (const t of TILES) {
      const tile = document.createElement("div");
      tile.className = "tile";

      const u = trial.mediaUrls[t.key];
      if (u) {
        const v = document.createElement("video");
        v.src = u;
        v.preload = "auto";
        v.muted = true;
        v.playsInline = true;
        tile.appendChild(v);
        v.addEventListener("canplay", () => { state.ready.add(v); maybeEnablePlay(); });
        state.videos.push(v);
        if (!state.primary && t.key === "video_cg_cam01") state.primary = v;
      } else {
        tile.classList.add("empty");
      }

      const label = document.createElement("span");
      label.className = "label";
      label.textContent = u ? t.label : "no file";
      tile.appendChild(label);

      grid.appendChild(tile);
    }
    if (!state.primary && state.videos.length > 0) state.primary = state.videos[0];

    state.duration = 0;

    if (state.primary) {
      const reportDur = () => {
        const d = state.primary.duration;
        if (Number.isFinite(d) && d > 0) setDuration(d);
      };
      state.primary.addEventListener("loadedmetadata", reportDur);
      state.primary.addEventListener("durationchange", reportDur);
      state.primary.addEventListener("timeupdate", () => {
        const t = state.primary.currentTime;
        for (const v of state.videos) {
          if (v === state.primary) continue;
          if (Math.abs(v.currentTime - t) > SYNC_THRESHOLD) v.currentTime = t;
        }
        for (const cb of state.timeListeners) cb(t);
      });
    }

    attachScrubBar();
  }

  function maybeEnablePlay() {
    const allReady = state.videos.length > 0 && state.videos.every((v) => state.ready.has(v));
    const btn = document.getElementById("vg-play");
    if (btn) btn.disabled = !allReady;
  }

  function playIconSvg(stateName) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 12 12");
    svg.setAttribute("fill", "currentColor");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", stateName === "pause"
      ? "M2 1.5 H4.4 V10.5 H2 Z M7.6 1.5 H10 V10.5 H7.6 Z"
      : "M2 1 L10 6 L2 11 Z");
    svg.appendChild(path);
    return svg;
  }

  function formatTime(s) {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  }

  function attachScrubBar() {
    const bar = document.getElementById("scrub-bar");
    bar.replaceChildren();

    const playBtn = document.createElement("button");
    playBtn.id = "vg-play";
    playBtn.className = "play-btn";
    playBtn.dataset.state = "play";
    playBtn.setAttribute("aria-label", "Play");
    playBtn.disabled = true;
    playBtn.appendChild(playIconSvg("play"));

    const track = document.createElement("div");
    track.className = "scrub-track";
    const progress = document.createElement("div");
    progress.className = "scrub-progress";
    const thumb = document.createElement("div");
    thumb.className = "scrub-thumb";
    track.append(progress, thumb);

    const timeLabel = document.createElement("div");
    timeLabel.className = "scrub-time";
    timeLabel.textContent = "0:00 / 0:00";

    bar.append(playBtn, track, timeLabel);

    function setIcon(nextState) {
      playBtn.dataset.state = nextState;
      playBtn.replaceChildren(playIconSvg(nextState));
      playBtn.setAttribute("aria-label", nextState === "pause" ? "Pause" : "Play");
    }

    playBtn.addEventListener("click", () => {
      if (!state.primary) return;
      if (state.primary.paused) play(); else pause();
    });

    function seekFromEvent(e) {
      const dur = getDuration() || (state.primary && state.primary.duration) || 0;
      if (!state.primary || dur <= 0) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(ratio * dur);
    }
    let dragging = false;
    track.addEventListener("pointerdown", (e) => {
      dragging = true;
      track.setPointerCapture(e.pointerId);
      seekFromEvent(e);
    });
    track.addEventListener("pointermove", (e) => { if (dragging) seekFromEvent(e); });
    track.addEventListener("pointerup", (e) => {
      dragging = false;
      try { track.releasePointerCapture(e.pointerId); } catch {}
    });

    if (state.primary) {
      const updateUI = () => {
        const cur = state.primary.currentTime || 0;
        const dur = getDuration() || state.primary.duration || 0;
        const pct = dur > 0 ? (cur / dur) * 100 : 0;
        progress.style.width = `${pct}%`;
        thumb.style.left = `${pct}%`;
        timeLabel.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
      };
      state.primary.addEventListener("loadedmetadata", updateUI);
      state.primary.addEventListener("durationchange", updateUI);
      state.primary.addEventListener("timeupdate", updateUI);
      state.primary.addEventListener("play", () => setIcon("pause"));
      state.primary.addEventListener("pause", () => setIcon("play"));
      document.addEventListener("vg:duration", updateUI);
    }
  }

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function play() {
    state.videos.forEach((v) => v.play());
    emit("vg:play", {});
  }
  function pause() {
    state.videos.forEach((v) => v.pause());
    emit("vg:pause", {});
  }
  function togglePlay() {
    if (!state.primary) return;
    state.primary.paused ? play() : pause();
  }
  function seek(t, opts) {
    const keepPlaying = !opts || opts.keepPlaying !== false;
    const wasPlaying = state.primary && !state.primary.paused;
    state.videos.forEach((v) => v.pause());
    for (const v of state.videos) v.currentTime = t;
    emit("vg:seek", { t });
    if (keepPlaying && wasPlaying) {
      play();
    } else if (!keepPlaying) {
      emit("vg:pause", {});
    }
  }
  function getCurrentTime() { return state.primary ? state.primary.currentTime : 0; }
  function getDuration() { return state.duration; }
  function setDuration(d) {
    if (!Number.isFinite(d) || d <= 0) return;
    if (d > state.duration + 0.01) {
      state.duration = d;
      emit("vg:duration", { duration: d });
    }
  }
  function onTime(cb) { state.timeListeners.add(cb); return () => state.timeListeners.delete(cb); }

  BMC.videoGrid = {
    buildVideoGrid, play, pause, togglePlay, seek,
    getCurrentTime, getDuration, setDuration, onTime,
  };
})(window.BMC);

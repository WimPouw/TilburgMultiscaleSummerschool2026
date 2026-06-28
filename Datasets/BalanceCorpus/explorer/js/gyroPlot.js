// Gyroscope panel — plots Tilt (orientation, °) or Acceleration (g) as clean
// lines with a playback cursor. The gyro CSV is cut to the trial (no padding),
// so the timeline maps directly to the video/audio: sample 0 = trial start.
(function (BMC) {
  "use strict";
  const VG = BMC.videoGrid;

  const MODES = {
    tilt: {
      keys: ["tiltX", "tiltY", "tiltZ"],
      labels: ["Roll (X)", "Pitch (Y)", "Yaw (Z)"],
      note: "° · sway from trial start",
      decimals: 1, suffix: "°",
    },
    angvel: {
      keys: ["asX", "asY", "asZ"],
      labels: ["AsX", "AsY", "AsZ"],
      note: "°/s · angular velocity",
      decimals: 1, suffix: " °/s",
    },
    acc: {
      keys: ["accX", "accY", "accZ"],
      labels: ["AccX", "AccY", "AccZ"],
      note: "g · raw acceleration",
      decimals: 2, suffix: " g",
    },
  };
  const COLORS = ["#ef4444", "#10b981", "#3b82f6"];

  let mode = (() => {
    const saved = localStorage.getItem("bmc.gyroMode");
    return saved && MODES[saved] ? saved : "angvel"; // default: angular velocity
  })();
  let plot = null;
  let plotHost = null;
  let cursorEl = null;     // thin playhead line at the current video time
  let lastFull = null;
  let detach = [];
  let resizeObs = null;

  function teardown() {
    for (const off of detach) try { off(); } catch {}
    detach = [];
    if (plot) { try { plot.destroy(); } catch {} plot = null; }
    if (resizeObs) { try { resizeObs.disconnect(); } catch {} resizeObs = null; }
    plotHost = null;
    cursorEl = null;
  }

  function tokenColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#999";
  }

  function createPlot(host, duration) {
    if (typeof uPlot === "undefined" || !lastFull) return null;
    const m = MODES[mode];
    const fg = tokenColor("--fg-muted");
    const grid = tokenColor("--border");
    const opts = {
      width: host.clientWidth || 640,
      height: 160,
      padding: [4, 8, 0, 0],
      cursor: { show: true, drag: { x: false, y: false } },
      legend: { show: false },
      scales: {
        x: duration > 0 ? { time: false, min: 0, max: duration } : { time: false, auto: true },
        y: { auto: true },
      },
      axes: [
        { stroke: fg, grid: { stroke: grid }, ticks: { stroke: grid },
          values: (u, vs) => vs.map((v) => v.toFixed(0)),
          font: "10px ui-monospace, monospace", size: 22 },
        { show: false, size: 0 },
      ],
      series: [
        {},
        { label: m.labels[0], stroke: COLORS[0], width: 1.25, points: { show: false } },
        { label: m.labels[1], stroke: COLORS[1], width: 1.25, points: { show: false } },
        { label: m.labels[2], stroke: COLORS[2], width: 1.25, points: { show: false } },
      ],
    };
    const data = [lastFull.t, lastFull[m.keys[0]], lastFull[m.keys[1]], lastFull[m.keys[2]]];
    return new uPlot(opts, data, host);
  }

  function updateCursor(time) {
    if (!plot || !cursorEl) return;
    const dur = VG.getDuration();
    if (dur <= 0) { cursorEl.style.display = "none"; return; }
    cursorEl.style.left = `${plot.valToPos(Math.max(0, Math.min(time, dur)), "x")}px`;
    cursorEl.style.display = "";
  }

  function syncControls() {
    const m = MODES[mode];
    document.querySelectorAll("#gyro-panel .gyro-leg-label").forEach((el, i) => { el.textContent = m.labels[i] || ""; });
    const note = document.querySelector("#gyro-panel .gyro-legend-note");
    if (note) note.textContent = m.note;
    for (const btn of document.querySelectorAll("#gyro-mode [data-gyro-mode]")) {
      const on = btn.dataset.gyroMode === mode;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function updateMeta() {
    const metaEl = document.getElementById("gyro-meta");
    if (!metaEl || !lastFull) return;
    const m = MODES[mode];
    const t = lastFull.t;
    const span = t.length > 0 ? `${t[t.length - 1].toFixed(2)} s` : "—";
    let lo = Infinity, hi = -Infinity;
    for (const k of m.keys) for (const v of lastFull[k]) { if (Number.isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }
    const yRange = lo <= hi ? ` · ${lo.toFixed(m.decimals)}…${hi.toFixed(m.decimals)}${m.suffix}` : "";
    metaEl.textContent = `${t.length.toLocaleString()} samples · ${lastFull.level} · spans ${span}${yRange}`;
  }

  function drawPlot() {
    if (!plotHost || !lastFull) return;
    if (plot) { try { plot.destroy(); } catch {} plot = null; }
    plot = createPlot(plotHost, VG.getDuration());
    updateMeta();
    syncControls();
    updateCursor(VG.getCurrentTime());
  }

  async function buildGyroPlot(trial) {
    const root = document.getElementById("gyro-plot");
    const panel = document.getElementById("gyro-panel");
    teardown();
    root.replaceChildren();

    let data = null;
    try { data = await BMC.corpus.getGyro(trial.group, trial.trial); } catch { data = null; }
    if (!data) { panel.hidden = true; return; }
    panel.hidden = false;
    lastFull = data;

    plotHost = document.createElement("div");
    plotHost.style.position = "relative";
    root.appendChild(plotHost);

    cursorEl = document.createElement("div");
    cursorEl.className = "gyro-cursor";
    cursorEl.style.display = "none";
    root.appendChild(cursorEl);

    drawPlot();

    const onDur = () => drawPlot();
    const onTime = VG.onTime((t) => updateCursor(t));
    document.addEventListener("vg:duration", onDur);
    detach.push(() => document.removeEventListener("vg:duration", onDur));
    detach.push(onTime);

    resizeObs = new ResizeObserver(() => {
      if (!plot || !plotHost) return;
      plot.setSize({ width: plotHost.clientWidth, height: 160 });
      updateCursor(VG.getCurrentTime());
    });
    resizeObs.observe(plotHost);
  }

  function setMode(next) {
    if (!MODES[next] || next === mode) return;
    mode = next;
    localStorage.setItem("bmc.gyroMode", mode);
    if (lastFull) drawPlot(); else syncControls();
  }

  function initControls() {
    for (const btn of document.querySelectorAll("#gyro-mode [data-gyro-mode]")) {
      btn.addEventListener("click", () => setMode(btn.dataset.gyroMode));
    }
    syncControls();
  }

  BMC.gyroPlot = { buildGyroPlot, setMode, initControls };
})(window.BMC);

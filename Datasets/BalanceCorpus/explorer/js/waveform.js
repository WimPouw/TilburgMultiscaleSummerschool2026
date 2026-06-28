// Ported from review-app/public/components/waveform.js.
// Uses the UMD wavesurfer global (window.WaveSurfer) + its Spectrogram plugin
// (window.WaveSurfer.Spectrogram) instead of ESM imports. Audio source is a
// blob URL for the picked .wav. Transport synced to BMC.videoGrid via the same
// vg:play/pause/seek event bus.
(function (BMC) {
  "use strict";
  const VG = BMC.videoGrid;

  let ws = null;
  let detach = [];

  function colors() {
    const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
    return { wave: isDark ? "#6366f1" : "#94a3b8", progress: "#3b82f6", cursor: "#3b82f6" };
  }
  function formatDuration(s) { return Number.isFinite(s) ? `${s.toFixed(2)} s` : ""; }

  function teardown() {
    for (const off of detach) try { off(); } catch {}
    detach = [];
    if (ws) { try { ws.destroy(); } catch {} ws = null; }
  }

  function buildWaveform(trial) {
    const container = document.getElementById("waveform");
    const specContainer = document.getElementById("spectrogram");
    const metaEl = document.getElementById("waveform-meta");
    container.replaceChildren();
    if (specContainer) specContainer.replaceChildren();
    teardown();
    if (metaEl) metaEl.textContent = "";

    if (!trial.mediaUrls.audio) { container.textContent = "no audio"; return; }

    const WaveSurfer = window.WaveSurfer;
    const Spectrogram = window.WaveSurfer && window.WaveSurfer.Spectrogram;
    if (!WaveSurfer) { container.textContent = "waveform library not loaded"; return; }

    const c = colors();
    const plugins = [];
    if (specContainer && Spectrogram) {
      plugins.push(Spectrogram.create({
        container: specContainer, labels: true, labelsBackground: "transparent",
        height: 80, splitChannels: false, fftSamples: 512, scale: "mel",
        windowFunc: "hann", frequencyMax: 8000, frequencyMin: 0,
      }));
    }

    ws = WaveSurfer.create({
      container, height: 56,
      waveColor: c.wave, progressColor: c.progress, cursorColor: c.cursor, cursorWidth: 1.5,
      barWidth: 2, barGap: 1, barRadius: 1.5, barHeight: 0.9,
      normalize: true, interact: true,
      splitChannels: [
        { waveColor: c.wave, progressColor: c.progress, height: 56 },
        { waveColor: c.wave, progressColor: c.progress, height: 56 },
      ],
      plugins,
    });
    ws.load(trial.mediaUrls.audio);

    ws.on("ready", () => {
      const dur = ws.getDuration();
      if (metaEl) metaEl.textContent = formatDuration(dur);
      VG.setDuration(dur);
    });

    ws.on("interaction", (t) => VG.seek(t));

    const onPlay  = () => { if (ws) ws.play(); };
    const onPause = () => { if (ws) ws.pause(); };
    const onSeek  = (e) => { if (ws) ws.setTime(Math.max(0, (e.detail && e.detail.t) || 0)); };
    document.addEventListener("vg:play",  onPlay);
    document.addEventListener("vg:pause", onPause);
    document.addEventListener("vg:seek",  onSeek);
    detach.push(() => document.removeEventListener("vg:play",  onPlay));
    detach.push(() => document.removeEventListener("vg:pause", onPause));
    detach.push(() => document.removeEventListener("vg:seek",  onSeek));

    const offTime = VG.onTime((t) => {
      if (!ws) return;
      const dur = ws.getDuration() || 0;
      if (dur <= 0) return;
      const cur = ws.getCurrentTime();
      if (Math.abs(cur - t) > 0.15) ws.setTime(Math.min(t, dur));
    });
    detach.push(offTime);
  }

  BMC.waveform = { buildWaveform };
})(window.BMC);

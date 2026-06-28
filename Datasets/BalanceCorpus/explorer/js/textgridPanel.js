// Ported from review-app/public/components/textgridPanel.js.
(function (BMC) {
  "use strict";
  const VG = BMC.videoGrid;

  let tooltipEl = null;
  let dismiss = null;
  let lastTrial = null;

  function closeTooltip() {
    if (dismiss) { try { dismiss(); } catch {} dismiss = null; }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
  }

  document.addEventListener("vg:duration", () => {
    if (lastTrial) renderTiers(lastTrial);
  });

  function showTooltip(anchorEl, info) {
    const { tier, speaker, xmin, xmax, text } = info;
    closeTooltip();
    const t = document.createElement("div");
    t.className = "interval-tooltip";

    const head = document.createElement("div");
    head.className = "tt-head";
    const tierEl = document.createElement("span");
    tierEl.className = "tt-tier";
    tierEl.textContent = `${speaker} · ${tier}`;
    const rangeEl = document.createElement("span");
    rangeEl.className = "tt-range";
    rangeEl.textContent = `${xmin.toFixed(2)}–${xmax.toFixed(2)} s · ${(xmax - xmin).toFixed(2)} s`;
    head.append(tierEl, rangeEl);

    const body = document.createElement("div");
    body.className = "tt-body";
    body.textContent = text;

    const close = document.createElement("button");
    close.className = "tt-close";
    close.type = "button";
    close.textContent = "×";
    close.addEventListener("click", (e) => { e.stopPropagation(); closeTooltip(); });

    t.append(close, head, body);
    document.body.appendChild(t);
    tooltipEl = t;

    const a = anchorEl.getBoundingClientRect();
    const tt = t.getBoundingClientRect();
    const margin = 8;
    let left = a.left + (a.width / 2) - (tt.width / 2);
    left = Math.max(margin, Math.min(window.innerWidth - tt.width - margin, left));
    let top = a.top - tt.height - 10;
    if (top < margin) top = a.bottom + 10;
    t.style.left = `${left}px`;
    t.style.top = `${top}px`;

    const onDocClick = (e) => {
      if (!tooltipEl) return;
      if (tooltipEl.contains(e.target) || anchorEl.contains(e.target)) return;
      closeTooltip();
    };
    const onKey = (e) => { if (e.key === "Escape") closeTooltip(); };
    const onScroll = () => closeTooltip();
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    dismiss = () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
    };
  }

  function buildTextGridPanel(trial) {
    closeTooltip();
    lastTrial = trial;
    renderTiers(trial);
  }

  function renderTiers(trial) {
    const root = document.getElementById("tier-rows");
    if (!root) return;
    root.replaceChildren();

    const duration = VG.getDuration() || maxXmax(trial);
    if (duration <= 0) return;

    for (const tg of trial.textgrids || []) {
      if (!tg.parsed) continue;
      for (const tier of tg.parsed.tiers || []) {
        const row = document.createElement("div");
        row.className = "tier";
        const name = document.createElement("div");
        name.className = "tier-name";
        name.textContent = `${tg.speaker} · ${tier.name}`;
        const track = document.createElement("div");
        track.className = "tier-track";
        for (const iv of tier.intervals) {
          if (!iv.text || !iv.text.trim()) continue;
          const el = document.createElement("div");
          el.className = "interval";
          el.style.left = `${(iv.xmin / duration) * 100}%`;
          el.style.width = `${((iv.xmax - iv.xmin) / duration) * 100}%`;
          el.textContent = iv.text;
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            VG.seek(iv.xmin, { keepPlaying: false });
            showTooltip(el, { tier: tier.name, speaker: tg.speaker, xmin: iv.xmin, xmax: iv.xmax, text: iv.text });
          });
          track.appendChild(el);
        }
        row.append(name, track);
        root.appendChild(row);
      }
    }
  }

  function maxXmax(trial) {
    let m = 0;
    for (const tg of trial.textgrids || []) {
      if (tg.parsed && tg.parsed.xmax) m = Math.max(m, tg.parsed.xmax);
    }
    return m;
  }

  BMC.textgridPanel = { buildTextGridPanel };
})(window.BMC);

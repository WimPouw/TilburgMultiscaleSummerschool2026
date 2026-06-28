// Boot + event wiring. Ported from review-app/public/app.js, with the server
// data layer replaced by BMC.corpus and the path-settings dialog replaced by a
// folder picker (webkitdirectory). Classic script — runs from file://.
(function (BMC) {
  "use strict";
  const VG = BMC.videoGrid;

  const TRIAL_PANEL_IDS = [
    "meta", "video-grid", "vg-resize", "scrub-bar",
    "waveform-panel", "gyro-panel", "metadata-panel", "demographics-panel",
  ];

  function showTrialPanels(visible) {
    document.getElementById("viewer-empty").hidden = visible;
    for (const id of TRIAL_PANEL_IDS) {
      const el = document.getElementById(id);
      if (el) el.hidden = !visible;
    }
  }

  function renderMeta(trial) {
    const meta = document.getElementById("meta");
    meta.replaceChildren();

    const left = document.createElement("div");
    left.className = "meta-l";

    const crumb = document.createElement("div");
    crumb.className = "crumb";
    crumb.append(document.createTextNode(trial.group));
    const sep = document.createElement("span");
    sep.className = "sep";
    sep.textContent = "/";
    crumb.append(sep, document.createTextNode(`trial ${trial.trial}`));

    const title = document.createElement("h1");
    title.className = "title";
    title.textContent = trial.target_word || "(no target word)";
    left.append(crumb, title);

    const chips = document.createElement("div");
    chips.className = "chips";

    const condition = (trial.condition || "").toLowerCase();
    const condChip = document.createElement("span");
    condChip.className = "chip" + (condition === "board" || condition === "ground" ? ` cond-${condition}` : "");
    const condDot = document.createElement("span");
    condDot.className = "chip-dot";
    condChip.append(condDot, document.createTextNode(condition || "—"));
    chips.appendChild(condChip);

    if (trial.clue_giver_pid) {
      const cg = document.createElement("span");
      cg.className = "chip";
      cg.append(document.createTextNode("clue-giver"));
      const cgVal = document.createElement("strong");
      cgVal.textContent = String(trial.clue_giver_pid);
      cg.appendChild(cgVal);
      chips.appendChild(cg);
    }

    const rt = Number(trial.metadata && trial.metadata.response_time_sec);
    if (Number.isFinite(rt)) {
      const rtChip = document.createElement("span");
      rtChip.className = "chip";
      rtChip.textContent = `${rt.toFixed(1)} s`;
      chips.appendChild(rtChip);
    }

    meta.append(left, chips);
  }

  async function loadTrial(id) {
    const trial = await BMC.corpus.getTrial(id);
    if (!trial) { showTrialPanels(false); return; }
    showTrialPanels(true);
    renderMeta(trial);
    BMC.sidebar.setActive(trial.id);
    window.__trial = trial;
    document.dispatchEvent(new CustomEvent("trial:loaded", { detail: trial }));
  }

  // ---- Folder picker (replaces path settings) ----------------------------
  function setEmptyMessage(msg) {
    const empty = document.getElementById("viewer-empty");
    if (empty) empty.textContent = msg;
  }

  function initFolderPicker() {
    const input = document.getElementById("folder-input");
    for (const btn of document.querySelectorAll("[data-open-folder]")) {
      btn.addEventListener("click", () => input.click());
    }
    input.addEventListener("change", async () => {
      const files = input.files;
      if (!files || files.length === 0) return;
      setEmptyMessage("Loading corpus…");
      try {
        const res = await BMC.corpus.openFolder(files);
        await BMC.sidebar.refreshSidebar();
        document.body.classList.add("corpus-loaded");
        setEmptyMessage(res.trials > 0 ? "Pick a trial on the left." : "No trials found in metadata.csv.");
        // If a trial is addressed in the hash, open it now that the index exists.
        const m = location.hash.match(/^#\/([^\/]+)\/(\d+)$/);
        if (m) loadTrial(`${m[1]}__trial${String(Number(m[2])).padStart(2, "0")}`);
      } catch (err) {
        setEmptyMessage("Could not load corpus: " + (err && err.message || err));
      }
    });
  }

  // ---- Boot --------------------------------------------------------------
  function boot() {
    initFolderPicker();
    BMC.sidebar.initSidebar(loadTrial);
    setEmptyMessage("Open a corpus folder to begin.");

    document.addEventListener("trial:loaded", (e) => {
      BMC.videoGrid.buildVideoGrid(e.detail);
      BMC.waveform.buildWaveform(e.detail);
      BMC.textgridPanel.buildTextGridPanel(e.detail);
      BMC.gyroPlot.buildGyroPlot(e.detail);
      BMC.metadataPanel.buildMetadataPanel(e.detail);
      BMC.demographicsPanel.buildDemographicsPanel(e.detail);
    });

    setupSidebarToggle();
    setupVideoResize();
    setupPanelCollapse();
    BMC.gyroPlot.initControls();
    setupKeyboard();
  }

  // Inject a minimize/expand toggle into each .panel header. Collapsing hides
  // everything in the panel except its header; state persists per panel id.
  function setupPanelCollapse() {
    for (const panel of document.querySelectorAll(".panel")) {
      const head = panel.querySelector(".panel-head");
      if (!head || head.querySelector(".panel-collapse")) continue;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "panel-collapse icon-btn";
      btn.setAttribute("aria-label", "Minimize section");
      btn.title = "Minimize / expand";
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", "0 0 12 12");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", "M3 4.5 L6 7.5 L9 4.5"); // chevron
      svg.appendChild(path);
      btn.appendChild(svg);

      const key = `bmc.collapsed.${panel.id}`;
      const apply = (collapsed) => {
        panel.classList.toggle("collapsed", collapsed);
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      };
      apply(localStorage.getItem(key) === "1");

      btn.addEventListener("click", () => {
        const collapsed = !panel.classList.contains("collapsed");
        apply(collapsed);
        localStorage.setItem(key, collapsed ? "1" : "0");
        // Let uPlot/wavesurfer re-measure if a panel above just changed height.
        setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
      });

      head.appendChild(btn);
    }
  }

  function setupSidebarToggle() {
    const btn = document.getElementById("sidebar-toggle");
    if (!btn) return;
    if (localStorage.getItem("bmc.sidebarCollapsed") === "1") {
      document.body.classList.add("sidebar-collapsed");
    }
    btn.addEventListener("click", () => {
      const next = !document.body.classList.contains("sidebar-collapsed");
      document.body.classList.toggle("sidebar-collapsed", next);
      localStorage.setItem("bmc.sidebarCollapsed", next ? "1" : "0");
      setTimeout(() => window.dispatchEvent(new Event("resize")), 220);
    });
  }

  function setupVideoResize() {
    const handle = document.getElementById("vg-resize");
    if (!handle) return;
    const stored = localStorage.getItem("bmc.vgHeightPx");
    if (stored) document.documentElement.style.setProperty("--vg-h", `${stored}px`);

    let startY = 0, startH = 0;
    handle.addEventListener("pointerdown", (e) => {
      const grid = document.getElementById("video-grid");
      if (!grid) return;
      startY = e.clientY;
      startH = grid.getBoundingClientRect().height;
      handle.classList.add("dragging");
      handle.setPointerCapture(e.pointerId);
      document.body.style.userSelect = "none";
    });
    handle.addEventListener("pointermove", (e) => {
      if (!handle.classList.contains("dragging")) return;
      const newH = Math.max(160, Math.min(window.innerHeight - 160, startH + (e.clientY - startY)));
      document.documentElement.style.setProperty("--vg-h", `${Math.round(newH)}px`);
    });
    const endDrag = (e) => {
      if (!handle.classList.contains("dragging")) return;
      handle.classList.remove("dragging");
      try { handle.releasePointerCapture(e.pointerId); } catch {}
      document.body.style.userSelect = "";
      const val = document.documentElement.style.getPropertyValue("--vg-h");
      const px = parseInt(val, 10);
      if (Number.isFinite(px)) localStorage.setItem("bmc.vgHeightPx", String(px));
      window.dispatchEvent(new Event("resize"));
    };
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
    handle.addEventListener("dblclick", () => {
      document.documentElement.style.removeProperty("--vg-h");
      localStorage.removeItem("bmc.vgHeightPx");
      window.dispatchEvent(new Event("resize"));
    });
  }

  function setupKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea")) return;
      const id = window.__trial && window.__trial.id;
      switch (e.key) {
        case " ": e.preventDefault(); VG.togglePlay(); break;
        case "j": case "J": e.shiftKey ? BMC.sidebar.navGroup(-1, id) : BMC.sidebar.navTrial(-1, id); break;
        case "k": case "K": e.shiftKey ? BMC.sidebar.navGroup(1, id) : BMC.sidebar.navTrial(1, id); break;
        case "ArrowLeft": VG.seek(Math.max(0, VG.getCurrentTime() - 2)); break;
        case "ArrowRight": VG.seek(VG.getCurrentTime() + 2); break;
        case "?": document.getElementById("cheatsheet").showModal(); break;
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.BMC);

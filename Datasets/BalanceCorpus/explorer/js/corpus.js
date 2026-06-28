// Client-side data layer — replaces the Node/Express server.
// Reads the corpus straight from a folder the user picks (webkitdirectory),
// builds the trial index from metadata.csv, and resolves media to blob URLs.
// Mirrors the shapes the UI components expect (see review-app src/lib/indexer.js
// and src/routes/*). Runs from file:// with classic scripts only.
(function (BMC) {
  "use strict";
  const { parseCsv, parseCsvRows, parseTextGrid, pad2 } = BMC.util;

  const state = {
    byBasename: new Map(), // lowercased basename -> File (corpus filenames are globally unique)
    trials: [],
    groups: [],
    byId: new Map(),
    gyroFile: null,        // File handle, parsed lazily on first gyro view
    gyroByGroup: null,     // Map<group, rows[]> once parsed
    gyroHasTrial: false,
    demographics: null,    // Map<participant_id, row> (null if no demographics.csv)
    liveUrls: [],          // object URLs for the currently-open trial (revoked on next load)
  };

  function baseName(path) {
    const i = path.replace(/\\/g, "/").lastIndexOf("/");
    return (i >= 0 ? path.slice(i + 1) : path).toLowerCase();
  }
  function lookup(name) {
    return name ? state.byBasename.get(String(name).toLowerCase()) || null : null;
  }
  // Video filenames in metadata end with .avi; the user is converting to .mp4.
  // Prefer the .mp4 file, fall back to the literal .avi so this works before
  // and after conversion.
  function lookupVideo(name) {
    if (!name) return null;
    const mp4 = String(name).replace(/\.avi$/i, ".mp4");
    return lookup(mp4) || lookup(name);
  }
  function url(file) {
    if (!file) return null;
    const u = URL.createObjectURL(file);
    state.liveUrls.push(u);
    return u;
  }
  function revokeLive() {
    for (const u of state.liveUrls) { try { URL.revokeObjectURL(u); } catch {} }
    state.liveUrls = [];
  }

  // ---- Index build -------------------------------------------------------
  async function openFolder(fileList) {
    state.byBasename.clear();
    state.gyroFile = null;
    state.gyroByGroup = null;
    state.demographics = null;
    revokeLive();

    let metadataFile = null;
    let demographicsFile = null;
    for (const f of fileList) {
      const bn = baseName(f.webkitRelativePath || f.name);
      // Last one wins is fine; corpus basenames are unique.
      state.byBasename.set(bn, f);
      if (bn === "metadata.csv") metadataFile = f;
      else if (bn === "gyroscope.csv") state.gyroFile = f;
      else if (bn === "demographics.csv") demographicsFile = f;
    }
    if (!metadataFile) throw new Error("metadata.csv not found in the selected folder.");

    const rows = parseCsv(await metadataFile.text());
    buildIndex(rows);

    if (demographicsFile) {
      const demoRows = parseCsv(await demographicsFile.text());
      const map = new Map();
      for (const r of demoRows) {
        const id = String(r.participant_id || "").trim();
        if (id) map.set(id, r);
      }
      state.demographics = map;
    }

    return { groups: state.groups.length, trials: state.trials.length };
  }

  // Demographic record for a participant id, or null if unavailable.
  function getDemographics(id) {
    if (!state.demographics || id == null) return null;
    return state.demographics.get(String(id).trim()) || null;
  }

  function buildIndex(rows) {
    const trials = [];
    for (const row of rows) {
      const group = String(row.pair_id || "").trim();
      const trialNum = Number(row.trial_number);
      if (!group || !Number.isFinite(trialNum)) continue;
      const NN = pad2(trialNum);

      const files = {
        video_cg_cam01: lookupVideo(row.video_clue_giver_cam01),
        video_cg_cam02: lookupVideo(row.video_clue_giver_cam02),
        video_g_cam01: lookupVideo(row.video_guesser_cam01),
        video_g_cam02: lookupVideo(row.video_guesser_cam02),
        audio: lookup(row.audio_file_name),
      };
      const tgP1Name = String(row.textgrid_file_name || "").trim();
      const tgP2Name = tgP1Name ? tgP1Name.replace(/_p1\.TextGrid$/i, "_p2.TextGrid") : "";
      files.textgrid_p1 = lookup(tgP1Name);
      files.textgrid_p2 = tgP2Name && tgP2Name !== tgP1Name ? lookup(tgP2Name) : null;

      const has = {};
      for (const k of Object.keys(files)) has[k] = !!files[k];

      trials.push({
        id: `${group}__trial${NN}`,
        group,
        trial: trialNum,
        target_word: String(row.target_word || ""),
        condition: row.clue_giver_condition || null,
        clue_giver_pid: row.clue_giver_id || null,
        raw: row,
        files,
        has,
      });
    }

    const groupsMap = new Map();
    for (const t of trials) {
      if (!groupsMap.has(t.group)) groupsMap.set(t.group, { id: t.group, trials: [] });
      groupsMap.get(t.group).trials.push({
        id: t.id, trial: t.trial, target_word: t.target_word, condition: t.condition, has: t.has,
      });
    }
    const groups = [...groupsMap.values()].sort((a, b) => a.id.localeCompare(b.id));
    for (const g of groups) g.trials.sort((a, b) => a.trial - b.trial);

    state.trials = trials;
    state.groups = groups;
    state.byId = new Map(trials.map((t) => [t.id, t]));
  }

  function getGroups() { return state.groups; }

  // ---- Trial detail (mirrors GET /api/trials/:id) ------------------------
  async function getTrial(id) {
    const t = state.byId.get(id);
    if (!t) return null;

    // Free the previous trial's media URLs before minting new ones.
    revokeLive();

    const textgrids = [];
    for (const speaker of ["p1", "p2"]) {
      const file = t.files[`textgrid_${speaker}`];
      if (!file) continue;
      try {
        const text = await file.text();
        textgrids.push({ speaker, parsed: parseTextGrid(text) });
      } catch (err) {
        textgrids.push({ speaker, error: String(err && err.message || err) });
      }
    }

    return {
      id: t.id,
      group: t.group,
      trial: t.trial,
      target_word: t.target_word,
      condition: t.condition,
      clue_giver_pid: t.clue_giver_pid,
      has: t.has,
      metadata: t.raw,
      textgrids,
      mediaUrls: {
        video_cg_cam01: url(t.files.video_cg_cam01),
        video_cg_cam02: url(t.files.video_cg_cam02),
        video_g_cam01: url(t.files.video_g_cam01),
        video_g_cam02: url(t.files.video_g_cam02),
        audio: url(t.files.audio),
      },
    };
  }

  // ---- Gyroscope (mirrors GET /api/gyro/:group/:trial) -------------------
  // Parse the flat gyroscope.csv once (438k rows ~ <1s), index by group.
  async function ensureGyro() {
    if (state.gyroByGroup) return true;
    if (!state.gyroFile) return false;
    const rows = parseCsvRows(await state.gyroFile.text());
    if (rows.length < 2) return false;
    const header = rows[0];
    const col = (name) => header.indexOf(name);
    const ci = {
      group: col("group_name"), trial: col("trial_number"), time: col("time"),
      // Both signals: orientation (roll/pitch/yaw, °) and acceleration (g).
      angX: col("AngleX(°)"), angY: col("AngleY(°)"), angZ: col("AngleZ(°)"),
      ax: col("AccX(g)"), ay: col("AccY(g)"), az: col("AccZ(g)"),
      asx: col("AsX(°/s)"), asy: col("AsY(°/s)"), asz: col("AsZ(°/s)"),
    };
    state.gyroHasTrial = ci.trial >= 0;
    const byGroup = new Map();
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const g = (cells[ci.group] || "").trim();
      if (!g) continue;
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(cells);
    }
    state.gyroByGroup = byGroup;
    state.gyroCols = ci;
    return true;
  }

  function num(v) {
    if (v == null || v === "") return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }
  function timeMs(v) {
    if (v == null || v === "") return NaN;
    const ms = Date.parse(String(v));
    return Number.isFinite(ms) ? ms : NaN;
  }

  // Remove 360° wraparound discontinuities so an angle series is continuous.
  function unwrapDeg(arr) {
    const out = new Array(arr.length);
    let offset = 0, prev = null;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (!Number.isFinite(v)) { out[i] = NaN; continue; }
      if (prev != null) {
        const d = v - prev;
        if (d > 180) offset -= 360;
        else if (d < -180) offset += 360;
      }
      prev = v;
      out[i] = v + offset;
    }
    return out;
  }

  // Subtract the value at index `bi` so that sample becomes 0° (NaN-safe).
  function baselineAt(arr, bi) {
    const b = arr[bi];
    if (!Number.isFinite(b)) return arr;
    return arr.map((v) => (Number.isFinite(v) ? v - b : NaN));
  }

  async function getGyro(group, trial) {
    const ok = await ensureGyro();
    if (!ok) return null;
    const ci = state.gyroCols;
    const groupRows = state.gyroByGroup.get(group) || [];
    let rows = groupRows;
    let level = "session";
    if (state.gyroHasTrial) {
      const trialNum = Number(trial);
      const slice = groupRows.filter((c) => Number(c[ci.trial]) === trialNum);
      if (slice.length > 0) { rows = slice; level = "trial"; }
    }
    if (rows.length === 0) return null;

    const pairs = [];
    let tMinMs = Infinity;
    for (const c of rows) {
      const ms = timeMs(c[ci.time]);
      if (!Number.isFinite(ms)) continue;
      pairs.push({ ms, c });
      if (ms < tMinMs) tMinMs = ms;
    }
    pairs.sort((a, b) => a.ms - b.ms);

    const t = [], rawX = [], rawY = [], rawZ = [], accX = [], accY = [], accZ = [], asX = [], asY = [], asZ = [];
    for (const { ms, c } of pairs) {
      // No padding in the gyro CSV: sample 0 is the trial start (t=0).
      t.push((ms - tMinMs) / 1000);
      rawX.push(num(c[ci.angX]));
      rawY.push(num(c[ci.angY]));
      rawZ.push(num(c[ci.angZ]));
      accX.push(num(c[ci.ax]));
      accY.push(num(c[ci.ay]));
      accZ.push(num(c[ci.az]));
      asX.push(num(c[ci.asx]));
      asY.push(num(c[ci.asy]));
      asZ.push(num(c[ci.asz]));
    }
    // Baseline tilt to the first sample (= trial start) so 0° = posture at
    // trial onset. accX/Y/Z (g) and asX/Y/Z (angular velocity, °/s) stay raw.
    // The UI lets the user pick which signal to plot.
    return {
      level, t,
      tiltX: baselineAt(unwrapDeg(rawX), 0),
      tiltY: baselineAt(unwrapDeg(rawY), 0),
      tiltZ: baselineAt(unwrapDeg(rawZ), 0),
      accX, accY, accZ,
      asX, asY, asZ,
    };
  }

  BMC.corpus = { openFolder, getGroups, getTrial, getGyro, getDemographics };
})(window.BMC);

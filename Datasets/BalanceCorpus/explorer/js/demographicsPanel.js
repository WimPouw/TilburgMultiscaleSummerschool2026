// Demographics panel — compares the two participants of the current trial
// using demographics.csv (looked up by participant id). Shows which one was the
// clue-giver on this trial. Hidden when demographics.csv is absent or neither
// participant is found.
//
// Completeness: every demographics.csv column (except the participant_id key)
// is shown, in CSV order, even when a value is blank ("—"). Columns are read
// from the actual data, so any column added to demographics.csv appears
// automatically; known columns get a friendly label, unknown ones are
// humanized from the column name.
(function (BMC) {
  "use strict";

  const EXCLUDE = new Set(["participant_id"]);

  // Friendly labels for known columns (others are humanized automatically).
  const LABELS = {
    age_in_years_1_text: "Age",
    gender: "Gender",
    height: "Height (cm)",
    weight: "Weight (kg)",
    dominant_hand: "Dominant hand",
    dominant_leg: "Dominant leg",
    english_native: "Native English",
    other_languages: "Other languages",
    other_languages_1_text: "Other languages (which)",
    hearing: "Hearing issue",
    balance_disorder: "Balance disorder",
    mobility_issue: "Mobility issue",
    sports_injury: "Sports injury",
    pregnancy: "Pregnancy",
    relationship_to_interlocutor: "Relationship to interlocutor",
  };

  function humanize(col) {
    return col
      .replace(/_1_text$/i, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || col;
  }
  function labelFor(col) { return LABELS[col] || humanize(col); }

  // Column order = union of keys from the available participant rows, in their
  // CSV (header) order, minus the excluded key columns.
  function columnsFrom(d1, d2) {
    const cols = [];
    const seen = new Set();
    for (const row of [d1, d2]) {
      if (!row) continue;
      for (const k of Object.keys(row)) {
        if (EXCLUDE.has(k) || seen.has(k)) continue;
        seen.add(k);
        cols.push(k);
      }
    }
    return cols;
  }

  function headerCell(id, isClueGiver) {
    const cell = document.createElement("div");
    cell.className = "demo-head";
    const pid = document.createElement("span");
    pid.className = "demo-pid";
    pid.textContent = id != null && id !== "" ? String(id) : "—";
    const role = document.createElement("span");
    role.className = "demo-role " + (isClueGiver ? "cg" : "g");
    role.textContent = isClueGiver ? "clue-giver" : "guesser";
    cell.append(pid, role);
    return cell;
  }

  function val(row, key) {
    const v = row ? row[key] : undefined;
    return v == null || v === "" ? "—" : String(v);
  }

  function buildDemographicsPanel(trial) {
    const panel = document.getElementById("demographics-panel");
    const root = document.getElementById("demographics-table");
    const metaEl = document.getElementById("demographics-meta");
    if (!panel || !root) return;
    root.replaceChildren();

    const m = trial.metadata || {};
    const id1 = m.participant_1_id != null ? String(m.participant_1_id).trim() : "";
    const id2 = m.participant_2_id != null ? String(m.participant_2_id).trim() : "";
    const cgId = m.clue_giver_id != null ? String(m.clue_giver_id).trim() : "";

    const d1 = BMC.corpus.getDemographics(id1);
    const d2 = BMC.corpus.getDemographics(id2);

    // No demographics.csv (or no matching rows) -> hide the panel.
    if (!d1 && !d2) { panel.hidden = true; return; }
    panel.hidden = false;

    const cols = columnsFrom(d1, d2);
    if (metaEl) metaEl.textContent = `demographics.csv · ${cols.length} fields`;

    // Header row: field | participant 1 | participant 2.
    const headRow = document.createElement("div");
    headRow.className = "demo-row demo-header-row";
    const corner = document.createElement("div");
    corner.className = "demo-field demo-corner";
    headRow.append(corner, headerCell(id1, !!id1 && id1 === cgId), headerCell(id2, !!id2 && id2 === cgId));
    root.appendChild(headRow);

    // Every column, in order, always shown (blank -> "—").
    for (const key of cols) {
      const row = document.createElement("div");
      row.className = "demo-row";
      const field = document.createElement("div");
      field.className = "demo-field";
      field.textContent = labelFor(key);
      const c1 = document.createElement("div");
      c1.className = "demo-val";
      c1.textContent = val(d1, key);
      const c2 = document.createElement("div");
      c2.className = "demo-val";
      c2.textContent = val(d2, key);
      row.append(field, c1, c2);
      root.appendChild(row);
    }
  }

  BMC.demographicsPanel = { buildDemographicsPanel };
})(window.BMC);

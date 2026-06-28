// Ported from review-app/public/components/metadataPanel.js.
(function (BMC) {
  "use strict";

  const KEYS = [
    "pair_id", "trial_number", "target_word", "clue_giver_id", "clue_giver_condition",
    "participant_1_id", "participant_2_id",
    "taboo_1", "taboo_2", "taboo_3", "taboo_4", "taboo_5",
    "target_word_ser_rating", "is_success", "response_time_sec",
    "p1_height_cm", "p1_weight_kg", "p2_height_cm", "p2_weight_kg",
    "session_date", "audio_file_name", "textgrid_file_name",
  ];

  function buildMetadataPanel(trial) {
    const root = document.getElementById("metadata-table");
    root.replaceChildren();
    const m = trial.metadata || {};
    for (const k of KEYS) {
      if (m[k] === undefined) continue;
      const cell = document.createElement("div");
      cell.className = "meta-cell";
      const kEl = document.createElement("span");
      kEl.className = "meta-k";
      kEl.textContent = k;
      const vEl = document.createElement("span");
      vEl.className = "meta-v";
      vEl.textContent = String(m[k] == null ? "" : m[k]);
      cell.append(kEl, vEl);
      root.appendChild(cell);
    }
    const metaEl = document.getElementById("metadata-meta");
    if (metaEl) metaEl.textContent = "metadata.csv";
  }

  BMC.metadataPanel = { buildMetadataPanel };
})(window.BMC);

// BMC namespace + shared helpers (classic script — no modules, runs from file://).
window.BMC = window.BMC || {};

(function (BMC) {
  "use strict";

  // ---- CSV parsing -------------------------------------------------------
  // A small RFC-4180-ish parser: handles quoted fields, embedded commas,
  // quoted newlines, and "" escapes. Returns an array of row objects keyed by
  // the header row. Good enough for metadata.csv (quoted target/taboo words).
  function parseCsv(text) {
    const rows = parseCsvRows(text);
    if (rows.length === 0) return [];
    const header = rows[0];
    const out = [];
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      if (cells.length === 1 && cells[0] === "") continue; // blank line
      const obj = {};
      for (let c = 0; c < header.length; c++) obj[header[c]] = cells[c] !== undefined ? cells[c] : "";
      out.push(obj);
    }
    return out;
  }

  // Parse into an array of string[] rows. Used directly (by column index) for
  // the large gyroscope CSV to avoid building a key per cell per row.
  function parseCsvRows(text) {
    // Strip a leading UTF-8 BOM (demographics.csv has one on participant_id).
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    const n = text.length;
    for (let i = 0; i < n; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field); field = "";
      } else if (ch === "\n") {
        row.push(field); field = "";
        rows.push(row); row = [];
      } else if (ch === "\r") {
        // swallow; \n handles the row break
      } else {
        field += ch;
      }
    }
    // trailing field/row (no final newline)
    if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
  }

  // ---- TextGrid parsing (ported from review-app src/lib/textgrid.js) ------
  function parseTextGrid(text) {
    if (!text || !text.trim()) return { xmin: 0, xmax: 0, tiers: [] };

    const tokens = [];
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("File type") || line.startsWith("Object class")) continue;
      if (line === "<exists>" || line === "<absent>") continue;

      const sm = line.match(/^"((?:[^"]|"")*)"$/);
      if (sm) { tokens.push({ kind: "s", value: sm[1].replace(/""/g, '"') }); continue; }
      const num = Number(line);
      if (Number.isFinite(num)) { tokens.push({ kind: "n", value: num }); continue; }
    }
    if (tokens.length === 0) return { xmin: 0, xmax: 0, tiers: [] };

    let i = 0;
    const nextNum = () => (tokens[i] && tokens[i].kind === "n" ? tokens[i++].value : 0);
    const nextStr = () => (tokens[i] && tokens[i].kind === "s" ? tokens[i++].value : "");

    const xmin = nextNum();
    const xmax = nextNum();
    const tierCount = nextNum();

    const tiers = [];
    for (let t = 0; t < tierCount && i < tokens.length; t++) {
      const tierClass = nextStr();
      const name = nextStr();
      const tXmin = nextNum();
      const tXmax = nextNum();
      const count = nextNum();
      const intervals = [];
      if (tierClass === "IntervalTier") {
        for (let k = 0; k < count && i < tokens.length; k++) {
          const xa = nextNum(), xb = nextNum(), txt = nextStr();
          intervals.push({ xmin: xa, xmax: xb, text: txt });
        }
      } else {
        for (let k = 0; k < count && i < tokens.length; k++) {
          const time = nextNum(), mark = nextStr();
          intervals.push({ xmin: time, xmax: time, text: mark });
        }
      }
      tiers.push({ name, xmin: tXmin, xmax: tXmax, intervals });
    }
    return { xmin, xmax, tiers };
  }

  function pad2(n) { return String(n).padStart(2, "0"); }

  BMC.util = { parseCsv, parseCsvRows, parseTextGrid, pad2 };
})(window.BMC);

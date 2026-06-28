// Ported from review-app/public/components/sidebar.js.
// Trial index comes from BMC.corpus.getGroups() (in-memory) instead of
// GET /api/trials.
(function (BMC) {
  "use strict";

  let allGroups = [];
  let activeId = null;
  let onSelect = () => {};

  async function initSidebar(handler) {
    onSelect = handler;
    await refreshSidebar();
    document.getElementById("search").addEventListener("input", (e) => render(e.target.value.trim().toLowerCase()));
    window.addEventListener("hashchange", () => routeFromHash());
    routeFromHash();
  }

  // Re-read the in-memory index and re-render. Returns the group count so the
  // caller can decide whether to prompt for a folder.
  async function refreshSidebar() {
    allGroups = BMC.corpus.getGroups() || [];
    const searchEl = document.getElementById("search");
    render(searchEl ? searchEl.value.trim().toLowerCase() : "");
    return allGroups.length;
  }

  function setActive(id) {
    activeId = id;
    for (const a of document.querySelectorAll("#groups .trial")) {
      const isActive = a.dataset.id === id;
      a.classList.toggle("active", isActive);
      if (isActive) {
        const group = a.closest(".group");
        if (group) group.classList.add("open");
        a.scrollIntoView({ block: "nearest" });
      }
    }
  }

  function matches(group, trial, q) {
    if (!q) return true;
    const hay = [group.id, trial.target_word, trial.condition].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  }

  function render(q) {
    const root = document.getElementById("groups");
    root.replaceChildren();
    const activeGroup = activeId ? activeId.split("__")[0] : null;
    for (const g of allGroups) {
      const visibleTrials = g.trials.filter((t) => matches(g, t, q));
      if (visibleTrials.length === 0) continue;

      const group = document.createElement("div");
      group.className = "group";
      if (q || g.id === activeGroup) group.classList.add("open");

      const head = document.createElement("div");
      head.className = "group-head";
      const headLeft = document.createElement("span");
      const chev = document.createElement("span");
      chev.className = "chev";
      chev.textContent = "▸";
      headLeft.append(chev, document.createTextNode(" " + g.id));
      const count = document.createElement("span");
      count.className = "count";
      count.textContent = String(visibleTrials.length);
      head.append(headLeft, count);
      head.addEventListener("click", () => group.classList.toggle("open"));
      group.appendChild(head);

      const body = document.createElement("div");
      body.className = "group-body";
      for (const t of visibleTrials) {
        const a = document.createElement("a");
        a.className = "trial" + (t.id === activeId ? " active" : "");
        a.href = `#/${g.id}/${t.trial}`;
        a.dataset.id = t.id;

        const num = document.createElement("span");
        num.className = "num";
        num.textContent = String(t.trial).padStart(2, "0");
        const word = document.createElement("span");
        word.className = "word";
        word.textContent = t.target_word || "";
        const cond = document.createElement("span");
        cond.className = "cond";
        cond.textContent = t.condition || "";

        a.append(num, word, cond);
        body.appendChild(a);
      }
      group.appendChild(body);
      root.appendChild(group);
    }
  }

  function routeFromHash() {
    const m = location.hash.match(/^#\/([^\/]+)\/(\d+)$/);
    if (!m) return;
    const id = `${m[1]}__trial${String(Number(m[2])).padStart(2, "0")}`;
    setActive(id);
    onSelect(id);
  }

  function trialOrder(filter) {
    const q = (filter || "").trim().toLowerCase();
    return allGroups.flatMap((g) =>
      g.trials.filter((t) => matches(g, t, q)).map((t) => ({ id: t.id, group: g.id, trial: t.trial }))
    );
  }

  function navTrial(delta, currentId) {
    const order = trialOrder(document.getElementById("search").value || "");
    if (order.length === 0) return;
    const i = order.findIndex((x) => x.id === currentId);
    const next = order[Math.max(0, Math.min(order.length - 1, (i < 0 ? 0 : i) + delta))];
    if (next) location.hash = `#/${next.group}/${next.trial}`;
  }

  function navGroup(delta, currentId) {
    const order = trialOrder(document.getElementById("search").value || "");
    if (order.length === 0) return;
    const groups = [...new Set(order.map((x) => x.group))];
    const curr = (order.find((x) => x.id === currentId) || {}).group || groups[0];
    const gi = groups.indexOf(curr);
    const ng = groups[Math.max(0, Math.min(groups.length - 1, gi + delta))];
    const first = order.find((x) => x.group === ng);
    if (first) location.hash = `#/${first.group}/${first.trial}`;
  }

  BMC.sidebar = { initSidebar, refreshSidebar, setActive, navTrial, navGroup };
})(window.BMC);

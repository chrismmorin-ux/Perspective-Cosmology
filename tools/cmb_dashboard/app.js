/* ==========================================================================
   Perspective Framework Explorer — Rendering Engine
   Pure presentation. All data lives in data.js / crystal-data.js.
   ========================================================================== */

(function () {
  "use strict";

  const D = CMB_DATA;

  // =========================================================================
  // DOM helpers
  // =========================================================================
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else if (k === "onclick") node.addEventListener("click", attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (typeof child === "string") node.appendChild(document.createTextNode(child));
      else if (child) node.appendChild(child);
    }
    return node;
  }

  function qs(sel) { return document.querySelector(sel); }

  // =========================================================================
  // Badge helper
  // =========================================================================
  function badge(text, type) {
    return el("span", { class: "badge badge--" + type, text: text });
  }

  function confidenceBadge(c) {
    return badge(c, c);
  }

  function statusBadge(s) {
    var map = { pass: "pass", marginal: "marginal", fail: "fail", falsified: "falsified", testable: "testable", monitoring: "monitoring", resolved: "resolved", "key-test": "key-test", tension: "marginal", open: "conjecture" };
    return badge(s.replace("-", " "), map[s] || "conjecture");
  }

  function severityBadge(s) {
    return badge(s, "sev-" + s);
  }

  function sigmaClass(sigma) {
    if (sigma === null || sigma === undefined) return "";
    if (sigma < 1) return "sigma-green";
    if (sigma < 2) return "sigma-yellow";
    if (sigma < 3) return "sigma-orange";
    return "sigma-red";
  }

  function fmtPct(v) {
    if (v === null || v === undefined) return "--";
    if (v === 0) return "EXACT";
    if (v < 0.01) return v.toFixed(3) + "%";
    if (v < 1) return v.toFixed(2) + "%";
    return v.toFixed(1) + "%";
  }

  function fmtVal(v) {
    if (v === null || v === undefined) return "--";
    if (typeof v === "string") return v;
    if (Math.abs(v) < 0.001 || Math.abs(v) >= 100000) return v.toExponential(3);
    if (Number.isInteger(v)) return String(v);
    return v.toPrecision(6);
  }

  // =========================================================================
  // MODULE SYSTEM
  // =========================================================================
  var MODULES = [
    { id: "cmb", label: "CMB Cosmology", nav: null },
    { id: "crystal", label: "Crystal Structure", nav: null },
    { id: "catalog", label: "Crystallization Catalogue", nav: null },
    { id: "primes", label: "Prime Attractors", nav: null },
  ];

  var activeModule = "cmb";

  function renderModuleTabs() {
    var container = qs("#module-tabs");
    MODULES.forEach(function (mod) {
      var btn = el("button", {
        class: "module-tab" + (mod.id === activeModule ? " active" : ""),
        text: mod.label,
        "data-module": mod.id,
        onclick: function () {
          switchModule(mod.id);
        },
      });
      container.appendChild(btn);
    });
  }

  function switchModule(moduleId) {
    activeModule = moduleId;

    // Toggle tab active state
    var tabs = document.querySelectorAll(".module-tab");
    tabs.forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-module") === moduleId);
    });

    // Toggle module content visibility
    var modules = document.querySelectorAll(".module-content");
    modules.forEach(function (m) {
      m.style.display = m.id === "module-" + moduleId ? "" : "none";
    });

    // Update navigation pills
    renderNavigationFor(moduleId);

    // Scroll to top of main content
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getNavForModule(moduleId) {
    if (moduleId === "cmb") return NAV_ITEMS;
    if (moduleId === "crystal" && window.CrystalModule) return window.CrystalModule.nav;
    if (moduleId === "catalog" && window.CatalogModule) return window.CatalogModule.nav;
    if (moduleId === "primes" && window.PrimesModule) return window.PrimesModule.nav;
    return [];
  }

  // =========================================================================
  // HEADER
  // =========================================================================
  function renderHeader() {
    var h = qs("#header");
    h.appendChild(el("h1", { text: "Perspective Framework Explorer" }));
    h.appendChild(el("div", { class: "subtitle", text: "Speculative framework. NOT established physics. All claims are [CONJECTURE] unless stated otherwise." }));
    h.appendChild(el("div", { class: "disclaimer-banner", text: D.meta.disclaimer }));
    var row = el("div", { class: "meta-row" });
    row.appendChild(el("span", { text: "Updated: " + D.meta.lastUpdated }));
    row.appendChild(el("span", { text: "Session: " + D.meta.sessionRef }));
    row.appendChild(el("span", { text: "Red Team probability: " + D.meta.redTeamProbability }));
    h.appendChild(row);
  }

  // =========================================================================
  // NAVIGATION + SCROLL SPY
  // =========================================================================
  var NAV_ITEMS = [
    { id: "sec-stats", label: "Overview" },
    { id: "sec-skymap", label: "Sky Map" },
    { id: "sec-lcdm", label: "LCDM Params" },
    { id: "sec-spectrum", label: "Peaks" },
    { id: "sec-table", label: "All Observables" },
    { id: "sec-blind", label: "Blind" },
    { id: "sec-polarization", label: "Polarization" },
    { id: "sec-bbn", label: "BBN" },
    { id: "sec-deviations", label: "Deviations" },
    { id: "sec-falsification", label: "Falsification" },
    { id: "sec-epochs", label: "SO(11) Epochs" },
    { id: "sec-synthesis", label: "Synthesis" },
    { id: "sec-assessment", label: "Assessment" },
  ];

  var currentObserver = null;

  function renderNavigationFor(moduleId) {
    var nav = qs("#nav-pills");
    nav.innerHTML = "";
    if (currentObserver) { currentObserver.disconnect(); currentObserver = null; }

    var items = getNavForModule(moduleId);
    items.forEach(function (item) {
      var pill = el("button", {
        class: "nav-pill",
        text: item.label,
        "data-target": item.id,
        onclick: function () {
          var target = document.getElementById(item.id);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      });
      nav.appendChild(pill);
    });
    // Scroll spy
    if ("IntersectionObserver" in window) {
      currentObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var pills = nav.querySelectorAll(".nav-pill");
            pills.forEach(function (p) {
              p.classList.toggle("active", p.getAttribute("data-target") === e.target.id);
            });
          }
        });
      }, { rootMargin: "-40% 0px -55% 0px" });
      items.forEach(function (item) {
        var section = document.getElementById(item.id);
        if (section) currentObserver.observe(section);
      });
    }
  }

  function renderNavigation() {
    renderNavigationFor(activeModule);
  }

  // =========================================================================
  // STATS OVERVIEW
  // =========================================================================
  function renderStatsOverview() {
    var container = qs("#stats-overview");
    var grid = el("div", { class: "stats-grid" });

    var totalObs = D.canonicalObservables.length + D.blindPredictions.length + D.bbn.length;
    var exactCount = D.canonicalObservables.filter(function (o) { return o.errorPercent === 0.0; }).length;
    var blindPass = D.blindPredictions.filter(function (p) { return p.status === "pass"; }).length;

    var stats = [
      { value: totalObs, label: "Total Observables" },
      { value: D.lcdmParams.length, label: "LCDM Params Derived" },
      { value: blindPass + "/" + D.blindPredictions.length, label: "Blind within 1\u03C3" },
      { value: D.meta.redTeamProbability, label: "Red Team Probability" },
    ];

    stats.forEach(function (s) {
      var card = el("div", { class: "stat-card" });
      card.appendChild(el("div", { class: "stat-value", text: String(s.value) }));
      card.appendChild(el("div", { class: "stat-label", text: s.label }));
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // =========================================================================
  // LCDM PARAMETER CARDS
  // =========================================================================
  function renderLCDMParams() {
    var container = qs("#lcdm-params");
    var grid = el("div", { class: "card-grid" });

    D.lcdmParams.forEach(function (p) {
      var card = el("div", { class: "card" });

      var header = el("div", { class: "card-header" });
      header.appendChild(el("span", { class: "card-symbol", text: p.symbol }));
      header.appendChild(confidenceBadge(p.confidence));
      card.appendChild(header);

      card.appendChild(el("div", { class: "card-name", text: p.name + (p.unit ? " (" + p.unit + ")" : "") }));
      card.appendChild(el("div", { class: "formula", text: p.formula }));

      var vals = el("dl", { class: "values" });
      vals.appendChild(el("dt", { text: "Predicted" }));
      vals.appendChild(el("dd", { text: fmtVal(p.predicted) }));
      vals.appendChild(el("dt", { text: "Measured" }));
      vals.appendChild(el("dd", { text: fmtVal(p.measured) + (p.uncertainty ? " \u00B1 " + p.uncertainty : "") }));
      vals.appendChild(el("dt", { text: "Error" }));
      var errDD = el("dd");
      errDD.textContent = fmtPct(p.errorPercent) + " ";
      card.appendChild(vals);

      // Error bar
      var barWrap = el("div", { class: "error-bar-container" });
      var pct = Math.min(p.errorPercent * 20, 100); // scale: 5% = full bar
      var color = p.errorPercent === 0 ? "var(--accent-green)" : p.errorPercent < 1 ? "var(--accent-cyan)" : p.errorPercent < 2 ? "var(--accent-yellow)" : "var(--accent-orange)";
      var fill = el("div", { class: "error-bar-fill" });
      fill.style.width = Math.max(pct, 2) + "%";
      fill.style.background = color;
      barWrap.appendChild(fill);
      card.appendChild(barWrap);

      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // =========================================================================
  // POWER SPECTRUM (SVG chart)
  // =========================================================================
  function renderPowerSpectrum() {
    var container = qs("#power-spectrum");
    var chartBox = el("div", { class: "chart-container" });

    var W = 760, H = 320, pad = { top: 30, right: 30, bottom: 60, left: 55 };
    var iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;

    var allPeaks = D.acousticPeaks.peaks.concat(D.acousticPeaks.higherPeaks.predictions);
    var xMin = 0, xMax = 2000;
    var yMax = allPeaks.reduce(function (m, p) { return Math.max(m, p.measured, p.predicted); }, 0) * 1.1;

    function sx(v) { return pad.left + (v - xMin) / (xMax - xMin) * iw; }
    function sy(v) { return pad.top + ih - (v / yMax) * ih; }

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", "100%");
    svg.style.maxWidth = W + "px";

    // Axes
    var axisLine = document.createElementNS(svgNS, "line");
    axisLine.setAttribute("x1", pad.left); axisLine.setAttribute("y1", pad.top + ih);
    axisLine.setAttribute("x2", pad.left + iw); axisLine.setAttribute("y2", pad.top + ih);
    axisLine.setAttribute("stroke", "#30363d"); axisLine.setAttribute("stroke-width", "1");
    svg.appendChild(axisLine);

    var yAxis = document.createElementNS(svgNS, "line");
    yAxis.setAttribute("x1", pad.left); yAxis.setAttribute("y1", pad.top);
    yAxis.setAttribute("x2", pad.left); yAxis.setAttribute("y2", pad.top + ih);
    yAxis.setAttribute("stroke", "#30363d"); yAxis.setAttribute("stroke-width", "1");
    svg.appendChild(yAxis);

    // X tick labels
    [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000].forEach(function (v) {
      var tx = document.createElementNS(svgNS, "text");
      tx.setAttribute("x", sx(v)); tx.setAttribute("y", pad.top + ih + 20);
      tx.setAttribute("text-anchor", "middle"); tx.setAttribute("class", "chart-label");
      tx.textContent = v;
      svg.appendChild(tx);
      // grid line
      var gl = document.createElementNS(svgNS, "line");
      gl.setAttribute("x1", sx(v)); gl.setAttribute("y1", pad.top);
      gl.setAttribute("x2", sx(v)); gl.setAttribute("y2", pad.top + ih);
      gl.setAttribute("stroke", "#21262d"); gl.setAttribute("stroke-width", "0.5");
      svg.appendChild(gl);
    });

    // X axis label
    var xlabel = document.createElementNS(svgNS, "text");
    xlabel.setAttribute("x", pad.left + iw / 2); xlabel.setAttribute("y", H - 8);
    xlabel.setAttribute("text-anchor", "middle"); xlabel.setAttribute("class", "chart-label");
    xlabel.textContent = "Multipole \u2113";
    svg.appendChild(xlabel);

    // Title
    var title = document.createElementNS(svgNS, "text");
    title.setAttribute("x", pad.left + iw / 2); title.setAttribute("y", 18);
    title.setAttribute("text-anchor", "middle"); title.setAttribute("class", "chart-title");
    title.textContent = "TT Acoustic Peak Positions: Predicted vs Measured (schematic)";
    svg.appendChild(title);

    // Draw peaks
    function drawPeak(p, idx, isFalsified) {
      var xp = sx(p.predicted), xm = sx(p.measured);
      var yp = sy(p.predicted), ym = sy(p.measured);

      // Predicted marker (diamond)
      var diamond = document.createElementNS(svgNS, "polygon");
      var s = 6;
      diamond.setAttribute("points", xp + "," + (yp - s) + " " + (xp + s) + "," + yp + " " + xp + "," + (yp + s) + " " + (xp - s) + "," + yp);
      diamond.setAttribute("fill", isFalsified ? "#f85149" : "#58a6ff");
      diamond.setAttribute("opacity", isFalsified ? "0.5" : "1");
      svg.appendChild(diamond);

      // Measured marker (circle)
      var circ = document.createElementNS(svgNS, "circle");
      circ.setAttribute("cx", xm); circ.setAttribute("cy", ym);
      circ.setAttribute("r", "5"); circ.setAttribute("fill", "none");
      circ.setAttribute("stroke", isFalsified ? "#f85149" : "#3fb950");
      circ.setAttribute("stroke-width", "2");
      circ.setAttribute("opacity", isFalsified ? "0.5" : "1");
      svg.appendChild(circ);

      // Connection line
      var conn = document.createElementNS(svgNS, "line");
      conn.setAttribute("x1", xp); conn.setAttribute("y1", yp);
      conn.setAttribute("x2", xm); conn.setAttribute("y2", ym);
      conn.setAttribute("stroke", isFalsified ? "#f85149" : "#8b949e");
      conn.setAttribute("stroke-width", "1"); conn.setAttribute("stroke-dasharray", "3,3");
      conn.setAttribute("opacity", isFalsified ? "0.3" : "0.5");
      svg.appendChild(conn);

      // Label
      var label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", (xp + xm) / 2); label.setAttribute("y", Math.min(yp, ym) - 10);
      label.setAttribute("text-anchor", "middle"); label.setAttribute("class", "chart-label");
      label.setAttribute("fill", isFalsified ? "#f85149" : "#e6edf3");
      label.textContent = "\u2113_" + p.n + (isFalsified ? " (X)" : "");
      svg.appendChild(label);
    }

    D.acousticPeaks.peaks.forEach(function (p, i) { drawPeak(p, i, false); });
    D.acousticPeaks.higherPeaks.predictions.forEach(function (p, i) { drawPeak(p, i + 3, true); });

    // Legend
    var ly = pad.top + 15;
    var lx = pad.left + iw - 180;
    [
      { color: "#58a6ff", label: "Predicted (diamond)", y: 0 },
      { color: "#3fb950", label: "Measured (circle)", y: 16 },
      { color: "#f85149", label: "Falsified (X)", y: 32 },
    ].forEach(function (item) {
      var lt = document.createElementNS(svgNS, "text");
      lt.setAttribute("x", lx + 12); lt.setAttribute("y", ly + item.y + 4);
      lt.setAttribute("class", "chart-label"); lt.setAttribute("fill", item.color);
      lt.textContent = item.label;
      svg.appendChild(lt);
      var ld = document.createElementNS(svgNS, "rect");
      ld.setAttribute("x", lx - 2); ld.setAttribute("y", ly + item.y - 4);
      ld.setAttribute("width", 8); ld.setAttribute("height", 8);
      ld.setAttribute("fill", item.color); ld.setAttribute("rx", "2");
      svg.appendChild(ld);
    });

    // Unified formula label
    var fl = document.createElementNS(svgNS, "text");
    fl.setAttribute("x", pad.left + 10); fl.setAttribute("y", pad.top + 18);
    fl.setAttribute("class", "chart-label"); fl.setAttribute("fill", "#d2a8ff");
    fl.textContent = D.acousticPeaks.unifiedFormula;
    svg.appendChild(fl);

    chartBox.appendChild(svg);

    // Note
    var note = el("div", {
      style: "font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem;",
      text: "Schematic: shows peak position comparison only, not amplitude or power spectrum shape. Higher peaks (l_4+) were blind predictions that failed."
    });
    chartBox.appendChild(note);

    container.appendChild(chartBox);
  }

  // =========================================================================
  // MASTER TABLE
  // =========================================================================
  var masterSort = { col: null, asc: true };
  var activeFilters = new Set(["cmb", "peaks", "inflation", "blind", "polarization", "bbn"]);

  function getAllObservables() {
    var rows = [];
    D.canonicalObservables.forEach(function (o) {
      rows.push({
        id: o.id, symbol: o.symbol, name: o.name, category: o.category || "cmb",
        formula: o.formula, predicted: o.predicted, measured: o.measured,
        measuredLabel: o.measuredLabel || null,
        uncertainty: o.uncertainty, errorPercent: o.errorPercent,
        confidence: o.confidence, gap: o.gap || "",
      });
    });
    D.blindPredictions.forEach(function (p) {
      rows.push({
        id: p.id, symbol: p.symbol, name: p.observable, category: "blind",
        formula: p.algebraicCandidate || "LCDM integral", predicted: p.predicted,
        measured: p.measured, measuredLabel: null,
        uncertainty: p.uncertainty, errorPercent: p.errorPercent,
        confidence: "derivation", gap: p.notes || "",
        sigma: p.sigma, status: p.status,
      });
    });
    D.bbn.forEach(function (b) {
      rows.push({
        id: b.id, symbol: b.symbol, name: b.name, category: "bbn",
        formula: b.formula, predicted: b.predicted, measured: b.measured,
        measuredLabel: null,
        uncertainty: b.uncertainty, errorPercent: b.errorPercent,
        confidence: b.confidence, gap: "",
      });
    });
    return rows;
  }

  function renderFilterBar() {
    var container = qs("#filter-bar");
    var bar = el("div", { class: "filter-bar" });
    var categories = [
      { key: "cmb", label: "CMB" },
      { key: "peaks", label: "Peaks" },
      { key: "inflation", label: "Inflation" },
      { key: "blind", label: "Blind" },
      { key: "polarization", label: "Polarization" },
      { key: "bbn", label: "BBN" },
    ];
    categories.forEach(function (cat) {
      var btn = el("button", {
        class: "filter-btn" + (activeFilters.has(cat.key) ? " active" : ""),
        text: cat.label,
        onclick: function () {
          if (activeFilters.has(cat.key)) activeFilters.delete(cat.key);
          else activeFilters.add(cat.key);
          btn.classList.toggle("active");
          renderMasterTableBody();
        },
      });
      bar.appendChild(btn);
    });
    container.appendChild(bar);
  }

  function renderMasterTable() {
    var container = qs("#master-table");
    container.innerHTML = "";
    var wrap = el("div", { class: "table-wrap" });
    var table = el("table");

    // Thead
    var thead = el("thead");
    var tr = el("tr");
    var cols = [
      { key: "expand", label: "", sortable: false },
      { key: "symbol", label: "Symbol", sortable: true },
      { key: "name", label: "Observable", sortable: true },
      { key: "category", label: "Category", sortable: true },
      { key: "formula", label: "Formula", sortable: false },
      { key: "predicted", label: "Predicted", sortable: true },
      { key: "measured", label: "Measured", sortable: true },
      { key: "errorPercent", label: "Error", sortable: true },
      { key: "confidence", label: "Confidence", sortable: true },
    ];
    cols.forEach(function (c) {
      var th = el("th", {
        html: c.label + (c.sortable ? ' <span class="sort-arrow">\u25B4</span>' : ""),
        onclick: c.sortable ? function () {
          if (masterSort.col === c.key) masterSort.asc = !masterSort.asc;
          else { masterSort.col = c.key; masterSort.asc = true; }
          renderMasterTableBody();
          // Update arrow styling
          tr.querySelectorAll("th").forEach(function (h) { h.classList.remove("sorted"); });
          th.classList.add("sorted");
          th.querySelector(".sort-arrow").textContent = masterSort.asc ? "\u25B4" : "\u25BE";
        } : null,
      });
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    var tbody = el("tbody", { id: "master-tbody" });
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
    renderMasterTableBody();
  }

  function renderMasterTableBody() {
    var tbody = qs("#master-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    var rows = getAllObservables().filter(function (r) { return activeFilters.has(r.category); });

    if (masterSort.col) {
      rows.sort(function (a, b) {
        var va = a[masterSort.col], vb = b[masterSort.col];
        if (va === null || va === undefined) va = masterSort.asc ? Infinity : -Infinity;
        if (vb === null || vb === undefined) vb = masterSort.asc ? Infinity : -Infinity;
        if (typeof va === "string") return masterSort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
        return masterSort.asc ? va - vb : vb - va;
      });
    }

    rows.forEach(function (r) {
      var row = el("tr");

      // Expand button
      var btnTd = el("td");
      var btn = el("button", { class: "expand-btn", text: "\u25B6" });
      var detailRow = el("tr", { class: "detail-row" });
      detailRow.style.display = "none";
      btn.addEventListener("click", function () {
        var showing = detailRow.style.display !== "none";
        detailRow.style.display = showing ? "none" : "";
        btn.classList.toggle("open", !showing);
      });
      btnTd.appendChild(btn);
      row.appendChild(btnTd);

      row.appendChild(el("td", { class: "mono", text: r.symbol }));
      row.appendChild(el("td", { text: r.name }));

      var catTd = el("td");
      catTd.appendChild(badge(r.category, r.category === "blind" ? "derivation" : r.category === "bbn" ? "conjecture" : "conjecture"));
      row.appendChild(catTd);

      row.appendChild(el("td", { class: "formula-cell", text: r.formula }));
      row.appendChild(el("td", { class: "mono", text: fmtVal(r.predicted) }));

      var measText = r.measuredLabel || fmtVal(r.measured);
      if (r.uncertainty) measText += " \u00B1 " + r.uncertainty;
      row.appendChild(el("td", { class: "mono", text: measText }));

      var errTd = el("td", { class: "mono" });
      errTd.textContent = fmtPct(r.errorPercent);
      if (r.sigma !== undefined) {
        errTd.textContent += " (" + r.sigma.toFixed(1) + "\u03C3)";
        errTd.classList.add(sigmaClass(r.sigma));
      }
      row.appendChild(errTd);

      var confTd = el("td");
      confTd.appendChild(confidenceBadge(r.confidence));
      row.appendChild(confTd);

      tbody.appendChild(row);

      // Detail row
      var detailTd = el("td", { colspan: "9" });
      var detailContent = el("div", { class: "detail-content" });
      if (r.gap) {
        detailContent.appendChild(el("div", { html: '<span class="detail-label">Gap:</span> ' + r.gap }));
      }
      if (r.formula) {
        detailContent.appendChild(el("div", { html: '<span class="detail-label">Formula:</span> <code>' + r.formula + '</code>' }));
      }
      detailTd.appendChild(detailContent);
      detailRow.appendChild(detailTd);
      tbody.appendChild(detailRow);
    });
  }

  // =========================================================================
  // BLIND PREDICTIONS
  // =========================================================================
  function renderBlindPredictions() {
    var container = qs("#blind-predictions");

    // Summary stats
    var summary = el("div", { class: "blind-summary" });
    var within1 = D.blindPredictions.filter(function (p) { return p.sigma < 1; }).length;
    var within2 = D.blindPredictions.filter(function (p) { return p.sigma < 2; }).length;
    var within3 = D.blindPredictions.filter(function (p) { return p.sigma < 3; }).length;

    [
      { num: within1 + "/" + D.blindPredictions.length, lbl: "Within 1\u03C3", color: "var(--accent-green)" },
      { num: within2 + "/" + D.blindPredictions.length, lbl: "Within 2\u03C3", color: "var(--accent-cyan)" },
      { num: within3 + "/" + D.blindPredictions.length, lbl: "Within 3\u03C3", color: "var(--accent-blue)" },
    ].forEach(function (s) {
      var box = el("div", { class: "blind-stat" });
      var numEl = el("div", { class: "num", text: s.num });
      numEl.style.color = s.color;
      box.appendChild(numEl);
      box.appendChild(el("div", { class: "lbl", text: s.lbl }));
      summary.appendChild(box);
    });
    container.appendChild(summary);

    // Table
    var wrap = el("div", { class: "table-wrap" });
    var table = el("table");
    var thead = el("thead");
    var hr = el("tr");
    ["ID", "Observable", "Symbol", "Predicted", "Measured", "Error", "\u03C3", "Status"].forEach(function (h) {
      hr.appendChild(el("th", { text: h }));
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el("tbody");
    D.blindPredictions.forEach(function (p) {
      var tr = el("tr");
      tr.appendChild(el("td", { class: "mono", text: p.id }));
      tr.appendChild(el("td", { text: p.observable }));
      tr.appendChild(el("td", { class: "mono", text: p.symbol }));
      tr.appendChild(el("td", { class: "mono", text: fmtVal(p.predicted) + (p.unit ? " " + p.unit : "") }));
      tr.appendChild(el("td", { class: "mono", text: fmtVal(p.measured) + " \u00B1 " + p.uncertainty }));
      tr.appendChild(el("td", { class: "mono", text: fmtPct(p.errorPercent) }));

      var sigmaTd = el("td", { class: "mono " + sigmaClass(p.sigma), text: p.sigma.toFixed(1) });
      tr.appendChild(sigmaTd);

      var statusTd = el("td");
      statusTd.appendChild(statusBadge(p.status));
      tr.appendChild(statusTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);

    // Note
    container.appendChild(el("div", {
      style: "font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem;",
      text: "All predictions are LCDM-derived from framework cosmological parameters. They confirm self-consistency, not independent physics.",
    }));
  }

  // =========================================================================
  // POLARIZATION
  // =========================================================================
  function renderPolarization() {
    var container = qs("#polarization");

    // EE Peaks table
    container.appendChild(el("h3", { style: "font-size:1rem;margin-bottom:0.75rem;color:var(--text-secondary);", text: "EE Peak Positions" }));
    var wrap = el("div", { class: "table-wrap" });
    var table = el("table");
    var thead = el("thead");
    var hr = el("tr");
    ["Peak", "Predicted", "Measured", "Error", "Confidence"].forEach(function (h) { hr.appendChild(el("th", { text: h })); });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    D.polarization.eePeaks.forEach(function (p) {
      var tr = el("tr");
      tr.appendChild(el("td", { text: "EE-" + p.n }));
      tr.appendChild(el("td", { class: "mono", text: String(p.predicted) }));
      tr.appendChild(el("td", { class: "mono", text: String(p.measured) }));
      tr.appendChild(el("td", { class: "mono", text: fmtPct(p.errorPercent) }));
      var confTd = el("td"); confTd.appendChild(confidenceBadge(p.confidence)); tr.appendChild(confTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);

    // B-mode card
    container.appendChild(el("h3", { style: "font-size:1rem;margin:1.25rem 0 0.75rem;color:var(--text-secondary);", text: "B-Mode Prediction (r = " + D.polarization.bMode.r + ")" }));
    var bGrid = el("div", { class: "card-grid", style: "grid-template-columns:repeat(2,1fr);" });
    D.polarization.bMode.experiments.forEach(function (e) {
      var card = el("div", { class: "card" });
      card.appendChild(el("div", { class: "card-symbol", text: e.name }));
      card.appendChild(el("div", { style: "font-size:0.85rem;color:var(--text-secondary);margin:0.4rem 0;", text: "Sensitivity: " + e.sensitivity }));
      card.appendChild(el("div", { class: "formula", text: "Detection: " + e.detectionSigma }));
      bGrid.appendChild(card);
    });
    container.appendChild(bGrid);

    // TE / ET
    container.appendChild(el("h3", { style: "font-size:1rem;margin:1.25rem 0 0.75rem;color:var(--text-secondary);", text: "Cross-Correlations" }));
    var crossGrid = el("div", { class: "card-grid", style: "grid-template-columns:repeat(2,1fr);" });
    [
      { title: "TE Correlation", data: D.polarization.teCorrelation },
      { title: "EE/TT Ratio", data: D.polarization.etRatio },
    ].forEach(function (item) {
      var card = el("div", { class: "card" });
      card.appendChild(el("div", { class: "card-symbol", text: item.title }));
      card.appendChild(el("div", { class: "formula", text: item.data.formula }));
      var vals = el("dl", { class: "values" });
      vals.appendChild(el("dt", { text: "Predicted" })); vals.appendChild(el("dd", { text: String(item.data.value) }));
      vals.appendChild(el("dt", { text: "Measured" })); vals.appendChild(el("dd", { text: item.data.measured }));
      vals.appendChild(el("dt", { text: "Error" })); vals.appendChild(el("dd", { text: "~" + item.data.errorPercent + "%" }));
      card.appendChild(vals);
      var confTd = el("div", { style: "margin-top:0.5rem;" }); confTd.appendChild(confidenceBadge(item.data.confidence)); card.appendChild(confTd);
      crossGrid.appendChild(card);
    });
    container.appendChild(crossGrid);
  }

  // =========================================================================
  // BBN
  // =========================================================================
  function renderBBN() {
    var container = qs("#bbn");
    var wrap = el("div", { class: "table-wrap" });
    var table = el("table");
    var thead = el("thead");
    var hr = el("tr");
    ["Observable", "Formula", "Predicted", "Measured", "Error", "Confidence"].forEach(function (h) { hr.appendChild(el("th", { text: h })); });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    D.bbn.forEach(function (b) {
      var tr = el("tr");
      tr.appendChild(el("td", { text: b.name + " (" + b.symbol + ")" }));
      tr.appendChild(el("td", { class: "formula-cell", text: b.formula }));
      tr.appendChild(el("td", { class: "mono", text: fmtVal(b.predicted) }));
      tr.appendChild(el("td", { class: "mono", text: fmtVal(b.measured) + " \u00B1 " + fmtVal(b.uncertainty) }));
      var errTd = el("td", { class: "mono", text: fmtPct(b.errorPercent) });
      if (b.errorPercent > 5) errTd.style.color = "var(--accent-orange)";
      tr.appendChild(errTd);
      var confTd = el("td"); confTd.appendChild(confidenceBadge(b.confidence)); tr.appendChild(confTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);

    container.appendChild(el("div", {
      style: "font-size:0.82rem;color:var(--text-secondary);margin-top:0.75rem;padding:0.75rem;background:var(--bg-card);border-radius:var(--radius-md);border:1px solid var(--border-primary);",
      html: "<strong>Note:</strong> Baryon asymmetry eta has ~7% error (worst of all observables). Y_p and D/H are sub-percent. All use alpha as input [A-IMPORT].",
    }));
  }

  // =========================================================================
  // LCDM DEVIATIONS
  // =========================================================================
  function renderDeviations() {
    var container = qs("#deviations");
    var wrap = el("div", { class: "table-wrap" });
    var table = el("table");
    var thead = el("thead");
    var hr = el("tr");
    ["ID", "Deviation", "Framework", "Standard/Measured", "Testable", "Status", "Tier"].forEach(function (h) { hr.appendChild(el("th", { text: h })); });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    D.lcdmDeviations.forEach(function (d) {
      var tr = el("tr");
      tr.appendChild(el("td", { class: "mono", text: d.id }));
      tr.appendChild(el("td", { text: d.description }));
      tr.appendChild(el("td", { class: "formula-cell", text: d.framework }));
      tr.appendChild(el("td", { text: d.standard }));
      tr.appendChild(el("td", { text: d.testable }));
      var stTd = el("td"); stTd.appendChild(statusBadge(d.status)); tr.appendChild(stTd);
      var svTd = el("td"); svTd.appendChild(severityBadge(d.severity)); tr.appendChild(svTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
  }

  // =========================================================================
  // FALSIFICATION
  // =========================================================================
  function renderFalsification() {
    var container = qs("#falsification");
    var grid = el("div", { class: "falsification-grid" });
    D.falsification.forEach(function (f) {
      var card = el("div", { class: "falsification-card sev-" + f.severity });
      var header = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;" });
      header.appendChild(el("h4", { text: f.criterion }));
      header.appendChild(severityBadge(f.severity));
      card.appendChild(header);
      card.appendChild(el("p", { text: f.detail }));
      card.appendChild(el("p", { class: "timeline", text: "Target: " + f.target }));
      card.appendChild(el("p", { class: "timeline", text: "Timeline: " + f.timeline }));
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // =========================================================================
  // HONEST ASSESSMENT
  // =========================================================================
  function renderHonestAssessment() {
    var container = qs("#assessment");
    var grid = el("div", { class: "assess-grid" });

    // IS derived column
    var derivedCol = el("div", { class: "assess-col derived" });
    derivedCol.appendChild(el("h3", { text: "IS Derived from Framework" }));
    var ulD = el("ul");
    D.honestAssessment.isDerived.forEach(function (item) { ulD.appendChild(el("li", { text: item })); });
    derivedCol.appendChild(ulD);
    grid.appendChild(derivedCol);

    // IS NOT derived column
    var notCol = el("div", { class: "assess-col not-derived" });
    notCol.appendChild(el("h3", { text: "IS NOT Derived" }));
    var ulN = el("ul");
    D.honestAssessment.isNotDerived.forEach(function (item) { ulN.appendChild(el("li", { text: item })); });
    notCol.appendChild(ulN);
    grid.appendChild(notCol);

    container.appendChild(grid);

    // Caveats
    var cav = el("div", { class: "caveats-list" });
    cav.appendChild(el("h3", { text: "Caveats" }));
    var ulC = el("ul");
    D.honestAssessment.caveats.forEach(function (item) { ulC.appendChild(el("li", { text: item })); });
    cav.appendChild(ulC);
    container.appendChild(cav);
  }

  // =========================================================================
  // CMB SKY MAP WITH INTERACTIVE OVERLAYS
  // =========================================================================
  function renderSkyMap() {
    var container = qs("#skymap");
    var sky = D.cmbSkyMap;
    if (!sky) return;

    var wrap = el("div", { class: "skymap-wrap" });

    // Intro text
    wrap.appendChild(el("p", { class: "skymap-intro", text: sky.description }));

    // Layer state
    var layers = { structures: true, framework: false, standard: false };
    var selectedMarker = null;

    // --- Toggle buttons ---
    var toggleBar = el("div", { class: "skymap-toggles" });
    var layerDefs = [
      { key: "structures", label: "Structures", startActive: true },
      { key: "framework", label: "Framework Predictions", startActive: false },
      { key: "standard", label: "Standard LCDM", startActive: false },
    ];

    function updateMarkerVisibility() {
      var markers = imgContainer.querySelectorAll(".skymap-marker");
      markers.forEach(function (m) {
        var layer = m.getAttribute("data-layer");
        m.classList.toggle("visible", !!layers[layer]);
      });
      // Region circles
      var regions = imgContainer.querySelectorAll(".skymap-region");
      regions.forEach(function (r) {
        var layer = r.getAttribute("data-layer");
        r.classList.toggle("visible", !!layers[layer]);
      });
      // Tint overlays
      fwTint.classList.toggle("active", !!layers.framework);
      stdTint.classList.toggle("active", !!layers.standard);
      // Clear selection if layer is off
      if (selectedMarker) {
        var selLayer = selectedMarker.getAttribute("data-layer");
        if (!layers[selLayer]) { selectedMarker = null; renderInfoPanel(); }
      }
      // Show comparison when both framework and standard are active
      comparisonSection.style.display = (layers.framework && layers.standard) ? "block" : "none";
    }

    layerDefs.forEach(function (ld) {
      layers[ld.key] = ld.startActive;
      var btn = el("button", {
        class: "skymap-toggle" + (ld.startActive ? " active" : ""),
        text: ld.label,
        "data-layer": ld.key,
        onclick: function () {
          layers[ld.key] = !layers[ld.key];
          btn.classList.toggle("active");
          updateMarkerVisibility();
        },
      });
      toggleBar.appendChild(btn);
    });
    wrap.appendChild(toggleBar);

    // --- Image container with overlays ---
    var imgContainer = el("div", { class: "skymap-image-container" });

    var img = el("img", { src: sky.image, alt: "Planck CMB temperature map — Mollweide projection" });
    img.onerror = function () {
      imgContainer.style.background = "linear-gradient(135deg, #1a0a0a 0%, #0a0a2a 50%, #0a1a0a 100%)";
      imgContainer.style.height = "400px";
      imgContainer.style.display = "flex";
      imgContainer.style.alignItems = "center";
      imgContainer.style.justifyContent = "center";
      imgContainer.innerHTML = '<div style="color:#6e7681;font-size:0.9rem;text-align:center">CMB image not loaded.<br>Place cmb_map.jpg in the dashboard directory.</div>';
    };
    imgContainer.appendChild(img);

    // Tint overlays
    var fwTint = el("div", { class: "skymap-tint tint-framework" });
    var stdTint = el("div", { class: "skymap-tint tint-standard" });
    imgContainer.appendChild(fwTint);
    imgContainer.appendChild(stdTint);

    // --- Info panel ---
    var infoPanel = el("div", { class: "skymap-info-panel" });
    function renderInfoPanel() {
      infoPanel.innerHTML = "";
      infoPanel.className = "skymap-info-panel";
      if (!selectedMarker) {
        infoPanel.appendChild(el("div", { class: "skymap-info-empty", text: "Click a marker on the map to see details. Toggle layers above to compare framework predictions with standard cosmology." }));
        return;
      }
      var data = JSON.parse(selectedMarker.getAttribute("data-info"));
      var layer = selectedMarker.getAttribute("data-layer");
      infoPanel.classList.add("panel-" + layer);

      var layerLabel = layer === "structures" ? "Structure" : layer === "framework" ? "Framework" : "Standard Model";
      infoPanel.appendChild(el("div", { class: "skymap-info-title" },
        el("span", { text: data.label + " " }),
        badge(layerLabel, layer === "structures" ? "pass" : layer === "framework" ? "axiom" : "conjecture")
      ));

      if (data.formula) {
        infoPanel.appendChild(el("div", { class: "skymap-info-formula", text: data.formula }));
      }
      if (data.match) {
        var matchEl = el("div", { class: "skymap-info-match" });
        matchEl.appendChild(el("strong", { text: "Match: " }));
        var matchClass = data.match === "EXACT" ? "sigma-green" : data.match === "testable" ? "sigma-yellow" : parseFloat(data.error) < 1 ? "sigma-green" : "sigma-yellow";
        matchEl.appendChild(el("span", { class: matchClass, text: data.match === "EXACT" ? "EXACT match" : data.match === "testable" ? "Awaiting measurement" : data.match + " error" }));
        infoPanel.appendChild(matchEl);
      }
      infoPanel.appendChild(el("div", { class: "skymap-info-detail", text: data.detail }));
    }

    // --- Create region highlight circles ---
    function addRegion(item, layerKey, regionClass) {
      if (!item.radius) return;
      var region = el("div", {
        class: "skymap-region " + regionClass + (layers[layerKey] ? " visible" : ""),
        "data-layer": layerKey,
      });
      region.style.left = item.x + "%";
      region.style.top = item.y + "%";
      region.style.width = (item.radius * 2) + "%";
      region.style.height = (item.radius * 2 * 2) + "%"; // taller because Mollweide is ~2:1
      imgContainer.appendChild(region);
    }

    // Add regions BEFORE markers so markers render on top
    sky.structures.forEach(function (s) { addRegion(s, "structures", "region-structure"); });
    sky.frameworkAnnotations.forEach(function (f) { addRegion(f, "framework", "region-framework"); });
    sky.standardAnnotations.forEach(function (s) { addRegion(s, "standard", "region-standard"); });

    // --- Create markers ---
    function getMatchBadge(item) {
      if (!item.match) return null;
      var cls, text;
      if (item.match === "EXACT") { cls = "match-exact"; text = "EXACT"; }
      else if (item.match === "testable") { cls = "match-testable"; text = "TBD"; }
      else if (parseFloat(item.error) <= 0.1) { cls = "match-exact"; text = item.error; }
      else if (parseFloat(item.error) <= 2) { cls = "match-close"; text = item.error; }
      else { cls = "match-gap"; text = item.error; }
      return el("span", { class: "marker-match " + cls, text: text });
    }

    function addMarker(item, layerKey, dotClass, lblClass, lineClass) {
      var flipLeft = item.x > 65;
      var marker = el("div", {
        class: "skymap-marker" + (layers[layerKey] ? " visible" : "") + (flipLeft ? " label-left" : ""),
        "data-layer": layerKey,
        "data-info": JSON.stringify(item),
      });
      marker.style.left = item.x + "%";
      marker.style.top = item.y + "%";

      var dot = el("div", { class: "marker-dot " + dotClass });
      marker.appendChild(dot);

      // Connecting line
      var line = el("div", { class: "marker-line " + lineClass });
      marker.appendChild(line);

      // Label with optional match badge
      var lbl = el("span", { class: "marker-label " + lblClass });
      lbl.appendChild(document.createTextNode(item.label));
      var matchBadge = getMatchBadge(item);
      if (matchBadge) lbl.appendChild(matchBadge);
      if (item.scope === "global") {
        lbl.appendChild(el("span", { class: "scope-badge", text: "all-sky" }));
      } else if (item.scope === "hidden") {
        lbl.appendChild(el("span", { class: "scope-badge", text: "polarization" }));
      }
      marker.appendChild(lbl);

      marker.addEventListener("click", function (e) {
        e.stopPropagation();
        var prev = imgContainer.querySelector(".skymap-marker.selected");
        if (prev) prev.classList.remove("selected");
        marker.classList.add("selected");
        selectedMarker = marker;
        renderInfoPanel();
      });

      imgContainer.appendChild(marker);
    }

    sky.structures.forEach(function (s) { addMarker(s, "structures", "structure-dot", "structure-lbl", "structure-line"); });
    sky.frameworkAnnotations.forEach(function (f) { addMarker(f, "framework", "framework-dot", "framework-lbl", "framework-line"); });
    sky.standardAnnotations.forEach(function (s) { addMarker(s, "standard", "standard-dot", "standard-lbl", "standard-line"); });

    // Click on image background to deselect
    imgContainer.addEventListener("click", function () {
      var prev = imgContainer.querySelector(".skymap-marker.selected");
      if (prev) prev.classList.remove("selected");
      selectedMarker = null;
      renderInfoPanel();
    });

    wrap.appendChild(imgContainer);

    // Credit line
    wrap.appendChild(el("div", { class: "skymap-credit", text: "Image: " + sky.credit + " | " + sky.meanTemp + " mean, " + sky.fluctuationRange + " fluctuations" }));

    // Angular scale legend
    var scaleLegend = el("div", { class: "skymap-scale-legend" });
    scaleLegend.appendChild(el("span", { class: "scale-title", text: "Angular scales:" }));
    sky.angularScales.forEach(function (s) {
      scaleLegend.appendChild(el("span", { class: "scale-item", text: s.label + " \u2014 " + s.theta + " (l=" + s.l + ")" }));
    });
    wrap.appendChild(scaleLegend);

    // Info panel
    renderInfoPanel();
    wrap.appendChild(infoPanel);

    // --- Coverage meter ---
    if (sky.coverage) {
      var covSection = el("div", { class: "skymap-coverage" });
      var totalWeight = 0, coveredWeight = 0;
      sky.coverage.forEach(function (c) {
        totalWeight += c.weight;
        if (c.covered) coveredWeight += c.weight;
      });
      var covPct = Math.round(coveredWeight / totalWeight * 100);
      var uncovPct = 100 - covPct;

      covSection.appendChild(el("h3", { text: "Framework Coverage of CMB Physics" }));

      var barWrap = el("div", { class: "coverage-bar-wrap" });
      var barOuter = el("div", { class: "coverage-bar-outer" });
      var barFilled = el("div", { class: "coverage-bar-filled" });
      barFilled.style.width = covPct + "%";
      barFilled.appendChild(el("span", { class: "coverage-bar-text", text: "Addressed: " + covPct + "%" }));
      var barEmpty = el("div", { class: "coverage-bar-empty" });
      barEmpty.appendChild(el("span", { class: "coverage-bar-text-empty", text: "Not addressed: " + uncovPct + "%" }));
      barOuter.appendChild(barFilled);
      barOuter.appendChild(barEmpty);
      barWrap.appendChild(barOuter);
      covSection.appendChild(barWrap);

      var breakdown = el("div", { class: "coverage-breakdown" });
      sky.coverage.forEach(function (c) {
        var item = el("div", { class: "coverage-item " + (c.covered ? "covered" : "not-covered") });
        var icon = el("span", { class: "coverage-icon " + (c.covered ? "yes" : "no"), text: c.covered ? "+" : "-" });
        var labelDiv = el("div");
        labelDiv.appendChild(el("span", { class: "coverage-label", text: c.category }));
        labelDiv.appendChild(el("span", { class: "coverage-note", text: c.note }));
        item.appendChild(icon);
        item.appendChild(labelDiv);
        breakdown.appendChild(item);
      });
      covSection.appendChild(breakdown);
      wrap.appendChild(covSection);
    }

    // --- Comparison table (hidden until both layers active) ---
    var comparisonSection = el("div", { class: "skymap-comparison", style: "display:none" });
    comparisonSection.appendChild(el("h3", { class: "section-title", style: "font-size:1rem;margin-top:0.5rem", text: "Framework vs Standard Model" }));

    var compTable = el("table");
    var compThead = el("thead");
    var compHdr = el("tr");
    ["Aspect", "Verdict", "Note"].forEach(function (h) { compHdr.appendChild(el("th", { text: h })); });
    compThead.appendChild(compHdr);
    compTable.appendChild(compThead);

    var compTbody = el("tbody");
    sky.comparisonNotes.forEach(function (cn) {
      var tr = el("tr");
      tr.appendChild(el("td", { text: cn.aspect, style: "font-weight:600" }));
      var verdictMap = { agree: "Agree", differs: "Differs", "framework-gap": "Framework gap" };
      tr.appendChild(el("td", {},
        el("span", { class: "verdict-" + cn.verdict, text: verdictMap[cn.verdict] || cn.verdict })
      ));
      tr.appendChild(el("td", { text: cn.note, style: "font-size:0.82rem;color:var(--text-secondary)" }));
      compTbody.appendChild(tr);
    });
    compTable.appendChild(compTbody);

    var compWrap = el("div", { class: "table-wrap" });
    compWrap.appendChild(compTable);
    comparisonSection.appendChild(compWrap);
    wrap.appendChild(comparisonSection);

    container.appendChild(wrap);
  }

  // =========================================================================
  // SO(11) EPOCH MAPPING (Session 191)
  // =========================================================================
  function renderSO11Epochs() {
    var container = qs("#epochs");
    if (!D.so11Epochs) return;
    var ep = D.so11Epochs;

    // Breaking chain banner
    var chainBanner = el("div", { class: "chain-banner" });
    chainBanner.appendChild(el("div", { class: "chain-label", text: "Symmetry Breaking Chain" }));
    chainBanner.appendChild(el("div", { class: "chain-formula", text: ep.breakingChain }));
    chainBanner.appendChild(el("div", { class: "chain-result", text: "\u2192 " + ep.smResult }));
    container.appendChild(chainBanner);

    // Stage cards
    var stageGrid = el("div", { class: "epoch-grid" });
    ep.stages.forEach(function (s) {
      var card = el("div", { class: "epoch-card stage-" + s.stage });

      // Header
      var header = el("div", { class: "epoch-header" });
      var stageNum = el("div", { class: "epoch-stage-num", text: "Stage " + s.stage });
      var scaleBadge;
      if (s.scaleConfidence === "gap") {
        scaleBadge = badge("GAP", "fail");
      } else if (s.scaleConfidence === "import") {
        scaleBadge = badge("IMPORT", "conjecture");
      } else {
        scaleBadge = badge("PHYSICAL", "derivation");
      }
      header.appendChild(stageNum);
      header.appendChild(scaleBadge);
      card.appendChild(header);

      card.appendChild(el("div", { class: "epoch-label", text: s.label }));
      card.appendChild(el("div", { class: "epoch-breaking", text: s.breaking }));

      // Goldstones
      var gBar = el("div", { class: "epoch-goldstones" });
      var gCount = el("span", { class: "epoch-g-count", text: String(s.goldstones) });
      gBar.appendChild(gCount);
      gBar.appendChild(el("span", { text: " Goldstones (" + s.formula + ")" }));
      card.appendChild(gBar);

      // Energy scale
      card.appendChild(el("div", { class: "epoch-scale", text: "Energy: " + s.energyScale }));

      // Fates
      var fateList = el("div", { class: "epoch-fates" });
      s.fates.forEach(function (f) {
        fateList.appendChild(el("div", { class: "epoch-fate", text: f.count + " \u2014 " + f.description }));
      });
      card.appendChild(fateList);

      // Note
      card.appendChild(el("div", { class: "epoch-note", text: s.note }));

      stageGrid.appendChild(card);
    });
    container.appendChild(stageGrid);

    // DOF Accounting
    var dofSection = el("div", { class: "dof-accounting" });
    dofSection.appendChild(el("h3", { text: "DOF Accounting: " + ep.totalDOF + " = " + ep.totalDOFFormula }));
    var dofGrid = el("div", { class: "dof-grid" });
    ep.dofAccounting.forEach(function (d) {
      var item = el("div", { class: "dof-item" });
      item.appendChild(el("div", { class: "dof-count", text: String(d.count) }));
      item.appendChild(el("div", { class: "dof-category", text: d.category }));
      item.appendChild(el("div", { class: "dof-detail", text: d.detail }));
      dofGrid.appendChild(item);
    });
    dofSection.appendChild(dofGrid);

    // Goldstone total bar
    var totalBar = el("div", { class: "goldstone-bar" });
    var colors = ["var(--accent-blue)", "var(--accent-purple)", "var(--accent-orange)", "var(--accent-cyan)"];
    var total = ep.totalGoldstones;
    ep.stages.forEach(function (s, i) {
      var seg = el("div", { class: "goldstone-segment" });
      seg.style.width = (s.goldstones / total * 100) + "%";
      seg.style.background = colors[i];
      seg.appendChild(el("span", { text: s.goldstones }));
      seg.title = "Stage " + s.stage + ": " + s.goldstones + " Goldstones";
      totalBar.appendChild(seg);
    });
    dofSection.appendChild(el("div", { class: "goldstone-bar-label", text: "43 Goldstones by Stage" }));
    dofSection.appendChild(totalBar);
    var legendRow = el("div", { class: "goldstone-legend" });
    ep.stages.forEach(function (s, i) {
      var item = el("span", { class: "goldstone-legend-item" });
      var swatch = el("span", { class: "legend-swatch" });
      swatch.style.background = colors[i];
      item.appendChild(swatch);
      item.appendChild(document.createTextNode("S" + s.stage + ": " + s.label + " (" + s.goldstones + ")"));
      legendRow.appendChild(item);
    });
    dofSection.appendChild(legendRow);

    dofSection.appendChild(el("div", {
      class: "epoch-verify",
      text: "Verified: " + ep.verificationScript + " \u2014 " + ep.tests,
    }));

    container.appendChild(dofSection);
  }

  // =========================================================================
  // CMB SYNTHESIS — "What IS the CMB?" (Session 191)
  // =========================================================================
  function renderCMBSynthesis() {
    var container = qs("#synthesis");
    if (!D.cmbSynthesis) return;
    var syn = D.cmbSynthesis;

    // Interpretation banner
    var interp = el("div", { class: "synthesis-interp" });
    interp.appendChild(el("p", { text: syn.interpretation }));
    container.appendChild(interp);

    // Scorecard
    var scoreGrid = el("div", { class: "stats-grid" });
    var sc = syn.scorecard;
    var scoreItems = [sc.derived, sc.imported, sc.conjectured];
    if (sc.falsified) scoreItems.push(sc.falsified);
    scoreItems.push(sc.gaps);
    scoreItems.forEach(function (s) {
      var card = el("div", { class: "stat-card" });
      var val = el("div", { class: "stat-value score-" + s.color, text: String(s.count) });
      card.appendChild(val);
      card.appendChild(el("div", { class: "stat-label", text: s.label }));
      scoreGrid.appendChild(card);
    });
    container.appendChild(scoreGrid);

    // Three-column layout: Derived | Imported | Conjectured
    var triGrid = el("div", { class: "synthesis-tri-grid" });

    // Derived column
    var derivCol = el("div", { class: "synthesis-col col-derived" });
    derivCol.appendChild(el("h3", { text: "Derived (" + syn.derivedItems.length + ")" }));
    syn.derivedItems.forEach(function (d) {
      var item = el("div", { class: "synthesis-item" });
      item.appendChild(el("div", { class: "synthesis-item-text", text: d.item }));
      item.appendChild(el("div", { class: "synthesis-item-source", text: d.source }));
      item.appendChild(confidenceBadge(d.confidence));
      derivCol.appendChild(item);
    });
    triGrid.appendChild(derivCol);

    // Imported column
    var impCol = el("div", { class: "synthesis-col col-imported" });
    impCol.appendChild(el("h3", { text: "Imported (" + syn.importedItems.length + ")" }));
    syn.importedItems.forEach(function (d) {
      var item = el("div", { class: "synthesis-item" });
      item.appendChild(el("div", { class: "synthesis-item-text", text: d.item }));
      item.appendChild(el("div", { class: "synthesis-item-source", text: d.use }));
      impCol.appendChild(item);
    });
    triGrid.appendChild(impCol);

    // Conjectured column
    var conjCol = el("div", { class: "synthesis-col col-conjectured" });
    conjCol.appendChild(el("h3", { text: "Conjectured (" + syn.conjecturedItems.length + ")" }));
    syn.conjecturedItems.forEach(function (d) {
      var item = el("div", { class: "synthesis-item" });
      item.appendChild(el("div", { class: "synthesis-item-text", text: d.item }));
      var meta = el("div", { class: "synthesis-item-source" });
      meta.appendChild(el("span", { text: "HRS=" + d.hrs + " " }));
      meta.appendChild(el("span", { class: "synthesis-note", text: d.note }));
      item.appendChild(meta);
      conjCol.appendChild(item);
    });
    triGrid.appendChild(conjCol);

    // Falsified column (if present)
    if (syn.falsifiedItems && syn.falsifiedItems.length > 0) {
      var falsCol = el("div", { class: "synthesis-col col-falsified" });
      falsCol.appendChild(el("h3", { text: "Falsified (" + syn.falsifiedItems.length + ")" }));
      syn.falsifiedItems.forEach(function (d) {
        var item = el("div", { class: "synthesis-item" });
        item.appendChild(el("div", { class: "synthesis-item-text", text: d.item }));
        item.appendChild(el("div", { class: "synthesis-item-source", text: d.note }));
        item.appendChild(badge("FALSIFIED", "falsified"));
        falsCol.appendChild(item);
      });
      triGrid.appendChild(falsCol);
    }

    container.appendChild(triGrid);

    // Sound Speed Investigation
    var csSection = el("div", { class: "investigation-box cs-box" });
    csSection.appendChild(el("h3", { text: "Sound Speed Investigation: c_s = 3/7?" }));
    var csStatus = el("div", { class: "investigation-verdict" });
    csStatus.appendChild(badge("NOT DERIVABLE", "fail"));
    csStatus.appendChild(el("span", {
      text: " Claimed: " + syn.soundSpeedInvestigation.claimed +
        " | Standard: " + syn.soundSpeedInvestigation.standard +
        " | Discrepancy: " + syn.soundSpeedInvestigation.discrepancy
    }));
    csSection.appendChild(csStatus);

    var pathTable = el("table", { class: "investigation-table" });
    var pathHead = el("thead");
    var pathHr = el("tr");
    ["Path", "Result", "Status"].forEach(function (h) { pathHr.appendChild(el("th", { text: h })); });
    pathHead.appendChild(pathHr);
    pathTable.appendChild(pathHead);
    var pathBody = el("tbody");
    syn.soundSpeedInvestigation.paths.forEach(function (p) {
      var tr = el("tr");
      tr.appendChild(el("td", { text: p.name }));
      tr.appendChild(el("td", { class: "formula-cell", text: p.result }));
      var stTd = el("td");
      stTd.appendChild(badge(p.status, p.status === "refuted" ? "falsified" : "fail"));
      tr.appendChild(stTd);
      pathBody.appendChild(tr);
    });
    pathTable.appendChild(pathBody);
    csSection.appendChild(pathTable);
    if (syn.soundSpeedInvestigation.integralResult) {
      csSection.appendChild(el("div", { class: "investigation-note investigation-alert", text: "Integral result: " + syn.soundSpeedInvestigation.integralResult }));
    }
    if (syn.soundSpeedInvestigation.positiveResult) {
      csSection.appendChild(el("div", { class: "investigation-note investigation-positive", text: "Positive: " + syn.soundSpeedInvestigation.positiveResult }));
    }
    container.appendChild(csSection);

    // Inflationary Amplitude Investigation
    var v0Section = el("div", { class: "investigation-box v0-box" });
    v0Section.appendChild(el("h3", { text: "Inflationary Amplitude V\u2080 Investigation" }));
    var v0Status = el("div", { class: "investigation-verdict" });
    v0Status.appendChild(badge("NOT DERIVABLE", "fail"));
    v0Status.appendChild(el("span", { text: " " + syn.inflationaryAmplitude.conclusion }));
    v0Section.appendChild(v0Status);

    var v0Details = el("dl", { class: "values" });
    v0Details.appendChild(el("dt", { text: "Target A_s" }));
    v0Details.appendChild(el("dd", { text: syn.inflationaryAmplitude.targetAs }));
    v0Details.appendChild(el("dt", { text: "Required power" }));
    v0Details.appendChild(el("dd", { text: syn.inflationaryAmplitude.requiredPower }));
    v0Details.appendChild(el("dt", { text: "Near-miss" }));
    v0Details.appendChild(el("dd", { text: syn.inflationaryAmplitude.nearMiss }));
    v0Details.appendChild(el("dt", { text: "A_s coefficient" }));
    v0Details.appendChild(el("dd", { text: syn.inflationaryAmplitude.asCoefficient + " (" + syn.inflationaryAmplitude.asCoefficientNote + ")" }));
    v0Section.appendChild(v0Details);
    container.appendChild(v0Section);

    // Open Gaps
    var gapSection = el("div", { class: "gap-section" });
    gapSection.appendChild(el("h3", { text: "Open Gaps (" + syn.openGaps.length + ")" }));
    var gapGrid = el("div", { class: "gap-grid" });
    syn.openGaps.forEach(function (g) {
      var card = el("div", { class: "gap-card sev-" + g.severity });
      var header = el("div", { class: "gap-header" });
      header.appendChild(el("span", { class: "gap-id", text: g.id }));
      header.appendChild(severityBadge(g.severity));
      card.appendChild(header);
      card.appendChild(el("div", { class: "gap-desc", text: g.description }));
      card.appendChild(el("div", { class: "gap-detail", text: g.detail }));
      gapGrid.appendChild(card);
    });
    gapSection.appendChild(gapGrid);
    container.appendChild(gapSection);

    // Verification scripts
    var verifySection = el("div", { class: "synthesis-verify" });
    verifySection.appendChild(el("h3", { text: "Verification: " + syn.totalTests + "/110 PASS (Session " + syn.session + ")" }));
    var verifyGrid = el("div", { class: "verify-grid" });
    syn.verificationScripts.forEach(function (v) {
      var item = el("div", { class: "verify-item" });
      item.appendChild(el("code", { text: v.name }));
      item.appendChild(el("span", { text: " \u2014 " + v.tests + " tests " }));
      item.appendChild(badge(v.status, "pass"));
      verifyGrid.appendChild(item);
    });
    verifySection.appendChild(verifyGrid);
    container.appendChild(verifySection);
  }

  // =========================================================================
  // FOOTER
  // =========================================================================
  function renderFooter() {
    var footer = qs("#footer");
    footer.innerHTML =
      "Perspective Framework Explorer | " +
      D.meta.sessionRef + " | " +
      D.meta.lastUpdated + "<br>" +
      "Works offline from file:// — no server, no CDN, no external dependencies.";
  }

  // =========================================================================
  // INIT
  // =========================================================================
  function init() {
    renderHeader();
    renderModuleTabs();
    renderNavigation();

    // CMB module
    renderStatsOverview();
    renderSkyMap();
    renderLCDMParams();
    renderPowerSpectrum();
    renderFilterBar();
    renderMasterTable();
    renderBlindPredictions();
    renderPolarization();
    renderBBN();
    renderDeviations();
    renderFalsification();
    renderSO11Epochs();
    renderCMBSynthesis();
    renderHonestAssessment();

    // Crystal module
    if (window.CrystalModule) {
      window.CrystalModule.init();
    }

    // Catalog module
    if (window.CatalogModule) {
      window.CatalogModule.init();
    }

    // Primes module
    if (window.PrimesModule) {
      window.PrimesModule.init();
    }

    renderFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

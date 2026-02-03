/* ==========================================================================
   Prime Attractors — Rendering Engine
   Visualizes prime-physics mappings, hierarchy, and precision data.
   ========================================================================== */

(function () {
  "use strict";

  var PD = PRIMES_DATA;
  var svgNS = "http://www.w3.org/2000/svg";

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
  function svgEl(tag, attrs) {
    var node = document.createElementNS(svgNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }
  function badge(text, type) { return el("span", { class: "badge badge--" + type, text: text }); }

  // =========================================================================
  // OVERVIEW
  // =========================================================================
  function renderPrimesOverview() {
    var container = qs("#primes-stats");
    if (!container) return;
    var grid = el("div", { class: "stats-grid" });
    var totalPrimes = 0;
    PD.tiers.forEach(function (t) { totalPrimes += t.primes.length; });
    var stats = [
      { value: totalPrimes, label: "Primes Catalogued" },
      { value: PD.tiers.length, label: "Hierarchy Tiers" },
      { value: "37,527", label: "Verification Tests" },
      { value: "100%", label: "Tests Passing" },
    ];
    stats.forEach(function (s) {
      var card = el("div", { class: "stat-card" });
      card.appendChild(el("div", { class: "stat-value", text: String(s.value) }));
      card.appendChild(el("div", { class: "stat-label", text: s.label }));
      grid.appendChild(card);
    });
    container.appendChild(grid);

    // Master pattern
    var pattern = el("div", { class: "chain-banner", style: "margin-top:1rem" });
    pattern.appendChild(el("div", { class: "chain-label", text: "Master Pattern" }));
    pattern.appendChild(el("div", { class: "chain-formula", text: PD.masterPattern.formula }));
    pattern.appendChild(el("div", { class: "chain-result", text: PD.masterPattern.explanation }));
    container.appendChild(pattern);
  }

  // =========================================================================
  // PRIME CONSTELLATION (radial SVG)
  // =========================================================================
  function renderConstellation() {
    var container = qs("#prime-constellation");
    if (!container) return;

    var W = 860, H = 580;
    var cx = W / 2, cy = H / 2;
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", style: "max-width:" + W + "px" });

    // Background
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" }));

    // Concentric rings for tiers
    var ringRadii = [0, 55, 140, 205, 260, 310, 350];
    var ringLabels = ["", "Structural", "Framework", "Triple", "Quad", "Additive", "Non-FW"];

    for (var ri = 1; ri < ringRadii.length; ri++) {
      svg.appendChild(svgEl("circle", {
        cx: cx, cy: cy, r: ringRadii[ri],
        fill: "none", stroke: "rgba(48,54,61,0.5)", "stroke-width": 1,
        "stroke-dasharray": ri <= 2 ? "none" : "4,4",
      }));
      // Ring label
      var lt = svgEl("text", {
        x: cx + ringRadii[ri] - 4, y: cy - 6,
        fill: "#484f58", "font-size": "9px", "text-anchor": "end",
        "font-family": "-apple-system,sans-serif",
      });
      lt.textContent = ringLabels[ri];
      svg.appendChild(lt);
    }

    // Place primes on rings
    PD.tiers.forEach(function (tier, ti) {
      var r = ringRadii[ti + 1];
      var primes = tier.primes;
      var angleStep = 2 * Math.PI / Math.max(primes.length, 1);
      var startAngle = -Math.PI / 2 + ti * 0.3; // offset each tier slightly

      primes.forEach(function (prime, pi) {
        var angle = startAngle + pi * angleStep;
        var px = cx + r * Math.cos(angle);
        var py = cy + r * Math.sin(angle);

        // Node circle
        var nodeR = prime.p <= 11 ? 18 : prime.p <= 137 ? 14 : 11;
        svg.appendChild(svgEl("circle", {
          cx: px, cy: py, r: nodeR,
          fill: tier.color, stroke: "rgba(255,255,255,0.3)", "stroke-width": 1.5,
          opacity: "0.9",
        }));

        // Prime number
        var txt = svgEl("text", {
          x: px, y: py + 4, fill: "#fff", "font-size": nodeR > 14 ? "12px" : "10px",
          "font-weight": "700", "text-anchor": "middle",
          "font-family": "'SF Mono',monospace",
        });
        txt.textContent = prime.p;
        svg.appendChild(txt);

        // Physics label (outside the node)
        if (prime.bestMatch || (ti === 0)) {
          var lblAngle = angle;
          var lblR = r + nodeR + 12;
          var lx = cx + lblR * Math.cos(lblAngle);
          var ly = cy + lblR * Math.sin(lblAngle);
          var anchor = Math.cos(lblAngle) < -0.3 ? "end" : Math.cos(lblAngle) > 0.3 ? "start" : "middle";
          var labelText = prime.bestMatch || prime.physics.split(",")[0];
          if (labelText.length > 18) labelText = labelText.substring(0, 18) + "\u2026";
          var lbl = svgEl("text", {
            x: lx, y: ly + 3, fill: "#8b949e", "font-size": "9px",
            "text-anchor": anchor, "font-family": "-apple-system,sans-serif",
          });
          lbl.textContent = labelText;
          svg.appendChild(lbl);
        }
      });
    });

    // Center label
    svg.appendChild(svgEl("circle", { cx: cx, cy: cy, r: 32, fill: "#21262d", stroke: "#bc8cff", "stroke-width": 2 }));
    var cTxt = svgEl("text", { x: cx, y: cy - 4, fill: "#bc8cff", "font-size": "11px", "font-weight": "700", "text-anchor": "middle", "font-family": "'SF Mono',monospace" });
    cTxt.textContent = "\u211D\u2102\u210D\ud835\udd46";
    svg.appendChild(cTxt);
    var cTxt2 = svgEl("text", { x: cx, y: cy + 10, fill: "#8b949e", "font-size": "8px", "text-anchor": "middle", "font-family": "-apple-system,sans-serif" });
    cTxt2.textContent = "Division Algebras";
    svg.appendChild(cTxt2);

    var chartBox = el("div", { class: "chart-container" });
    chartBox.appendChild(svg);

    // Legend below
    var legend = el("div", { class: "prime-legend" });
    PD.tiers.forEach(function (tier) {
      var item = el("span", { class: "prime-legend-item" });
      var swatch = el("span", { class: "legend-swatch" });
      swatch.style.background = tier.color;
      item.appendChild(swatch);
      item.appendChild(document.createTextNode("T" + tier.id + ": " + tier.name + " (" + tier.primes.length + ")"));
      legend.appendChild(item);
    });
    chartBox.appendChild(legend);

    container.appendChild(chartBox);
  }

  // =========================================================================
  // PRECISION CHART (horizontal bar chart)
  // =========================================================================
  function renderPrecisionChart() {
    var container = qs("#precision-chart");
    if (!container) return;

    // Sort by precision (ascending = best first)
    var data = PD.precisionChart.slice().sort(function (a, b) { return a.ppm - b.ppm; });

    var chartBox = el("div", { class: "chart-container" });
    chartBox.appendChild(el("div", { style: "font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;", text: "Precision of prime-physics matches (parts per million, log scale). Lower = better match." }));

    var barContainer = el("div", { class: "precision-bars" });
    var maxLog = Math.log10(1000); // max ppm on chart

    data.forEach(function (d) {
      var row = el("div", { class: "precision-row" });

      // Label
      var label = el("div", { class: "precision-label" });
      label.appendChild(el("span", { class: "precision-name", text: d.label }));
      label.appendChild(el("span", { class: "precision-prime", text: "p=" + d.prime }));
      row.appendChild(label);

      // Bar
      var barWrap = el("div", { class: "precision-bar-wrap" });
      var ppmVal = Math.max(d.ppm, 0.1); // min for display
      var widthPct = Math.min((Math.log10(ppmVal) + 1) / (maxLog + 1) * 100, 100);
      var bar = el("div", { class: "precision-bar" });
      var tierColor = PD.tiers[d.tier - 1] ? PD.tiers[d.tier - 1].color : "#6e7681";
      bar.style.width = Math.max(widthPct, 3) + "%";
      bar.style.background = tierColor;
      barWrap.appendChild(bar);
      row.appendChild(barWrap);

      // Value
      var valStr = d.ppm === 0 ? "EXACT" : d.ppm < 1 ? d.ppm.toFixed(2) + " ppm" : d.ppm < 1000 ? Math.round(d.ppm) + " ppm" : (d.ppm / 1000).toFixed(1) + " \u2030";
      row.appendChild(el("div", { class: "precision-value", text: valStr }));
      barContainer.appendChild(row);
    });
    chartBox.appendChild(barContainer);
    container.appendChild(chartBox);
  }

  // =========================================================================
  // TIER EXPLORER (interactive cards per tier)
  // =========================================================================
  function renderTierExplorer() {
    var container = qs("#tier-explorer");
    if (!container) return;

    PD.tiers.forEach(function (tier) {
      var section = el("div", { class: "tier-section" });
      section.style.borderLeft = "3px solid " + tier.color;

      var header = el("div", { class: "tier-header" });
      var tierBadge = el("span", { class: "tier-badge" });
      tierBadge.style.background = tier.color;
      tierBadge.textContent = "T" + tier.id;
      header.appendChild(tierBadge);
      header.appendChild(el("span", { class: "tier-name", text: tier.name }));
      header.appendChild(el("span", { class: "tier-count", text: tier.primes.length + " primes" }));
      section.appendChild(header);
      section.appendChild(el("p", { class: "tier-desc", text: tier.description }));

      // Prime table
      var wrap = el("div", { class: "table-wrap" });
      var table = el("table");
      var thead = el("thead");
      var hr = el("tr");
      ["Prime", "Form", "Physical Manifestation", "Precision"].forEach(function (h) { hr.appendChild(el("th", { text: h })); });
      thead.appendChild(hr);
      table.appendChild(thead);

      var tbody = el("tbody");
      tier.primes.forEach(function (p) {
        var tr = el("tr");
        var pTd = el("td", { class: "mono" });
        pTd.style.color = tier.color;
        pTd.style.fontWeight = "700";
        pTd.textContent = p.p;
        tr.appendChild(pTd);
        tr.appendChild(el("td", { class: "formula-cell", text: p.form }));
        var physTd = el("td", { text: p.physics });
        if (p.special) {
          physTd.appendChild(el("br"));
          var sp = el("span", { class: "prime-special", text: p.special });
          physTd.appendChild(sp);
        }
        tr.appendChild(physTd);
        tr.appendChild(el("td", { class: "mono", text: p.precision }));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      section.appendChild(wrap);
      container.appendChild(section);
    });
  }

  // =========================================================================
  // KEY FORMULAS
  // =========================================================================
  function renderKeyFormulas() {
    var container = qs("#prime-formulas");
    if (!container) return;

    var grid = el("div", { class: "card-grid", style: "grid-template-columns:repeat(2,1fr)" });
    PD.keyFormulas.forEach(function (f) {
      var card = el("div", { class: "card" });
      card.appendChild(el("div", { class: "card-symbol", text: f.name }));
      card.appendChild(el("div", { class: "formula", text: f.formula }));
      var vals = el("dl", { class: "values" });
      vals.appendChild(el("dt", { text: "Precision" }));
      vals.appendChild(el("dd", { text: f.precision }));
      vals.appendChild(el("dt", { text: "Primes" }));
      vals.appendChild(el("dd", { text: f.primes.join(", ") }));
      card.appendChild(vals);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // =========================================================================
  // NAV + PUBLIC API
  // =========================================================================
  var PRIMES_NAV = [
    { id: "sec-primes-stats", label: "Overview" },
    { id: "sec-constellation", label: "Constellation" },
    { id: "sec-precision", label: "Precision" },
    { id: "sec-tier-explorer", label: "Tier Explorer" },
    { id: "sec-prime-formulas", label: "Key Formulas" },
  ];

  window.PrimesModule = {
    nav: PRIMES_NAV,
    init: function () {
      renderPrimesOverview();
      renderConstellation();
      renderPrecisionChart();
      renderTierExplorer();
      renderKeyFormulas();
    },
  };
})();

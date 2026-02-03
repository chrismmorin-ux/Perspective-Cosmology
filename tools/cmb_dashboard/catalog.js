/* ==========================================================================
   Crystallization Catalogue — Rendering Engine
   Visualizes the 9 crystallization types and their composability.
   ========================================================================== */

(function () {
  "use strict";

  var CD = CATALOG_DATA;
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
  // OVERVIEW STATS
  // =========================================================================
  function renderCatalogOverview() {
    var container = qs("#catalog-stats");
    if (!container) return;
    var grid = el("div", { class: "stats-grid" });
    var stats = [
      { value: "9", label: "Crystallization Types" },
      { value: CD.meta.scripts, label: "Verification Scripts" },
      { value: CD.meta.testsPass + "/" + CD.meta.testsTotal, label: "Tests Passing" },
      { value: CD.gaps.length, label: "Open Gaps" },
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
  // ORDER PARAMETER VISUAL
  // =========================================================================
  function renderOrderParameter() {
    var container = qs("#order-parameter");
    if (!container) return;

    var op = CD.orderParameter;
    var track = el("div", { class: "op-track" });

    // Title
    track.appendChild(el("div", { class: "op-title", html: "Order Parameter: <code>" + op.symbol + "</code> &mdash; Ground state: <code>" + op.groundState + "</code>" }));

    // State bar
    var bar = el("div", { class: "op-bar" });
    op.states.forEach(function (s) {
      var seg = el("div", { class: "op-segment" });
      seg.style.background = s.color;
      var label = el("div", { class: "op-seg-label" });
      label.appendChild(el("strong", { text: s.eps }));
      label.appendChild(el("br"));
      label.appendChild(el("span", { text: s.label }));
      seg.appendChild(label);
      seg.title = s.physics;
      bar.appendChild(seg);
    });
    track.appendChild(bar);

    // Physics descriptions below
    var descs = el("div", { class: "op-descriptions" });
    op.states.forEach(function (s) {
      var item = el("div", { class: "op-desc-item" });
      var dot = el("span", { class: "op-dot" });
      dot.style.background = s.color;
      item.appendChild(dot);
      item.appendChild(el("span", { text: s.label + ": " + s.physics }));
      descs.appendChild(item);
    });
    track.appendChild(descs);
    container.appendChild(track);
  }

  // =========================================================================
  // TYPE CARDS (C1–C9) — expandable gallery
  // =========================================================================
  function renderTypeCards() {
    var container = qs("#type-gallery");
    if (!container) return;

    var grid = el("div", { class: "type-grid" });
    CD.types.forEach(function (t) {
      var card = el("div", { class: "type-card" });
      card.style.borderTopColor = t.color;

      // Header
      var header = el("div", { class: "type-header" });
      var idBadge = el("span", { class: "type-id", text: t.id });
      idBadge.style.background = t.color;
      header.appendChild(idBadge);
      header.appendChild(el("span", { class: "type-name", text: t.name }));
      header.appendChild(badge(t.confidence, t.confidence));
      card.appendChild(header);

      // Classification tags
      var tags = el("div", { class: "type-tags" });
      [t.direction, t.scale, t.channel, t.mechanism].forEach(function (tag) {
        tags.appendChild(el("span", { class: "type-tag", text: tag }));
      });
      card.appendChild(tags);

      // Transition
      var trans = el("div", { class: "type-transition" });
      trans.appendChild(el("span", { class: "type-state before", text: t.before }));
      trans.appendChild(el("span", { class: "type-arrow", text: "\u2192" }));
      trans.appendChild(el("span", { class: "type-state after", text: t.after }));
      card.appendChild(trans);

      // Summary
      card.appendChild(el("p", { class: "type-summary", text: t.summary }));

      // Key formula
      card.appendChild(el("div", { class: "formula", text: t.keyFormula }));

      // Expandable signatures
      var sigWrap = el("div", { class: "type-sigs", style: "display:none" });
      if (t.signatures.length > 0) {
        var table = el("table", { class: "type-sig-table" });
        var thead = el("thead");
        var hr = el("tr");
        ["Observable", "Predicted", "Measured", "Error"].forEach(function (h) { hr.appendChild(el("th", { text: h })); });
        thead.appendChild(hr);
        table.appendChild(thead);
        var tbody = el("tbody");
        t.signatures.forEach(function (sig) {
          var tr = el("tr");
          tr.appendChild(el("td", { text: sig.observable }));
          tr.appendChild(el("td", { class: "mono", text: sig.predicted }));
          tr.appendChild(el("td", { class: "mono", text: sig.measured }));
          tr.appendChild(el("td", { class: "mono", text: sig.error }));
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        sigWrap.appendChild(table);
      }

      // Verification stats
      if (t.scripts > 0) {
        var verify = el("div", { class: "type-verify" });
        verify.appendChild(el("span", { text: t.scripts + " scripts, " + t.testsPass + "/" + t.testsTotal + " PASS" }));
        var pct = t.testsTotal > 0 ? Math.round(t.testsPass / t.testsTotal * 100) : 0;
        var verBar = el("div", { class: "type-verify-bar" });
        var verFill = el("div", { class: "type-verify-fill" });
        verFill.style.width = pct + "%";
        verFill.style.background = pct === 100 ? "var(--accent-green)" : pct > 95 ? "var(--accent-cyan)" : "var(--accent-yellow)";
        verBar.appendChild(verFill);
        verify.appendChild(verBar);
        sigWrap.appendChild(verify);
      }
      card.appendChild(sigWrap);

      // Expand button
      var expandBtn = el("button", {
        class: "type-expand-btn",
        text: "Show signatures \u25BC",
        onclick: function () {
          var showing = sigWrap.style.display !== "none";
          sigWrap.style.display = showing ? "none" : "";
          expandBtn.textContent = showing ? "Show signatures \u25BC" : "Hide signatures \u25B2";
        },
      });
      card.appendChild(expandBtn);

      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // =========================================================================
  // COMPOSABILITY FLOW (SVG)
  // =========================================================================
  function renderComposability() {
    var container = qs("#composability");
    if (!container) return;

    var chains = CD.chains;
    var W = 880, rowH = 56, padY = 24, padX = 30;
    var H = padY * 2 + chains.length * rowH;

    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", style: "max-width:" + W + "px" });
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" }));

    // Type positions for node placement
    var typeOrder = ["C1","C2","C3","C4","C5","C6","C7","C8","C9"];
    var typeX = {};
    typeOrder.forEach(function (t, i) { typeX[t] = padX + 40 + i * 88; });

    // Type color map
    var typeColor = {};
    CD.types.forEach(function (t) { typeColor[t.id] = t.color; });

    chains.forEach(function (chain, ci) {
      var y = padY + ci * rowH + rowH / 2;

      // Chain name label
      var lbl = svgEl("text", { x: padX + 10, y: y + 4, fill: chain.color, "font-size": "11px", "font-weight": "700", "font-family": "-apple-system,sans-serif", "text-anchor": "end" });
      // Use right-aligned at a fixed position
      lbl.setAttribute("x", padX + 4);
      lbl.setAttribute("text-anchor", "start");
      lbl.textContent = chain.name;
      // Position name to the right of the flow
      lbl.setAttribute("x", W - padX);
      lbl.setAttribute("text-anchor", "end");
      svg.appendChild(lbl);

      // Draw nodes and arrows
      var seq = chain.sequence;
      var startX = 140;
      var nodeGap = 120;
      seq.forEach(function (typeId, si) {
        var nx = startX + si * nodeGap;
        var nw = 50, nh = 28;

        // Node
        svg.appendChild(svgEl("rect", {
          x: nx - nw / 2, y: y - nh / 2, width: nw, height: nh, rx: 6,
          fill: typeColor[typeId] || "#333", stroke: "rgba(255,255,255,0.2)", "stroke-width": 1,
        }));
        var txt = svgEl("text", {
          x: nx, y: y + 4, fill: "#fff", "font-size": "12px", "font-weight": "700",
          "text-anchor": "middle", "font-family": "'SF Mono',monospace",
        });
        txt.textContent = typeId;
        svg.appendChild(txt);

        // Arrow to next
        if (si < seq.length - 1) {
          var ax1 = nx + nw / 2 + 2;
          var ax2 = startX + (si + 1) * nodeGap - nw / 2 - 2;
          svg.appendChild(svgEl("line", {
            x1: ax1, y1: y, x2: ax2, y2: y,
            stroke: chain.color, "stroke-width": 2, opacity: "0.7",
          }));
          // Arrowhead
          svg.appendChild(svgEl("polygon", {
            points: (ax2 - 6) + "," + (y - 4) + " " + ax2 + "," + y + " " + (ax2 - 6) + "," + (y + 4),
            fill: chain.color, opacity: "0.7",
          }));
        }
      });

      // Description below chain
      var desc = svgEl("text", {
        x: startX, y: y + 22, fill: "#6e7681", "font-size": "9px",
        "font-family": "-apple-system,sans-serif",
      });
      desc.textContent = chain.description;
      svg.appendChild(desc);
    });

    var chartBox = el("div", { class: "chart-container" });
    chartBox.appendChild(svg);
    container.appendChild(chartBox);
  }

  // =========================================================================
  // GAP TRACKER
  // =========================================================================
  function renderGaps() {
    var container = qs("#gap-tracker");
    if (!container) return;

    // Open gaps
    var gapGrid = el("div", { class: "gap-grid" });
    CD.gaps.forEach(function (g) {
      var card = el("div", { class: "gap-card sev-" + g.severity });
      var header = el("div", { class: "gap-header" });
      header.appendChild(el("span", { class: "gap-id", text: g.id }));
      var sevMap = { critical: "sev-critical", high: "sev-high", medium: "sev-medium" };
      header.appendChild(badge(g.severity, sevMap[g.severity] || "conjecture"));
      card.appendChild(header);
      card.appendChild(el("div", { class: "gap-desc", text: g.description }));
      var typeStr = g.types.join(", ");
      card.appendChild(el("div", { class: "gap-detail", text: "Affects: " + typeStr }));
      gapGrid.appendChild(card);
    });
    container.appendChild(el("h3", { style: "font-size:1rem;color:var(--text-primary);margin-bottom:0.75rem;", text: "Open Gaps (" + CD.gaps.length + ")" }));
    container.appendChild(gapGrid);

    // Falsified
    if (CD.falsified.length > 0) {
      container.appendChild(el("h3", { style: "font-size:1rem;color:var(--accent-red);margin:1.5rem 0 0.75rem;", text: "Falsified (" + CD.falsified.length + ")" }));
      var fGrid = el("div", { class: "gap-grid" });
      CD.falsified.forEach(function (f) {
        var card = el("div", { class: "gap-card sev-critical" });
        card.appendChild(el("div", { class: "gap-desc", text: f.description }));
        card.appendChild(el("div", { class: "gap-detail", text: "Session: " + f.session }));
        fGrid.appendChild(card);
      });
      container.appendChild(fGrid);
    }

    // Resolved
    if (CD.resolved.length > 0) {
      container.appendChild(el("h3", { style: "font-size:1rem;color:var(--accent-green);margin:1.5rem 0 0.75rem;", text: "Resolved (" + CD.resolved.length + ")" }));
      var rGrid = el("div", { class: "gap-grid" });
      CD.resolved.forEach(function (r) {
        var card = el("div", { class: "gap-card", style: "border-left:3px solid var(--accent-green)" });
        card.appendChild(el("div", { class: "gap-desc", text: r.description }));
        card.appendChild(el("div", { class: "gap-detail", text: r.session + " \u2014 " + r.tests }));
        rGrid.appendChild(card);
      });
      container.appendChild(rGrid);
    }
  }

  // =========================================================================
  // NAV + PUBLIC API
  // =========================================================================
  var CATALOG_NAV = [
    { id: "sec-catalog-stats", label: "Overview" },
    { id: "sec-order-param", label: "Order Parameter" },
    { id: "sec-type-gallery", label: "Type Gallery" },
    { id: "sec-composability", label: "Composability" },
    { id: "sec-gaps", label: "Gap Tracker" },
  ];

  window.CatalogModule = {
    nav: CATALOG_NAV,
    init: function () {
      renderCatalogOverview();
      renderOrderParameter();
      renderTypeCards();
      renderComposability();
      renderGaps();
    },
  };
})();

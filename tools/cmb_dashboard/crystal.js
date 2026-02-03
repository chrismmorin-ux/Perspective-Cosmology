/* ==========================================================================
   Crystal Structure — Rendering Engine
   Visualizes the 11D crystal: breaking chain, decomposition, tilt matrix.
   ========================================================================== */

(function () {
  "use strict";

  var CD = CRYSTAL_DATA;
  var svgNS = "http://www.w3.org/2000/svg";

  // =========================================================================
  // DOM helpers (reuse pattern from app.js)
  // =========================================================================
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
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
    if (attrs) Object.keys(attrs).forEach(function (k) {
      node.setAttribute(k, attrs[k]);
    });
    return node;
  }

  function svgText(x, y, text, attrs) {
    var t = svgEl("text", Object.assign({ x: x, y: y }, attrs || {}));
    t.textContent = text;
    return t;
  }

  // =========================================================================
  // CRYSTAL OVERVIEW STATS
  // =========================================================================
  function renderCrystalOverview() {
    var container = qs("#crystal-stats");
    if (!container) return;
    var grid = el("div", { class: "stats-grid" });

    var stats = [
      { value: "11", label: "Crystal Dimensions (n_c)" },
      { value: "4", label: "Defect Dimensions (n_d)" },
      { value: "137", label: "Interface Modes (1/\u03B1)" },
      { value: "43", label: "Goldstone Modes" },
    ];

    stats.forEach(function (s) {
      var card = el("div", { class: "stat-card" });
      card.appendChild(el("div", { class: "stat-value", text: s.value }));
      card.appendChild(el("div", { class: "stat-label", text: s.label }));
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // =========================================================================
  // SYMMETRY BREAKING CASCADE (SVG)
  // =========================================================================
  function renderSymmetryBreaking() {
    var container = qs("#symmetry-breaking");
    if (!container) return;

    var stages = CD.breakingChain.stages;
    var W = 860, H = 640;
    var nodeW = 280, nodeH = 56;
    var mechW = 240, mechH = 44;
    var vGap = 60;
    var centerX = 300;

    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", style: "max-width:" + W + "px" });

    // Background
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" }));

    // Draw each stage
    stages.forEach(function (s, i) {
      var y = 24 + i * (nodeH + vGap);
      var x = centerX - nodeW / 2;

      // Node background
      var isFirst = i === 0;
      var isLast = i === stages.length - 1;
      svg.appendChild(svgEl("rect", {
        x: x, y: y, width: nodeW, height: nodeH, rx: 8,
        fill: s.color, stroke: s.borderColor, "stroke-width": isFirst || isLast ? 3 : 2,
        opacity: 0.9,
      }));

      // Group name
      svg.appendChild(svgText(centerX, y + 22, s.group, {
        "text-anchor": "middle", fill: "#fff", "font-weight": "700", "font-size": "14px",
        "font-family": "'SF Mono','Cascadia Code',monospace",
      }));

      // Generator count + label
      svg.appendChild(svgText(centerX, y + 40, s.generators + " generators \u2014 " + s.label, {
        "text-anchor": "middle", fill: "rgba(255,255,255,0.75)", "font-size": "10.5px",
        "font-family": "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }));

      // Arrow + Goldstone count (between nodes)
      if (i > 0) {
        var arrowY1 = y - vGap + nodeH;
        var arrowY2 = y;
        var midY = (arrowY1 + arrowY2) / 2;

        // Arrow line
        svg.appendChild(svgEl("line", {
          x1: centerX, y1: arrowY1 + 4, x2: centerX, y2: arrowY2 - 4,
          stroke: "#484f58", "stroke-width": 2, "stroke-dasharray": "6,3",
        }));

        // Arrowhead
        svg.appendChild(svgEl("polygon", {
          points: (centerX - 5) + "," + (arrowY2 - 8) + " " + centerX + "," + (arrowY2 - 1) + " " + (centerX + 5) + "," + (arrowY2 - 8),
          fill: "#484f58",
        }));

        // Goldstone badge
        var gs = stages[i];
        var badgeW = 100;
        svg.appendChild(svgEl("rect", {
          x: centerX - badgeW / 2, y: midY - 10, width: badgeW, height: 20, rx: 10,
          fill: "#21262d", stroke: "#30363d", "stroke-width": 1,
        }));
        svg.appendChild(svgText(centerX, midY + 4, gs.goldstones + " Goldstones", {
          "text-anchor": "middle", fill: "#d29922", "font-size": "11px", "font-weight": "600",
          "font-family": "-apple-system,sans-serif",
        }));

        // Mechanism box (right side)
        var mechX = centerX + nodeW / 2 + 30;
        var mechY = midY - mechH / 2;

        // Connecting line
        svg.appendChild(svgEl("line", {
          x1: centerX + badgeW / 2 + 2, y1: midY, x2: mechX, y2: midY,
          stroke: "#30363d", "stroke-width": 1, "stroke-dasharray": "3,3",
        }));

        svg.appendChild(svgEl("rect", {
          x: mechX, y: mechY, width: mechW, height: mechH, rx: 6,
          fill: "#161b22", stroke: "#30363d", "stroke-width": 1,
        }));

        svg.appendChild(svgText(mechX + mechW / 2, mechY + 16, gs.mechanism, {
          "text-anchor": "middle", fill: "#bc8cff", "font-size": "11px", "font-weight": "600",
          "font-family": "'SF Mono',monospace",
        }));

        svg.appendChild(svgText(mechX + mechW / 2, mechY + 32, gs.goldstoneFormula, {
          "text-anchor": "middle", fill: "#8b949e", "font-size": "10px",
          "font-family": "'SF Mono',monospace",
        }));
      }
    });

    // Total Goldstones label
    var totalY = H - 28;
    svg.appendChild(svgEl("rect", {
      x: centerX - 120, y: totalY - 14, width: 240, height: 26, rx: 13,
      fill: "#1b5e20", stroke: "#4caf50", "stroke-width": 1.5,
    }));
    svg.appendChild(svgText(centerX, totalY + 4, "Total: 28 + 7 + 6 + 2 = 43 Goldstone modes", {
      "text-anchor": "middle", fill: "#a5d6a7", "font-size": "11px", "font-weight": "600",
      "font-family": "-apple-system,sans-serif",
    }));

    var chartBox = el("div", { class: "chart-container" });
    chartBox.appendChild(svg);
    container.appendChild(chartBox);

    // Mechanism detail cards below
    var detailGrid = el("div", { class: "crystal-mechanism-grid" });
    stages.forEach(function (s, i) {
      if (i === 0) return; // skip pristine
      var card = el("div", { class: "card" });
      card.style.borderTop = "3px solid " + s.color;

      var header = el("div", { class: "card-header" });
      header.appendChild(el("span", { class: "card-symbol", text: "Stage " + i }));
      header.appendChild(el("span", { class: "badge badge--derivation", text: s.epoch }));
      card.appendChild(header);

      card.appendChild(el("div", { class: "card-name", text: s.group }));
      card.appendChild(el("div", { class: "formula", text: s.mechanism }));
      card.appendChild(el("p", { style: "font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin:0", text: s.mechanismDetail }));
      detailGrid.appendChild(card);
    });
    container.appendChild(detailGrid);
  }

  // =========================================================================
  // CRYSTAL DECOMPOSITION (SVG tree)
  // =========================================================================
  function renderCrystalDecomposition() {
    var container = qs("#crystal-decomposition");
    if (!container) return;
    var dec = CD.decomposition;

    var W = 880, H = 420;
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", style: "max-width:" + W + "px" });

    // Layout: root -> 2 branches -> crystal has 3 sub-branches
    var rootX = 80, rootY = H / 2;
    var splitX = 260;
    var defY = 80, crysY = H / 2 + 40;
    var leafX = 530;
    var subY = [80, H / 2, H - 80];

    var nw = 200, nh = 72; // node size
    var snw = 210, snh = 90; // subspace node size

    // Helper: draw a node
    function drawNode(x, y, w, h, fill, stroke, sw, label1, label2, label3) {
      svg.appendChild(svgEl("rect", { x: x, y: y - h / 2, width: w, height: h, rx: 8, fill: fill, stroke: stroke, "stroke-width": sw }));
      svg.appendChild(svgText(x + w / 2, y - 10, label1, { "text-anchor": "middle", fill: "#fff", "font-weight": "700", "font-size": "13px", "font-family": "'SF Mono',monospace" }));
      if (label2) svg.appendChild(svgText(x + w / 2, y + 6, label2, { "text-anchor": "middle", fill: "rgba(255,255,255,0.7)", "font-size": "10.5px", "font-family": "-apple-system,sans-serif" }));
      if (label3) svg.appendChild(svgText(x + w / 2, y + 20, label3, { "text-anchor": "middle", fill: "rgba(255,255,255,0.5)", "font-size": "9.5px", "font-family": "-apple-system,sans-serif" }));
    }

    // Helper: draw a curved connection
    function drawLink(x1, y1, x2, y2) {
      var mx = (x1 + x2) / 2;
      var path = "M" + x1 + "," + y1 + " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2;
      svg.appendChild(svgEl("path", { d: path, fill: "none", stroke: "#30363d", "stroke-width": 1.5 }));
    }

    // Root node
    drawNode(rootX - 10, rootY, 140, 64, "#4A148C", "#CE93D8", 2.5, "V (Total)", "15 dimensions", "n_d + n_c = 4 + 11");

    // Links from root
    drawLink(rootX + 130, rootY, splitX, defY);
    drawLink(rootX + 130, rootY, splitX, crysY);

    // Defect node
    drawNode(splitX, defY, nw, nh, "#B71C1C", "#EF5350", 2, "Defect (n_d = 4)", "\u210D Quaternions", "Associative \u2192 Spacetime");

    // Crystal node
    drawNode(splitX, crysY, nw, nh, "#0D47A1", "#42A5F5", 2, "Crystal (n_c = 11)", "1 + 3 + 7", "Im(\u2102) + Im(\u210D) + Im(\ud835\udd46)");

    // Interface label on the link between defect and crystal
    var intfY = (defY + crysY) / 2;
    svg.appendChild(svgEl("rect", { x: splitX + 40, y: intfY - 11, width: 120, height: 22, rx: 11, fill: "#21262d", stroke: "#9B59B6", "stroke-width": 1 }));
    svg.appendChild(svgText(splitX + 100, intfY + 3, "44 modes (Higgs)", { "text-anchor": "middle", fill: "#bc8cff", "font-size": "9.5px", "font-weight": "600", "font-family": "-apple-system,sans-serif" }));

    // Links from crystal to subspaces
    dec.subspaces.forEach(function (ss, i) {
      drawLink(splitX + nw, crysY, leafX, subY[i]);
    });

    // Defect leaf
    drawNode(leafX, defY, snw, snh, "rgba(229,57,53,0.25)", "#E53935", 1.5,
      "3+1 Spacetime", "SO(3,1) Lorentz", "Gravity \u2022 16 Herm modes");

    drawLink(splitX + nw, defY, leafX, defY);

    // Subspace leaf nodes
    dec.subspaces.forEach(function (ss, i) {
      drawNode(leafX, subY[i], snw, snh,
        ss.colorLight.replace("0.15", "0.3"), ss.color, 1.5,
        ss.name + " = " + ss.dim,
        ss.gaugeGroup + " \u2192 " + ss.particles,
        ss.extra || ss.physics
      );
    });

    // 137 interface total label
    svg.appendChild(svgEl("rect", { x: W - 170, y: H - 36, width: 160, height: 26, rx: 13, fill: "#311B92", stroke: "#B388FF", "stroke-width": 1.5 }));
    svg.appendChild(svgText(W - 90, H - 20, "137 = 16 + 121 = 1/\u03B1", { "text-anchor": "middle", fill: "#CE93D8", "font-size": "11px", "font-weight": "600", "font-family": "'SF Mono',monospace" }));

    var chartBox = el("div", { class: "chart-container" });
    chartBox.appendChild(svg);
    container.appendChild(chartBox);
  }

  // =========================================================================
  // TILT MATRIX HEATMAP (Canvas)
  // =========================================================================
  function renderTiltMatrix() {
    var container = qs("#tilt-matrix");
    if (!container) return;
    var tm = CD.tiltMatrix;

    // Wrapper with flex layout
    var wrapper = el("div", { class: "tilt-wrapper" });

    // Canvas
    var canvasWrap = el("div", { class: "tilt-canvas-wrap" });
    var canvas = el("canvas", { id: "tilt-canvas", width: "580", height: "580" });
    canvasWrap.appendChild(canvas);

    // Tooltip
    var tooltip = el("div", { class: "tilt-tooltip", id: "tilt-tooltip" });
    canvasWrap.appendChild(tooltip);
    wrapper.appendChild(canvasWrap);

    // Legend panel
    var legend = el("div", { class: "tilt-legend" });
    legend.appendChild(el("h3", { text: "Block Types" }));

    tm.legendItems.forEach(function (item) {
      var bt = tm.blockTypes[item.key];
      var row = el("div", { class: "tilt-legend-item" });
      var swatch = el("div", { class: "tilt-swatch" });
      swatch.style.background = bt.color;
      row.appendChild(swatch);
      var labelDiv = el("div", { class: "tilt-legend-text" });
      labelDiv.appendChild(el("strong", { text: item.label }));
      labelDiv.appendChild(el("span", { text: " " + bt.dim }));
      labelDiv.appendChild(el("br"));
      labelDiv.appendChild(el("span", { class: "tilt-legend-phys", text: item.detail }));
      row.appendChild(labelDiv);
      legend.appendChild(row);
    });

    legend.appendChild(el("h3", { style: "margin-top:1.25rem", text: "Key Numbers" }));
    var numGrid = el("div", { class: "tilt-numbers" });
    tm.keyNumbers.forEach(function (kn) {
      var item = el("div", { class: "tilt-num-item" });
      item.appendChild(el("span", { class: "tilt-num-val", text: kn.value }));
      item.appendChild(el("span", { class: "tilt-num-label", text: kn.label }));
      numGrid.appendChild(item);
    });
    legend.appendChild(numGrid);
    wrapper.appendChild(legend);
    container.appendChild(wrapper);

    // Info box
    var info = el("div", { class: "tilt-info" });
    info.innerHTML =
      "<strong>Reading the Tilt Matrix.</strong> Each cell is a coupling \u03B5<sub>ij</sub> between dimension <i>i</i> and <i>j</i>. " +
      "In the pristine crystal, \u03B5 = 0 (all cells zero). Our universe has |\u03B5| ~ \u03B1\u00B2 ~ 10<sup>\u22125</sup>. " +
      "<br/><br/>" +
      "<strong>Diagonal blocks</strong> (same subspace) generate gauge fields: red = gravity, green = weak, blue = strong. " +
      "<strong>Off-diagonal blocks</strong> encode mixing: purple = Higgs interface, orange = electroweak, teal = GUT interface. " +
      "<strong>White-bordered diagonal cells</strong> are self-couplings. " +
      "Trace constraint: <code>Tr(\u03B5) = \u22127</code>.";
    container.appendChild(info);

    // Render canvas
    drawTiltCanvas(canvas, tooltip, tm);
  }

  function drawTiltCanvas(canvas, tooltip, tm) {
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    var N = tm.size;
    var margin = { top: 50, left: 54, right: 10, bottom: 10 };
    var gW = W - margin.left - margin.right;
    var gH = H - margin.top - margin.bottom;
    var cellW = gW / N, cellH = gH / N;

    function getBlockIdx(dim) {
      for (var i = 0; i < tm.blocks.length; i++) {
        if (dim >= tm.blocks[i].start && dim < tm.blocks[i].end) return i;
      }
      return -1;
    }

    function hexToRgb(hex) {
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      };
    }

    // Background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, W, H);

    // Draw cells
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < N; j++) {
        var x = margin.left + j * cellW;
        var y = margin.top + i * cellH;
        var bi = getBlockIdx(i), bj = getBlockIdx(j);
        var bt = tm.blockTypes[bi + "-" + bj];
        if (!bt) continue;
        var rgb = hexToRgb(bt.color);
        var isDiag = i === j;
        var alpha = isDiag ? 0.92 : 0.5;

        // Subtle radial fade within blocks
        var bci = (tm.blocks[bi].start + tm.blocks[bi].end - 1) / 2;
        var bcj = (tm.blocks[bj].start + tm.blocks[bj].end - 1) / 2;
        var dist = Math.sqrt(Math.pow(i - bci, 2) + Math.pow(j - bcj, 2));
        var maxD = Math.sqrt(Math.pow((tm.blocks[bi].end - tm.blocks[bi].start) / 2, 2) + Math.pow((tm.blocks[bj].end - tm.blocks[bj].start) / 2, 2)) || 1;
        var fade = 1 - 0.12 * (dist / maxD);

        ctx.fillStyle = "rgba(" + Math.round(rgb.r * fade) + "," + Math.round(rgb.g * fade) + "," + Math.round(rgb.b * fade) + "," + alpha + ")";
        ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

        if (isDiag) {
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);
        }
      }
    }

    // Block boundaries
    var boundaries = [0, 4, 5, 8, 15];
    ctx.strokeStyle = "rgba(230,237,243,0.4)";
    ctx.lineWidth = 1.5;
    boundaries.forEach(function (b) {
      var px = margin.left + b * cellW, py = margin.top + b * cellH;
      ctx.beginPath(); ctx.moveTo(px, margin.top); ctx.lineTo(px, margin.top + gH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(margin.left, py); ctx.lineTo(margin.left + gW, py); ctx.stroke();
    });

    // Outer border
    ctx.strokeStyle = "rgba(230,237,243,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(margin.left, margin.top, gW, gH);

    // Cell labels
    ctx.fillStyle = "#8b949e";
    ctx.font = "10px 'Segoe UI',system-ui,sans-serif";
    ctx.textAlign = "center";
    tm.blocks.forEach(function (block) {
      for (var d = block.start; d < block.end; d++) {
        var lbl = block.labels[d - block.start];
        ctx.textBaseline = "bottom";
        ctx.fillText(lbl, margin.left + (d + 0.5) * cellW, margin.top - 3);
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillText(lbl, margin.left - 5, margin.top + (d + 0.5) * cellH);
        ctx.textAlign = "center";
      }
    });

    // Block group labels (top)
    ctx.font = "bold 11px 'Segoe UI',system-ui,sans-serif";
    ctx.fillStyle = "#e6edf3";
    ctx.textBaseline = "bottom";
    tm.blocks.forEach(function (block) {
      var mid = (block.start + block.end) / 2;
      ctx.fillText(block.shortName, margin.left + mid * cellW, margin.top - 16);
    });

    // Block group labels (left, rotated)
    tm.blocks.forEach(function (block) {
      var mid = (block.start + block.end) / 2;
      ctx.save();
      ctx.translate(margin.left - 26, margin.top + mid * cellH);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(block.shortName, 0, 0);
      ctx.restore();
    });

    // Dimension annotations in larger blocks
    ctx.font = "10px 'Segoe UI',system-ui,sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var bi2 = 0; bi2 < tm.blocks.length; bi2++) {
      for (var bj2 = 0; bj2 < tm.blocks.length; bj2++) {
        var b1 = tm.blocks[bi2], b2 = tm.blocks[bj2];
        var rows = b1.end - b1.start, cols = b2.end - b2.start;
        if (rows >= 3 && cols >= 3) {
          var cx = margin.left + ((b2.start + b2.end) / 2) * cellW;
          var cy = margin.top + ((b1.start + b1.end) / 2) * cellH;
          ctx.fillText(rows + "\u00D7" + cols, cx, cy);
        }
      }
    }

    // Tooltip on hover
    canvas.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (W / rect.width);
      var my = (e.clientY - rect.top) * (H / rect.height);
      var col = Math.floor((mx - margin.left) / cellW);
      var row = Math.floor((my - margin.top) / cellH);

      if (row >= 0 && row < N && col >= 0 && col < N) {
        var bri = getBlockIdx(row), bci2 = getBlockIdx(col);
        var info = tm.blockTypes[bri + "-" + bci2];
        if (!info) { tooltip.style.opacity = "0"; return; }
        var rowL = tm.blocks[bri].labels[row - tm.blocks[bri].start];
        var colL = tm.blocks[bci2].labels[col - tm.blocks[bci2].start];
        tooltip.innerHTML = "<strong>\u03B5<sub>" + rowL + "," + colL + "</sub></strong><br/>" +
          info.name + "<br/><span style='color:#8b949e'>" + info.physics + "</span>" +
          (row === col ? "<br/><span style='color:#58a6ff'>Diagonal (self-coupling)</span>" : "");
        tooltip.style.opacity = "1";
        tooltip.style.left = (e.clientX - canvas.parentElement.getBoundingClientRect().left + 15) + "px";
        tooltip.style.top = (e.clientY - canvas.parentElement.getBoundingClientRect().top - 10) + "px";
      } else {
        tooltip.style.opacity = "0";
      }
    });

    canvas.addEventListener("mouseleave", function () {
      tooltip.style.opacity = "0";
    });
  }

  // =========================================================================
  // NAV ITEMS for crystal module
  // =========================================================================
  var CRYSTAL_NAV = [
    { id: "sec-crystal-stats", label: "Overview" },
    { id: "sec-breaking", label: "Symmetry Breaking" },
    { id: "sec-decomposition", label: "Decomposition" },
    { id: "sec-tilt", label: "Tilt Matrix" },
  ];

  // =========================================================================
  // PUBLIC API
  // =========================================================================
  window.CrystalModule = {
    nav: CRYSTAL_NAV,
    init: function () {
      renderCrystalOverview();
      renderSymmetryBreaking();
      renderCrystalDecomposition();
      renderTiltMatrix();
    },
  };
})();

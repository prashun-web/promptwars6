/**
 * FIFA AI Command Center — AnalyticsAgent (Refactored)
 * Single responsibility: chart computation and executive summary generation.
 * Chart drawing is debounced. Pure summary function exported for tests.
 * @module AnalyticsAgent
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;
  var C   = global.FIFA_CONSTANTS;

  // ── Debounce utility ─────────────────────────────────────────────────────

  function debounce(fn, ms) {
    var timer = null;
    return function () {
      var args    = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(context, args); }, ms);
    };
  }

  // ── Pure summary builder (exported for tests) ────────────────────────────

  /**
   * Build executive summary text from current state.
   * Pure function — no DOM, no side effects.
   * @param {{type:string, priority:string, exit:string}|null} activeEmergency
   * @param {number} crowdDensity
   * @param {number} energyRate    — % renewable
   * @param {string} date          — formatted date string
   * @returns {{color:string, heading:string, body:string}}
   */
  function buildExecutiveSummary(activeEmergency, crowdDensity, energyRate, date) {
    if (activeEmergency) {
      return {
        color:   'var(--neon-red)',
        heading: '[EXECUTIVE ALERT] ACTIVE ' + activeEmergency.type.toUpperCase() + ' DISPATCH PROTOCOL',
        body:    'Operations summary for ' + date + '. Operational security classification raised to level: ' + activeEmergency.priority + '. Evacuation and volunteer vectors shifted to incident mitigation at exit ' + activeEmergency.exit + '. Auxiliary power grids on standby. Action Plan checkouts are active.',
      };
    }
    return {
      color:   'var(--neon-green)',
      heading: '[EXECUTIVE OVERVIEW] ALL SECTORS NOMINAL',
      body:    'Operations summary for ' + date + '. Stadium occupancy has reached average density of ' + crowdDensity + '% of safe seating configurations. Eco-infrastructure reports ' + energyRate + '% renewable offsets from photovoltaic array grids. Concession queue metrics indicate moderate flows near Sections 101 and 103, with zero reports of ticketing hardware failures in the last 60 minutes. Local traffic flow nominal; transit services pacing correctly.',
    };
  }

  // ── SVG chart helpers ────────────────────────────────────────────────────

  function buildCrowdDensityChart(data) {
    if (!data || data.length === 0) return '';
    var maxVal  = Math.max.apply(null, data.map(function (d) { return d.density; }));
    var xStep   = 450 / (data.length - 1);
    var points  = data.map(function (d, i) {
      var x = 30 + i * xStep;
      var y = 160 - (d.density / maxVal) * 110;
      return x + ',' + y;
    }).join(' ');

    var dots = data.map(function (d, i) {
      var x = 30 + i * xStep;
      var y = 160 - (d.density / maxVal) * 110;
      return '<circle cx="' + x + '" cy="' + y + '" r="4.5" fill="#fff" stroke="var(--neon-blue)" stroke-width="2" />';
    }).join('');

    var labels = data.map(function (d, i) {
      var x = 30 + i * xStep;
      return '<text x="' + x + '" y="185" fill="var(--text-muted)" font-size="10" text-anchor="middle">' + global.Sanitizer.sanitizeHTML(d.time) + '</text>';
    }).join('');

    return '<svg viewBox="0 0 500 200" style="width:100%;height:100%;" aria-label="Crowd density over time">' +
      '<line x1="30" y1="50"  x2="480" y2="50"  class="chart-gridline" />' +
      '<line x1="30" y1="105" x2="480" y2="105" class="chart-gridline" />' +
      '<line x1="30" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />' +
      '<polyline points="' + points + '" fill="none" stroke="var(--neon-blue)" stroke-width="3" style="filter:drop-shadow(0 0 4px var(--neon-blue))" />' +
      dots +
      '<text x="25" y="160" fill="var(--text-muted)" font-size="9" text-anchor="end">0%</text>' +
      '<text x="25" y="105" fill="var(--text-muted)" font-size="9" text-anchor="end">50%</text>' +
      '<text x="25" y="50"  fill="var(--text-muted)" font-size="9" text-anchor="end">100%</text>' +
      labels + '</svg>';
  }

  function buildTransportChart(data) {
    if (!data || data.length === 0) return '';
    var maxVal   = Math.max.apply(null, data.map(function (d) { return d.queue; }));
    var barsHtml = data.map(function (d, i) {
      var width    = (d.queue / maxVal) * 320;
      var y        = 20 + i * 38;
      var barColor = d.queue > 30 ? 'var(--neon-orange)' : 'var(--neon-blue)';
      return '<text x="10" y="' + (y + 14) + '" fill="var(--text-main)" font-size="10" font-weight="500">' + global.Sanitizer.sanitizeHTML(d.type) + '</text>' +
        '<rect x="130" y="' + y + '" width="' + width + '" height="18" rx="3" fill="' + barColor + '" class="chart-bar" />' +
        '<text x="' + (130 + width + 8) + '" y="' + (y + 13) + '" fill="var(--neon-blue)" font-size="10" font-family="var(--font-mono)">' + d.queue + ' min</text>';
    }).join('');
    return '<svg viewBox="0 0 500 170" style="width:100%;height:100%;" aria-label="Transport wait times">' +
      '<line x1="130" y1="10" x2="130" y2="160" stroke="rgba(255,255,255,0.15)" />' +
      barsHtml + '</svg>';
  }

  function buildEnergyChart(usage) {
    var total      = usage.solarGenerationKw + usage.gridDrawKw;
    var solarRatio = Math.round((usage.solarGenerationKw / total) * 100);
    var gridRatio  = 100 - solarRatio;
    return '<div style="display:flex;flex-direction:column;gap:12px;width:100%;padding:10px 0;">' +
      '<div style="display:flex;justify-content:space-between;font-size:0.85rem;">' +
      '<span style="color:var(--neon-green)">● Rooftop Solar (' + solarRatio + '%)</span>' +
      '<span style="color:var(--neon-blue)">● Power Grid (' + gridRatio + '%)</span></div>' +
      '<div style="height:24px;border-radius:12px;overflow:hidden;display:flex;border:1px solid rgba(255,255,255,0.1);">' +
      '<div style="width:' + solarRatio + '%;background:linear-gradient(to right,#00b36b,var(--neon-green));" title="Solar"></div>' +
      '<div style="width:' + gridRatio + '%;background:linear-gradient(to right,#0088cc,var(--neon-blue));" title="Grid"></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px;font-family:var(--font-mono);font-size:0.9rem;">' +
      '<div class="kpi-card" style="text-align:left;"><span class="kpi-title" style="font-size:0.7rem;">Solar Supply</span><div style="color:var(--neon-green);font-weight:bold;">' + usage.solarGenerationKw + ' kW</div></div>' +
      '<div class="kpi-card" style="text-align:left;"><span class="kpi-title" style="font-size:0.7rem;">Grid Draw</span><div style="color:var(--neon-blue);font-weight:bold;">' + usage.gridDrawKw + ' kW</div></div>' +
      '</div></div>';
  }

  // ── AnalyticsAgent ───────────────────────────────────────────────────────

  function AnalyticsAgent() {
    this._historyData    = null;
    this._unsubscribers  = [];
    this._drawCharts     = null; // debounced version set in init
  }

  AnalyticsAgent.prototype.init = function () {
    this._historyData = global.analyticsHistoryData;
    this._drawCharts  = debounce(this._renderCharts.bind(this), C.ANALYTICS.CHART_DEBOUNCE_MS);

    var self = this;
    this._unsubscribers = [
      global.eventBus.on('tick',                function () { self._drawCharts(); self._renderSummary(); }),
      global.eventBus.on('emergency_triggered', function () { self._renderSummary(); }),
      global.eventBus.on('emergency_cleared',   function () { self._renderSummary(); }),
    ];

    this._renderCharts();
    this._renderSummary();
  };

  AnalyticsAgent.prototype.destroy = function () {
    this._unsubscribers.forEach(function (u) { u(); });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  AnalyticsAgent.prototype._renderCharts = function () {
    var crowdEl  = DOM.byId('chart-crowd-density');
    var transEl  = DOM.byId('chart-transport-times');
    var energyEl = DOM.byId('chart-energy-draw');

    if (crowdEl)  crowdEl.innerHTML  = buildCrowdDensityChart(this._historyData.crowdTrend);
    if (transEl)  transEl.innerHTML  = buildTransportChart(this._historyData.transportTimes);
    if (energyEl) energyEl.innerHTML = buildEnergyChart(this._historyData.energyUsage);
  };

  AnalyticsAgent.prototype._renderSummary = function () {
    var summaryEl = DOM.byId('analytics-ai-report');
    if (!summaryEl) return;

    var emergency   = global.simState.getActiveEmergency();
    var kpis        = global.simState.getKPIs();
    var energyData  = this._historyData.energyUsage;
    var energyRate  = Math.round((energyData.solarGenerationKw / (energyData.solarGenerationKw + energyData.gridDrawKw)) * 100);
    var date        = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    var summary = buildExecutiveSummary(emergency, kpis.crowdDensity, energyRate, date);

    DOM.clearChildren(summaryEl);
    var heading = DOM.createElement('p', { style: { color: summary.color, fontWeight: '600', marginBottom: '8px' } }, summary.heading);
    var body    = DOM.createElement('p', {}, summary.body);
    DOM.appendChildren(summaryEl, [heading, body]);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.AnalyticsAgent = AnalyticsAgent;
  global.AnalyticsAgent.buildExecutiveSummary = buildExecutiveSummary;

}(window));

/**
 * FIFA AI Command Center — CrowdView
 * Responsible ONLY for rendering crowd-related DOM elements.
 * Receives plain data objects from CrowdAgent — no business logic.
 * @module CrowdView
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;
  var S   = global.Sanitizer;
  var C   = global.FIFA_CONSTANTS;

  // ── Colour helpers ───────────────────────────────────────────────────────

  /** Map a gate status string to a CSS neon variable */
  function statusToColor(status) {
    var map = {
      critical:  'var(--neon-red)',
      congested: 'var(--neon-orange)',
      moderate:  'var(--neon-yellow)',
      nominal:   'var(--neon-green)',
    };
    return map[status] || 'var(--neon-green)';
  }

  /** Map a gate status string to a CSS class suffix */
  function statusToClass(status) {
    var map = { critical: 'red', congested: 'orange', moderate: 'yellow', nominal: 'green' };
    return map[status] || 'green';
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Update SVG gate colour + glow on the stadium map.
   * @param {Array<{id: string, status: string}>} gates
   */
  function renderMapGates(gates) {
    gates.forEach(function (gate) {
      var el = DOM.byId('svg-gate-' + gate.id);
      if (!el) return;
      var color = statusToColor(gate.status);
      el.setAttribute('fill', color);
      el.setAttribute('style', 'filter: drop-shadow(0 0 6px ' + color + ')');
    });
  }

  /**
   * Update the badge chips beside gate rows in the Crowd Intel tab.
   * @param {Array<{id: string, density: number, status: string}>} gates
   */
  function renderGateBadges(gates) {
    gates.forEach(function (gate) {
      var badge = DOM.byId('gate-badge-' + gate.id);
      if (!badge) return;
      var waitMins = Math.round(gate.density * C.CROWD.QUEUE_MINUTES_PER_DENSITY);
      badge.textContent = waitMins + 'm wait';
      badge.className = 'priority-tag ' + gate.status;
    });
  }

  /**
   * Render the detail panel when a gate is selected.
   * @param {{name: string, density: number, status: string}} gate
   */
  function renderGateDetail(gate) {
    var panel = DOM.byId('crowd-detail-panel');
    if (!panel) return;

    DOM.clearChildren(panel);

    var title = DOM.createElement('div', { className: 'kpi-title' }, 'Selected Gate');
    var heading = DOM.createElement('h4', { style: { marginBottom: '8px', color: 'var(--neon-blue)' } }, gate.name);

    var density  = Math.round(gate.density * 100);
    var queue    = Math.round(gate.density * C.CROWD.QUEUE_MINUTES_PER_DENSITY);
    var flow     = Math.round(gate.density * C.CROWD.FLOW_PER_MIN_PER_DENSITY);

    var grid = DOM.createElement('div', { className: 'stats-grid', style: { marginTop: '12px' } });

    function metric(label, value, cls) {
      var card = DOM.createElement('div', { className: 'kpi-card' });
      card.appendChild(DOM.createElement('div', { className: 'kpi-title' }, label));
      card.appendChild(DOM.createElement('div', { className: 'kpi-value ' + (cls || '') }, value));
      return card;
    }

    grid.appendChild(metric('Density',    S.formatPercentage(density), gate.status));
    grid.appendChild(metric('Queue Est.', queue + ' mins'));
    grid.appendChild(metric('Active Flow',flow + ' / min'));

    var actionBox = DOM.createElement('div', { className: 'action-box' });
    var modeText  = DOM.createElement('div', {}, 'Gate control mode: ');
    var strong    = DOM.createElement('strong', {}, 'AUTOMATED FEEDBACK');
    modeText.appendChild(strong);

    var rerouteBtn = DOM.createElement('button', {
      type: 'button',
      'data-gate': gate.id,
      'data-action': 'reroute',
    }, 'Trigger Reroute Instruction');

    actionBox.appendChild(modeText);
    actionBox.appendChild(rerouteBtn);

    DOM.appendChildren(panel, [title, heading, grid, actionBox]);
  }

  /**
   * Render the detail panel when a section is selected.
   * @param {{name: string, occupancy: number}} section
   */
  function renderSectionDetail(section) {
    var panel = DOM.byId('crowd-detail-panel');
    if (!panel) return;

    DOM.clearChildren(panel);

    var title   = DOM.createElement('div', { className: 'kpi-title' }, 'Selected Seating Area');
    var heading = DOM.createElement('h4', { style: { marginBottom: '8px', color: 'var(--neon-blue)' } }, section.name);
    var grid    = DOM.createElement('div', { className: 'stats-grid', style: { marginTop: '12px' } });

    function metric(label, value, cls) {
      var card = DOM.createElement('div', { className: 'kpi-card' });
      card.appendChild(DOM.createElement('div', { className: 'kpi-title' }, label));
      card.appendChild(DOM.createElement('div', { className: 'kpi-value ' + (cls || '') }, value));
      return card;
    }

    grid.appendChild(metric('Occupancy',   S.formatPercentage(section.occupancy * 100)));
    grid.appendChild(metric('Est. Seats',  String(Math.round(section.occupancy * C.CROWD.MAX_SECTION_SEATS))));
    grid.appendChild(metric('Stair Flow',  'Optimal', 'ok'));

    DOM.appendChildren(panel, [title, heading, grid]);
  }

  /**
   * Render empty detail panel (no selection).
   */
  function renderNoSelection() {
    var panel = DOM.byId('crowd-detail-panel');
    if (!panel) return;
    DOM.clearChildren(panel);
    var msg = DOM.createElement('div', {
      className: 'kpi-title',
      style: { textAlign: 'center', padding: '20px 0' },
    }, 'Select a gate or section on the map to analyze.');
    panel.appendChild(msg);
  }

  /**
   * Render the AI reasoning report.
   * @param {{color: string, heading: string, body: string}} report
   */
  function renderReasoningReport(report) {
    var el = DOM.byId('crowd-ai-report');
    if (!el) return;

    DOM.clearChildren(el);

    var heading = DOM.createElement('p', {
      style: { color: report.color, fontWeight: '600', marginBottom: '8px' },
    }, report.heading);

    var body = DOM.createElement('p', {}, report.body);

    DOM.appendChildren(el, [heading, body]);
  }

  // ── Expose ───────────────────────────────────────────────────────────────
  global.CrowdView = {
    renderMapGates:       renderMapGates,
    renderGateBadges:     renderGateBadges,
    renderGateDetail:     renderGateDetail,
    renderSectionDetail:  renderSectionDetail,
    renderNoSelection:    renderNoSelection,
    renderReasoningReport:renderReasoningReport,
  };

}(window));

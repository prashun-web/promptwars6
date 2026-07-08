/**
 * FIFA AI Command Center — CrowdAgent (Refactored)
 * Single responsibility: crowd flow data management and AI reasoning.
 * ALL rendering delegated to CrowdView.
 * @module CrowdAgent
 */
(function (global) {
  'use strict';

  var C = global.FIFA_CONSTANTS;

  // ── Status classifier (pure function) ────────────────────────────────────

  /**
   * @param {number} density  0.0–1.0
   * @returns {string}  'critical' | 'congested' | 'moderate' | 'nominal'
   */
  function classifyDensity(density) {
    if (density > C.DENSITY.CRITICAL)  return 'critical';
    if (density > C.DENSITY.CONGESTED) return 'congested';
    if (density > C.DENSITY.MODERATE)  return 'moderate';
    return 'nominal';
  }

  // ── Reasoning engine (pure function) ────────────────────────────────────

  /**
   * Produce an AI reasoning report as a plain data object.
   * @param {Array}   gates
   * @param {{type: string}|null} emergency
   * @param {{id: string}|null}   selectedGate
   * @returns {{color: string, heading: string, body: string}}
   */
  function buildReasoningReport(gates, emergency, selectedGate) {
    if (emergency) {
      if (emergency.type === 'panic') {
        return {
          color:   'var(--neon-red)',
          heading: 'CRITICAL BOTTLENECK ALERT — GATE F',
          body:    'Gate F density has spiked to 92%+ due to crowd panic. Spectator exits are blocked at NW corridors. Crowd Agent Recommendation: Immediately dispatch Crowd Marshalls to redirect Section 104 routes toward Gate A. Field-play entry barriers must be locked.',
        };
      }
      if (emergency.type === 'fire') {
        return {
          color:   'var(--neon-red)',
          heading: 'EVACUATION FLOW ROUTING — SECTION 202',
          body:    'Concession area fire at Section 202 requires evacuation. Spectators are venting towards Gate C. Gate C queue flow is increasing. Crowd Agent Recommendation: Keep Gate C wide open. Open all auxiliary exit turnstiles. Display evacuation instructions on digital screens.',
        };
      }
      return {
        color:   'var(--neon-orange)',
        heading: 'EMERGENCY OPS OVERLAY IN EFFECT',
        body:    'An emergency event (' + emergency.type + ') is drawing operator focus. Spectator egress routes remain under observation. No severe crowd bottlenecks currently detected.',
      };
    }

    var highlyCongestedGates = gates.filter(function (g) { return g.density > C.DENSITY.CONGESTED; });
    if (highlyCongestedGates.length > 0) {
      var gateList = highlyCongestedGates.map(function (g) { return g.id; }).join(' & ');
      return {
        color:   'var(--neon-orange)',
        heading: 'CONGESTION WARNING: GATE ' + gateList,
        body:    'Gate ' + gateList + ' ' + (highlyCongestedGates.length > 1 ? 'are' : 'is') + ' experiencing high ingress loads. Bottlenecks are forming due to incoming shuttle buses and high metro frequencies. Queue wait times have exceeded 15 minutes. Crowd Agent Action Plan: Triggering electronic banners in Section 201 directing arrivals to Gate A. Open auxiliary gate checkpoints 3 and 4.',
      };
    }

    return {
      color:   'var(--neon-green)',
      heading: 'STADIUM INGRESS/EGRESS: NOMINAL',
      body:    'All entrances are operating at safe flow rates. Average gate queue time is 4.5 minutes. Ingress rate is matched to turnstile throughput. AI predictive analysis indicates no capacity exceedances in the next 30 minutes.',
    };
  }

  // ── CrowdAgent ───────────────────────────────────────────────────────────

  function CrowdAgent() {
    /** @type {Array<{id:string, name:string, density:number, status:string}>} */
    this.gates = [];
    /** @type {Array<{id:string, name:string, occupancy:number}>} */
    this.sections = [];
    this._selectedGate    = null;
    this._selectedSection = null;
    this._unsubscribers   = [];
  }

  CrowdAgent.prototype.init = function () {
    // Deep-copy data so we can mutate density values
    this.gates    = global.stadiumData.gates.map(function (g) { return Object.assign({}, g); });
    this.sections = global.stadiumData.sections.map(function (s) { return Object.assign({}, s); });

    var self = this;
    this._unsubscribers = [
      global.eventBus.on('gate_clicked',        function (id)  { self._onGateClicked(id); }),
      global.eventBus.on('section_clicked',     function (id)  { self._onSectionClicked(id); }),
      global.eventBus.on('tick',                function ()    { self._onTick(); }),
      global.eventBus.on('emergency_triggered', function (inc) { self._onEmergencyTriggered(inc); }),
      global.eventBus.on('emergency_cleared',   function ()    { self._onEmergencyCleared(); }),
    ];

    this._render();
  };

  CrowdAgent.prototype.destroy = function () {
    this._unsubscribers.forEach(function (unsub) { unsub(); });
    this._unsubscribers = [];
  };

  // ── Private event handlers ───────────────────────────────────────────────

  CrowdAgent.prototype._onGateClicked = function (gateId) {
    this._selectedGate    = this.gates.find(function (g) { return g.id === gateId; }) || null;
    this._selectedSection = null;
    global.logOperation('Crowd Agent', 'Telemetry requested for Gate ' + gateId);
    this._render();
    global.eventBus.emit('agent_focus_change', { agent: 'crowd', context: 'Gate ' + gateId });
  };

  CrowdAgent.prototype._onSectionClicked = function (sectionId) {
    this._selectedSection = this.sections.find(function (s) { return s.id === sectionId; }) || null;
    this._selectedGate    = null;
    global.logOperation('Crowd Agent', 'Telemetry requested for Section ' + sectionId);
    this._render();
    global.eventBus.emit('agent_focus_change', { agent: 'crowd', context: 'Section ' + sectionId });
  };

  CrowdAgent.prototype._onTick = function () {
    this._simulateFlows();
    this._render();
  };

  CrowdAgent.prototype._onEmergencyTriggered = function (incident) {
    if (incident.type === 'panic') {
      global.logOperation('Crowd Agent', 'Alert: Evacuation bottlenecks detected near Gate F exits.');
    }
    this._render();
  };

  CrowdAgent.prototype._onEmergencyCleared = function () {
    this._render();
  };

  // ── Simulation ───────────────────────────────────────────────────────────

  CrowdAgent.prototype._simulateFlows = function () {
    var emergency = global.simState.getActiveEmergency();

    this.gates.forEach(function (gate) {
      var noise = (Math.random() - 0.5) * C.DENSITY.NOISE_GATE;

      if (emergency) {
        if (emergency.type === 'panic' && gate.id === 'F') {
          gate.density = Math.min(1.0, gate.density + 0.04);
        } else if (emergency.type === 'fire' && gate.id === 'C') {
          gate.density = Math.min(1.0, gate.density + 0.03);
        }
      }

      gate.density = Math.max(0.1, Math.min(0.99, gate.density + noise));
      gate.status  = classifyDensity(gate.density);
    });

    this.sections.forEach(function (sec) {
      var noise = (Math.random() - 0.5) * C.DENSITY.NOISE_SEC;
      sec.occupancy = Math.max(0.2, Math.min(1.0, sec.occupancy + noise));
    });

    // Update global KPI
    var densities  = this.gates.map(function (g) { return g.density; });
    var avgDensity = Math.round((densities.reduce(function (a, b) { return a + b; }, 0) / densities.length) * 100);
    global.simState.setCrowdDensity(avgDensity);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  CrowdAgent.prototype._render = function () {
    var V = global.CrowdView;
    if (!V) return;

    V.renderMapGates(this.gates);
    V.renderGateBadges(this.gates);

    if (this._selectedGate) {
      V.renderGateDetail(this._selectedGate);
    } else if (this._selectedSection) {
      V.renderSectionDetail(this._selectedSection);
    } else {
      V.renderNoSelection();
    }

    var emergency = global.simState.getActiveEmergency();
    var report = buildReasoningReport(this.gates, emergency, this._selectedGate);
    V.renderReasoningReport(report);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.CrowdAgent = CrowdAgent;

}(window));

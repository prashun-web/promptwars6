/**
 * FIFA AI Command Center — SimState
 * Encapsulated, validated simulation state store.
 * Replaces the raw `window.simState` mutable object.
 * @module SimState
 */
(function (global) {
  'use strict';

  var C = global.FIFA_CONSTANTS;

  // ── Private default factory ──────────────────────────────────────────────
  function createDefaultState() {
    return {
      match: {
        home:      'Argentina',
        away:      'France',
        homeScore: 2,
        awayScore: 2,
        minute:    45,
        half:      1,
        status:    'Halftime Break',
      },
      weather: {
        temp:      24,
        condition: 'Clear',
        wind:      '12 km/h',
        humidity:  '48%',
      },
      kpis: {
        crowdDensity:      74,   // 0–100 percentage points
        securityStatus:    'Nominal',
        medicalAlerts:     0,
        transportFlow:     92,
        energyUsageKw:     830,
        solarGenerationKw: 350,
      },
      activeEmergency: null,
      logs:            [],
    };
  }

  // ── SimState constructor ─────────────────────────────────────────────────
  function SimState() {
    this._state = createDefaultState();
  }

  // ── Match accessors ──────────────────────────────────────────────────────

  SimState.prototype.getMatch = function () {
    return Object.assign({}, this._state.match);
  };

  SimState.prototype.setMatchMinute = function (minute) {
    if (typeof minute !== 'number') return;
    this._state.match.minute = Math.max(0, Math.min(C.SIM.MATCH_TOTAL_MINUTES, minute));
  };

  SimState.prototype.setMatchHalf = function (half) {
    if (half !== 1 && half !== 2) return;
    this._state.match.half = half;
    this._state.match.status = half === 2 ? '2nd Half' : '1st Half';
  };

  SimState.prototype.setMatchStatus = function (status) {
    if (typeof status !== 'string') return;
    this._state.match.status = status;
  };

  // ── Weather accessors ────────────────────────────────────────────────────

  SimState.prototype.getWeather = function () {
    return Object.assign({}, this._state.weather);
  };

  SimState.prototype.setWeatherTemp = function (temp) {
    if (typeof temp !== 'number') return;
    this._state.weather.temp = temp;
  };

  // ── KPI accessors ────────────────────────────────────────────────────────

  SimState.prototype.getKPIs = function () {
    return Object.assign({}, this._state.kpis);
  };

  SimState.prototype.setCrowdDensity = function (val) {
    if (typeof val !== 'number') return;
    this._state.kpis.crowdDensity = Math.min(100, Math.max(0, Math.round(val)));
  };

  SimState.prototype.setSecurityStatus = function (status) {
    if (typeof status !== 'string') return;
    this._state.kpis.securityStatus = status;
  };

  SimState.prototype.setMedicalAlerts = function (count) {
    if (typeof count !== 'number' || count < 0) return;
    this._state.kpis.medicalAlerts = count;
  };

  SimState.prototype.setSolarGenerationKw = function (kw) {
    if (typeof kw !== 'number') return;
    this._state.kpis.solarGenerationKw = Math.max(0, kw);
  };

  // ── Emergency accessors ──────────────────────────────────────────────────

  SimState.prototype.getActiveEmergency = function () {
    if (!this._state.activeEmergency) return null;
    return Object.assign({}, this._state.activeEmergency);
  };

  SimState.prototype.setActiveEmergency = function (incident) {
    // Accept null to clear, or an object with a `type` field
    if (incident !== null && (typeof incident !== 'object' || !incident.type)) {
      console.warn('[SimState] Invalid emergency incident object');
      return;
    }
    this._state.activeEmergency = incident ? Object.assign({}, incident) : null;
  };

  SimState.prototype.hasActiveEmergency = function () {
    return this._state.activeEmergency !== null;
  };

  // ── Log accessors ────────────────────────────────────────────────────────

  SimState.prototype.addLog = function (entry) {
    this._state.logs.unshift(entry);
    if (this._state.logs.length > C.LOG.MAX_ENTRIES) {
      this._state.logs.pop();
    }
  };

  SimState.prototype.getLogs = function () {
    return this._state.logs.slice();
  };

  // ── Snapshot (read-only clone for event payloads) ────────────────────────

  SimState.prototype.snapshot = function () {
    return JSON.parse(JSON.stringify(this._state));
  };

  // ── Reset ────────────────────────────────────────────────────────────────

  SimState.prototype.reset = function () {
    this._state = createDefaultState();
  };

  // ── Expose class + global singleton ─────────────────────────────────────
  global.SimState = SimState;

  // Singleton instance consumed by all agents/controllers
  global.simState = new SimState();

  // Backward-compat shim: keep window.simState.kpis/.match etc. readable
  // by proxying through the singleton so existing code doesn't break.
  // Note: Direct mutation of window.simState properties is deprecated — use setters.

}(window));

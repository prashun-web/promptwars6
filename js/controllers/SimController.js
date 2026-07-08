/**
 * FIFA AI Command Center — SimController
 * Single responsibility: simulation loop management (tick, speed, score, weather).
 * @module SimController
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;
  var C   = global.FIFA_CONSTANTS;

  function SimController() {
    this._interval  = null;
    this._speed     = 1;
  }

  /**
   * Start the simulation tick.
   */
  SimController.prototype.start = function () {
    var self = this;
    this._interval = setInterval(function () { self._tick(); }, C.SIM.TICK_INTERVAL_MS);
  };

  /**
   * Stop the simulation.
   */
  SimController.prototype.stop = function () {
    clearInterval(this._interval);
    this._interval = null;
  };

  /**
   * Set simulation speed multiplier.
   * @param {number} multiplier
   */
  SimController.prototype.setSpeed = function (multiplier) {
    this._speed = Math.max(1, Math.min(10, multiplier));
    global.logOperation('System', 'Simulation clock speed set to ' + this._speed + '\u00D7', 'info');
  };

  SimController.prototype.getSpeed = function () {
    return this._speed;
  };

  // ── Private tick ─────────────────────────────────────────────────────────

  SimController.prototype._tick = function () {
    var match = global.simState.getMatch();

    // Advance match minute
    var newMinute = match.minute + this._speed;
    if (newMinute > C.SIM.MATCH_TOTAL_MINUTES) {
      newMinute = 1;
      var newHalf = match.half === 1 ? 2 : 1;
      global.simState.setMatchHalf(newHalf);
      global.logOperation('Stadium Clock', 'Second half kick-off initiated.');
    }
    global.simState.setMatchMinute(newMinute);

    // Solar decay after minute 60
    if (newMinute > C.SIM.SOLAR_DECAY_MINUTE) {
      var kpis = global.simState.getKPIs();
      global.simState.setSolarGenerationKw(kpis.solarGenerationKw - C.SIM.SOLAR_DECAY_KW);
    }

    // Update match minute badge
    var minBadge = DOM.byId('match-minute-badge');
    if (minBadge) {
      minBadge.textContent = (newMinute === C.SIM.HALFTIME_MINUTE) ? 'HT' : newMinute + "'";
    }

    // Update match score display
    var freshMatch = global.simState.getMatch();
    DOM.setText('match-score-home', freshMatch.homeScore);
    DOM.setText('match-score-away', freshMatch.awayScore);

    // Weather fluctuation
    if (Math.random() > C.SIM.WEATHER_CHANGE_PROB) {
      var weather = global.simState.getWeather();
      var delta   = Math.random() > 0.5 ? 1 : -1;
      global.simState.setWeatherTemp(weather.temp + delta);
      var newWeather = global.simState.getWeather();
      DOM.setText('hud-weather',  '\u2600\uFE0F ' + newWeather.temp + '\u00B0C');
      DOM.setText('kpi-weather',  newWeather.temp + '\u00B0C');
    }

    // Crowd fluctuation
    if (Math.random() > 0.6) {
      var kpis2   = global.simState.getKPIs();
      var delta2  = (Math.random() - 0.5) * 1;
      var newDens = Math.min(99, Math.max(50, kpis2.crowdDensity + delta2));
      global.simState.setCrowdDensity(newDens);

      var fans = Math.floor(newDens * C.STADIUM.FANS_PER_DENSITY_PT);
      DOM.setText('fans-inside-count', fans.toLocaleString());
      DOM.setText('kpi-fans', fans.toLocaleString());

      var fill = DOM.byId('density-fill');
      var val  = DOM.byId('density-val');
      var pct  = Math.round(newDens);
      if (fill) fill.style.width = pct + '%';
      if (val)  val.textContent  = pct;
    }

    // Emit tick for agents
    global.eventBus.emit('tick', global.simState.snapshot());
    global.eventBus.emit('kpis_updated', null);
  };

  // ── Speed buttons ─────────────────────────────────────────────────────────

  /**
   * Bind the speed control buttons in the Settings panel.
   */
  SimController.prototype.bindSpeedButtons = function () {
    var self = this;
    DOM.qsa('.speed-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        DOM.qsa('.speed-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var speed = parseInt(btn.getAttribute('data-speed'), 10) || 1;
        self.setSpeed(speed);
      });
    });
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.SimController = SimController;

}(window));

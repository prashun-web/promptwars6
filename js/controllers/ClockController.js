/**
 * FIFA AI Command Center — ClockController
 * Single responsibility: wall clock and match countdown timers.
 * @module ClockController
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;

  function ClockController() {
    this._clockInterval     = null;
    this._countdownInterval = null;
    this._matchStartMs      = null;
  }

  /**
   * Start the HUD wall clock.
   * @param {string} elementId
   */
  ClockController.prototype.startWallClock = function (elementId) {
    var update = function () {
      DOM.setText(elementId, new Date().toLocaleTimeString('en-GB'));
    };
    update();
    this._clockInterval = setInterval(update, 1000);
  };

  /**
   * Start a match countdown from now + offsetMs.
   * @param {number} offsetMs    — milliseconds from now until match start
   * @param {string} elementId
   */
  ClockController.prototype.startMatchCountdown = function (offsetMs, elementId) {
    this._matchStartMs = Date.now() + offsetMs;

    var self   = this;
    var update = function () {
      var remaining = self._matchStartMs - Date.now();
      if (remaining <= 0) {
        DOM.setText(elementId, 'LIVE');
        return;
      }
      var h = Math.floor(remaining / 3600000);
      var m = Math.floor((remaining % 3600000) / 60000);
      var s = Math.floor((remaining % 60000) / 1000);
      DOM.setText(elementId,
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0'));
    };

    update();
    this._countdownInterval = setInterval(update, 1000);
  };

  /**
   * Stop all timers.
   */
  ClockController.prototype.stop = function () {
    clearInterval(this._clockInterval);
    clearInterval(this._countdownInterval);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.ClockController = ClockController;

}(window));

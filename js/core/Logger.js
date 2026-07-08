/**
 * FIFA AI Command Center — Logger
 * Single-responsibility operations log manager.
 * Replaces the inline `window.logOperation` function with a proper class.
 * @module Logger
 */
(function (global) {
  'use strict';

  var C   = global.FIFA_CONSTANTS;
  var DOM = global.DOMHelper;

  /** @type {Object.<string, number>} severity sort weights */
  var SEVERITY_WEIGHTS = {
    critical: 0,
    warning:  1,
    success:  2,
    info:     3,
  };

  /**
   * @typedef {Object} LogEntry
   * @property {string} timestamp
   * @property {string} source
   * @property {string} text
   * @property {string} severity
   */

  /**
   * Logger constructor — encapsulates the operations log.
   * @param {Object} eventBus — EventBus instance to emit log_added events
   */
  function Logger(eventBus) {
    if (!eventBus || typeof eventBus.emit !== 'function') {
      throw new Error('[Logger] A valid EventBus instance is required.');
    }
    this._bus = eventBus;
    this._entries = [];
  }

  /**
   * Add a log entry.
   * @param {string} source   — module name e.g. "Crowd Agent"
   * @param {string} text     — human-readable message
   * @param {string} [severity='info']  — 'info' | 'success' | 'warning' | 'critical'
   * @returns {LogEntry}
   */
  Logger.prototype.log = function (source, text, severity) {
    if (!global.Sanitizer.isValidString(source, 100)) {
      source = 'System';
    }
    if (!global.Sanitizer.isValidString(text, 500)) {
      text = '(empty log)';
    }
    severity = (severity && SEVERITY_WEIGHTS[severity] !== undefined) ? severity : 'info';

    var entry = {
      timestamp: new Date().toLocaleTimeString(),
      source:    source,
      text:      text,
      severity:  severity,
    };

    this._entries.unshift(entry);

    // Enforce max log size
    if (this._entries.length > C.LOG.MAX_ENTRIES) {
      this._entries.pop();
    }

    // Persist to simState for backward-compat
    if (global.simState && typeof global.simState.addLog === 'function') {
      global.simState.addLog(entry);
    }

    this._bus.emit('log_added', entry);
    this._bus.emit('kpis_updated', null);

    return entry;
  };

  /**
   * Retrieve all log entries (newest first).
   * @returns {LogEntry[]}
   */
  Logger.prototype.getEntries = function () {
    return this._entries.slice();
  };

  /**
   * Clear all log entries.
   */
  Logger.prototype.clear = function () {
    this._entries = [];
  };

  // ── Expose class + global singleton ─────────────────────────────────────
  global.Logger = Logger;

  // The singleton is initialized in app.js once the EventBus is ready.
  // Provide a safe fallback so modules loading before app.js can still call it:
  global.logOperation = function (source, text, severity) {
    // If the real logger is up, delegate to it
    if (global.appLogger && typeof global.appLogger.log === 'function') {
      return global.appLogger.log(source, text, severity);
    }
    // Otherwise buffer via console until logger is ready
    console.info('[' + (source || 'System') + '] ' + (text || ''));
  };

}(window));

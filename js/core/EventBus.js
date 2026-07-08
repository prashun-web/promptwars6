/**
 * FIFA AI Command Center — EventBus
 * Typed, memory-safe publish-subscribe event bus.
 * Supports: on(), off(), once(), emit() with isolated error handling.
 * @module EventBus
 */
(function (global) {
  'use strict';

  /**
   * Creates and returns a new EventBus instance.
   * Exposed as `window.EventBus` constructor for testability.
   */
  function EventBus() {
    /** @type {Object.<string, Array<{fn: Function, once: boolean}>>} */
    this._listeners = {};
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} fn
   * @returns {Function} unsubscribe function
   */
  EventBus.prototype.on = function (event, fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('[EventBus] Listener must be a function for event: ' + event);
    }
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    var entry = { fn: fn, once: false };
    this._listeners[event].push(entry);

    // Return an unsubscribe handle
    var self = this;
    return function unsubscribe() {
      self.off(event, fn);
    };
  };

  /**
   * Subscribe once — auto-removed after first emit.
   * @param {string} event
   * @param {Function} fn
   * @returns {Function} unsubscribe function
   */
  EventBus.prototype.once = function (event, fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('[EventBus] Listener must be a function for event: ' + event);
    }
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    var entry = { fn: fn, once: true };
    this._listeners[event].push(entry);

    var self = this;
    return function unsubscribe() {
      self.off(event, fn);
    };
  };

  /**
   * Unsubscribe a specific listener.
   * @param {string} event
   * @param {Function} fn
   */
  EventBus.prototype.off = function (event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(function (entry) {
      return entry.fn !== fn;
    });
  };

  /**
   * Emit an event with optional data payload.
   * All listeners run in isolation; one failing won't block others.
   * @param {string} event
   * @param {*} [data]
   */
  EventBus.prototype.emit = function (event, data) {
    if (!this._listeners[event]) return;

    // Snapshot listeners to allow safe mutation during iteration
    var snapshot = this._listeners[event].slice();
    var survivors = [];

    for (var i = 0; i < snapshot.length; i++) {
      var entry = snapshot[i];
      try {
        entry.fn(data);
      } catch (err) {
        console.error('[EventBus] Error in listener for "' + event + '":', err);
      }
      if (!entry.once) {
        survivors.push(entry);
      }
    }

    // Keep non-once listeners plus any added during emit
    var current = this._listeners[event] || [];
    var added = current.filter(function (e) { return snapshot.indexOf(e) === -1; });
    this._listeners[event] = survivors.concat(added);
  };

  /**
   * Remove all listeners for an event (or all events if no arg).
   * @param {string} [event]
   */
  EventBus.prototype.clear = function (event) {
    if (event) {
      delete this._listeners[event];
    } else {
      this._listeners = {};
    }
  };

  /**
   * Return count of listeners for an event (useful for tests).
   * @param {string} event
   * @returns {number}
   */
  EventBus.prototype.listenerCount = function (event) {
    return this._listeners[event] ? this._listeners[event].length : 0;
  };

  // ── Expose class for tests + instantiate the global singleton ────────────
  global.EventBus = EventBus;

  // Global singleton used by the application
  global.eventBus = new EventBus();

}(window));

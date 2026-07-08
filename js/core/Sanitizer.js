/**
 * FIFA AI Command Center — Sanitizer
 * Security-focused input sanitization and validation utilities.
 * All user-facing input MUST pass through this module before DOM insertion.
 * @module Sanitizer
 */
(function (global) {
  'use strict';

  /** HTML entity escape map */
  var ESCAPE_MAP = {
    '&':  '&amp;',
    '<':  '&lt;',
    '>':  '&gt;',
    '"':  '&quot;',
    "'":  '&#x27;',
    '/':  '&#x2F;',
    '`':  '&#x60;',
    '=':  '&#x3D;',
  };

  var ESCAPE_REGEX = /[&<>"'`=/]/g;

  /**
   * Escape all HTML-sensitive characters to prevent XSS.
   * @param {*} str — raw input (will be coerced to string)
   * @returns {string} HTML-safe string
   */
  function sanitizeHTML(str) {
    if (str === null || str === undefined) return '';
    var s = String(str);
    return s.replace(ESCAPE_REGEX, function (ch) {
      return ESCAPE_MAP[ch];
    });
  }

  /**
   * Strip ALL HTML tags and return plain text only.
   * Useful for TTS, logging, aria-labels.
   * @param {string} str
   * @returns {string}
   */
  function stripTags(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * Clamp a numeric value within [min, max].
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clampNumber(val, min, max) {
    var n = Number(val);
    if (!isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  /**
   * Format a number as a percentage string, clamped to [0, 100].
   * @param {number} val
   * @returns {string}  e.g. "78%"
   */
  function formatPercentage(val) {
    return clampNumber(val, 0, 100).toFixed(0) + '%';
  }

  /**
   * Validate that a string is a known gate ID.
   * @param {string} id
   * @returns {boolean}
   */
  function isValidGateId(id) {
    return typeof id === 'string' && ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(id) !== -1;
  }

  /**
   * Validate that a value is a non-empty string with bounded length.
   * @param {*} val
   * @param {number} [maxLen=500]
   * @returns {boolean}
   */
  function isValidString(val, maxLen) {
    maxLen = maxLen || 500;
    return typeof val === 'string' && val.trim().length > 0 && val.length <= maxLen;
  }

  // ── Expose on global ─────────────────────────────────────────────────────
  global.Sanitizer = {
    sanitizeHTML:     sanitizeHTML,
    stripTags:        stripTags,
    clampNumber:      clampNumber,
    formatPercentage: formatPercentage,
    isValidGateId:    isValidGateId,
    isValidString:    isValidString,
  };

  // Backward-compat alias used in legacy code
  global.sanitizeHTML    = sanitizeHTML;
  global.formatPercentage = formatPercentage;

}(window));

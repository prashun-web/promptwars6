/**
 * FIFA AI Command Center — TroubleshooterMatcher
 * Pure function: matches equipment issue keywords to solution text.
 * Fully unit-testable; no DOM, no side effects.
 * @module TroubleshooterMatcher
 */
(function (global) {
  'use strict';

  /**
   * @typedef {Object} MatchResult
   * @property {string} category  — 'scanner' | 'radio' | 'aed' | 'generic'
   * @property {string} solution  — human-readable guidance
   */

  /**
   * Match a volunteer's free-text issue description to a solution.
   * @param {string} query           — sanitized lowercase query text
   * @param {Object} troubleshooter  — from volunteersData.troubleshooter
   * @returns {MatchResult}
   */
  function matchIssue(query, troubleshooter) {
    if (typeof query !== 'string' || !troubleshooter) {
      return { category: 'generic', solution: _genericGuide() };
    }

    var q = query.toLowerCase();

    // ── Scanner category ─────────────────────────────────────────────────
    var isScannerQuery = q.includes('scanner') || q.includes('laser') ||
                         q.includes('offline') || q.includes('ticket');
    if (isScannerQuery) {
      if (q.includes('reboot') || q.includes('turn on') || q.includes('boot')) {
        return { category: 'scanner', solution: 'Reboot Guide: ' + troubleshooter.scanners.reboot };
      }
      if (q.includes('offline') || q.includes('network') || q.includes('wifi')) {
        return { category: 'scanner', solution: 'Network Guide: ' + troubleshooter.scanners.offline };
      }
      return { category: 'scanner', solution: 'Laser/Window Guide: ' + troubleshooter.scanners.laser + '\n\nAlternative check: ' + troubleshooter.scanners.offline };
    }

    // ── Radio category ───────────────────────────────────────────────────
    var isRadioQuery = q.includes('radio') || q.includes('static') ||
                       q.includes('mic')   || q.includes('channel');
    if (isRadioQuery) {
      if (q.includes('static') || q.includes('channel') || q.includes('hear')) {
        return { category: 'radio', solution: 'Signal/Static Guide: ' + troubleshooter.radios.static };
      }
      return { category: 'radio', solution: 'Battery Swap Guide: ' + troubleshooter.radios.battery };
    }

    // ── AED / medical category ───────────────────────────────────────────
    var isAEDQuery = q.includes('aed') || q.includes('defibrillator') || q.includes('medical');
    if (isAEDQuery) {
      return {
        category: 'aed',
        solution: 'AED Guide: AED units are self-calibrating. Green flashing light indicates nominal operational capacity. If red light is present, contact the Main Medical Command trailer for an immediate swap.',
      };
    }

    // ── Generic fallback ─────────────────────────────────────────────────
    return { category: 'generic', solution: _genericGuide() };
  }

  function _genericGuide() {
    return 'Generic Equipment Guide: Consult the operational manual at the Volunteer Kiosk or locate your Team Lead. If it is a software fault, please reboot the device.';
  }

  // ── Expose ───────────────────────────────────────────────────────────────
  global.TroubleshooterMatcher = { matchIssue: matchIssue };

}(window));

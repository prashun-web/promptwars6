/**
 * FIFA AI Command Center — EmergencyAgent (Refactored)
 * Single responsibility: incident lifecycle management.
 * ALL rendering delegated to EmergencyView.
 * @module EmergencyAgent
 */
(function (global) {
  'use strict';

  function EmergencyAgent() {
    /** @type {Object} incident templates keyed by type */
    this._templates = {};
    /** @type {{type:string, priority:string, summary:string, actionPlan:string[], volunteerInstructions:string[], paScript:string, exit:string}|null} */
    this._activeIncident = null;
    this._unsubscribers  = [];
  }

  EmergencyAgent.prototype.init = function () {
    this._templates = global.incidentTemplatesData;

    this._setupButtonListeners();

    // Event delegation for PA push button (avoids inline onclick)
    var self = this;
    var module = document.getElementById('module-emergency');
    if (module) {
      module.addEventListener('click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        if (target.getAttribute('data-action') === 'push-pa-translation') {
          self._pushPAToTranslation();
        }
      });
    }

    this._render();
  };

  EmergencyAgent.prototype.destroy = function () {
    this._unsubscribers.forEach(function (u) { u(); });
  };

  // ── Setup ────────────────────────────────────────────────────────────────

  EmergencyAgent.prototype._setupButtonListeners = function () {
    var self = this;

    global.DOMHelper.qsa('.emergency-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.triggerEmergency(btn.getAttribute('data-incident'));
      });
    });

    var clearBtn = global.DOMHelper.byId('emergency-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        self.clearEmergency();
      });
    }
  };

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Trigger an emergency incident by type key.
   * @param {string} type  e.g. 'fire', 'medical', 'panic'
   */
  EmergencyAgent.prototype.triggerEmergency = function (type) {
    var template = this._templates[type];
    if (!template) {
      console.warn('[EmergencyAgent] Unknown incident type:', type);
      return;
    }

    this._activeIncident = {
      type:                  type,
      priority:              template.priority,
      summary:               template.summary,
      actionPlan:            template.actionPlan.slice(),
      volunteerInstructions: template.volunteerInstructions.slice(),
      paScript:              template.paScript,
      exit:                  template.exit,
    };

    // Update encapsulated state
    global.simState.setActiveEmergency(this._activeIncident);
    global.simState.setSecurityStatus(template.priority);
    if (type === 'medical') {
      global.simState.setMedicalAlerts(1);
    }

    // Highlight active button
    global.DOMHelper.qsa('.emergency-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-incident') === type);
    });

    var overlay = global.DOMHelper.byId('alarm-overlay');
    if (overlay) overlay.classList.add('active');

    global.logOperation('Emergency Agent', '[CRITICAL ALERT] Simulated Incident Triggered: ' + type.toUpperCase(), 'critical');
    global.eventBus.emit('emergency_triggered', this._activeIncident);
    global.eventBus.emit('agent_focus_change', { agent: 'emergency', context: 'Incident: ' + type });

    this._render();
    return this._activeIncident;
  };

  /**
   * Resolve and clear the active incident.
   */
  EmergencyAgent.prototype.clearEmergency = function () {
    if (!this._activeIncident) return;

    global.simState.setActiveEmergency(null);
    global.simState.setSecurityStatus('Nominal');
    global.simState.setMedicalAlerts(0);

    global.DOMHelper.qsa('.emergency-btn').forEach(function (btn) {
      btn.classList.remove('active');
    });

    var overlay = global.DOMHelper.byId('alarm-overlay');
    if (overlay) overlay.classList.remove('active');

    global.logOperation('Emergency Agent', 'Alarms deactivated. Incident resolved. Switching back to NOMINAL.', 'success');

    this._activeIncident = null;
    global.eventBus.emit('emergency_cleared', null);
    this._render();
  };

  /**
   * Return the current active incident (or null).
   * @returns {{type:string}|null}
   */
  EmergencyAgent.prototype.getActiveIncident = function () {
    return this._activeIncident ? Object.assign({}, this._activeIncident) : null;
  };

  // ── Private ──────────────────────────────────────────────────────────────

  EmergencyAgent.prototype._pushPAToTranslation = function () {
    if (!this._activeIncident) return;
    var tab = document.querySelector('.nav-item[data-tab="translation"] button');
    if (tab) tab.click();
    global.logOperation('Emergency Agent', 'Emergency PA pushed to Translation Hub.', 'info');
  };

  EmergencyAgent.prototype._render = function () {
    var V = global.EmergencyView;
    if (!V) return;

    if (!this._activeIncident) {
      V.renderIdle();
      return;
    }

    V.renderIncidentStatus(this._activeIncident);
    V.renderActionPlan(this._activeIncident.actionPlan);
    V.renderPAScript(this._activeIncident.paScript);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.EmergencyAgent = EmergencyAgent;

}(window));

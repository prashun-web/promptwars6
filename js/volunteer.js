/**
 * FIFA AI Command Center — VolunteerAgent (Refactored)
 * Single responsibility: volunteer task/roster state management.
 * ALL rendering delegated to VolunteerView.
 * @module VolunteerAgent
 */
(function (global) {
  'use strict';

  function VolunteerAgent() {
    this._volunteers = [];
    this._tasks      = [];
    this._equipment  = [];
    this._troubleshooter = {};
    this._unsubscribers  = [];
  }

  VolunteerAgent.prototype.init = function () {
    // Deep-copy mutable state from frozen data store
    this._volunteers    = global.volunteersData.volunteers.map(function (v) { return Object.assign({}, v); });
    this._tasks         = global.volunteersData.tasks.map(function (t) { return Object.assign({}, t); });
    this._equipment     = global.volunteersData.equipment.map(function (e) { return Object.assign({}, e); });
    this._troubleshooter = global.volunteersData.troubleshooter;

    var self = this;
    this._unsubscribers = [
      global.eventBus.on('emergency_triggered', function (inc) { self._onEmergencyTriggered(inc); }),
      global.eventBus.on('emergency_cleared',   function ()    { self._onEmergencyCleared();       }),
    ];

    this._setupTroubleshooterForm();
    this._setupTaskDelegation();
    this._render();
  };

  VolunteerAgent.prototype.destroy = function () {
    this._unsubscribers.forEach(function (u) { u(); });
  };

  // ── Setup ────────────────────────────────────────────────────────────────

  VolunteerAgent.prototype._setupTroubleshooterForm = function () {
    var self   = this;
    var form   = global.DOMHelper.byId('vol-trouble-form');
    var input  = global.DOMHelper.byId('vol-trouble-input');

    if (form && input) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var rawText = input.value.trim().toLowerCase();
        var query   = global.Sanitizer.sanitizeHTML(rawText);
        if (!query) return;

        global.logOperation('Volunteer Agent', 'Troubleshooting request: "' + query + '"');
        global.eventBus.emit('agent_focus_change', { agent: 'volunteer', context: 'Troubleshoot: ' + query });

        var result = global.TroubleshooterMatcher.matchIssue(query, self._troubleshooter);
        global.VolunteerView.renderTroubleshooterResult(result.solution);
        input.value = '';
      });
    }
  };

  /**
   * Event delegation for task toggle buttons — avoids inline onclick.
   */
  VolunteerAgent.prototype._setupTaskDelegation = function () {
    var self      = this;
    var taskList  = global.DOMHelper.byId('volunteer-task-list');
    if (!taskList) return;

    taskList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="toggle-task"]');
      if (!btn) return;
      var taskId = btn.getAttribute('data-task-id');
      if (taskId) self.toggleTask(taskId);
    });
  };

  // ── Event handlers ───────────────────────────────────────────────────────

  VolunteerAgent.prototype._onEmergencyTriggered = function (incident) {
    // Filter to only high-priority tasks
    this._tasks = this._tasks.filter(function (t) {
      return t.priority === 'High' || t.priority === 'Critical' || t.status === 'In Progress';
    });

    incident.volunteerInstructions.forEach(function (instruction, idx) {
      var parts      = instruction.split(' to ');
      var assignee   = parts[0] || 'Steward Squad';
      var actionText = parts[1] || instruction;

      this._tasks.unshift({
        id:         'EMG-' + (100 + idx),
        title:      actionText,
        assignedTo: assignee,
        priority:   'Critical',
        status:     'Pending',
        due:        'IMMEDIATE',
      });
    }, this);

    global.logOperation('Volunteer Agent', 'Re-prioritized volunteer task board. Injected emergency duties.');
    this._render();
  };

  VolunteerAgent.prototype._onEmergencyCleared = function () {
    // Restore to initial data
    this._tasks = global.volunteersData.tasks.map(function (t) { return Object.assign({}, t); });
    this._render();
  };

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Cycle a task's status: Pending → In Progress → Completed → Pending
   * @param {string} taskId
   */
  VolunteerAgent.prototype.toggleTask = function (taskId) {
    var task = this._tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;

    var transitions = { Pending: 'In Progress', 'In Progress': 'Completed', Completed: 'Pending', Unassigned: 'Pending' };
    task.status = transitions[task.status] || 'Pending';

    global.logOperation('Volunteer Agent', 'Task ' + taskId + ' status shifted to: ' + task.status.toUpperCase());
    this._render();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  VolunteerAgent.prototype._render = function () {
    var V = global.VolunteerView;
    if (!V) return;
    V.renderTaskList(this._tasks);
    V.renderRoster(this._volunteers);
    V.renderEquipment(this._equipment);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.VolunteerAgent = VolunteerAgent;

  // Backward-compat: app.js calls window.toggleTaskStatus
  global.toggleTaskStatus = function (taskId) {
    console.warn('[VolunteerAgent] window.toggleTaskStatus is deprecated. Use event delegation instead.');
  };

}(window));

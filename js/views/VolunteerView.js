/**
 * FIFA AI Command Center — VolunteerView
 * Responsible ONLY for rendering volunteer-related DOM elements.
 * @module VolunteerView
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;

  /** Map status string to color */
  function statusColor(status) {
    var map = {
      'Active':   'var(--neon-green)',
      'On Break': 'var(--neon-yellow)',
      'Offline':  'var(--text-muted)',
      'Transit':  'var(--neon-blue)',
    };
    return map[status] || 'var(--text-muted)';
  }

  /**
   * Render the task board.
   * Buttons use data-task-id + data-action — no inline onclick.
   * @param {Array<{id:string, title:string, assignedTo:string, priority:string, status:string, due:string}>} tasks
   */
  function renderTaskList(tasks) {
    var container = DOM.byId('volunteer-task-list');
    if (!container) return;

    DOM.clearChildren(container);

    if (tasks.length === 0) {
      container.appendChild(DOM.createElement('div', {
        style: { color: 'var(--text-muted)', fontSize: '0.85rem', padding: '15px', textAlign: 'center' },
      }, 'No active tasks assigned.'));
      return;
    }

    tasks.forEach(function (task) {
      var card    = DOM.createElement('div', { className: 'task-card' });
      var details = DOM.createElement('div', { className: 'task-details' });
      var title   = DOM.createElement('div', { className: 'task-title' }, task.title);
      var meta    = DOM.createElement('div', { className: 'task-assignee' }, 'Assignee: ');
      var strong  = DOM.createElement('strong', {}, task.assignedTo);
      meta.appendChild(strong);
      meta.appendChild(document.createTextNode(' \u2022 Due: ' + task.due));
      details.appendChild(title);
      details.appendChild(meta);

      var actions = DOM.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
      var badge   = DOM.createElement('span', { className: 'priority-tag ' + task.priority.toLowerCase() }, task.priority);
      var iconMap = { Completed: '\u2713', 'In Progress': '\u231B' };
      var icon    = iconMap[task.status] || '\u2699';
      var btn     = DOM.createElement('button', {
        type:              'button',
        className:         'lang-btn',
        style:             { padding: '4px 8px', fontSize: '0.7rem' },
        'data-action':     'toggle-task',
        'data-task-id':    task.id,
        'aria-label':      'Toggle status for ' + task.title,
      }, icon);

      actions.appendChild(badge);
      actions.appendChild(btn);
      card.appendChild(details);
      card.appendChild(actions);
      container.appendChild(card);
    });
  }

  /**
   * Render the staff roster list.
   * @param {Array<{name:string, role:string, location:string, status:string, battery:number, radioStatus:string}>} volunteers
   */
  function renderRoster(volunteers) {
    var container = DOM.byId('volunteer-roster');
    if (!container) return;

    DOM.clearChildren(container);

    volunteers.forEach(function (vol) {
      var row  = DOM.createElement('div', { className: 'volunteer-card' });
      var info = DOM.createElement('div');
      var name = DOM.createElement('strong', {}, vol.name);
      info.appendChild(name);
      info.appendChild(document.createTextNode(' (' + vol.role + ')'));
      var meta = DOM.createElement('div', { style: { color: 'var(--text-muted)', fontSize: '0.7rem' } },
        'Battery: ' + vol.battery + '% \u2022 Radio: ' + vol.radioStatus);
      info.appendChild(meta);

      var statusEl = DOM.createElement('span', {
        style: { color: statusColor(vol.status), fontSize: '0.75rem', fontWeight: '600' },
      }, '\u25CF ' + vol.status);

      row.appendChild(info);
      row.appendChild(statusEl);
      container.appendChild(row);
    });
  }

  /**
   * Render the equipment status list.
   * @param {Array<{name:string, total:number, active:number, faulty:number}>} equipment
   */
  function renderEquipment(equipment) {
    var container = DOM.byId('volunteer-equipment');
    if (!container) return;

    DOM.clearChildren(container);

    equipment.forEach(function (eq) {
      var div   = DOM.createElement('div', { style: { marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' } });
      var row   = DOM.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' } });
      var name  = DOM.createElement('span', {}, eq.name);
      var count = DOM.createElement('span', { style: { fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)' } },
        eq.active + '/' + eq.total + ' Online');
      row.appendChild(name);
      row.appendChild(count);
      div.appendChild(row);

      if (eq.faulty > 0) {
        var warn = DOM.createElement('div', {
          style: { color: 'var(--neon-orange)', fontSize: '0.7rem', marginTop: '4px' },
        }, '\u26A0\uFE0F Fault detected on ' + eq.faulty + ' unit(s). Check troubleshooter guidance.');
        div.appendChild(warn);
      }

      container.appendChild(div);
    });
  }

  /**
   * Render the troubleshooter result panel.
   * @param {string} solution  plain text solution
   */
  function renderTroubleshooterResult(solution) {
    var panel = DOM.byId('vol-trouble-result');
    if (!panel) return;

    DOM.clearChildren(panel);

    var box = DOM.createElement('div', {
      style: { background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.12)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', lineHeight: '1.4' },
    });
    box.appendChild(DOM.createElement('p', {}, solution));
    panel.appendChild(box);
  }

  // ── Expose ───────────────────────────────────────────────────────────────
  global.VolunteerView = {
    renderTaskList:            renderTaskList,
    renderRoster:              renderRoster,
    renderEquipment:           renderEquipment,
    renderTroubleshooterResult:renderTroubleshooterResult,
  };

}(window));

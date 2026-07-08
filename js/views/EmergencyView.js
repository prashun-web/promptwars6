/**
 * FIFA AI Command Center — EmergencyView
 * Responsible ONLY for rendering emergency-related DOM elements.
 * @module EmergencyView
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;

  /**
   * Render the "no active incident" idle state.
   */
  function renderIdle() {
    var statusPanel  = DOM.byId('emergency-incident-status');
    var actionPanel  = DOM.byId('emergency-action-plan');
    var paPanel      = DOM.byId('emergency-pa-script');

    if (statusPanel) {
      DOM.clearChildren(statusPanel);
      var center  = DOM.createElement('div', { style: { textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' } });
      var strong  = DOM.createElement('p');
      strong.appendChild(DOM.createElement('strong', {}, 'System Status: NOMINAL'));
      var hint    = DOM.createElement('p', { style: { fontSize: '0.8rem', marginTop: '6px' } },
        'Trigger an emergency simulation above to test real-time AI generation protocols.');
      center.appendChild(strong);
      center.appendChild(hint);
      statusPanel.appendChild(center);
    }

    if (actionPanel) {
      DOM.clearChildren(actionPanel);
      actionPanel.appendChild(DOM.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.85rem' } },
        'No active tactical operation plan.'));
    }

    if (paPanel) {
      DOM.clearChildren(paPanel);
      paPanel.appendChild(DOM.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.85rem' } },
        'Standby for public announcement scripts.'));
    }
  }

  /**
   * Render the status summary card for an active incident.
   * @param {{type: string, priority: string, summary: string, exit: string}} incident
   */
  function renderIncidentStatus(incident) {
    var statusPanel = DOM.byId('emergency-incident-status');
    if (!statusPanel) return;

    DOM.clearChildren(statusPanel);

    var priorityClass = incident.priority === 'CRITICAL' ? 'critical' : 'warning';

    var header = DOM.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } });
    var h4     = DOM.createElement('h4', { style: { color: 'var(--neon-red)', textTransform: 'uppercase' } },
      incident.type.replace('_', ' ') + ' Incident');
    var badge  = DOM.createElement('span', { className: 'priority-tag ' + priorityClass }, incident.priority);
    header.appendChild(h4);
    header.appendChild(badge);

    var summary = DOM.createElement('p', { style: { fontSize: '0.9rem', lineHeight: '1.4', color: '#fff', marginBottom: '8px' } },
      incident.summary);

    var exit = DOM.createElement('p', { style: { fontSize: '0.8rem', color: 'var(--text-muted)' } },
      'Primary Evac exit node: ');
    var exitStrong = DOM.createElement('strong', {}, incident.exit);
    exit.appendChild(exitStrong);

    DOM.appendChildren(statusPanel, [header, summary, exit]);
  }

  /**
   * Render the action plan checklist.
   * @param {string[]} steps
   */
  function renderActionPlan(steps) {
    var actionPanel = DOM.byId('emergency-action-plan');
    if (!actionPanel) return;

    DOM.clearChildren(actionPanel);

    var ul = DOM.createElement('ul', { style: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' } });

    steps.forEach(function (step, idx) {
      var li    = DOM.createElement('li', { style: { fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' } });
      var cb    = DOM.createElement('input', { type: 'checkbox', id: 'action-step-' + idx, style: { accentColor: 'var(--neon-blue)' } });
      cb.checked = true;
      var label = DOM.createElement('label', { 'for': 'action-step-' + idx, style: { cursor: 'pointer' } }, step);
      li.appendChild(cb);
      li.appendChild(label);
      ul.appendChild(li);
    });

    actionPanel.appendChild(ul);
  }

  /**
   * Render the PA script with a "Push to Translation" button.
   * The button uses data-action attribute; no inline onclick.
   * @param {string} paScript
   */
  function renderPAScript(paScript) {
    var paPanel = DOM.byId('emergency-pa-script');
    if (!paPanel) return;

    DOM.clearChildren(paPanel);

    var scriptBox = DOM.createElement('div', {
      style: { background: 'rgba(255,0,85,0.05)', border: '1px solid rgba(255,0,85,0.15)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '10px' },
    });
    var label = DOM.createElement('strong', {}, '[PA Draft]: ');
    var text  = DOM.createElement('span', {}, '"' + paScript + '"');
    scriptBox.appendChild(label);
    scriptBox.appendChild(text);

    var actionBox = DOM.createElement('div', { className: 'action-box' });
    var hint      = DOM.createElement('div', {}, 'Send draft to translation engine:');
    var pushBtn   = DOM.createElement('button', { type: 'button', 'data-action': 'push-pa-translation' }, 'Push to Translation Hub');
    actionBox.appendChild(hint);
    actionBox.appendChild(pushBtn);

    DOM.appendChildren(paPanel, [scriptBox, actionBox]);
  }

  // ── Expose ───────────────────────────────────────────────────────────────
  global.EmergencyView = {
    renderIdle:            renderIdle,
    renderIncidentStatus:  renderIncidentStatus,
    renderActionPlan:      renderActionPlan,
    renderPAScript:        renderPAScript,
  };

}(window));

/**
 * FIFA AI Command Center — NavigationView
 * Responsible ONLY for rendering navigation-related DOM elements.
 * @module NavigationView
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;
  var C   = global.FIFA_CONSTANTS;

  /**
   * Render the route summary panel.
   * @param {{routeClass:string, routeLabel:string, startName:string, endName:string, distanceMeters:number, durationMins:number, guidance:string}} info
   */
  function renderSummaryPanel(info) {
    var panel = DOM.byId('nav-summary-panel');
    if (!panel) return;

    DOM.clearChildren(panel);

    var tagSpan = DOM.createElement('span', { className: info.routeClass }, info.routeLabel);
    var tagWrap = DOM.createElement('div', { style: { marginBottom: '8px' } });
    tagWrap.appendChild(tagSpan);

    var fromP = DOM.createElement('p', { style: { fontSize: '0.9rem', marginBottom: '6px' } });
    fromP.appendChild(document.createTextNode('From: '));
    fromP.appendChild(DOM.createElement('strong', {}, info.startName));

    var toP = DOM.createElement('p', { style: { fontSize: '0.9rem', marginBottom: '12px' } });
    toP.appendChild(document.createTextNode('To: '));
    toP.appendChild(DOM.createElement('strong', {}, info.endName));

    var grid = DOM.createElement('div', { className: 'stats-grid' });
    var distCard = DOM.createElement('div', { className: 'kpi-card' });
    distCard.appendChild(DOM.createElement('div', { className: 'kpi-title' }, 'Est. Distance'));
    distCard.appendChild(DOM.createElement('div', { className: 'kpi-value ok' }, info.distanceMeters + ' m'));

    var timeCard = DOM.createElement('div', { className: 'kpi-card' });
    timeCard.appendChild(DOM.createElement('div', { className: 'kpi-title' }, 'Estd. Walk Time'));
    timeCard.appendChild(DOM.createElement('div', { className: 'kpi-value' },
      info.durationMins + ' min' + (info.durationMins > 1 ? 's' : '')));

    grid.appendChild(distCard);
    grid.appendChild(timeCard);

    var actionBox = DOM.createElement('div', { className: 'action-box', style: { marginTop: '12px', fontSize: '0.8rem' } });
    actionBox.appendChild(DOM.createElement('strong', {}, 'AI Nav Agent Guidance: '));
    actionBox.appendChild(document.createTextNode(info.guidance));

    DOM.appendChildren(panel, [tagWrap, fromP, toP, grid, actionBox]);
  }

  /**
   * Draw or update the route path on the SVG stadium map.
   * @param {string} pathString — SVG path "d" attribute value
   * @param {boolean} isAccessible
   * @param {boolean} isEmergency
   */
  function renderMapPath(pathString, isAccessible, isEmergency) {
    var svg = DOM.qs('.stadium-svg');
    if (!svg) return;

    var pathEl = DOM.byId('svg-nav-path');
    if (!pathEl) {
      pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('id', 'svg-nav-path');
      svg.appendChild(pathEl);
    }

    pathEl.setAttribute('d', pathString);

    var classes = ['navigation-path'];
    if (isAccessible) classes.push('accessible');
    if (isEmergency)  classes.push('emergency');
    pathEl.setAttribute('class', classes.join(' '));

    var color = isEmergency  ? 'var(--neon-red)'  :
                isAccessible ? 'var(--neon-green)' : 'var(--neon-blue)';
    pathEl.setAttribute('style', 'filter: drop-shadow(0 0 8px ' + color + ')');
  }

  // ── Expose ───────────────────────────────────────────────────────────────
  global.NavigationView = {
    renderSummaryPanel: renderSummaryPanel,
    renderMapPath:      renderMapPath,
  };

}(window));

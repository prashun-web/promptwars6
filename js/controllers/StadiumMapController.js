/**
 * FIFA AI Command Center — StadiumMapController
 * Single responsibility: interactive stadium SVG map (gates + sections).
 * Uses event delegation and emits semantic eventBus events.
 * @module StadiumMapController
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;
  var S   = global.Sanitizer;

  function StadiumMapController() {
    this._gates    = [];
    this._sections = [];
  }

  /**
   * Initialise the map with data.
   * @param {Array} gates
   * @param {Array} sections
   */
  StadiumMapController.prototype.init = function (gates, sections) {
    this._gates    = gates;
    this._sections = sections;

    this._bindGates();
    this._bindSections();
    this._buildTooltip();
    this._bindTooltipHide();
  };

  // ── Private ──────────────────────────────────────────────────────────────

  StadiumMapController.prototype._bindGates = function () {
    var self = this;
    this._gates.forEach(function (gate) {
      var el = DOM.byId('svg-gate-' + gate.id);
      if (!el) return;

      el.style.cursor = 'pointer';
      el.setAttribute('tabindex',   '0');
      el.setAttribute('role',       'button');
      el.setAttribute('aria-label', 'Gate ' + gate.id + ': ' + gate.status);

      el.addEventListener('click', function () {
        global.eventBus.emit('gate_clicked', gate.id);
        global.eventBus.emit('agent_focus_change', { agent: 'crowd', context: 'Gate ' + gate.id });
        self._showTooltip(el, gate.name, gate.status, gate.density);
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });

      el.addEventListener('mouseenter', function () {
        self._showTooltip(el, gate.name, gate.status, gate.density);
      });

      el.addEventListener('mouseleave', function () {
        self._hideTooltip();
      });
    });
  };

  StadiumMapController.prototype._bindSections = function () {
    var self = this;
    this._sections.forEach(function (sec) {
      var el = DOM.byId('svg-sec-' + sec.id);
      if (!el) return;

      el.style.cursor = 'pointer';
      el.setAttribute('tabindex',   '0');
      el.setAttribute('role',       'button');
      el.setAttribute('aria-label', sec.name + ': occupancy ' + Math.round(sec.occupancy * 100) + '%');

      el.addEventListener('click', function () {
        global.eventBus.emit('section_clicked', sec.id);
        global.eventBus.emit('agent_focus_change', { agent: 'crowd', context: 'Section ' + sec.id });
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });
  };

  StadiumMapController.prototype._buildTooltip = function () {
    if (DOM.byId('map-tooltip')) return;
    var tip  = DOM.createElement('div', { id: 'map-tooltip', className: 'map-tooltip', 'aria-hidden': 'true' });
    document.body.appendChild(tip);
  };

  StadiumMapController.prototype._showTooltip = function (el, name, status, density) {
    var tip = DOM.byId('map-tooltip');
    if (!tip) return;

    DOM.clearChildren(tip);
    tip.appendChild(DOM.createElement('strong', {}, S.sanitizeHTML(name)));
    tip.appendChild(DOM.createElement('div', {
      style: { fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-muted)' },
    }, 'Status: ' + S.sanitizeHTML(status) + ' · Density: ' + S.formatPercentage(density * 100)));

    var rect = el.getBoundingClientRect();
    var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    tip.style.left    = (rect.left + scrollX + rect.width / 2 - 60) + 'px';
    tip.style.top     = (rect.top  + scrollY - 60) + 'px';
    tip.style.display = 'block';
    tip.setAttribute('aria-hidden', 'false');
  };

  StadiumMapController.prototype._hideTooltip = function () {
    var tip = DOM.byId('map-tooltip');
    if (tip) {
      tip.style.display = 'none';
      tip.setAttribute('aria-hidden', 'true');
    }
  };

  StadiumMapController.prototype._bindTooltipHide = function () {
    var self = this;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') self._hideTooltip();
    });
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.StadiumMapController = StadiumMapController;

}(window));

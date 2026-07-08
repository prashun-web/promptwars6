/**
 * FIFA AI Command Center — NavigationAgent (Refactored)
 * Single responsibility: pathfinding computation and route state management.
 * Pure pathfinding functions are exported for unit testing.
 * ALL rendering delegated to NavigationView.
 * @module NavigationAgent
 */
(function (global) {
  'use strict';

  var C = global.FIFA_CONSTANTS;

  // ── Pure pathfinding functions ────────────────────────────────────────────

  /**
   * Calculate a path string that avoids the pitch centre.
   * @param {{x:number,y:number}} p1
   * @param {{x:number,y:number}} p2
   * @param {{x:number,y:number}} centre
   * @param {number} pitchRadius
   * @returns {string}  SVG path "d" attribute
   */
  function calculatePath(p1, p2, centre, pitchRadius) {
    var dx    = p2.x - p1.x;
    var dy    = p2.y - p1.y;
    var lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return 'M ' + p1.x + ' ' + p1.y + ' L ' + p2.x + ' ' + p2.y;

    var t     = ((centre.x - p1.x) * dx + (centre.y - p1.y) * dy) / lenSq;
    t         = Math.max(0, Math.min(1, t));
    var projX = p1.x + t * dx;
    var projY = p1.y + t * dy;
    var dist  = Math.hypot(projX - centre.x, projY - centre.y);

    if (dist < pitchRadius) {
      var angle1    = Math.atan2(p1.y - centre.y, p1.x - centre.x);
      var angle2    = Math.atan2(p2.y - centre.y, p2.x - centre.x);
      var midAngle  = (angle1 + angle2) / 2;
      if (Math.abs(angle1 - angle2) > Math.PI) midAngle += Math.PI;
      var detourR   = pitchRadius + C.NAV.DETOUR_BUFFER;
      var ctrlX     = centre.x + Math.cos(midAngle) * detourR;
      var ctrlY     = centre.y + Math.sin(midAngle) * detourR;
      return 'M ' + p1.x + ' ' + p1.y + ' Q ' + ctrlX + ' ' + ctrlY + ' ' + p2.x + ' ' + p2.y;
    }

    return 'M ' + p1.x + ' ' + p1.y + ' L ' + p2.x + ' ' + p2.y;
  }

  /**
   * Estimate walk distance and duration from SVG path length.
   * @param {{x:number,y:number}} p1
   * @param {{x:number,y:number}} p2
   * @param {string} pathString
   * @param {boolean} isAccessible
   * @param {boolean} isEmergency
   * @returns {{distanceMeters:number, durationMins:number}}
   */
  function estimateWalk(p1, p2, pathString, isAccessible, isEmergency) {
    var directDist  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    var overhead    = pathString.includes('Q') ? C.NAV.CURVE_OVERHEAD : C.NAV.STRAIGHT_OVERHEAD;
    var pathLength  = directDist * overhead;
    var meters      = Math.round(pathLength * C.NAV.METRES_PER_SVG_UNIT);
    var speed       = isEmergency  ? C.NAV.WALK_SPEED_EMERGENCY  :
                      isAccessible ? C.NAV.WALK_SPEED_ACCESSIBLE : C.NAV.WALK_SPEED_NORMAL;
    var mins        = Math.ceil(meters / speed / 60);
    return { distanceMeters: meters, durationMins: mins };
  }

  // ── NavigationAgent ──────────────────────────────────────────────────────

  function NavigationAgent() {
    this._pois     = [];
    this._gates    = [];
    this._sections = [];
    this._startId  = 'gate_A';
    this._endId    = 'poi_wc_north';
    this._accessible  = false;
    this._emergency   = false;
    this._unsubscribers = [];

    this._centre = { x: C.NAV.STADIUM_CENTER_X, y: C.NAV.STADIUM_CENTER_Y };
  }

  NavigationAgent.prototype.init = function () {
    this._pois     = global.stadiumData.pois;
    this._gates    = global.stadiumData.gates;
    this._sections = global.stadiumData.sections;

    var self = this;
    this._unsubscribers = [
      global.eventBus.on('emergency_triggered', function (inc) { self._onEmergency(inc); }),
      global.eventBus.on('emergency_cleared',   function ()    { self._onEmergencyCleared(); }),
    ];

    this._populateSelectors();
    this._compute();
  };

  NavigationAgent.prototype.destroy = function () {
    this._unsubscribers.forEach(function (u) { u(); });
  };

  // ── Setup ────────────────────────────────────────────────────────────────

  NavigationAgent.prototype._populateSelectors = function () {
    var startSel = global.DOMHelper.byId('nav-start-select');
    var endSel   = global.DOMHelper.byId('nav-end-select');
    if (!startSel || !endSel) return;

    startSel.innerHTML = '';
    endSel.innerHTML   = '';

    this._gates.forEach(function (gate) {
      startSel.add(new Option('Gate ' + gate.id + ' - ' + gate.name, 'gate_' + gate.id));
    });
    this._sections.forEach(function (sec) {
      startSel.add(new Option('Section ' + sec.id, 'sec_' + sec.id));
      endSel.add(new Option('Section ' + sec.id, 'sec_' + sec.id));
    });
    this._pois.forEach(function (poi) {
      endSel.add(new Option(poi.name + ' (' + poi.type + ')', 'poi_' + poi.id));
    });

    startSel.value = 'gate_A';
    endSel.value   = 'poi_wc_north';

    var self = this;
    startSel.addEventListener('change', function (e) { self._startId = e.target.value; self._compute(); });
    endSel.addEventListener('change',   function (e) { self._endId   = e.target.value; self._compute(); });

    var accessToggle = global.DOMHelper.byId('nav-access-toggle');
    if (accessToggle) {
      accessToggle.addEventListener('change', function (e) {
        self._accessible = e.target.checked;
        global.logOperation('Navigation Agent', 'Accessible Routing: ' + (self._accessible ? 'ENABLED' : 'DISABLED'));
        self._compute();
      });
    }
  };

  // ── Event handlers ───────────────────────────────────────────────────────

  NavigationAgent.prototype._onEmergency = function (incident) {
    this._emergency = true;
    global.logOperation('Navigation Agent', 'Active emergency: Route priority shifted to EMERGENCY EXITS.');
    var endSel   = global.DOMHelper.byId('nav-end-select');
    var bestExit = (incident.exit && incident.exit.includes('Gate C')) ? 'poi_exit_south' : 'poi_exit_north';
    if (endSel) { endSel.value = bestExit; }
    this._endId = bestExit;
    this._compute();
  };

  NavigationAgent.prototype._onEmergencyCleared = function () {
    this._emergency = false;
    this._compute();
  };

  // ── Pathfinding ──────────────────────────────────────────────────────────

  NavigationAgent.prototype._resolveNode = function (id) {
    if (!id) return null;
    var parts = id.split('_');
    var type  = parts[0];
    var key   = parts.slice(1).join('_');

    if (type === 'gate') {
      var g = this._gates.find(function (x) { return x.id === key; });
      return g ? { x: g.x, y: g.y, name: g.name } : null;
    }
    if (type === 'sec') {
      var s = this._sections.find(function (x) { return x.id === key; });
      return s ? { x: s.x, y: s.y, name: s.name } : null;
    }
    if (type === 'poi') {
      var p = this._pois.find(function (x) { return x.id === key; });
      if (!p) return null;
      // If accessibility mode is on, redirect to accessible POI of same type
      if (this._accessible && p.type === 'restroom' && !p.accessible) {
        var alt = this._pois.find(function (x) { return x.type === 'restroom' && x.accessible; });
        if (alt) {
          var endSel = global.DOMHelper.byId('nav-end-select');
          if (endSel) endSel.value = 'poi_' + alt.id;
          this._endId = 'poi_' + alt.id;
          return { x: alt.x, y: alt.y, name: alt.name };
        }
      }
      return { x: p.x, y: p.y, name: p.name };
    }
    return null;
  };

  NavigationAgent.prototype._compute = function () {
    var startNode = this._resolveNode(this._startId);
    var endNode   = this._resolveNode(this._endId);
    if (!startNode || !endNode) return;

    var pathStr  = calculatePath(startNode, endNode, this._centre, C.NAV.PITCH_RADIUS);
    var walk     = estimateWalk(startNode, endNode, pathStr, this._accessible, this._emergency);

    var routeClass, routeLabel, guidance;
    if (this._emergency) {
      routeClass = 'priority-tag critical';
      routeLabel = 'EMERGENCY EVACUATION ROUTE';
      guidance   = 'Follow strobe lighting signals along the green route. Volunteers are opening exit corridors.';
    } else if (this._accessible) {
      routeClass = 'priority-tag low';
      routeLabel = 'ACCESSIBLE PATH (NO STAIRS)';
      guidance   = 'Uses ramps and elevators exclusively.';
    } else {
      routeClass = 'priority-tag medium';
      routeLabel = 'STANDARD STADIUM PATHWAY';
      guidance   = 'Path is fully cleared of blockages. Includes standard stair accesses.';
    }

    global.NavigationView.renderSummaryPanel({
      routeClass:     routeClass,
      routeLabel:     routeLabel,
      startName:      startNode.name || this._startId,
      endName:        endNode.name   || this._endId,
      distanceMeters: walk.distanceMeters,
      durationMins:   walk.durationMins,
      guidance:       guidance,
    });

    global.NavigationView.renderMapPath(pathStr, this._accessible, this._emergency);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.NavigationAgent = NavigationAgent;

  // Export pure functions for tests
  global.NavigationAgent.calculatePath = calculatePath;
  global.NavigationAgent.estimateWalk  = estimateWalk;

}(window));

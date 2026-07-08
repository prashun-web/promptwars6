/**
 * FIFA AI Command Center — Application Orchestrator (Refactored)
 * Thin coordinator: composes controllers and agents, wires the EventBus.
 * Contains ZERO business logic — all concerns delegated to specialist modules.
 * @module App
 */
(function (global) {
  'use strict';

  // ── Static data (defined inline to avoid module ordering issues) ─────────

  var BOOT_LOGS = [
    { text: 'FIFA AI Command Center v4.26.0 - SECURE BOOT', color: 'var(--neon-blue)' },
    { text: 'Initializing Stadium Digital Twin...', ok: true },
    { text: 'Connecting Crowd Analytics Engine...', ok: true },
    { text: 'Connecting Medical Network...', ok: true },
    { text: 'Connecting Security Systems...', ok: true },
    { text: 'Loading AI Decision Engine...', ok: true },
    { text: 'Calibrating Neural Translation Dictionaries...', ok: true },
    { text: 'Eco Solar Power Grid Handshake...', ok: true },
    { text: 'All systems nominal. SYSTEM READY \u2713', color: 'var(--neon-green)' },
  ];

  var TIMELINE_EVENTS = [
    { icon: '\uD83D\uDE87', text: 'Metro Line 4 arrival detected. +2,400 fans inbound.' },
    { icon: '\uD83D\uDC65', text: 'Crowd density increased at Gate B \u2014 queue forming.' },
    { icon: '\uD83E\uDD1D', text: 'Volunteer VOL-117 dispatched to North Concourse.' },
    { icon: '\uD83D\uDEAA', text: 'Gate D secondary lane opened \u2014 AI rerouting active.' },
    { icon: '\uD83C\uDFE5', text: 'Medical Unit M-2 repositioned near Section 103.' },
    { icon: '\u26A1',       text: 'Solar grid: 350 kW offset achieved. Net draw reduced.' },
    { icon: '\uD83D\uDCE2', text: 'PA announcement translated to 5 languages. Broadcast ready.' },
    { icon: '\uD83D\uDEE1\uFE0F', text: 'Security perimeter check completed. All zones nominal.' },
    { icon: '\uD83D\uDD25', text: 'Emergency drill completed in Sector B \u2014 4 min response.' },
  ];

  var NOTIF_POOL = [
    { icon: '\uD83D\uDEA8', title: 'Security Alert',         desc: 'Gate F crowd density at 96%. Deploy additional staff.',        type: 'critical' },
    { icon: '\uD83D\uDC65', title: 'Heavy Crowd Near Gate C',desc: 'Queue time rising \u2014 7 minute wait detected.',             type: 'warning'  },
    { icon: '\uD83D\uDE91', title: 'Medical Team Available', desc: 'Unit M-1 repositioned to North concourse.',                    type: 'ok'       },
    { icon: '\uD83D\uDE87', title: 'Metro Surge Incoming',   desc: 'Line 4 departure in 8 min. Expect +3,200 fans.',              type: 'info'     },
    { icon: '\u26A1',       title: 'Energy Spike Detected',  desc: 'Grid draw at 820 kW. Activating solar backup.',               type: 'warning'  },
    { icon: '\uD83C\uDF27', title: 'Rain Alert',             desc: 'Rain expected in 18 minutes. Prepare shelter zones.',         type: 'info'     },
    { icon: '\u2705',       title: 'Gate D Opened',          desc: 'Capacity relief operational. AI congestion plan active.',     type: 'ok'       },
  ];

  // ── Agent definitions ────────────────────────────────────────────────────

  var AGENT_DEFS = [
    { key: 'crowd',       name: 'Crowd Agent',        getClass: function () { return global.CrowdAgent;       } },
    { key: 'navigation',  name: 'Navigation Agent',   getClass: function () { return global.NavigationAgent;  } },
    { key: 'fan',         name: 'Fan Agent',           getClass: function () { return global.FanAgent;         } },
    { key: 'emergency',   name: 'Emergency Agent',    getClass: function () { return global.EmergencyAgent;   } },
    { key: 'volunteer',   name: 'Volunteer Agent',    getClass: function () { return global.VolunteerAgent;   } },
    { key: 'translation', name: 'Translation Agent',  getClass: function () { return global.TranslationAgent; } },
    { key: 'analytics',   name: 'Analytics Agent',    getClass: function () { return global.AnalyticsAgent;   } },
  ];

  // ── AI Sidebar persona data ──────────────────────────────────────────────

  var AI_PROFILES = {
    unified:     { name: 'Operations Orchestrator', status: 'ONLINE \u00B7 IDLE',       style: '' },
    crowd:       { name: 'Crowd Flow Agent',         status: 'MONITORING INGRESS/EGRESS', style: 'color:var(--neon-blue)' },
    navigation:  { name: 'Navigation Pathfinder',   status: 'ROUTING OPTIMISER ACTIVE', style: 'color:var(--neon-green)' },
    emergency:   { name: 'Safety & Security AI',    status: 'INCIDENT COMMAND READY',   style: 'color:var(--neon-red)' },
    volunteer:   { name: 'Volunteer Coordinator',   status: 'DISPATCH LOGIC ONLINE',    style: 'color:var(--neon-yellow)' },
    translation: { name: 'Broadcast Translator',    status: 'MULTILINGUAL MODE ACTIVE', style: '' },
    sustainability: { name: 'Eco-Impact Monitor',   status: 'SUSTAINABILITY TRACKING',  style: 'color:var(--neon-green)' },
    analytics:   { name: 'Executive Briefing AI',   status: 'REPORT ENGINE ACTIVE',     style: '' },
  };

  var AI_KNOWLEDGE_BASE = {
    unified:   ['stadium status', 'overall crowd at 78% capacity', 'Gate F needs attention', 'medical unit M-2 is deployed'],
    crowd:     ['Gate F density at 92%', 'Queue time at Gate B is 12 minutes', 'Recommend redirecting to Gate A or D', 'Gate C moderate'],
    navigation:['Shortest path from Gate A to Section 201 is 350m', 'Accessible route active via ramp E3', 'Emergency exit North cleared'],
    emergency: ['No active incidents', 'All safety teams on standby', 'AED units all operational', 'Emergency protocols loaded'],
    volunteer: ['TSK-003 pending at Gate F', 'VOL-210 Chloe Dupont active', 'Scanner 12 reported calibration error', 'Radio 08 offline'],
    translation:['Spanish selected as primary broadcast', 'Emergency PA translated to 7 languages', 'Lost child PA on standby'],
    sustainability: ['Solar: 350 kW offset', 'Recycling at 92%', 'Water saved: 12.5k gallons', 'CO2 offset: 4.2 tonnes'],
    analytics: ['Density trend peaking at match start', 'Transport wait up 15%', 'No incidents vs match average'],
  };

  // ── App orchestrator ─────────────────────────────────────────────────────

  function App() {
    /** @type {Object.<string, Object>} */
    this.agents     = {};
    this._activeAgentName = 'unified';
    this._timelineIdx     = 0;

    // Controllers
    this._boot          = null;
    this._tabRouter     = null;
    this._clock         = null;
    this._sim           = null;
    this._notifications = null;
    this._stadiumMap    = null;
  }

  App.prototype.init = function () {
    // ── Step 1: Boot Logger singleton ────────────────────────────────────
    global.appLogger = new global.Logger(global.eventBus);

    // Wire log_added to ops log renderer
    global.eventBus.on('log_added', function () {
      renderOpsLog();
    });

    // ── Step 2: Boot sequence (runs parallel with rest of setup) ────────
    var self = this;
    this._boot = new global.BootController(BOOT_LOGS, function () {
      global.logOperation('System', 'Boot complete. Operations dashboard active.', 'success');
    });
    this._boot.run();

    // ── Step 3: Initialise all agents ────────────────────────────────────
    this._initAgents();

    // ── Step 4: Initialise controllers ───────────────────────────────────
    this._tabRouter     = new global.TabRouter();
    this._clock         = new global.ClockController();
    this._sim           = new global.SimController();
    this._notifications = new global.NotificationController();
    this._stadiumMap    = new global.StadiumMapController();

    this._tabRouter.init(function (tabId) { self._onTabChange(tabId); });
    this._clock.startWallClock('hud-time');
    this._clock.startMatchCountdown(0, 'match-countdown');   // already live
    this._sim.start();
    this._sim.bindSpeedButtons();

    this._stadiumMap.init(global.stadiumData.gates, global.stadiumData.sections);

    // ── Step 5: Wire cross-cutting EventBus subscriptions ───────────────
    this._wireEventBus();

    // ── Step 6: Scheduled notifications ─────────────────────────────────
    this._notifications.schedule(NOTIF_POOL);

    // ── Step 7: Timeline injections ──────────────────────────────────────
    this._scheduleTimeline();

    // ── Step 8: Quick Actions bar ─────────────────────────────────────────
    this._bindQuickActions();

    // ── Step 9: AI chat sidebar ───────────────────────────────────────────
    this._bindAIAssistant();

    // ── Step 10: AI sidebar agent tabs ───────────────────────────────────
    this._bindAIAgentTabs();

    // ── Step 11: Initial KPI render ───────────────────────────────────────
    this._renderInitialKPIs();

    global.logOperation('System', 'FIFA AI Command Center v4.26.0 is ONLINE and fully operational.', 'success');
  };

  // ── Agent initialisation ─────────────────────────────────────────────────

  App.prototype._initAgents = function () {
    AGENT_DEFS.forEach(function (def) {
      try {
        var AgentClass = def.getClass();
        if (!AgentClass) throw new Error('Class not found for: ' + def.key);
        var agent = new AgentClass();
        agent.init();
        global.agents         = global.agents || {};
        global.agents[def.key] = agent;
        this.agents[def.key]   = agent;
        global.logOperation(def.name, 'Agent initialized successfully.', 'success');
      } catch (err) {
        console.error('[App] Failed to init agent: ' + def.key, err);
        global.logOperation(def.name, 'Agent initialization failed: ' + err.message, 'critical');
      }
    }, this);
  };

  // ── EventBus cross-cutting wiring ────────────────────────────────────────

  App.prototype._wireEventBus = function () {
    var self = this;

    global.eventBus.on('agent_focus_change', function (data) {
      self._switchAISidebar(data.agent);
    });

    global.eventBus.on('emergency_triggered', function () {
      var alarmOverlay = global.DOMHelper.byId('alarm-overlay');
      if (alarmOverlay) alarmOverlay.classList.add('active');
    });

    global.eventBus.on('emergency_cleared', function () {
      var alarmOverlay = global.DOMHelper.byId('alarm-overlay');
      if (alarmOverlay) alarmOverlay.classList.remove('active');
    });

    global.eventBus.on('tab_changed', function (tabId) {
      self._updateSidebarForTab(tabId);
    });
  };

  // ── Tab change ────────────────────────────────────────────────────────────

  App.prototype._onTabChange = function (tabId) {
    this._updateSidebarForTab(tabId);
  };

  App.prototype._updateSidebarForTab = function (tabId) {
    var agentMap = {
      'dashboard':    'unified',
      'crowd':        'crowd',
      'navigation':   'navigation',
      'emergency':    'emergency',
      'volunteer':    'volunteer',
      'fan':          'fan',
      'translation':  'translation',
      'sustainability':'sustainability',
      'analytics':    'analytics',
      'settings':     'unified',
    };
    var agentKey = agentMap[tabId] || 'unified';
    this._switchAISidebar(agentKey);
  };

  // ── AI Sidebar ────────────────────────────────────────────────────────────

  App.prototype._switchAISidebar = function (agentKey) {
    this._activeAgentName = agentKey;
    var profile = AI_PROFILES[agentKey] || AI_PROFILES.unified;

    global.DOMHelper.setText('sidebar-ai-name',   profile.name);
    global.DOMHelper.setText('sidebar-ai-status', '● ' + profile.status);

    var statusEl = global.DOMHelper.byId('sidebar-ai-status');
    if (statusEl && profile.style) statusEl.setAttribute('style', profile.style);

    // Update active tab chip
    global.DOMHelper.qsa('.ai-agent-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-agent') === agentKey);
    });
  };

  App.prototype._bindAIAgentTabs = function () {
    var self = this;
    global.DOMHelper.qsa('.ai-agent-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var agent = btn.getAttribute('data-agent');
        self._switchAISidebar(agent);
        global.eventBus.emit('agent_focus_change', { agent: agent, context: '' });
      });
    });
  };

  // ── AI Assistant Chat ─────────────────────────────────────────────────────

  App.prototype._bindAIAssistant = function () {
    var self     = this;
    var form     = global.DOMHelper.byId('hud-assistant-form');
    var input    = global.DOMHelper.byId('hud-assistant-input');
    var chatEl   = global.DOMHelper.byId('hud-assistant-chat');

    if (!form || !input || !chatEl) return;

    // Initial greeting
    appendChatMsg(chatEl, 'assistant', 'Operations Orchestrator', 'All stadium systems online. How can I assist?');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;

      appendChatMsg(chatEl, 'user', null, text);
      global.logOperation('AI Assistant', 'Query: "' + text + '"');
      input.value = '';

      var skeletonDiv = document.createElement('div');
      skeletonDiv.className = 'chat-message assistant';
      skeletonDiv.id        = 'hud-skeleton';
      skeletonDiv.innerHTML = global.createSkeletonLoader(1);
      chatEl.appendChild(skeletonDiv);
      global.DOMHelper.scrollToBottom(chatEl);

      setTimeout(function () {
        var sk = global.DOMHelper.byId('hud-skeleton');
        if (sk) sk.remove();
        var reply = self._generateAIReply(text.toLowerCase());
        appendChatMsg(chatEl, 'assistant', AI_PROFILES[self._activeAgentName].name, reply);
      }, 900);
    });
  };

  /**
   * Generate a contextual reply from the AI profile knowledge base.
   * Pure deterministic function — no DOM.
   */
  App.prototype._generateAIReply = function (lowerQuery) {
    var kb = AI_KNOWLEDGE_BASE[this._activeAgentName] || AI_KNOWLEDGE_BASE.unified;

    var keywords = {
      gate:       kb[0] || '',
      crowd:      kb[0] || '',
      emergency:  kb[1] || '',
      navigation: kb[0] || '',
      translate:  kb[0] || '',
      volunteer:  kb[0] || '',
    };

    for (var kw in keywords) {
      if (lowerQuery.includes(kw)) {
        return 'Contextual analysis: ' + keywords[kw] + '. Refer to the ' + this._activeAgentName + ' module for detailed metrics.';
      }
    }

    return 'Current ' + (AI_PROFILES[this._activeAgentName] || AI_PROFILES.unified).name + ' status: ' + kb.join('. ') + '. What specific action should I take?';
  };

  function appendChatMsg(container, sender, agentName, text) {
    if (!container) return;
    var div = global.DOMHelper.createElement('div', { className: 'chat-message ' + sender });
    if (sender === 'assistant' && agentName) {
      var label = global.DOMHelper.createElement('strong', {
        style: { color: 'var(--neon-blue)', display: 'block', marginBottom: '4px', fontSize: '0.75rem' },
      }, '[AI: ' + agentName + ']');
      div.appendChild(label);
    }
    div.appendChild(document.createTextNode(text));
    container.appendChild(div);
    global.DOMHelper.scrollToBottom(container);
  }

  // ── Quick Actions ─────────────────────────────────────────────────────────

  App.prototype._bindQuickActions = function () {
    var self     = this;
    var tabRouter = this._tabRouter;

    function bindQA(id, action) {
      var btn = global.DOMHelper.byId(id);
      if (btn) btn.addEventListener('click', action);
    }

    bindQA('qa-emergency', function () {
      tabRouter.navigateTo('emergency');
      global.logOperation('Quick Action', 'Emergency panel activated via Quick Actions.');
    });

    bindQA('qa-announce', function () {
      tabRouter.navigateTo('translation');
      global.logOperation('Quick Action', 'Translation hub opened for announcement drafting.');
    });

    bindQA('qa-heatmap', function () {
      tabRouter.navigateTo('crowd');
      global.logOperation('Quick Action', 'Crowd heatmap view requested.');
    });

    bindQA('qa-medical', function () {
      tabRouter.navigateTo('volunteer');
      global.logOperation('Quick Action', 'Medical team roster opened via Volunteer Hub.');
    });

    bindQA('qa-translate', function () {
      tabRouter.navigateTo('translation');
      global.logOperation('Quick Action', 'Translation desk opened.');
    });

    bindQA('qa-export', function () {
      global.logOperation('Quick Action', 'Report export initiated (PDF stub in production build).', 'info');
      self._notifications.show({ icon: '\uD83D\uDCCB', title: 'Report Export', desc: 'Full ops log packaged for briefing.', type: 'ok' });
    });
  };

  // ── Timeline ──────────────────────────────────────────────────────────────

  App.prototype._scheduleTimeline = function () {
    var self       = this;
    var container  = global.DOMHelper.byId('timeline-list');
    var C          = global.FIFA_CONSTANTS;

    if (!container) return;

    // Initial batch
    for (var i = 0; i < C.TIMELINE.INITIAL_COUNT; i++) {
      (function (idx) {
        setTimeout(function () {
          appendTimelineItem(container, TIMELINE_EVENTS[idx % TIMELINE_EVENTS.length]);
        }, idx * C.TIMELINE.INITIAL_DELAY);
      })(i);
    }

    // Scheduled additions
    function scheduleNext() {
      var delay = C.TIMELINE.SCHEDULE_MIN + Math.random() * C.TIMELINE.SCHEDULE_RAND;
      setTimeout(function () {
        appendTimelineItem(container, TIMELINE_EVENTS[self._timelineIdx % TIMELINE_EVENTS.length]);
        self._timelineIdx++;
        global.DOMHelper.trimChildren(container, C.TIMELINE.MAX_ITEMS);
        scheduleNext();
      }, delay);
    }

    setTimeout(function () {
      self._timelineIdx = C.TIMELINE.INITIAL_COUNT;
      scheduleNext();
    }, C.TIMELINE.FIRST_SCHED_MS);
  };

  function appendTimelineItem(container, event) {
    var item    = global.DOMHelper.createElement('div', { className: 'timeline-item' });
    var ts      = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    var iconEl  = global.DOMHelper.createElement('span', { 'aria-hidden': 'true' }, event.icon);
    var textEl  = global.DOMHelper.createElement('span', {}, ' ' + event.text + ' ');
    var timeEl  = global.DOMHelper.createElement('span', { className: 'timeline-time' }, ts);
    item.appendChild(iconEl);
    item.appendChild(textEl);
    item.appendChild(timeEl);
    global.DOMHelper.prepend(container, item);
  }

  // ── Ops log renderer ──────────────────────────────────────────────────────

  function renderOpsLog() {
    var logEl = global.DOMHelper.byId('ops-log-list');
    if (!logEl || !global.appLogger) return;

    var entries  = global.appLogger.getEntries();
    var C        = global.FIFA_CONSTANTS;
    var visible  = entries.slice(0, C.LOG.MAX_VISIBLE);

    global.DOMHelper.clearChildren(logEl);

    var frag = document.createDocumentFragment();
    visible.forEach(function (entry) {
      var row     = global.DOMHelper.createElement('div', { className: 'log-row' });
      var timeEl  = global.DOMHelper.createElement('span', { className: 'log-time' }, entry.timestamp);
      var srcEl   = global.DOMHelper.createElement('span', { className: 'log-source' }, '[' + entry.source + ']');
      var textEl  = global.DOMHelper.createElement('span', { className: 'log-text' }, entry.text);

      row.appendChild(timeEl);
      row.appendChild(srcEl);
      row.appendChild(textEl);
      frag.appendChild(row);
    });

    logEl.appendChild(frag);
    global.DOMHelper.scrollToBottom(logEl);
  }

  // ── Initial KPI render ───────────────────────────────────────────────────

  App.prototype._renderInitialKPIs = function () {
    var kpis    = global.simState.getKPIs();
    var match   = global.simState.getMatch();
    var weather = global.simState.getWeather();
    var C       = global.FIFA_CONSTANTS;

    var fans = Math.floor(kpis.crowdDensity * C.STADIUM.FANS_PER_DENSITY_PT);
    global.DOMHelper.setText('fans-inside-count', fans.toLocaleString());
    global.DOMHelper.setText('kpi-fans', fans.toLocaleString());
    global.DOMHelper.setText('kpi-weather', weather.temp + '\u00B0C');
    global.DOMHelper.setText('hud-weather', '\u2600\uFE0F ' + weather.temp + '\u00B0C');

    var fill = global.DOMHelper.byId('density-fill');
    var val  = global.DOMHelper.byId('density-val');
    if (fill) fill.style.width    = kpis.crowdDensity + '%';
    if (val)  val.textContent     = kpis.crowdDensity;

    global.DOMHelper.setText('match-score-home', match.homeScore);
    global.DOMHelper.setText('match-score-away', match.awayScore);
    global.DOMHelper.setText('match-minute-badge', match.minute + "'");
  };

  // ── Bootstrap ────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    var app = new App();
    global.app = app;  // expose for debugging
    app.init();
  });

}(window));

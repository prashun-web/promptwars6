/**
 * FIFA AI Command Center — Main Application Coordinator
 * World Cup 2026 · Stadium Operations Platform
 */

class App {
  constructor() {
    this.agents = {};
    this.activeTabId = 'dashboard';
    this.activeAgentName = 'unified';
    this.simSpeed = 1;
    this.simInterval = null;
    this.countdownTarget = null; // Match start time countdown
    this.toastQueue = [];
    this.toastTimer = null;

    // Boot sequence log lines
    this.bootLogs = [
      { text: 'FIFA AI Command Center v4.26.0 - SECURE BOOT', color: 'var(--neon-blue)' },
      { text: 'Initializing Stadium Digital Twin...', ok: true },
      { text: 'Connecting Crowd Analytics Engine...', ok: true },
      { text: 'Connecting Medical Network...', ok: true },
      { text: 'Connecting Security Systems...', ok: true },
      { text: 'Loading AI Decision Engine...', ok: true },
      { text: 'Calibrating Neural Translation Dictionaries...', ok: true },
      { text: 'Eco Solar Power Grid Handshake...', ok: true },
      { text: 'All systems nominal. SYSTEM READY ✓', color: 'var(--neon-green)' }
    ];

    // Live timeline events to inject
    this.timelineEvents = [
      { icon: '🚇', text: 'Metro Line 4 arrival detected. +2,400 fans inbound.' },
      { icon: '👥', text: 'Crowd density increased at Gate B — queue forming.' },
      { icon: '🤝', text: 'Volunteer VOL-117 dispatched to North Concourse.' },
      { icon: '🚪', text: 'Gate D secondary lane opened — AI rerouting active.' },
      { icon: '🏥', text: 'Medical Unit M-2 repositioned near Section 103.' },
      { icon: '⚡', text: 'Solar grid: 350 kW offset achieved. Net draw reduced.' },
      { icon: '📢', text: 'PA announcement translated to 5 languages. Broadcast ready.' },
      { icon: '🛡️', text: 'Security perimeter check completed. All zones nominal.' },
      { icon: '🔥', text: 'Emergency drill completed in Sector B — 4 min response.' },
    ];

    // Floating notification pool
    this.notifPool = [
      { icon: '🚨', title: 'Security Alert', desc: 'Gate F crowd density at 96%. Deploy additional staff.', type: 'critical' },
      { icon: '👥', title: 'Heavy Crowd Near Gate C', desc: 'Queue time rising — 7 minute wait detected.', type: 'warning' },
      { icon: '🚑', title: 'Medical Team Available', desc: 'Unit M-1 repositioned to North concourse.', type: 'ok' },
      { icon: '🚇', title: 'Metro Surge Incoming', desc: 'Line 4 departure in 8 min. Expect +3,200 fans.', type: 'info' },
      { icon: '⚡', title: 'Energy Spike Detected', desc: 'Grid draw at 820 kW. Activating solar backup.', type: 'warning' },
      { icon: '🌧', title: 'Rain Alert', desc: 'Rain expected in 18 minutes. Prepare shelter zones.', type: 'info' },
      { icon: '✅', title: 'Gate D Opened', desc: 'Capacity relief operational. AI congestion plan active.', type: 'ok' },
    ];

    // Gate data for tooltips
    this.gateData = {
      A: { location: 'North', crowd: '4,200', queue: '~3 min', occ: '52%', security: 'Normal', medical: 'M-1 (200m)', status: 'NOMINAL', statusClass: 'green', ai: 'All clear. Capacity well within operational thresholds.' },
      B: { location: 'North-East', crowd: '8,900', queue: '~12 min', occ: '84%', security: 'Elevated', medical: 'M-2 (350m)', status: 'HIGH', statusClass: 'orange', ai: 'Gate B likely to become congested in 8 minutes. Recommend redirecting visitors to Gate D.' },
      C: { location: 'South-East', crowd: '6,100', queue: '~7 min', occ: '68%', security: 'Normal', medical: 'M-3 (150m)', status: 'MODERATE', statusClass: 'yellow', ai: 'Moderate queue building. Monitor flow — no immediate action required.' },
      D: { location: 'South', crowd: '3,800', queue: '~2 min', occ: '45%', security: 'Normal', medical: 'M-4 (180m)', status: 'NOMINAL', statusClass: 'green', ai: 'Low congestion. Optimal gate for overflow routing from Gate B and F.' },
      E: { location: 'South-West', crowd: '4,500', queue: '~4 min', occ: '55%', security: 'Normal', medical: 'M-4 (220m)', status: 'NOMINAL', statusClass: 'green', ai: 'Operating normally. Slight uptick expected as match approaches.' },
      F: { location: 'North-West', crowd: '11,200', queue: '~16 min', occ: '97%', security: 'Critical', medical: 'M-1 (80m)', status: 'CRITICAL', statusClass: 'red', ai: 'CRITICAL: Gate F at near-full capacity. Immediate rerouting to Gate A and D recommended. Dispatch additional stewards.' }
    };
  }

  async init() {
    // CRITICAL: Set up boot screen FIRST so buttons always work
    this.runBootSequence();

    // Safe agent initialization — each wrapped in try/catch
    const agentDefs = [
      { key: 'crowd',       Cls: () => window.CrowdAgent },
      { key: 'navigation',  Cls: () => window.NavigationAgent },
      { key: 'fan',         Cls: () => window.FanAgent },
      { key: 'emergency',   Cls: () => window.EmergencyAgent },
      { key: 'volunteer',   Cls: () => window.VolunteerAgent },
      { key: 'translation', Cls: () => window.TranslationAgent },
      { key: 'analytics',   Cls: () => window.AnalyticsAgent },
    ];

    agentDefs.forEach(({ key, Cls }) => {
      try {
        const AgentClass = Cls();
        if (typeof AgentClass !== 'function') throw new Error(`${key} class not found on window`);
        this.agents[key] = new AgentClass();
        this.agents[key].init();
      } catch (err) {
        console.warn(`[FIFA OS] Agent "${key}" failed to load:`, err.message);
      }
    });

    // Setup routing & event handling
    this.setupTabRouting();
    this.setupEventHandlers();
    this.setupAssistantInterface();
    this.setupStadiumMapInteractions();
    this.setupQuickActions();
    this.setupSpeedButtons();

    // Start simulation tickers
    this.startSimulation();
    this.startClock();
    this.startMatchCountdown();
    this.startTimelineInjector();

    // Schedule floating notifications
    this.scheduleFloatingNotifications();

    // Initial KPI paint
    this.updateDashboardKPIs();
  }

  // ============================================================
  // BOOT SEQUENCE
  // ============================================================
  runBootSequence() {
    const term         = document.getElementById('boot-log-terminal');
    const biometricBtn = document.getElementById('boot-biometric-btn');
    const loginForm    = document.getElementById('boot-login-form');
    const bootScreen   = document.getElementById('boot-screen');
    const ringEl       = document.getElementById('boot-ring-progress');

    // Guard: if boot screen is already gone, skip
    if (!bootScreen) return;
    if (!term) {
      // Still hook up the buttons even if terminal is missing
      this._hookBootButtons(biometricBtn, loginForm, bootScreen, null, ringEl);
      return;
    }

    term.innerHTML = '';

    const totalCircumference = 339; // 2 * pi * 54

    // Print boot logs sequentially
    this.bootLogs.forEach((log, idx) => {
      setTimeout(() => {
        const line = document.createElement('div');
        if (log.color) {
          line.style.color = log.color;
          line.style.fontWeight = '600';
          line.textContent = '> ' + log.text;
        } else if (log.ok) {
          line.innerHTML = '<span style="color:#4a6080">&gt; ' + log.text.replace('...', '') + '</span>&nbsp;&nbsp;<span style="color:var(--neon-green); font-weight:600">[OK]</span>';
        } else {
          line.textContent = '> ' + log.text;
        }
        term.appendChild(line);
        term.scrollTop = term.scrollHeight;

        // Advance ring progress
        if (ringEl) {
          const totalCircumference = 339;
          const pct = ((idx + 1) / this.bootLogs.length) * totalCircumference;
          ringEl.style.strokeDasharray = pct + ' ' + totalCircumference;
        }
      }, idx * 320);
    });

    this._hookBootButtons(biometricBtn, loginForm, bootScreen, term, ringEl);
  }

  _hookBootButtons(biometricBtn, loginForm, bootScreen, term, ringEl) {
    // Biometric scanner button
    if (biometricBtn) {
      // Remove any existing listeners by cloning
      const newBtn = biometricBtn.cloneNode(true);
      biometricBtn.parentNode.replaceChild(newBtn, biometricBtn);

      newBtn.addEventListener('click', () => {
        newBtn.classList.add('scanning');
        const scanText = newBtn.querySelector('.scanner-text');
        if (scanText) scanText.textContent = 'SCANNING...';

        setTimeout(() => {
          newBtn.classList.remove('scanning');
          const icon = newBtn.querySelector('.scan-finger-icon');
          if (icon) icon.textContent = '\u2705';
          if (scanText) scanText.textContent = 'IDENTITY VERIFIED';
          newBtn.style.borderColor = 'var(--neon-green)';
          newBtn.style.color = 'var(--neon-green)';
          newBtn.style.borderStyle = 'solid';

          if (term) {
            const line = document.createElement('div');
            line.style.color = 'var(--neon-green)';
            line.style.fontWeight = '600';
            line.textContent = '> BIOMETRICS MATCHED. AUTHORIZATION GRANTED. WELCOME, Sofia R.';
            term.appendChild(line);
            term.scrollTop = term.scrollHeight;
          }

          setTimeout(() => this._dismissBootScreen(bootScreen), 900);
        }, 1400);
      });
    }

    // Manual login form
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.textContent = 'Authorizing...'; submitBtn.disabled = true; }

        setTimeout(() => {
          if (term) {
            const line = document.createElement('div');
            line.style.color = 'var(--neon-green)';
            line.style.fontWeight = '600';
            line.textContent = '> SECURITY TOKENS VALIDATED. ACCESS GRANTED.';
            term.appendChild(line);
            term.scrollTop = term.scrollHeight;
          }
          setTimeout(() => this._dismissBootScreen(bootScreen), 700);
        }, 800);
      });
    }
  }

  _dismissBootScreen(bootScreen) {
    if (!bootScreen) return;
    bootScreen.classList.add('fade-out');
    setTimeout(() => {
      bootScreen.style.display = 'none';
      // Safe log — logOperation may not exist yet if utils.js errored
      if (typeof window.logOperation === 'function') {
        window.logOperation('Command Center', 'Operator Sofia R. authenticated. Stadium OS loaded.', 'success');
      }
      this.showFloatingNotification({ icon: '\u2705', title: 'System Online', desc: 'FIFA AI Command Center operational.', type: 'ok' });
    }, 650);
  }

  // ============================================================
  // CLOCK & COUNTDOWN
  // ============================================================
  startClock() {
    const update = () => {
      const el = document.getElementById('hud-clock');
      if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
    };
    update();
    setInterval(update, 1000);
  }

  startMatchCountdown() {
    // Set match start 90 minutes from page load
    const startMs = Date.now() + (90 * 60 * 1000);

    const update = () => {
      const el = document.getElementById('match-countdown');
      if (!el) return;

      const remaining = startMs - Date.now();
      if (remaining <= 0) {
        el.textContent = 'LIVE';
        return;
      }

      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    update();
    setInterval(update, 1000);
  }

  // ============================================================
  // LIVE EVENT TIMELINE
  // ============================================================
  startTimelineInjector() {
    const container = document.getElementById('event-timeline');
    if (!container) return;

    let idx = 0;

    const inject = () => {
      const ev = this.timelineEvents[idx % this.timelineEvents.length];
      idx++;

      const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const row = document.createElement('div');
      row.className = 'timeline-event';
      row.innerHTML = `
        <span class="timeline-time">${time}</span>
        <span class="timeline-icon">${ev.icon}</span>
        <span class="timeline-text">${ev.text}</span>
      `;
      container.insertBefore(row, container.firstChild);

      // Keep max 12 items
      while (container.children.length > 12) {
        container.lastChild.remove();
      }
    };

    // Add initial events
    for (let i = 0; i < 5; i++) {
      setTimeout(() => inject(), i * 300);
    }

    // Continue injecting every 8-18 seconds
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 10000;
      setTimeout(() => { inject(); scheduleNext(); }, delay);
    };
    setTimeout(() => scheduleNext(), 6000);
  }

  // ============================================================
  // FLOATING NOTIFICATIONS
  // ============================================================
  scheduleFloatingNotifications() {
    let idx = 0;
    const show = () => {
      const notif = this.notifPool[idx % this.notifPool.length];
      idx++;
      this.showFloatingNotification(notif);
      const next = 12000 + Math.random() * 18000;
      setTimeout(show, next);
    };

    // First notification after 5 seconds
    setTimeout(show, 5000);
  }

  showFloatingNotification({ icon, title, desc, type = 'info' }) {
    const container = document.getElementById('notification-toaster');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `notif-toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss notification">✕</button>
    `;

    // Dismiss on click
    const dismiss = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };
    toast.addEventListener('click', dismiss);
    toast.querySelector('.toast-close').addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });

    container.appendChild(toast);

    // Auto-dismiss after 6 seconds
    setTimeout(dismiss, 6000);

    // Update badge count
    const badge = document.getElementById('notif-badge');
    if (badge) {
      const count = parseInt(badge.textContent) || 0;
      badge.textContent = count + 1;
    }
  }

  // Expose globally for other modules
  _exposeGlobal() {
    window.showFloatingNotification = (opts) => this.showFloatingNotification(opts);
  }

  // ============================================================
  // GATE TOOLTIP
  // ============================================================
  setupStadiumMapInteractions() {
    const tooltip = document.getElementById('gate-tooltip');

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(gateId => {
      const el = document.getElementById(`svg-gate-${gateId}`);
      if (!el) return;

      // Click to fire event bus
      el.addEventListener('click', () => {
        window.eventBus.emit('gate_clicked', gateId);
        window.logOperation('Crowd AI', `Gate ${gateId} telemetry focused by operator.`);
      });

      // Hover tooltip
      el.addEventListener('mouseenter', (e) => {
        const data = this.gateData[gateId];
        if (!data || !tooltip) return;

        document.getElementById('tooltip-gate-name').textContent = `Gate ${gateId} — ${data.location}`;

        const statusEl = document.getElementById('tooltip-gate-status');
        statusEl.textContent = data.status;
        statusEl.style.background = `rgba(var(--color-${data.statusClass}), 0.1)`;
        statusEl.style.color = `var(--neon-${data.statusClass === 'red' ? 'red' : data.statusClass === 'orange' ? 'orange' : data.statusClass === 'yellow' ? 'yellow' : 'green'})`;
        statusEl.style.padding = '2px 8px';
        statusEl.style.borderRadius = '4px';
        statusEl.style.fontSize = '0.62rem';
        statusEl.style.fontWeight = '700';

        document.getElementById('tooltip-crowd').textContent = data.crowd;
        document.getElementById('tooltip-queue').textContent = data.queue;
        document.getElementById('tooltip-occ').textContent = data.occ;
        document.getElementById('tooltip-security').textContent = data.security;
        document.getElementById('tooltip-medical').textContent = data.medical;
        document.getElementById('tooltip-ai-text').textContent = data.ai;

        tooltip.classList.add('visible');
        tooltip.setAttribute('aria-hidden', 'false');
      });

      el.addEventListener('mouseleave', () => {
        if (tooltip) {
          tooltip.classList.remove('visible');
          tooltip.setAttribute('aria-hidden', 'true');
        }
      });

      // Keyboard support
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.eventBus.emit('gate_clicked', gateId);
        }
      });
    });

    // Section clicks
    ['101', '102', '103', '104', '201', '202', '203', '204'].forEach(secId => {
      const el = document.getElementById(`svg-sec-${secId}`);
      if (el) {
        el.addEventListener('click', () => {
          window.eventBus.emit('section_clicked', secId);
        });
      }
    });
  }

  // ============================================================
  // TAB ROUTING
  // ============================================================
  setupTabRouting() {
    const navItems = document.querySelectorAll('.nav-item');
    const modules  = document.querySelectorAll('.viewport-module');

    navItems.forEach(item => {
      const button = item.querySelector('button');
      if (!button) return;

      button.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab');

        navItems.forEach(n => {
          n.classList.remove('active');
          const btn = n.querySelector('button');
          if (btn) btn.setAttribute('aria-current', 'false');
        });
        item.classList.add('active');
        button.setAttribute('aria-current', 'page');

        modules.forEach(m => {
          m.classList.remove('active');
          if (m.id === `module-${tabId}`) m.classList.add('active');
        });

        this.activeTabId = tabId;
        window.logOperation('Navigation', `Viewport shifted to: ${tabId.toUpperCase()}`);
        this.autoFocusAgentForTab(tabId);
      });
    });
  }

  // ============================================================
  // QUICK ACTIONS
  // ============================================================
  setupQuickActions() {
    const actions = {
      'btn-gen-emergency': () => document.querySelector('.nav-item[data-tab="emergency"] button')?.click(),
      'btn-announcement':  () => document.querySelector('.nav-item[data-tab="translation"] button')?.click(),
      'btn-heatmap':       () => {
        this.showFloatingNotification({ icon: '🌡️', title: 'Crowd Heatmap', desc: 'Switching to crowd density view on stadium map.', type: 'info' });
        document.querySelector('.nav-item[data-tab="crowd"] button')?.click();
      },
      'btn-export': () => {
        this.showFloatingNotification({ icon: '📊', title: 'Report Exported', desc: 'Executive operations report generated and ready.', type: 'ok' });
        window.logOperation('Analytics', 'Executive report export triggered by operator.', 'success');
      },
      'qa-emergency': () => document.querySelector('.nav-item[data-tab="emergency"] button')?.click(),
      'qa-announce':  () => document.querySelector('.nav-item[data-tab="translation"] button')?.click(),
      'qa-heatmap':   () => document.querySelector('.nav-item[data-tab="crowd"] button')?.click(),
      'qa-medical':   () => {
        this.showFloatingNotification({ icon: '🏥', title: 'Medical Teams', desc: 'M-1: North, M-2: East, M-3: South, M-4: West — All active.', type: 'ok' });
        window.logOperation('Medical', 'Operator located all active medical units.', 'info');
      },
      'qa-translate': () => document.querySelector('.nav-item[data-tab="translation"] button')?.click(),
      'qa-export':    () => {
        this.showFloatingNotification({ icon: '📄', title: 'Report Generated', desc: 'Operations report exported successfully.', type: 'ok' });
      },
    };

    Object.entries(actions).forEach(([id, handler]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', handler);
    });
  }

  // ============================================================
  // SPEED BUTTONS
  // ============================================================
  setupSpeedButtons() {
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseInt(btn.getAttribute('data-speed')) || 1;
        this.simSpeed = speed;
        window.logOperation('System', `Simulation clock speed set to ${speed}×`, 'info');
      });
    });
  }

  // ============================================================
  // AUTO-FOCUS AGENT
  // ============================================================
  autoFocusAgentForTab(tabId) {
    const map = {
      crowd: 'crowd', navigation: 'navigation', emergency: 'emergency',
      volunteer: 'volunteer', fan: 'fan', translation: 'translation',
      sustainability: 'sustainability', analytics: 'analytics'
    };
    this.switchActiveAgent(map[tabId] || 'unified');
  }

  // ============================================================
  // EVENT HANDLERS
  // ============================================================
  setupEventHandlers() {
    window.eventBus.on('log_added',    (log)    => this.renderLog(log));
    window.eventBus.on('kpis_updated', ()       => this.updateDashboardKPIs());

    window.eventBus.on('emergency_triggered', (incident) => {
      const tab = document.querySelector('.nav-item[data-tab="emergency"]');
      if (tab) tab.querySelector('button').click();

      const badge = document.getElementById('hud-system-status-badge');
      if (badge) {
        badge.innerHTML = `<span class="status-dot red"></span> ALERT: ${incident.priority}`;
      }

      document.getElementById('alarm-overlay')?.classList.add('active');

      this.showFloatingNotification({
        icon: '🚨',
        title: `Emergency: ${incident.type.replace('_', ' ').toUpperCase()}`,
        desc: 'Incident detected. All units alerted. Executing response plan.',
        type: 'critical'
      });
    });

    window.eventBus.on('emergency_cleared', () => {
      const badge = document.getElementById('hud-system-status-badge');
      if (badge) badge.innerHTML = `<span class="status-dot green"></span> OPERATIONAL`;

      document.getElementById('alarm-overlay')?.classList.remove('active');

      const dashTab = document.querySelector('.nav-item[data-tab="dashboard"]');
      if (dashTab) dashTab.querySelector('button').click();

      this.showFloatingNotification({ icon: '✅', title: 'All Clear', desc: 'Emergency resolved. Stadium status restored to nominal.', type: 'ok' });
    });

    window.eventBus.on('agent_focus_change', (data) => {
      this.switchActiveAgent(data.agent);
      this.postAssistantMessage(`Analyzing: "${data.context}"`);
    });
  }

  // ============================================================
  // SIMULATION TICK
  // ============================================================
  startSimulation() {
    this.simInterval = setInterval(() => {
      // Advance match minute
      window.simState.match.minute += this.simSpeed;
      if (window.simState.match.minute > 90) {
        window.simState.match.minute = 1;
        window.simState.match.half = window.simState.match.half === 1 ? 2 : 1;
        window.simState.match.status = window.simState.match.half === 2 ? '2nd Half' : '1st Half';
        window.logOperation('Stadium Clock', 'Second half kick-off initiated.');
      }

      // Solar generation decreases after sunset
      if (window.simState.match.minute > 60) {
        window.simState.kpis.solarGenerationKw = Math.max(0, window.simState.kpis.solarGenerationKw - 3);
      }

      // Update match score badge
      const minBadge = document.getElementById('match-minute-badge');
      if (minBadge) {
        const m = window.simState.match.minute;
        if (m === 45) { minBadge.textContent = 'HT'; }
        else { minBadge.textContent = `${m}'`; }
      }

      // Update score display
      const homeScore = document.getElementById('match-score-home');
      const awayScore = document.getElementById('match-score-away');
      if (homeScore) homeScore.textContent = window.simState.match.homeScore;
      if (awayScore) awayScore.textContent = window.simState.match.awayScore;

      // Weather fluctuation
      if (Math.random() > 0.88) {
        window.simState.weather.temp += Math.random() > 0.5 ? 1 : -1;
        const el = document.getElementById('hud-weather');
        if (el) el.textContent = `☀️ ${window.simState.weather.temp}°C`;
        const kpiEl = document.getElementById('kpi-weather');
        if (kpiEl) kpiEl.textContent = `${window.simState.weather.temp}°C`;
      }

      // Crowd fluctuation
      if (Math.random() > 0.6) {
        const delta = Math.floor(Math.random() * 200) - 80;
        window.simState.kpis.crowdDensity = Math.min(99, Math.max(50, window.simState.kpis.crowdDensity + (delta > 0 ? 0.5 : -0.3)));
        const fansEl = document.getElementById('fans-inside-count');
        if (fansEl) {
          const fans = Math.floor(window.simState.kpis.crowdDensity * 820);
          fansEl.textContent = fans.toLocaleString();
        }
        // Update density bar
        const fill = document.getElementById('density-fill');
        const val = document.getElementById('density-val');
        const pct = Math.round(window.simState.kpis.crowdDensity);
        if (fill) fill.style.width = `${pct}%`;
        if (val) val.textContent = pct;
      }

      // Emit global tick
      window.eventBus.emit('tick', window.simState);

    }, 3000);
  }

  // ============================================================
  // KPI UPDATES
  // ============================================================
  updateDashboardKPIs() {
    const s = window.simState.kpis;

    const set = (id, value, cls) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = value; if (cls) el.className = `kpi-value-big ${cls}`; }
    };

    const crowdPct = s.crowdDensity;
    set('kpi-fans', Math.floor(crowdPct * 820).toLocaleString());
    set('kpi-medical', `${s.medicalAlerts}`, s.medicalAlerts > 0 ? 'critical' : 'ok');
    set('kpi-security', s.securityStatus !== 'Nominal' ? '2' : '1', s.securityStatus !== 'Nominal' ? 'critical' : 'warning');
    set('kpi-transport', `${s.transportFlow}%`, s.transportFlow < 80 ? 'warning' : 'ok');

    const netDraw = s.energyUsageKw - s.solarGenerationKw;
    set('kpi-energy', `${netDraw} kW`);

    // Density display
    const fill = document.getElementById('density-fill');
    const val = document.getElementById('density-val');
    if (fill) fill.style.width = `${Math.round(crowdPct)}%`;
    if (val) val.textContent = Math.round(crowdPct);
  }

  // ============================================================
  // OPERATIONS LOG RENDER
  // ============================================================
  renderLog(log) {
    const container = document.getElementById('hud-logs-wrapper');
    if (!container) return;

    const row = document.createElement('div');
    row.className = `hud-log-item ${log.severity || ''}`;
    row.innerHTML = `
      <span class="hud-log-time">[${log.timestamp}]</span>
      <span class="hud-log-src">${log.source}</span>
      <span class="hud-log-txt">${log.text}</span>
    `;

    container.insertBefore(row, container.firstChild);
    if (container.children.length > 30) container.lastChild.remove();
  }

  // ============================================================
  // AI ASSISTANT PANEL
  // ============================================================
  setupAssistantInterface() {
    // Agent tab switching
    document.querySelectorAll('.ai-agent-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const agent = tab.getAttribute('data-agent');
        this.switchActiveAgent(agent);
        document.querySelectorAll('.ai-agent-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      });
    });

    // Assistant form
    const form  = document.getElementById('hud-assistant-form');
    const input = document.getElementById('hud-assistant-input');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawText = input.value.trim();
        if (!rawText) return;

        const text = window.sanitizeHTML(rawText);
        this.postUserMessage(text);
        input.value = '';

        setTimeout(() => this.respondToAssistantQuery(text), 700);
      });
    }

    // Default greeting
    setTimeout(() => {
      this.postAssistantMessage('All systems online. Stadium OS operational. Awaiting operator commands.');
    }, 500);
  }

  switchActiveAgent(agent) {
    this.activeAgentName = agent;

    const map = {
      crowd:          { name: 'Crowd AI Agent',         status: 'MONITORING TURNSTILES' },
      navigation:     { name: 'Navigation AI Agent',    status: 'COMPUTING ROUTES' },
      emergency:      { name: 'Emergency AI Agent',     status: window.simState?.activeEmergency ? 'INCIDENT ACTIVE' : 'MONITORING SENSORS' },
      volunteer:      { name: 'Volunteer AI Steward',   status: 'DISPATCHING SHIFTS' },
      translation:    { name: 'Translation AI Agent',   status: 'LINGUISTICS ACTIVE' },
      sustainability: { name: 'Sustainability AI Guard', status: 'GRID MONITORING' },
      analytics:      { name: 'Executive AI Analyst',   status: 'BRIEFINGS COMPILED' },
      unified:        { name: 'Operations Orchestrator', status: 'ONLINE · IDLE' },
    };

    const data = map[agent] || map.unified;

    const nameEl   = document.getElementById('sidebar-ai-name');
    const statusEl = document.getElementById('sidebar-ai-status');
    const avatar   = document.getElementById('sidebar-ai-avatar');
    const glow     = document.getElementById('sidebar-ai-avatar-glow');

    if (nameEl)   nameEl.textContent = data.name;
    if (statusEl) statusEl.innerHTML = `<span class="status-pulse green"></span>${data.status}`;
    if (avatar)   avatar.className = `ai-avatar ${agent === 'emergency' && window.simState?.activeEmergency ? 'emergency' : ''}`;
    if (glow)     glow.className   = `ai-avatar-glow ${agent === 'emergency' && window.simState?.activeEmergency ? 'emergency' : ''}`;
  }

  postUserMessage(text) {
    const container = document.getElementById('hud-assistant-chat');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-message user';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  postAssistantMessage(text) {
    const container = document.getElementById('hud-assistant-chat');
    if (!container) return;
    const isEmergency = this.activeAgentName === 'emergency' && window.simState?.activeEmergency;
    const div = document.createElement('div');
    div.className = `chat-message assistant ${isEmergency ? 'emergency' : ''}`;
    div.innerHTML = `
      <strong style="color:var(--neon-blue);display:block;margin-bottom:4px;font-size:0.7rem;">
        [${this.activeAgentName.toUpperCase()} AGENT]
      </strong>
      ${text}
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  respondToAssistantQuery(query) {
    const q = query.toLowerCase();
    const responses = {
      crowd: 'Ingress rates nominal at Gates A, D, E. Gates B and F showing moderate-high queue. AI rerouting messages active on digital boards.',
      navigation: 'All elevator nodes active. Route optimization avoiding Section 102 congestion. Accessible paths computed for 3 destinations.',
      emergency: window.simState?.activeEmergency
        ? `Executing ${window.simState.activeEmergency.type} response plan. PA broadcast queued in 5 languages. All units mobilized.`
        : 'All emergency sensors nominal. AED units checked at 100% capacity. No active incidents.',
      volunteer: 'All shift stewards checked in. VOL-115 dispatched to turnstile clearing. Roster at 94% coverage.',
      translation: 'Linguistic engines active for 7 languages. Emergency safety terminology cross-referenced. PA broadcast ready.',
      sustainability: 'Solar grid generating 350 kW. Net draw at 480 kW. EV charger throttling active in Lot P4.',
      analytics: 'Attendance trending +2.1% vs forecast. Gate B anomaly flagged in executive brief. Transport KPIs above target.',
      unified: 'All agents coordinating. Match simulation nominal. Stadium operating within parameters.'
    };

    const reply = responses[this.activeAgentName] || responses.unified;
    this.postAssistantMessage(reply);
  }
}

// ============================================================
// BOOTSTRAP
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app._exposeGlobal();
  app.init().catch(err => console.error('OS Boot failure:', err));

  // Global helpers for inline references in other modules
  window.dispatchReroute = (gateId) => {
    window.logOperation('Crowd Agent', `Rerouting overflow from Gate ${gateId} to auxiliary checkpoints.`, 'info');
    app.showFloatingNotification({
      icon: '🔀',
      title: `Gate ${gateId} Rerouted`,
      desc: `Digital boards directing visitors away from Gate ${gateId}.`,
      type: 'info'
    });
  };

  window.sendPAToTranslation = () => {
    if (!window.simState.activeEmergency) return;
    document.querySelector('.nav-item[data-tab="translation"] button')?.click();
    window.logOperation('Emergency Agent', 'Emergency PA pushed to Translation Hub.', 'info');
  };

  window.toggleTaskStatus = (taskId) => {
    app.agents.volunteer?.toggleTask(taskId);
  };
});

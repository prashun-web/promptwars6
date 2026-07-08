/**
 * FIFA AI Command Center — Static Data Store
 * Contains ONLY application data constants (stadium, volunteers, incidents, etc.)
 * All utility functions have been moved to js/core/*.js modules.
 *
 * SECURITY NOTE: No credentials, API keys, or secrets are stored here.
 * Config is read from environment at runtime (or the Settings UI for the sandbox).
 */
(function (global) {
  'use strict';

  // ── Application environment (no secrets) ────────────────────────────────
  global.appConfig = Object.freeze({
    env:             'development-simulation-sandbox',
    apiEndpoint:     'https://api.fifa2026.internal/v1/stadium-operations',
    version:         '4.26.0',
  });

  // ── Skeleton loader helper (kept here for backward compat) ───────────────
  global.createSkeletonLoader = function (lines) {
    lines = Math.max(1, Math.min(10, lines || 3));
    var frag = document.createDocumentFragment();
    var wrapper = document.createElement('div');
    wrapper.className = 'skeleton-wrapper';
    wrapper.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < lines; i++) {
      var line = document.createElement('div');
      line.className = 'skeleton-line skeleton-w-' + (80 - i * 15);
      wrapper.appendChild(line);
    }
    frag.appendChild(wrapper);
    // Return the outer HTML string for innerHTML usages (legacy)
    var tmp = document.createElement('div');
    tmp.appendChild(frag.cloneNode(true));
    return tmp.innerHTML;
  };

  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║  STADIUM DATA                                                        ║
  // ╚══════════════════════════════════════════════════════════════════════╝
  global.stadiumData = Object.freeze({
    gates: Object.freeze([
      Object.freeze({ id: 'A', name: 'Gate A (North)',     x: 300, y:  70, density: 0.35, capacity: 5000, status: 'nominal'   }),
      Object.freeze({ id: 'B', name: 'Gate B (North-East)',x: 460, y: 140, density: 0.85, capacity: 6000, status: 'congested' }),
      Object.freeze({ id: 'C', name: 'Gate C (South-East)',x: 460, y: 460, density: 0.58, capacity: 5500, status: 'moderate'  }),
      Object.freeze({ id: 'D', name: 'Gate D (South)',     x: 300, y: 530, density: 0.22, capacity: 5000, status: 'nominal'   }),
      Object.freeze({ id: 'E', name: 'Gate E (South-West)',x: 140, y: 460, density: 0.45, capacity: 5500, status: 'nominal'   }),
      Object.freeze({ id: 'F', name: 'Gate F (North-West)',x: 140, y: 140, density: 0.92, capacity: 6000, status: 'critical'  }),
    ]),
    sections: Object.freeze([
      Object.freeze({ id: '101', name: 'Section 101', level: 'lower', x: 380, y: 220, occupancy: 0.92 }),
      Object.freeze({ id: '102', name: 'Section 102', level: 'lower', x: 380, y: 380, occupancy: 0.88 }),
      Object.freeze({ id: '103', name: 'Section 103', level: 'lower', x: 220, y: 380, occupancy: 0.95 }),
      Object.freeze({ id: '104', name: 'Section 104', level: 'lower', x: 220, y: 220, occupancy: 0.91 }),
      Object.freeze({ id: '201', name: 'Section 201', level: 'mid',   x: 300, y: 140, occupancy: 0.78 }),
      Object.freeze({ id: '202', name: 'Section 202', level: 'mid',   x: 460, y: 300, occupancy: 0.82 }),
      Object.freeze({ id: '203', name: 'Section 203', level: 'mid',   x: 300, y: 460, occupancy: 0.80 }),
      Object.freeze({ id: '204', name: 'Section 204', level: 'mid',   x: 140, y: 300, occupancy: 0.74 }),
    ]),
    pois: Object.freeze([
      Object.freeze({ id: 'wc_north',        name: 'Restrooms North',          type: 'restroom',    x: 300, y: 100, accessible: true  }),
      Object.freeze({ id: 'wc_south',        name: 'Restrooms South',          type: 'restroom',    x: 300, y: 500, accessible: true  }),
      Object.freeze({ id: 'wc_east',         name: 'Restrooms East',           type: 'restroom',    x: 480, y: 300, accessible: false }),
      Object.freeze({ id: 'wc_west',         name: 'Restrooms West',           type: 'restroom',    x: 120, y: 300, accessible: true  }),
      Object.freeze({ id: 'med_east',        name: 'Medical Station East',     type: 'medical',     x: 400, y: 270, accessible: true  }),
      Object.freeze({ id: 'med_west',        name: 'Medical Station West',     type: 'medical',     x: 200, y: 330, accessible: true  }),
      Object.freeze({ id: 'food_north',      name: 'Food Court North',         type: 'food',        x: 370, y: 120, accessible: true  }),
      Object.freeze({ id: 'food_south',      name: 'Food Court South',         type: 'food',        x: 230, y: 480, accessible: true  }),
      Object.freeze({ id: 'concess_east',    name: 'Concessions East',         type: 'concession',  x: 430, y: 250, accessible: true  }),
      Object.freeze({ id: 'concess_west',    name: 'Concessions West',         type: 'concession',  x: 170, y: 350, accessible: false }),
      Object.freeze({ id: 'exit_north',      name: 'Emergency Exit North',     type: 'exit',        x: 300, y:  40, accessible: true  }),
      Object.freeze({ id: 'exit_south',      name: 'Emergency Exit South',     type: 'exit',        x: 300, y: 560, accessible: true  }),
      Object.freeze({ id: 'transport_metro', name: 'Metro Transit Station',    type: 'transport',   x: 550, y: 300, accessible: true  }),
      Object.freeze({ id: 'transport_bus',   name: 'West Bus Terminus',        type: 'transport',   x:  50, y: 300, accessible: true  }),
    ]),
  });

  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║  FAN FAQ DATA                                                        ║
  // ╚══════════════════════════════════════════════════════════════════════╝
  global.fanQuestionsData = Object.freeze([
    Object.freeze({
      keywords: Object.freeze(['washroom', 'toilet', 'restroom', 'wc', 'bathroom']),
      answer: 'Restrooms are located on all concourses. Accessible facilities are available near Sections 101, 102, 104, 201, 203, and 204. Use the Smart Navigation tab to display the shortest route from your current section.',
      agent: 'Navigation Agent',
    }),
    Object.freeze({
      keywords: Object.freeze(['vegetarian', 'vegan', 'food', 'eat', 'meal', 'halal', 'kosher', 'gluten']),
      answer: 'Food Court North (near Section 201) and Concessions East offer full vegetarian, vegan, and gluten-free options. Halal certified hotdogs and wraps are available at Concessions East.',
      agent: 'Sustainability Agent',
    }),
    Object.freeze({
      keywords: Object.freeze(['wheelchair', 'accessible', 'disabled', 'elevator', 'ramp', 'stairs']),
      answer: 'FIFA World Cup 2026 stadiums are fully accessible. Elevators are situated at Gates A, C, D, and E. Accessible ramps lead directly to lower bowl Sections 101–104. Rerouting functions in the Navigation panel will automatically avoid stairs.',
      agent: 'Navigation Agent',
    }),
    Object.freeze({
      keywords: Object.freeze(['lost', 'child', 'missing', 'separated', 'kid', 'find my']),
      answer: 'If you have lost a child, please alert the nearest volunteer (wearing neon green vests) immediately or proceed to the Guest Services Desk at Gate A. Security protocol "Alpha-Child" will be initiated to monitor all gates.',
      agent: 'Emergency Agent',
    }),
    Object.freeze({
      keywords: Object.freeze(['parking', 'car', 'vehicle', 'drive', 'garage', 'park']),
      answer: 'Official FIFA Parking Lots (P1–P4) require pre-booked passes. Lot P1 (North Entrance) has EV charging. Shuttle service runs from Lot P3 to Gate D. If parking is full, we recommend taking the Metro directly to the transit link at Gate C/East side.',
      agent: 'Crowd Agent',
    }),
    Object.freeze({
      keywords: Object.freeze(['seat', 'find', 'ticket', 'row', 'gate', 'section']),
      answer: 'Your ticket specifies your gate. Enter through the corresponding gate (e.g. Gate F for Northwest sections) to avoid long walks. Sections 101–104 are lower bowl, 201–204 are middle bowl, and 301+ are upper tier.',
      agent: 'Navigation Agent',
    }),
    Object.freeze({
      keywords: Object.freeze(['medical', 'help', 'sick', 'hurt', 'doctor', 'first aid', 'injury', 'ambulance']),
      answer: 'First aid stations are located near Gate B (Medical Station East) and Gate E (Medical Station West). In a severe medical emergency, notify any staff member or press the "Medical Alert" emergency button on our HUD.',
      agent: 'Emergency Agent',
    }),
    Object.freeze({
      keywords: Object.freeze(['sustainability', 'eco', 'green', 'carbon', 'recycling', 'cup', 'waste']),
      answer: 'We aim for net-zero operations. Zero-waste bins are located throughout the concourses. Reusable souvenir cups can be refilled at any water station. Turnstiles and lights are powered by our rooftop solar array.',
      agent: 'Sustainability Agent',
    }),
  ]);

  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║  VOLUNTEER DATA                                                      ║
  // ╚══════════════════════════════════════════════════════════════════════╝
  global.volunteersData = Object.freeze({
    volunteers: Object.freeze([
      Object.freeze({ id: 'VOL-104', name: 'Mateo Silva',   role: 'Gate Usher',        location: 'Gate B',                  status: 'Active',   battery: 82, radioStatus: 'Nominal'     }),
      Object.freeze({ id: 'VOL-210', name: 'Chloe Dupont',  role: 'Section Steward',   location: 'Section 102',             status: 'Active',   battery: 95, radioStatus: 'Nominal'     }),
      Object.freeze({ id: 'VOL-058', name: 'Yuki Tanaka',   role: 'Access Guide',      location: 'Gate E (Elevator)',       status: 'On Break', battery: 41, radioStatus: 'Weak Signal' }),
      Object.freeze({ id: 'VOL-302', name: 'Carlos Gomez',  role: 'First Aid Assist',  location: 'Medical Station East',    status: 'Transit',  battery: 78, radioStatus: 'Nominal'     }),
      Object.freeze({ id: 'VOL-115', name: 'Amara Diallo',  role: 'Crowd Marshall',    location: 'Gate F',                  status: 'Active',   battery: 63, radioStatus: 'Offline'     }),
    ]),
    tasks: Object.freeze([
      Object.freeze({ id: 'TSK-001', title: 'Inspect Turnstile Scanners',                   assignedTo: 'Mateo Silva',   priority: 'Medium',   status: 'Completed',  due: '18:00' }),
      Object.freeze({ id: 'TSK-002', title: 'Assist wheelchair access at Gate E elevator',  assignedTo: 'Yuki Tanaka',   priority: 'High',     status: 'In Progress',due: '18:45' }),
      Object.freeze({ id: 'TSK-003', title: 'Gate B Overflow Redirect Coordination',        assignedTo: 'Amara Diallo',  priority: 'Critical', status: 'Pending',    due: 'ASAP'  }),
      Object.freeze({ id: 'TSK-004', title: 'Check concession lines at East Plaza',         assignedTo: 'Unassigned',    priority: 'Low',      status: 'Unassigned', due: '19:15' }),
      Object.freeze({ id: 'TSK-005', title: 'Deploy signs for Gate D exit paths',           assignedTo: 'Carlos Gomez',  priority: 'Medium',   status: 'In Progress',due: '19:00' }),
    ]),
    equipment: Object.freeze([
      Object.freeze({ name: 'Handheld Ticket Scanners',                total: 120, active: 105, faulty: 3, issues: Object.freeze(['Scanner #12: Calibration error at Gate B', 'Scanner #45: Laser timeout at Gate F']) }),
      Object.freeze({ name: 'Tactical Radios (Ch 4)',                  total:  85, active:  78, faulty: 2, issues: Object.freeze(['Unit #08: Microphone failure', 'Unit #15: Battery charging fault']) }),
      Object.freeze({ name: 'Automated External Defibrillators (AED)', total:  32, active:  32, faulty: 0, issues: Object.freeze([]) }),
      Object.freeze({ name: 'High-Visibility LED Vests',               total: 200, active: 180, faulty: 0, issues: Object.freeze([]) }),
    ]),
    troubleshooter: Object.freeze({
      scanners: Object.freeze({
        reboot:  'Hold POWER + SCAN for 10 seconds. Release when green light flashes. Calibration resets automatically on boot.',
        offline: 'Verify scanner is connected to FIFA-STA-VOL secure Wi-Fi. Check active token validation inside the Settings pane of the scanner app.',
        laser:   'Clean the scan window with microfiber. If error persists, replace the rechargeable battery pack.',
      }),
      radios: Object.freeze({
        static:  'Ensure radio is set to Channel 4 (Command & Ops). If signal is poor, elevate antenna or move 5 metres away from massive concrete structural columns.',
        battery: 'Red blinking light indicates charge is under 15%. Swap with a charged spare battery unit at the volunteer command trailer.',
      }),
    }),
  });

  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║  INCIDENT TEMPLATES                                                  ║
  // ╚══════════════════════════════════════════════════════════════════════╝
  global.incidentTemplatesData = Object.freeze({
    fire: Object.freeze({
      priority: 'CRITICAL',
      summary: 'Localized fire detected in concession area Section 202. Sprinkler system activated. Emergency containment protocols initiated.',
      actionPlan: Object.freeze([
        'Isolate electricity and gas utilities supplying Section 202 concessions.',
        'Dispatch Local Fire Response Unit and emergency services.',
        'Clear smoke venting routes in East Plaza.',
        'Establish primary safety cordon 100 metres around Section 202.',
        'Initiate phased evacuation of Section 202 towards Gate C.',
      ]),
      volunteerInstructions: Object.freeze([
        'Steward Mateo Silva to stand at Section 202 stairs to guide fans away from smoke.',
        'All active Gate C ushers prepare gates to open wide for exit routing.',
        'Volunteer Carlos Gomez to assist medical teams at East Medical Hub.',
      ]),
      paScript: 'ATTENTION PLEASE. An operational incident has occurred in Section 202. Please follow instructions from stewards and proceed calmly to Gate C. Do not run. Elevators are disabled for safety. Use stairs.',
      exit: 'Gate C (South-East Exit)',
    }),
    medical: Object.freeze({
      priority: 'HIGH',
      summary: 'Cardiac arrest reported in Section 103, Row M. AED dispatch and medical subagent response required immediately.',
      actionPlan: Object.freeze([
        'Alert Medical Hub West and dispatch nearest paramedics.',
        'Notify Volunteer Yuki Tanaka to guide medical team from Gate E.',
        'Provide chest compression coaching to bystander on call.',
        'Clear spectator access walkway in Section 103.',
      ]),
      volunteerInstructions: Object.freeze([
        'Yuki Tanaka to immediately fetch AED from elevator bay and move to Sec 103 Row M.',
        'Amara Diallo to secure elevator at Gate E for paramedic stretcher access.',
      ]),
      paScript: 'NO STADIUM BROADCAST NEEDED. Stewards in Section 103, please clear Row M stairs for emergency access. Bystanders follow first aider directions.',
      exit: 'Gate E (Elevator Access)',
    }),
    security: Object.freeze({
      priority: 'HIGH',
      summary: 'Physical altercation / pitch invasion hazard developing near lower bowl barrier in Section 104.',
      actionPlan: Object.freeze([
        'Deploy Security Response Team Bravo to barriers at Section 104.',
        'Lock down pitch-access gates in Northwest quadrant.',
        'Isolate CCTV camera feeds 08, 09, 10 to Command Room main screens.',
        'Notify local police dispatch unit on standby.',
      ]),
      volunteerInstructions: Object.freeze([
        'Stewards in adjacent Section 101 to keep spectators in their seats.',
        'Amara Diallo at Gate F to stand by for emergency police ingress guidance.',
      ]),
      paScript: 'LADIES AND GENTLEMEN. We remind you that entering the field of play is a federal offense. Violators will be prosecuted. Please remain in your seats.',
      exit: 'Gate F (North-West Exit)',
    }),
    lost_child: Object.freeze({
      priority: 'MEDIUM',
      summary: 'Separated 7-year-old child (wearing blue jersey, white cap) reported near Gate A concessions.',
      actionPlan: Object.freeze([
        'Initiate Protocol Alpha-Child. Circulate photo/description to volunteer devices.',
        'Lock down outer gates A and F for visual check-out of departing children.',
        'Deploy guest services agent to coordinate with parent at Gate A info desk.',
        'Review CCTV footage around Gate A from last 15 minutes.',
      ]),
      volunteerInstructions: Object.freeze([
        'Mateo Silva to check toilets near Gate A.',
        'Chloe Dupont to monitor Section 102 exit flows for matching description.',
        'Yuki Tanaka to broadcast description to outer plaza shuttle drivers.',
      ]),
      paScript: 'ATTENTION SPECTATORS. FIFA Guest Services is assisting a young fan named Leo, aged 7, wearing a blue jersey. If you have any information, please report to the nearest Guest Services kiosk.',
      exit: 'Gate A (Main Info Desk)',
    }),
    power: Object.freeze({
      priority: 'CRITICAL',
      summary: 'Power grid fluctuation causes partial blackout in lighting grid West (Gates E & F). Auxiliary batteries operational.',
      actionPlan: Object.freeze([
        'Activate stadium backup generator group 2 (West concourses).',
        'Switch emergency signs and floodlights to battery power.',
        'Send technical engineering team to substation West.',
        'Broadcast status update to security staff handhelds.',
      ]),
      volunteerInstructions: Object.freeze([
        'All West stewards (Gate E/F) turn on high-visibility LED vests and flashlight wands.',
        'Chloe Dupont to position at Section 102 entrance to prevent panic during low-light transitions.',
      ]),
      paScript: 'LADIES AND GENTLEMEN. We are experiencing a minor electrical power fluctuation. Back-up systems are online. The match is continuing. Please remain seated.',
      exit: 'Gate A & D (Fully Illuminated Exits)',
    }),
    panic: Object.freeze({
      priority: 'CRITICAL',
      summary: 'Sudden crowd crush threat due to blockages at Gate F exit corridor. High congestion alert.',
      actionPlan: Object.freeze([
        'Open all side barriers and auxiliary gates at Gate F corridor.',
        'Halt incoming flows from Section 104 into Gate F corridor; redirect to Gate A.',
        'Activate emergency warning boards on concourses.',
        'Deploy crowd control stewards to Gate F bottleneck.',
      ]),
      volunteerInstructions: Object.freeze([
        'Amara Diallo to open emergency exit F-3 manually.',
        'Chloe Dupont to direct Section 104 egress towards Gate A.',
        'Mateo Silva to manage the line split at the Gate B/F crossroads.',
      ]),
      paScript: 'ATTENTION ALL FANS. Gate F is heavily congested. For your safety, please follow stewards\' instructions and redirect towards Gate A. Repeat, redirect towards Gate A.',
      exit: 'Gate A (North Exit)',
    }),
  });

  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║  ANALYTICS HISTORY DATA                                              ║
  // ╚══════════════════════════════════════════════════════════════════════╝
  global.analyticsHistoryData = Object.freeze({
    crowdTrend: Object.freeze([
      Object.freeze({ time: '15:00', density:  10, capacity: 0.10 }),
      Object.freeze({ time: '16:00', density:  25, capacity: 0.25 }),
      Object.freeze({ time: '17:00', density:  50, capacity: 0.50 }),
      Object.freeze({ time: '18:00', density:  85, capacity: 0.85 }),
      Object.freeze({ time: '19:00', density:  94, capacity: 0.94 }),
      Object.freeze({ time: '20:00', density:  98, capacity: 0.98 }),
      Object.freeze({ time: '21:00', density:  70, capacity: 0.70 }),
      Object.freeze({ time: '22:00', density:  20, capacity: 0.20 }),
    ]),
    incidents: Object.freeze([
      Object.freeze({ match: 'Match 1',          medical: 2, security: 1, other: 0 }),
      Object.freeze({ match: 'Match 2',          medical: 4, security: 0, other: 1 }),
      Object.freeze({ match: 'Match 3',          medical: 1, security: 3, other: 2 }),
      Object.freeze({ match: 'Match 4 (Quarter)',medical: 3, security: 2, other: 0 }),
      Object.freeze({ match: 'Match 5 (Semi)',   medical: 5, security: 4, other: 1 }),
      Object.freeze({ match: 'Match 6 (Finals)', medical: 2, security: 1, other: 2 }),
    ]),
    transportTimes: Object.freeze([
      Object.freeze({ type: 'Metro Transit',       queue: 18, status: 'nominal'   }),
      Object.freeze({ type: 'West Bus Hub',        queue: 32, status: 'congested' }),
      Object.freeze({ type: 'Rideshare Lot P4',    queue: 25, status: 'moderate'  }),
      Object.freeze({ type: 'Pedestrian Walkways', queue:  5, status: 'nominal'   }),
    ]),
    energyUsage: Object.freeze({
      solarGenerationKw:  350,
      gridDrawKw:         480,
      wasteRecyclingRate:  92,
      waterSavedGallons: 12500,
      hourlySolar: Object.freeze([
        Object.freeze({ hour: '12:00', kw: 300 }),
        Object.freeze({ hour: '13:00', kw: 420 }),
        Object.freeze({ hour: '14:00', kw: 450 }),
        Object.freeze({ hour: '15:00', kw: 380 }),
        Object.freeze({ hour: '16:00', kw: 290 }),
        Object.freeze({ hour: '17:00', kw: 180 }),
        Object.freeze({ hour: '18:00', kw:  40 }),
        Object.freeze({ hour: '19:00', kw:   0 }),
      ]),
    }),
  });

}(window));

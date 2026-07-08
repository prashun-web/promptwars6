/**
 * FIFA AI Command Center — Application Constants
 * Single source of truth for all magic numbers and configuration values.
 * @module constants
 */
(function (global) {
  'use strict';

  global.FIFA_CONSTANTS = Object.freeze({

    // ── Stadium ─────────────────────────────────────────────────────────────
    STADIUM: Object.freeze({
      CAPACITY:            82500,
      FANS_PER_DENSITY_PT: 820,   // fans = density * FANS_PER_DENSITY_PT
      GATE_IDS:            Object.freeze(['A', 'B', 'C', 'D', 'E', 'F']),
      SECTION_IDS:         Object.freeze(['101', '102', '103', '104', '201', '202', '203', '204']),
    }),

    // ── Density thresholds ──────────────────────────────────────────────────
    DENSITY: Object.freeze({
      CRITICAL:   0.90,
      CONGESTED:  0.75,
      MODERATE:   0.50,
      NOISE_GATE: 0.05,   // max random ± noise per tick
      NOISE_SEC:  0.02,   // max random ± noise per tick (sections)
    }),

    // ── Simulation ──────────────────────────────────────────────────────────
    SIM: Object.freeze({
      TICK_INTERVAL_MS:     3000,
      MATCH_TOTAL_MINUTES:  90,
      HALFTIME_MINUTE:      45,
      SOLAR_DECAY_MINUTE:   60,
      SOLAR_DECAY_KW:       3,
      WEATHER_CHANGE_PROB:  0.88,   // probability gate for weather fluctuation
    }),

    // ── Boot sequence ───────────────────────────────────────────────────────
    BOOT: Object.freeze({
      LOG_DELAY_MS:         320,    // ms between each boot log line
      BIOMETRIC_SCAN_MS:    1400,
      BIOMETRIC_DISMISS_MS: 900,
      FORM_AUTH_MS:         800,
      FORM_DISMISS_MS:      700,
      DISMISS_FADE_MS:      650,
      RING_CIRCUMFERENCE:   339,    // 2 * π * 54 (SVG ring r=54)
    }),

    // ── Notifications ───────────────────────────────────────────────────────
    NOTIFICATION: Object.freeze({
      TOAST_AUTO_DISMISS_MS:  6000,
      TOAST_REMOVE_FADE_MS:   300,
      TOAST_MAX_VISIBLE:      3,
      SCHEDULE_FIRST_MS:      5000,
      SCHEDULE_MIN_INTERVAL:  12000,
      SCHEDULE_RAND_RANGE:    18000,
    }),

    // ── Operations log ──────────────────────────────────────────────────────
    LOG: Object.freeze({
      MAX_ENTRIES:    50,
      MAX_VISIBLE:    30,
    }),

    // ── Timeline ────────────────────────────────────────────────────────────
    TIMELINE: Object.freeze({
      MAX_ITEMS:      12,
      INITIAL_COUNT:  5,
      INITIAL_DELAY:  300,    // ms between initial batch
      SCHEDULE_MIN:   8000,
      SCHEDULE_RAND:  10000,
      FIRST_SCHED_MS: 6000,
    }),

    // ── Navigation ──────────────────────────────────────────────────────────
    NAV: Object.freeze({
      STADIUM_CENTER_X:     300,
      STADIUM_CENTER_Y:     300,
      PITCH_RADIUS:         110,
      DETOUR_BUFFER:        20,
      METRES_PER_SVG_UNIT:  0.6,
      WALK_SPEED_NORMAL:    1.3,   // m/s
      WALK_SPEED_ACCESSIBLE:0.9,
      WALK_SPEED_EMERGENCY: 2.5,
      CURVE_OVERHEAD:       1.25,  // path-length multiplier for curved routes
      STRAIGHT_OVERHEAD:    1.05,
    }),

    // ── Analytics ───────────────────────────────────────────────────────────
    ANALYTICS: Object.freeze({
      CHART_DEBOUNCE_MS: 500,
    }),

    // ── Crowd queue estimation ───────────────────────────────────────────────
    CROWD: Object.freeze({
      QUEUE_MINUTES_PER_DENSITY:  12,
      FLOW_PER_MIN_PER_DENSITY:   80,
      MAX_SECTION_SEATS:          8500,
    }),

  });

}(window));

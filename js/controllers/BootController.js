/**
 * FIFA AI Command Center — BootController
 * Single responsibility: boot sequence animation and operator authentication.
 * @module BootController
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;
  var C   = global.FIFA_CONSTANTS;

  function BootController(bootLogs, onComplete) {
    if (!Array.isArray(bootLogs)) throw new Error('[BootController] bootLogs must be an array.');
    if (typeof onComplete !== 'function') throw new Error('[BootController] onComplete must be a function.');
    this._bootLogs   = bootLogs;
    this._onComplete = onComplete;
  }

  /**
   * Start the boot sequence — renders logs then hooks auth buttons.
   */
  BootController.prototype.run = function () {
    var bootScreen = DOM.byId('boot-screen');
    if (!bootScreen) {
      // Already dismissed or not in DOM — call complete immediately
      this._onComplete();
      return;
    }

    var term    = DOM.byId('boot-log-terminal');
    var ringEl  = DOM.byId('boot-ring-progress');

    if (term) {
      DOM.clearChildren(term);
      this._animateLogs(term, ringEl);
    }

    this._hookButtons(bootScreen, term);
  };

  // ── Private ──────────────────────────────────────────────────────────────

  BootController.prototype._animateLogs = function (term, ringEl) {
    var logs  = this._bootLogs;
    var total = logs.length;
    var circ  = C.BOOT.RING_CIRCUMFERENCE;

    logs.forEach(function (log, idx) {
      setTimeout(function () {
        var line = document.createElement('div');
        if (log.color) {
          line.style.color      = log.color;
          line.style.fontWeight = '600';
          line.textContent      = '> ' + log.text;
        } else if (log.ok) {
          // Safe inline construction — no user-supplied data
          line.style.color = '#4a6080';
          line.textContent = '> ' + log.text.replace('...', '');
          var ok = document.createElement('span');
          ok.style.color      = 'var(--neon-green)';
          ok.style.fontWeight = '600';
          ok.textContent      = '  [OK]';
          line.appendChild(ok);
        } else {
          line.textContent = '> ' + log.text;
        }
        term.appendChild(line);
        term.scrollTop = term.scrollHeight;

        if (ringEl) {
          var pct = ((idx + 1) / total) * circ;
          ringEl.style.strokeDasharray = pct + ' ' + circ;
        }
      }, idx * C.BOOT.LOG_DELAY_MS);
    });
  };

  BootController.prototype._hookButtons = function (bootScreen, term) {
    var self = this;

    // ── Biometric button ──────────────────────────────────────────────────
    var bioBtn = DOM.byId('boot-biometric-btn');
    if (bioBtn) {
      // Clone to remove any prior listeners
      var newBio = bioBtn.cloneNode(true);
      bioBtn.parentNode.replaceChild(newBio, bioBtn);

      newBio.addEventListener('click', function () {
        newBio.classList.add('scanning');
        var scanText = newBio.querySelector('.scanner-text');
        if (scanText) scanText.textContent = 'SCANNING...';

        setTimeout(function () {
          newBio.classList.remove('scanning');
          var icon = newBio.querySelector('.scan-finger-icon');
          if (icon)     icon.textContent     = '\u2705';
          if (scanText) scanText.textContent = 'IDENTITY VERIFIED';
          newBio.style.borderColor = 'var(--neon-green)';
          newBio.style.color       = 'var(--neon-green)';
          newBio.style.borderStyle = 'solid';

          if (term) {
            var line = document.createElement('div');
            line.style.color      = 'var(--neon-green)';
            line.style.fontWeight = '600';
            line.textContent      = '> BIOMETRICS MATCHED. AUTHORIZATION GRANTED. WELCOME, Operator.';
            term.appendChild(line);
            term.scrollTop = term.scrollHeight;
          }

          setTimeout(function () { self._dismiss(bootScreen); }, C.BOOT.BIOMETRIC_DISMISS_MS);
        }, C.BOOT.BIOMETRIC_SCAN_MS);
      });
    }

    // ── Manual login form ─────────────────────────────────────────────────
    var form = DOM.byId('boot-login-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.textContent = 'Authorizing...'; submitBtn.disabled = true; }

        setTimeout(function () {
          if (term) {
            var line = document.createElement('div');
            line.style.color      = 'var(--neon-green)';
            line.style.fontWeight = '600';
            line.textContent      = '> SECURITY TOKENS VALIDATED. ACCESS GRANTED.';
            term.appendChild(line);
            term.scrollTop = term.scrollHeight;
          }
          setTimeout(function () { self._dismiss(bootScreen); }, C.BOOT.FORM_DISMISS_MS);
        }, C.BOOT.FORM_AUTH_MS);
      });
    }
  };

  BootController.prototype._dismiss = function (bootScreen) {
    if (!bootScreen) return;
    bootScreen.classList.add('fade-out');
    var self = this;
    setTimeout(function () {
      bootScreen.style.display = 'none';
      self._onComplete();
    }, C.BOOT.DISMISS_FADE_MS);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.BootController = BootController;

}(window));

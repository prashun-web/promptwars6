/**
 * FIFA AI Command Center — NotificationController
 * Single responsibility: floating toast notifications and scheduling.
 * @module NotificationController
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;
  var C   = global.FIFA_CONSTANTS;
  var S   = global.Sanitizer;

  function NotificationController() {
    this._scheduleTimer = null;
  }

  /**
   * Show a single floating toast.
   * @param {{icon:string, title:string, desc:string, type:string}} opts
   */
  NotificationController.prototype.show = function (opts) {
    var container = DOM.byId('notification-toaster');
    if (!container) return;

    // Enforce max visible cap
    while (container.children.length >= C.NOTIFICATION.TOAST_MAX_VISIBLE) {
      container.removeChild(container.firstChild);
    }

    var toast = DOM.createElement('div', {
      className: 'notif-toast ' + (opts.type || 'info'),
      role:      'alert',
    });

    var iconSpan = DOM.createElement('span', { className: 'toast-icon' }, opts.icon || '');

    var body     = DOM.createElement('div', { className: 'toast-body' });
    body.appendChild(DOM.createElement('div', { className: 'toast-title' }, S.sanitizeHTML(opts.title || '')));
    body.appendChild(DOM.createElement('div', { className: 'toast-desc'  }, S.sanitizeHTML(opts.desc  || '')));

    var closeBtn = DOM.createElement('button', {
      className:  'toast-close',
      type:       'button',
      'aria-label': 'Dismiss notification',
    }, '\u2715');

    toast.appendChild(iconSpan);
    toast.appendChild(body);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    var self    = this;
    var dismiss = function () {
      toast.classList.add('removing');
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, C.NOTIFICATION.TOAST_REMOVE_FADE_MS);
    };

    toast.addEventListener('click', dismiss);
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); dismiss(); });
    setTimeout(dismiss, C.NOTIFICATION.TOAST_AUTO_DISMISS_MS);

    // Update badge
    var badge = DOM.byId('notif-badge');
    if (badge) {
      var count = parseInt(badge.textContent, 10) || 0;
      badge.textContent = count + 1;
      badge.setAttribute('aria-label', (count + 1) + ' unread notifications');
    }
  };

  /**
   * Schedule automatic notifications from a pool.
   * @param {Array<{icon:string, title:string, desc:string, type:string}>} pool
   */
  NotificationController.prototype.schedule = function (pool) {
    if (!Array.isArray(pool) || pool.length === 0) return;
    var self = this;
    var idx  = 0;

    var showNext = function () {
      self.show(pool[idx % pool.length]);
      idx++;
      var delay = C.NOTIFICATION.SCHEDULE_MIN_INTERVAL + Math.random() * C.NOTIFICATION.SCHEDULE_RAND_RANGE;
      self._scheduleTimer = setTimeout(showNext, delay);
    };

    this._scheduleTimer = setTimeout(showNext, C.NOTIFICATION.SCHEDULE_FIRST_MS);
  };

  /**
   * Stop scheduled notifications.
   */
  NotificationController.prototype.stopSchedule = function () {
    clearTimeout(this._scheduleTimer);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.NotificationController = NotificationController;

}(window));

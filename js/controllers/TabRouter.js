/**
 * FIFA AI Command Center — TabRouter
 * Single responsibility: tab navigation and viewport module switching.
 * @module TabRouter
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;

  function TabRouter() {
    this._activeTabId = 'dashboard';
    this._onTabChange = null;
  }

  /**
   * Initialise routing.
   * @param {Function} [onTabChange]  — callback(tabId) called after every switch
   */
  TabRouter.prototype.init = function (onTabChange) {
    this._onTabChange = typeof onTabChange === 'function' ? onTabChange : null;
    this._bindNavItems();
  };

  /**
   * Programmatically navigate to a tab.
   * @param {string} tabId
   */
  TabRouter.prototype.navigateTo = function (tabId) {
    var item = document.querySelector('.nav-item[data-tab="' + tabId + '"]');
    if (item) {
      var btn = item.querySelector('button');
      if (btn) btn.click();
    }
  };

  TabRouter.prototype.getActiveTab = function () {
    return this._activeTabId;
  };

  // ── Private ──────────────────────────────────────────────────────────────

  TabRouter.prototype._bindNavItems = function () {
    var self     = this;
    var navItems = DOM.qsa('.nav-item');
    var modules  = DOM.qsa('.viewport-module');

    navItems.forEach(function (item) {
      var button = item.querySelector('button');
      if (!button) return;

      button.addEventListener('click', function () {
        var tabId = item.getAttribute('data-tab');
        if (!tabId) return;

        // Update nav state
        navItems.forEach(function (n) {
          n.classList.remove('active');
          var b = n.querySelector('button');
          if (b) b.setAttribute('aria-current', 'false');
        });
        item.classList.add('active');
        button.setAttribute('aria-current', 'page');

        // Show correct module
        modules.forEach(function (m) {
          m.classList.toggle('active', m.id === 'module-' + tabId);
        });

        self._activeTabId = tabId;
        global.logOperation('Navigation', 'Viewport shifted to: ' + tabId.toUpperCase());
        global.eventBus.emit('tab_changed', tabId);

        if (self._onTabChange) {
          self._onTabChange(tabId);
        }
      });
    });
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.TabRouter = TabRouter;

}(window));

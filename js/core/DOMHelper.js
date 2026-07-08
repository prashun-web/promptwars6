/**
 * FIFA AI Command Center — DOMHelper
 * Safe, null-protected DOM utilities.
 * Centralizes all DOM queries and element creation so agents stay DOM-agnostic.
 * NEVER throws on missing elements — always returns null/false with a warning.
 * @module DOMHelper
 */
(function (global) {
  'use strict';

  /**
   * Null-safe getElementById.
   * @param {string} id
   * @returns {HTMLElement|null}
   */
  function byId(id) {
    var el = document.getElementById(id);
    if (!el) {
      // Only warn in development; not in tests that deliberately check missing
      // elements. Suppress warning if id ends with '-mock'.
      if (id && id.indexOf('-mock') === -1) {
        console.debug('[DOMHelper] Element not found: #' + id);
      }
    }
    return el || null;
  }

  /**
   * Null-safe querySelector.
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {Element|null}
   */
  function qs(selector, context) {
    try {
      return (context || document).querySelector(selector) || null;
    } catch (e) {
      console.warn('[DOMHelper] Invalid selector:', selector);
      return null;
    }
  }

  /**
   * Null-safe querySelectorAll — always returns an Array (never NodeList).
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {Array<Element>}
   */
  function qsa(selector, context) {
    try {
      return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    } catch (e) {
      console.warn('[DOMHelper] Invalid selector:', selector);
      return [];
    }
  }

  /**
   * Set an element's text content safely (no innerHTML, no XSS).
   * @param {string|HTMLElement} idOrEl
   * @param {string} text
   * @returns {boolean} true if element was found and updated
   */
  function setText(idOrEl, text) {
    var el = typeof idOrEl === 'string' ? byId(idOrEl) : idOrEl;
    if (!el) return false;
    el.textContent = (text === null || text === undefined) ? '' : String(text);
    return true;
  }

  /**
   * Set an element's CSS class list, replacing all existing classes.
   * @param {string|HTMLElement} idOrEl
   * @param {string} className
   * @returns {boolean}
   */
  function setClass(idOrEl, className) {
    var el = typeof idOrEl === 'string' ? byId(idOrEl) : idOrEl;
    if (!el) return false;
    el.className = className || '';
    return true;
  }

  /**
   * Toggle a class on an element.
   * @param {string|HTMLElement} idOrEl
   * @param {string} className
   * @param {boolean} force — add if true, remove if false
   * @returns {boolean}
   */
  function toggleClass(idOrEl, className, force) {
    var el = typeof idOrEl === 'string' ? byId(idOrEl) : idOrEl;
    if (!el) return false;
    el.classList.toggle(className, force);
    return true;
  }

  /**
   * Show or hide an element via aria-hidden attribute.
   * @param {string|HTMLElement} idOrEl
   * @param {boolean} visible
   */
  function setVisible(idOrEl, visible) {
    var el = typeof idOrEl === 'string' ? byId(idOrEl) : idOrEl;
    if (!el) return;
    el.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  /**
   * Set an element's inline style property safely.
   * @param {string|HTMLElement} idOrEl
   * @param {string} prop   CSS property in camelCase
   * @param {string} value
   * @returns {boolean}
   */
  function setStyle(idOrEl, prop, value) {
    var el = typeof idOrEl === 'string' ? byId(idOrEl) : idOrEl;
    if (!el) return false;
    el.style[prop] = value;
    return true;
  }

  /**
   * Create a DOM element with optional attributes and text content.
   * @param {string} tag
   * @param {Object} [attrs]  — key/value attribute pairs
   * @param {string} [text]   — text content (safe, no innerHTML)
   * @returns {HTMLElement}
   */
  function createElement(tag, attrs, text) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'className') {
          el.className = attrs[key];
        } else if (key === 'style' && typeof attrs[key] === 'object') {
          Object.assign(el.style, attrs[key]);
        } else {
          el.setAttribute(key, attrs[key]);
        }
      });
    }
    if (text !== undefined && text !== null) {
      el.textContent = String(text);
    }
    return el;
  }

  /**
   * Append multiple child nodes to a parent.
   * @param {HTMLElement} parent
   * @param {Array<HTMLElement>} children
   */
  function appendChildren(parent, children) {
    if (!parent || !Array.isArray(children)) return;
    var frag = document.createDocumentFragment();
    children.forEach(function (child) {
      if (child instanceof Node) frag.appendChild(child);
    });
    parent.appendChild(frag);
  }

  /**
   * Clear all children from a container.
   * @param {string|HTMLElement} idOrEl
   * @returns {boolean}
   */
  function clearChildren(idOrEl) {
    var el = typeof idOrEl === 'string' ? byId(idOrEl) : idOrEl;
    if (!el) return false;
    while (el.firstChild) el.removeChild(el.firstChild);
    return true;
  }

  /**
   * Insert a child at the top (prepend).
   * @param {HTMLElement} parent
   * @param {HTMLElement} child
   */
  function prepend(parent, child) {
    if (!parent || !child) return;
    parent.insertBefore(child, parent.firstChild);
  }

  /**
   * Trim a container to a maximum number of visible children.
   * @param {HTMLElement} container
   * @param {number} maxItems
   */
  function trimChildren(container, maxItems) {
    if (!container) return;
    while (container.children.length > maxItems) {
      container.removeChild(container.lastChild);
    }
  }

  /**
   * Scroll a scrollable container to its bottom.
   * @param {string|HTMLElement} idOrEl
   */
  function scrollToBottom(idOrEl) {
    var el = typeof idOrEl === 'string' ? byId(idOrEl) : idOrEl;
    if (el) el.scrollTop = el.scrollHeight;
  }

  // ── Expose ───────────────────────────────────────────────────────────────
  global.DOMHelper = {
    byId:           byId,
    qs:             qs,
    qsa:            qsa,
    setText:        setText,
    setClass:       setClass,
    toggleClass:    toggleClass,
    setVisible:     setVisible,
    setStyle:       setStyle,
    createElement:  createElement,
    appendChildren: appendChildren,
    clearChildren:  clearChildren,
    prepend:        prepend,
    trimChildren:   trimChildren,
    scrollToBottom: scrollToBottom,
  };

}(window));

/**
 * FIFA AI Command Center — FanAgent (Refactored)
 * Single responsibility: FAQ matching and chat history management.
 * matchFAQ is a pure function for full unit-testability.
 * @module FanAgent
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;

  // ── Pure FAQ matcher (exported for tests) ────────────────────────────────

  /**
   * Match a sanitized query string against the FAQ database.
   * Pure function — no side effects, no DOM.
   * @param {string} query     — sanitized, trimmed, lowercase query
   * @param {Array}  faqData   — array of {keywords, answer, agent} objects
   * @returns {{answer: string, agent: string}}
   */
  function matchFAQ(query, faqData) {
    if (!query || !Array.isArray(faqData)) {
      return { answer: _fallbackAnswer(query || ''), agent: 'Unified Agent' };
    }
    var lowerQuery = query.toLowerCase();

    for (var i = 0; i < faqData.length; i++) {
      var item    = faqData[i];
      var matched = item.keywords.some(function (kw) { return lowerQuery.includes(kw); });
      if (matched) {
        return { answer: item.answer, agent: item.agent || 'Unified Agent' };
      }
    }

    return { answer: _fallbackAnswer(query), agent: 'Unified Agent' };
  }

  function _fallbackAnswer(query) {
    return 'I\'ve analyzed your query regarding "' + global.Sanitizer.sanitizeHTML(query) + '". While I don\'t have a direct FAQ match, I recommend referring to the interactive map. For physical guidance, please ask any nearby stadium usher wearing a neon-green vest.';
  }

  // ── FanAgent ─────────────────────────────────────────────────────────────

  function FanAgent() {
    this._faq          = [];
    this._chatHistory  = [];
    this._chatContainer = null;
    this._speechEnabled = false;
  }

  FanAgent.prototype.init = function () {
    this._faq           = global.fanQuestionsData;
    this._chatContainer = DOM.byId('fan-chat-messages');

    this._setupEventListeners();
    this._addSystemMessage('Hello! I am the Fan Support Orchestrator. Ask me anything about seats, transport, accessibility, restrooms, or dining.');
  };

  // ── Setup ────────────────────────────────────────────────────────────────

  FanAgent.prototype._setupEventListeners = function () {
    var self  = this;
    var form  = DOM.byId('fan-chat-form');
    var input = DOM.byId('fan-chat-input');

    if (form && input) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = input.value.trim();
        if (text) {
          self.handleUserQuery(text);
          input.value = '';
        }
      });
    }

    DOM.qsa('.quick-question-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.handleUserQuery(btn.textContent.trim());
      });
    });

    var speechToggle = DOM.byId('fan-speech-toggle');
    if (speechToggle) {
      speechToggle.addEventListener('change', function (e) {
        self._speechEnabled = e.target.checked;
        global.logOperation('Fan Agent', 'Audio Output (TTS): ' + (self._speechEnabled ? 'ENABLED' : 'DISABLED'));
      });
    }
  };

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Process a raw user query string.
   * @param {string} rawText
   */
  FanAgent.prototype.handleUserQuery = function (rawText) {
    var queryText = global.Sanitizer.sanitizeHTML(rawText);
    if (!queryText) return;

    this._addMessage(queryText, 'user');
    global.logOperation('Fan Agent', 'User Query: "' + queryText + '"');
    global.eventBus.emit('agent_focus_change', { agent: 'fan', context: queryText });

    var skeletonId = this._showLoadingSkeleton();
    var self       = this;

    setTimeout(function () {
      self._removeLoadingSkeleton(skeletonId);
      // Use plain text query for matching (strip sanitization entities for keyword matching)
      var plainQuery = rawText.toLowerCase().trim();
      var answerObj  = matchFAQ(plainQuery, self._faq);
      self._addMessage(answerObj.answer, 'assistant', answerObj.agent);
      if (self._speechEnabled) {
        self._speakText(answerObj.answer);
      }
    }, 800);
  };

  // ── Private rendering ────────────────────────────────────────────────────

  FanAgent.prototype._addMessage = function (text, sender, agentName) {
    if (!this._chatContainer) return;

    var msgDiv = DOM.createElement('div', { className: 'chat-message ' + sender });

    if (sender === 'assistant' && agentName) {
      var label = DOM.createElement('strong', {
        style: { color: 'var(--neon-blue)', display: 'block', marginBottom: '4px', fontSize: '0.75rem' },
      }, '[AI: ' + agentName + ']');
      msgDiv.appendChild(label);
    }
    // textContent for user messages, text node for assistant (safe — no HTML)
    msgDiv.appendChild(document.createTextNode(text));

    this._chatContainer.appendChild(msgDiv);
    DOM.scrollToBottom(this._chatContainer);

    this._chatHistory.push({ sender: sender, text: text, agentName: agentName });
  };

  FanAgent.prototype._addSystemMessage = function (text) {
    this._addMessage(text, 'assistant', 'Fan Orchestrator');
  };

  FanAgent.prototype._showLoadingSkeleton = function () {
    if (!this._chatContainer) return null;
    var div = DOM.createElement('div', { className: 'chat-message assistant' });
    var id  = 'skeleton-' + Date.now();
    div.id  = id;
    div.innerHTML = global.createSkeletonLoader(2); // safe HTML from our own factory
    this._chatContainer.appendChild(div);
    DOM.scrollToBottom(this._chatContainer);
    return id;
  };

  FanAgent.prototype._removeLoadingSkeleton = function (id) {
    var el = DOM.byId(id);
    if (el) el.remove();
  };

  FanAgent.prototype._speakText = function (text) {
    if (!('speechSynthesis' in window)) {
      console.warn('[FanAgent] Speech Synthesis not supported.');
      return;
    }
    window.speechSynthesis.cancel();
    var cleanText   = global.Sanitizer.stripTags(text);
    var utterance   = new SpeechSynthesisUtterance(cleanText);
    utterance.rate  = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.FanAgent = FanAgent;

  // Export pure function for tests
  global.FanAgent.matchFAQ = matchFAQ;

}(window));

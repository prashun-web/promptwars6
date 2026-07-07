/**
 * FIFA AI Command Center - Fan Assistant Agent Module
 */

class FanAgent {
  constructor() {
    this.faq = [];
    this.chatHistory = [];
    this.chatContainer = null;
    this.speechEnabled = false;
  }

  init() {
    // Read directly from consolidated window configurations
    this.faq = window.fanQuestionsData;
    this.chatContainer = document.getElementById('fan-chat-messages');
    this.setupEventListeners();
    this.addSystemMessage("Hello! I am the Fan Support Orchestrator. Ask me anything about seats, transport, accessibility, restrooms, or dining.");
  }

  setupEventListeners() {
    const form = document.getElementById('fan-chat-form');
    const input = document.getElementById('fan-chat-input');
    const quickBtns = document.querySelectorAll('.quick-question-btn');
    const speechToggle = document.getElementById('fan-speech-toggle');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          this.handleUserQuery(text);
          input.value = '';
        }
      });
    }

    if (quickBtns) {
      quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.handleUserQuery(btn.textContent);
        });
      });
    }

    if (speechToggle) {
      speechToggle.addEventListener('change', (e) => {
        this.speechEnabled = e.target.checked;
        window.logOperation("Fan Agent", `Audio Output (Text-to-Speech): ${this.speechEnabled ? 'ENABLED' : 'DISABLED'}`);
      });
    }
  }

  handleUserQuery(rawText) {
    // Sanitize input to prevent XSS (Security focus)
    const queryText = window.sanitizeHTML(rawText);
    if (!queryText) return;

    this.addMessage(queryText, 'user');
    window.logOperation("Fan Agent", `User Query: "${queryText}"`);

    // Focus active AI Agent panel on the right sidebar
    window.eventBus.emit('agent_focus_change', { agent: 'fan', context: queryText });

    const skeletonId = this.showLoadingSkeleton();

    // Simulate AI response delay
    setTimeout(() => {
      this.removeLoadingSkeleton(skeletonId);
      const answerObj = this.matchFAQ(queryText);
      this.addMessage(answerObj.answer, 'assistant', answerObj.agent);
      
      // Accessibility: Speech Synthesis if enabled
      if (this.speechEnabled) {
        this.speakText(answerObj.answer);
      }
    }, 800);
  }

  matchFAQ(query) {
    const lowerQuery = query.toLowerCase();
    
    // Attempt keyword matches
    for (const item of this.faq) {
      const matched = item.keywords.some(keyword => lowerQuery.includes(keyword));
      if (matched) {
        return {
          answer: item.answer,
          agent: item.agent || 'Unified Agent'
        };
      }
    }

    // Default intelligence fallback
    return {
      answer: `I've analyzed your query regarding "${query}". While I don't have a direct FAQ match, I recommend referring to the interactive map. For physical guidance, please ask any nearby stadium usher wearing a neon-green vest.`,
      agent: 'Unified Agent'
    };
  }

  addMessage(text, sender, agentName = '') {
    if (!this.chatContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    
    if (sender === 'assistant') {
      const prefix = agentName ? `<strong style="color:var(--neon-blue); display:block; margin-bottom:4px; font-size:0.75rem;">[AI: ${agentName}]</strong>` : '';
      msgDiv.innerHTML = `${prefix}${text}`;
    } else {
      msgDiv.textContent = text;
    }

    this.chatContainer.appendChild(msgDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    
    this.chatHistory.push({ sender, text, agentName });
  }

  addSystemMessage(text) {
    this.addMessage(text, 'assistant', 'Fan Orchestrator');
  }

  showLoadingSkeleton() {
    if (!this.chatContainer) return null;
    const skeletonDiv = document.createElement('div');
    const skeletonId = `skeleton-${Date.now()}`;
    skeletonDiv.id = skeletonId;
    skeletonDiv.className = 'chat-message assistant';
    skeletonDiv.innerHTML = window.createSkeletonLoader(2);
    this.chatContainer.appendChild(skeletonDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    return skeletonId;
  }

  removeLoadingSkeleton(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  speakText(text) {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech Synthesis not supported by this browser.");
      return;
    }
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, ""); // strip tags
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// Make globally accessible
window.FanAgent = FanAgent;

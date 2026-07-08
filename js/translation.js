/**
 * FIFA AI Command Center — TranslationAgent (Refactored)
 * Single responsibility: translation dictionary lookup and incident type detection.
 * detectIncidentType and translate are pure functions — fully unit-testable.
 * @module TranslationAgent
 */
(function (global) {
  'use strict';

  var DOM = global.DOMHelper;

  // ── Translation dictionary ───────────────────────────────────────────────
  var DICTIONARY = Object.freeze({
    es: Object.freeze({
      fire:       'ATENCIÓN POR FAVOR. Ha ocurrido un incidente operativo en la Sección 202. Siga las instrucciones de los acomodadores y diríjase con calma a la Puerta C. No corra. Los ascensores están desactivados por seguridad. Use las escaleras.',
      medical:    'NO SE REQUIERE TRANSMISIÓN EN EL ESTADIO. Acomodadores de la Sección 103, despejen las escaleras de la Fila M para acceso de emergencia.',
      security:   'DAMAS Y CABALLEROS. Les recordamos que ingresar al terreno de juego es un delito federal. Los infractores serán procesados. Permanezcan en sus asientos.',
      lost_child: 'ATENCIÓN ESPECTADORES. Servicios al Huésped de la FIFA está ayudando a un joven aficionado llamado Leo, de 7 años, que viste una camiseta azul.',
      power:      'DAMAS Y CABALLEROS. Estamos experimentando una fluctuación menor de energía eléctrica. Los sistemas de respaldo están en línea. El partido continúa. Permanezcan sentados.',
      panic:      'ATENCIÓN A TODOS LOS AFICIONADOS. La Puerta F está muy congestionada. Por su seguridad, siga las instrucciones de los acomodadores y diríjase a la Puerta A.',
      welcome:    'Bienvenidos al Estadio del Mundial de la FIFA 2026. Todos los sistemas están funcionando con normalidad.',
    }),
    fr: Object.freeze({
      fire:       "ATTENTION S'IL VOUS PLAÎT. Un incident opérationnel s'est produit dans la section 202. Veuillez suivre les instructions des stadiers et vous diriger calmement vers la porte C. Ne courez pas.",
      medical:    'AUCUNE DIFFUSION DANS LE STADE REQUISE. Stadiers de la section 103, veuillez dégager les escaliers de la rangée M pour l\'accès d\'urgence.',
      security:   'MESDAMES ET MESSIEURS. Nous vous rappelons que pénétrer sur l\'aire de jeu est une infraction fédérale. Veuillez rester dans vos sièges.',
      lost_child: 'ATTENTION SPECTATEURS. Le service d\'accueil de la FIFA vient en aide à un jeune supporter nommé Leo, âgé de 7 ans, vêtu d\'un maillot bleu.',
      power:      'MESDAMES ET MESSIEURS. Nous connaissons une légère fluctuation de l\'alimentation électrique. Les systèmes de secours sont en ligne. Le match se poursuit.',
      panic:      'ATTENTION À TOUS LES SUPPORTERS. La porte F est très encombrée. Pour votre sécurité, veuillez vous rediriger vers la porte A.',
      welcome:    'Bienvenue au stade de la Coupe du Monde de la FIFA 2026. Tous les systèmes fonctionnent normalement.',
    }),
    ar: Object.freeze({
      fire:       'انتباه من فضلكم. وقع حادث تشغيلي في القسم 202. يرجى اتباع تعليمات مشرفي الملاعب والتوجه بهدوء إلى البوابة C.',
      medical:    'لا داعي للإعلان الداخلي. مشرفو الملاعب في القسم 103، يرجى إخلاء سلالم الصف M لمرور الإسعاف.',
      security:   'سيداتي وسادتي. نذكركم بأن دخول أرضية الملعب يعد مخالفة قانونية. يرجى البقاء في مقاعدكم.',
      lost_child: 'انتباه أيها الجمهور. خدمات الضيوف في الفيفا تساعد طفلاً تائهاً يدعى ليو، يبلغ من العمر 7 سنوات، يرتدي قميصاً أزرق.',
      power:      'سيداتي وسادتي. نحن نواجه تذبذباً بسيطاً في التيار الكهربائي. أنظمة الاحتياط قيد التشغيل. المباراة مستمرة.',
      panic:      'انتباه لجميع المشجعين. البوابة F مزدحمة للغاية. من أجل سلامتكم، يرجى التوجه نحو البوابة A.',
      welcome:    'مرحباً بكم في استاد كأس العالم FIFA 2026. جميع الأنظمة تعمل بشكل طبيعي.',
    }),
    hi: Object.freeze({
      fire:       'कृपया ध्यान दें। सेक्शन 202 में एक परिचालन घटना घटी है। कृपया स्टूवर्ड्स के निर्देशों का पालन करें और शांतिपूर्वक गेट C की ओर बढ़ें।',
      medical:    'स्टेडियम घोषणा की आवश्यकता नहीं है। सेक्शन 103 के स्टूवर्ड्स कृपया आपातकालीन पहुंच के लिए रो M की सीढ़ियों को खाली रखें।',
      security:   'देवियों और सज्जनों। हम आपको याद दिलाते हैं कि खेल के मैदान में प्रवेश करना एक अपराध है। कृपया अपनी सीटों पर बने रहें।',
      lost_child: 'दर्शकों ध्यान दें। फीफा गेस्ट सर्विसेज 7 साल के एक युवा प्रशंसक लियो की मदद कर रही है, जिसने नीली जर्सी पहनी है।',
      power:      'देवियों और सज्जनों। हम एक मामूली बिजली उतार-चढ़ाव का सामना कर रहे हैं। बैक-अप सिस्टम ऑनलाइन हैं। मैच जारी है।',
      panic:      'सभी प्रशंसकों ध्यान दें। गेट F पर भारी भीड़ है। आपकी सुरक्षा के लिए कृपया गेट A की ओर रुख करें।',
      welcome:    'फीफा विश्व कप 2026 स्टेडियम में आपका स्वागत है। सभी प्रणालियां सामान्य रूप से काम कर रही हैं।',
    }),
    pt: Object.freeze({
      fire:       'ATENÇÃO POR FAVOR. Ocorreu um incidente operacional na Seção 202. Siga as instruções dos orientadores e dirija-se com calma para o Portão C.',
      medical:    'NENHUMA TRANSMISSÃO DE ESTÁDIO NECESSÁRIA. Orientadores na Seção 103, por favor, limpem as escadas da Fila M para acesso de emergência.',
      security:   'SENHORAS E SENHORES. Lembramos que invadir o campo de jogo é um crime federal. Por favor, permaneçam em seus assentos.',
      lost_child: 'ATENÇÃO ESPECTADORES. O Atendimento ao Visitante da FIFA está ajudando um jovem torcedor chamado Leo, de 7 anos, vestindo uma camisa azul.',
      power:      'SENHORAS E SENHORES. Estamos enfrentando uma pequena oscilação na rede elétrica. Os sistemas de backup estão online. A partida continua.',
      panic:      'ATENÇÃO TODOS OS TORCEDORES. O Portão F está altamente congestionado. Para sua segurança, dirija-se ao Portão A.',
      welcome:    'Bem-vindo ao Estádio da Copa do Mundo FIFA 2026. Todos os sistemas funcionando nominalmente.',
    }),
    de: Object.freeze({
      fire:       'ACHTUNG BITTE. In Sektor 202 ist ein betrieblicher Zwischenfall aufgetreten. Bitte begeben Sie sich ruhig zu Tor C. Nutzen Sie die Treppe.',
      medical:    'KEINE STADIONDURCHSAGE ERFORDERLICH. Ordner in Sektor 103, bitte halten Sie die Treppen in Reihe M für Rettungskräfte frei.',
      security:   'SEHR GEEHRTE ZUSCHAUER. Das Betreten des Spielfelds ist eine Straftat. Bleiben Sie auf Ihren Plätzen.',
      lost_child: 'ACHTUNG ZUSCHAUER. Der FIFA-Besucherservice betreut einen 7-jährigen Jungen namens Leo in einem blauen Trikot.',
      power:      'SEHR GEEHRTE ZUSCHAUER. Wir verzeichnen eine geringfügige Schwankung im Stromnetz. Notstromsysteme laufen. Das Spiel geht weiter.',
      panic:      'ACHTUNG AN ALLE FANS. Tor F ist stark überlastet. Zu Ihrer Sicherheit gehen Sie bitte in Richtung Tor A.',
      welcome:    'Willkommen im FIFA WM-Stadion 2026. Alle Systeme laufen planmäßig.',
    }),
    ja: Object.freeze({
      fire:       '皆様にご案内いたします。セクション202で運営上の問題が発生しました。ゲートCへ進んでください。階段をご利用ください。',
      medical:    'スタジアム放送は不要です。セクション103の係員は、救急搬送のため列Mの通路を空けてください。',
      security:   '皆様にお願いいたします。ピッチへの立ち入りは法律で禁止されています。座席から移動しないでください。',
      lost_child: 'ご来場の皆様にご案内します。ゲストサービスは青いジャージを着た7歳のレオ君を保護しています。',
      power:      '皆様にご案内いたします。現在一部で電圧低下が発生しています。予備電源が稼働しており、試合は継続します。',
      panic:      'サポーターの皆様にご案内します。ゲートF付近が非常に混雑しています。ゲートAへ迂回してください。',
      welcome:    'FIFA ワールドカップ 2026 スタジアムへようこそ。現在すべてのシステムは正常に稼働しています。',
    }),
  });

  /** Word-substitution map for partial translations */
  var WORD_MAP = Object.freeze({
    welcome:   { es: 'bienvenidos', fr: 'bienvenue',  ar: 'مرحباً',  hi: 'स्वागत',    pt: 'bem-vindo',  de: 'willkommen', ja: 'ようこそ'    },
    attention: { es: 'atención',   fr: 'attention',  ar: 'انتباه',  hi: 'ध्यान दें', pt: 'atenção',    de: 'achtung',    ja: '注目'        },
    please:    { es: 'por favor',  fr: "s'il vous plaît", ar: 'رجاءً', hi: 'कृपया',  pt: 'por favor',  de: 'bitte',      ja: 'お願いします' },
    stadium:   { es: 'estadio',    fr: 'stade',      ar: 'ملعب',    hi: 'स्टेडियम', pt: 'estádio',    de: 'stadion',    ja: 'スタジアム'  },
    gate:      { es: 'puerta',     fr: 'porte',      ar: 'بوابة',   hi: 'गेट',       pt: 'portão',     de: 'tor',        ja: 'ゲート'      },
    emergency: { es: 'emergencia', fr: 'urgence',    ar: 'طوارئ',   hi: 'आपातकाल',  pt: 'emergência', de: 'notfall',    ja: '緊急'        },
  });

  var WORD_MAP_REGEX = /\b(welcome|attention|please|stadium|gate|emergency)\b/gi;

  // ── Pure functions (exported for tests) ──────────────────────────────────

  /**
   * Detect which incident template best matches the source text.
   * @param {string} text
   * @returns {string|null}  template key or null
   */
  function detectIncidentType(text) {
    if (typeof text !== 'string') return null;
    var lower = text.toLowerCase();
    if (lower.includes('section 202') || lower.includes('fire'))           return 'fire';
    if (lower.includes('row m')  || lower.includes('cardiac') || lower.includes('medical')) return 'medical';
    if (lower.includes('field of play') || lower.includes('pitch invasion'))                return 'security';
    if (lower.includes('leo')    || lower.includes('lost child') || lower.includes('separated')) return 'lost_child';
    if (lower.includes('electrical') || lower.includes('power') || lower.includes('blackout'))   return 'power';
    if (lower.includes('gate f is heavily') || lower.includes('congested') || lower.includes('panic')) return 'panic';
    if (lower.includes('welcome') || lower.includes('nominal'))            return 'welcome';
    return null;
  }

  /**
   * Translate a source text to a target language.
   * @param {string} sourceText
   * @param {string} lang       — language code e.g. 'es', 'fr'
   * @param {Object} dictionary — the DICTIONARY object above
   * @returns {string}          translated text
   */
  function translate(sourceText, lang, dictionary) {
    if (!sourceText) return 'Translation output will render here...';
    if (!dictionary || !dictionary[lang]) return '[Language not available: ' + lang + ']';

    var key = detectIncidentType(sourceText);
    if (key && dictionary[lang][key]) {
      return dictionary[lang][key];
    }

    // Partial word substitution fallback
    return '[Simulated AI Translation - ' + lang.toUpperCase() + ']\n' +
      sourceText.replace(WORD_MAP_REGEX, function (match) {
        var word = match.toLowerCase();
        return (WORD_MAP[word] && WORD_MAP[word][lang]) ? WORD_MAP[word][lang] : match;
      });
  }

  // ── TranslationAgent ─────────────────────────────────────────────────────

  function TranslationAgent() {
    this._currentLanguage = 'es';
    this._sourceText      = '';
    this._unsubscribers   = [];
  }

  TranslationAgent.prototype.init = function () {
    this._setupEventListeners();
    this.setSourceText('Welcome to the FIFA World Cup 2026 stadium. All systems are operating normally.');
  };

  TranslationAgent.prototype.destroy = function () {
    this._unsubscribers.forEach(function (u) { u(); });
  };

  // ── Setup ────────────────────────────────────────────────────────────────

  TranslationAgent.prototype._setupEventListeners = function () {
    var self = this;

    var textInput = DOM.byId('trans-source-text');
    if (textInput) {
      textInput.addEventListener('input', function (e) {
        self._sourceText = e.target.value;
        self._renderTranslation();
      });
    }

    DOM.qsa('.lang-btn[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self._currentLanguage = btn.getAttribute('data-lang');
        DOM.qsa('.lang-btn[data-lang]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        global.logOperation('Translation Agent', 'Active broadcast language shifted to: ' + self._currentLanguage.toUpperCase());
        global.eventBus.emit('agent_focus_change', { agent: 'translation', context: 'Language: ' + self._currentLanguage.toUpperCase() });
        self._renderTranslation();
      });
    });

    this._unsubscribers = [
      global.eventBus.on('emergency_triggered', function (incident) {
        self.setSourceText(incident.paScript);
      }),
      global.eventBus.on('emergency_cleared', function () {
        self.setSourceText('Welcome to the FIFA World Cup 2026 stadium. All systems are operating normally.');
      }),
    ];
  };

  // ── Public API ───────────────────────────────────────────────────────────

  TranslationAgent.prototype.setSourceText = function (text) {
    this._sourceText = text;
    var input = DOM.byId('trans-source-text');
    if (input) input.value = text;
    this._renderTranslation();
  };

  // ── Private render ───────────────────────────────────────────────────────

  TranslationAgent.prototype._renderTranslation = function () {
    var outputEl = DOM.byId('trans-result-panel');
    if (!outputEl) return;
    var result = translate(this._sourceText, this._currentLanguage, DICTIONARY);
    DOM.setText(outputEl, result);
  };

  // ── Expose ───────────────────────────────────────────────────────────────
  global.TranslationAgent = TranslationAgent;

  // Export pure functions for tests
  global.TranslationAgent.detectIncidentType = detectIncidentType;
  global.TranslationAgent.translate          = translate;
  global.TranslationAgent.DICTIONARY         = DICTIONARY;

}(window));

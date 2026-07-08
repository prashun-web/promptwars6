/** Tests: TranslationAgent pure functions */
describe('TranslationAgent — detectIncidentType()', function () {

  var detect = TranslationAgent.detectIncidentType;

  it('detects fire from "section 202"', function () {
    assert.equal(detect('An incident occurred in Section 202.'), 'fire');
  });

  it('detects fire from keyword "fire"', function () {
    assert.equal(detect('There is a fire at the concession stand.'), 'fire');
  });

  it('detects medical from "row m"', function () {
    assert.equal(detect('Row M needs emergency access.'), 'medical');
  });

  it('detects medical from "cardiac"', function () {
    assert.equal(detect('Cardiac arrest reported.'), 'medical');
  });

  it('detects medical from keyword "medical"', function () {
    assert.equal(detect('Medical assistance needed.'), 'medical');
  });

  it('detects security from "field of play"', function () {
    assert.equal(detect('Fan has entered the field of play.'), 'security');
  });

  it('detects security from "pitch invasion"', function () {
    assert.equal(detect('Pitch invasion reported.'), 'security');
  });

  it('detects lost_child from "leo"', function () {
    assert.equal(detect('Guest Services assisting Leo, aged 7.'), 'lost_child');
  });

  it('detects lost_child from "lost child"', function () {
    assert.equal(detect('A lost child has been found.'), 'lost_child');
  });

  it('detects lost_child from "separated"', function () {
    assert.equal(detect('A child has become separated.'), 'lost_child');
  });

  it('detects power from "electrical"', function () {
    assert.equal(detect('Minor electrical fluctuation detected.'), 'power');
  });

  it('detects power from "power"', function () {
    assert.equal(detect('Power grid issue in West wing.'), 'power');
  });

  it('detects power from "blackout"', function () {
    assert.equal(detect('Partial blackout in Section E.'), 'power');
  });

  it('detects panic from "congested"', function () {
    assert.equal(detect('Gate F is heavily congested.'), 'panic');
  });

  it('detects panic from keyword "panic"', function () {
    assert.equal(detect('Crowd panic detected.'), 'panic');
  });

  it('detects welcome from "welcome"', function () {
    assert.equal(detect('Welcome to the FIFA World Cup 2026 stadium.'), 'welcome');
  });

  it('detects welcome from "nominal"', function () {
    assert.equal(detect('All systems operating nominal.'), 'welcome');
  });

  it('returns null for unmatched text', function () {
    assert.isNull(detect('The referee blew the whistle.'));
  });

  it('returns null for empty string', function () {
    assert.isNull(detect(''));
  });

  it('returns null for non-string input', function () {
    assert.isNull(detect(null));
  });

  it('is case-insensitive', function () {
    assert.equal(detect('FIRE DETECTED'), 'fire');
    assert.equal(detect('Medical Emergency'), 'medical');
  });
});

describe('TranslationAgent — translate()', function () {

  var translate = TranslationAgent.translate;
  var dict      = TranslationAgent.DICTIONARY;

  it('returns Spanish fire translation from fire text', function () {
    var result = translate('There is a fire in Section 202.', 'es', dict);
    assert.includes(result, 'ATENCI\u00D3N');
  });

  it('returns French medical translation', function () {
    var result = translate('Row M needs medical access.', 'fr', dict);
    assert.includes(result, 'AUCUNE');
  });

  it('returns Arabic welcome translation', function () {
    var result = translate('Welcome to the FIFA World Cup 2026.', 'ar', dict);
    assert.includes(result, '\u0645\u0631\u062D\u0628\u0627\u064B');
  });

  it('returns Hindi panic translation', function () {
    var result = translate('Gate F is heavily congested.', 'hi', dict);
    assert.isDefined(result);
    assert.notEqual(result, '');
  });

  it('uses partial word substitution for unknown text', function () {
    var result = translate('Please proceed to the emergency gate.', 'es', dict);
    assert.includes(result, 'por favor');
  });

  it('returns placeholder for empty source text', function () {
    var result = translate('', 'es', dict);
    assert.includes(result, 'Translation output');
  });

  it('returns language-not-available for unsupported lang code', function () {
    var result = translate('Some text', 'zz', dict);
    assert.includes(result, 'not available');
  });

  it('handles null dictionary gracefully', function () {
    var result = translate('Some text', 'es', null);
    assert.includes(result, 'not available');
  });

  it('returns Japanese fire translation', function () {
    var result = translate('fire in Section 202', 'ja', dict);
    assert.isDefined(result);
    assert.greaterThan(result.length, 5);
  });

  it('returns Portuguese security translation', function () {
    var result = translate('Fan on the field of play', 'pt', dict);
    assert.includes(result, 'SENHORAS');
  });
});

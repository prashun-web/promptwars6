/** Tests: FanAgent — matchFAQ() pure function */
describe('FanAgent — matchFAQ()', function () {

  var matchFAQ = FanAgent.matchFAQ;
  var faq      = window.fanQuestionsData;

  // ── Keyword matching ──────────────────────────────────────────────────

  it('matches "washroom" query', function () {
    var result = matchFAQ('where is the washroom', faq);
    assert.includes(result.answer.toLowerCase(), 'restroom');
  });

  it('matches "toilet" keyword', function () {
    var result = matchFAQ('toilet nearby', faq);
    assert.includes(result.answer.toLowerCase(), 'restroom');
  });

  it('matches "vegetarian" food query', function () {
    var result = matchFAQ('vegetarian food options', faq);
    assert.includes(result.answer.toLowerCase(), 'vegetarian');
  });

  it('matches "vegan" keyword', function () {
    var result = matchFAQ('vegan options available', faq);
    assert.isDefined(result.answer);
    assert.greaterThan(result.answer.length, 10);
  });

  it('matches "wheelchair" accessibility query', function () {
    var result = matchFAQ('wheelchair access gates', faq);
    assert.includes(result.answer.toLowerCase(), 'accessible');
  });

  it('matches "elevator" keyword', function () {
    var result = matchFAQ('elevator locations', faq);
    assert.includes(result.answer.toLowerCase(), 'elevator');
  });

  it('matches "lost child" query', function () {
    var result = matchFAQ('report lost child', faq);
    assert.includes(result.answer.toLowerCase(), 'child');
  });

  it('matches "missing" keyword', function () {
    var result = matchFAQ('my child is missing', faq);
    assert.isDefined(result.answer);
    assert.greaterThan(result.answer.length, 10);
  });

  it('matches "parking" query', function () {
    var result = matchFAQ('parking garage info', faq);
    assert.includes(result.answer.toLowerCase(), 'parking');
  });

  it('matches "seat" and ticket query', function () {
    var result = matchFAQ('find my seat section', faq);
    assert.includes(result.answer.toLowerCase(), 'gate');
  });

  it('matches "medical" help query', function () {
    var result = matchFAQ('medical assistance please', faq);
    assert.includes(result.answer.toLowerCase(), 'medical');
  });

  it('matches "first aid" keyword', function () {
    var result = matchFAQ('first aid station', faq);
    assert.isDefined(result.answer);
    assert.greaterThan(result.answer.length, 10);
  });

  it('matches "sustainability" keyword', function () {
    var result = matchFAQ('sustainability info', faq);
    assert.includes(result.answer.toLowerCase(), 'eco');
  });

  // ── Fallback ──────────────────────────────────────────────────────────

  it('returns a fallback answer for unmatched query', function () {
    var result = matchFAQ('xyzzy random gibberish', faq);
    assert.isDefined(result.answer);
    assert.greaterThan(result.answer.length, 10);
  });

  it('fallback answer mentions the query', function () {
    var result = matchFAQ('xyzzy', faq);
    assert.includes(result.answer.toLowerCase(), 'xyzzy');
  });

  it('returns fallback for empty string', function () {
    var result = matchFAQ('', faq);
    assert.isDefined(result.answer);
  });

  it('returns fallback for null input', function () {
    var result = matchFAQ(null, faq);
    assert.isDefined(result.answer);
  });

  it('returns fallback for null faqData', function () {
    var result = matchFAQ('washroom', null);
    assert.isDefined(result.answer);
  });

  // ── Return shape ──────────────────────────────────────────────────────

  it('result always has an "answer" field', function () {
    var result = matchFAQ('anything', faq);
    assert.isDefined(result.answer);
  });

  it('result always has an "agent" field', function () {
    var result = matchFAQ('wheelchair', faq);
    assert.isDefined(result.agent);
  });

  it('agent field is a non-empty string', function () {
    var result = matchFAQ('washroom', faq);
    assert.isTrue(typeof result.agent === 'string' && result.agent.length > 0);
  });

  // ── Case insensitivity ────────────────────────────────────────────────

  it('is case-insensitive', function () {
    var lower  = matchFAQ('wheelchair', faq);
    var upper  = matchFAQ('WHEELCHAIR', faq);
    assert.equal(lower.answer, upper.answer);
  });

  // ── Priority: first match wins ─────────────────────────────────────────

  it('returns the first matching FAQ entry', function () {
    // "toilet" and "washroom" are in the same FAQ entry → same answer
    var a = matchFAQ('toilet',   faq);
    var b = matchFAQ('washroom', faq);
    assert.equal(a.answer, b.answer);
  });
});

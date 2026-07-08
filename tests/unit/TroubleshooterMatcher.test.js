/** Tests: TroubleshooterMatcher */
describe('TroubleshooterMatcher — matchIssue()', function () {

  var match       = TroubleshooterMatcher.matchIssue;
  var troubleshooter = window.volunteersData.troubleshooter;

  // ── Scanner category ──────────────────────────────────────────────────

  it('identifies scanner category for "scanner offline"', function () {
    var result = match('scanner offline', troubleshooter);
    assert.equal(result.category, 'scanner');
  });

  it('identifies scanner category for "laser" keyword', function () {
    var result = match('laser not working', troubleshooter);
    assert.equal(result.category, 'scanner');
  });

  it('identifies scanner category for "ticket" keyword', function () {
    var result = match('ticket scanner issue', troubleshooter);
    assert.equal(result.category, 'scanner');
  });

  it('scanner reboot path matches "reboot" keyword', function () {
    var result = match('scanner needs reboot', troubleshooter);
    assert.includes(result.solution.toLowerCase(), 'reboot');
  });

  it('scanner offline path matches "offline" keyword', function () {
    var result = match('scanner offline', troubleshooter);
    assert.includes(result.solution.toLowerCase(), 'wi-fi');
  });

  it('scanner offline path matches "wifi" keyword', function () {
    var result = match('scanner lost wifi', troubleshooter);
    assert.includes(result.solution.toLowerCase(), 'wi-fi');
  });

  it('scanner laser path is returned for generic scanner query', function () {
    var result = match('scanner not reading', troubleshooter);
    assert.includes(result.solution.toLowerCase(), 'laser');
  });

  // ── Radio category ────────────────────────────────────────────────────

  it('identifies radio category for "radio" keyword', function () {
    var result = match('radio not working', troubleshooter);
    assert.equal(result.category, 'radio');
  });

  it('identifies radio category for "static" keyword', function () {
    var result = match('radio has static', troubleshooter);
    assert.equal(result.category, 'radio');
  });

  it('identifies radio category for "mic" keyword', function () {
    var result = match('mic on radio is broken', troubleshooter);
    assert.equal(result.category, 'radio');
  });

  it('radio static path for "static" issue', function () {
    var result = match('too much static on radio', troubleshooter);
    assert.includes(result.solution.toLowerCase(), 'channel');
  });

  it('radio battery path for battery issue', function () {
    var result = match('radio battery problem', troubleshooter);
    assert.includes(result.solution.toLowerCase(), 'battery');
  });

  // ── AED category ──────────────────────────────────────────────────────

  it('identifies aed category for "aed" keyword', function () {
    var result = match('aed not working', troubleshooter);
    assert.equal(result.category, 'aed');
  });

  it('identifies aed category for "defibrillator" keyword', function () {
    var result = match('defibrillator red light', troubleshooter);
    assert.equal(result.category, 'aed');
  });

  it('AED solution mentions green light', function () {
    var result = match('aed light issue', troubleshooter);
    assert.includes(result.solution.toLowerCase(), 'green');
  });

  // ── Generic fallback ──────────────────────────────────────────────────

  it('returns generic category for unrecognised keyword', function () {
    var result = match('my vest is torn', troubleshooter);
    assert.equal(result.category, 'generic');
  });

  it('generic solution is non-empty', function () {
    var result = match('something unknown', troubleshooter);
    assert.greaterThan(result.solution.length, 10);
  });

  // ── Edge cases ────────────────────────────────────────────────────────

  it('handles empty string — returns generic', function () {
    var result = match('', troubleshooter);
    assert.equal(result.category, 'generic');
  });

  it('handles null query — returns generic', function () {
    var result = match(null, troubleshooter);
    assert.equal(result.category, 'generic');
  });

  it('handles null troubleshooter — returns generic', function () {
    var result = match('scanner offline', null);
    assert.equal(result.category, 'generic');
  });

  // ── Return shape ──────────────────────────────────────────────────────

  it('always returns an object with category and solution', function () {
    var result = match('scanner', troubleshooter);
    assert.isDefined(result.category);
    assert.isDefined(result.solution);
  });
});

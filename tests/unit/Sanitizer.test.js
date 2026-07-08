/** Tests: Sanitizer module */
describe('Sanitizer', function () {

  it('sanitizeHTML: escapes & to &amp;', function () {
    assert.equal(Sanitizer.sanitizeHTML('a & b'), 'a &amp; b');
  });

  it('sanitizeHTML: escapes < to &lt;', function () {
    assert.equal(Sanitizer.sanitizeHTML('<script>'), '&lt;script&gt;');
  });

  it('sanitizeHTML: escapes double quotes', function () {
    assert.equal(Sanitizer.sanitizeHTML('"hello"'), '&quot;hello&quot;');
  });

  it('sanitizeHTML: escapes single quotes', function () {
    assert.equal(Sanitizer.sanitizeHTML("it's"), 'it&#x27;s');
  });

  it('sanitizeHTML: returns empty string for null', function () {
    assert.equal(Sanitizer.sanitizeHTML(null), '');
  });

  it('sanitizeHTML: returns empty string for undefined', function () {
    assert.equal(Sanitizer.sanitizeHTML(undefined), '');
  });

  it('sanitizeHTML: coerces numbers to string', function () {
    assert.equal(Sanitizer.sanitizeHTML(42), '42');
  });

  it('sanitizeHTML: passes safe text unmodified', function () {
    assert.equal(Sanitizer.sanitizeHTML('Hello World'), 'Hello World');
  });

  it('stripTags: removes HTML tags', function () {
    assert.equal(Sanitizer.stripTags('<b>bold</b>'), 'bold');
  });

  it('stripTags: passes plain text through', function () {
    assert.equal(Sanitizer.stripTags('plain text'), 'plain text');
  });

  it('stripTags: handles empty string', function () {
    assert.equal(Sanitizer.stripTags(''), '');
  });

  it('clampNumber: clamps value below min', function () {
    assert.equal(Sanitizer.clampNumber(-10, 0, 100), 0);
  });

  it('clampNumber: clamps value above max', function () {
    assert.equal(Sanitizer.clampNumber(200, 0, 100), 100);
  });

  it('clampNumber: passes value within range', function () {
    assert.equal(Sanitizer.clampNumber(50, 0, 100), 50);
  });

  it('clampNumber: handles non-finite input → returns min', function () {
    assert.equal(Sanitizer.clampNumber(NaN, 0, 100), 0);
  });

  it('formatPercentage: formats a number as percent', function () {
    assert.equal(Sanitizer.formatPercentage(78), '78%');
  });

  it('formatPercentage: clamps value at 100', function () {
    assert.equal(Sanitizer.formatPercentage(150), '100%');
  });

  it('formatPercentage: clamps value at 0', function () {
    assert.equal(Sanitizer.formatPercentage(-5), '0%');
  });

  it('isValidGateId: accepts valid gates', function () {
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(function (id) {
      assert.isTrue(Sanitizer.isValidGateId(id), 'Gate ' + id + ' should be valid');
    });
  });

  it('isValidGateId: rejects invalid gate', function () {
    assert.isFalse(Sanitizer.isValidGateId('Z'));
  });

  it('isValidGateId: rejects empty string', function () {
    assert.isFalse(Sanitizer.isValidGateId(''));
  });

  it('isValidString: accepts non-empty string within limit', function () {
    assert.isTrue(Sanitizer.isValidString('hello'));
  });

  it('isValidString: rejects empty string', function () {
    assert.isFalse(Sanitizer.isValidString(''));
  });

  it('isValidString: rejects string over maxLen', function () {
    var longStr = new Array(502).join('x');
    assert.isFalse(Sanitizer.isValidString(longStr, 500));
  });
});

/** Tests: AnalyticsAgent — buildExecutiveSummary() */
describe('AnalyticsAgent — buildExecutiveSummary()', function () {

  var build = AnalyticsAgent.buildExecutiveSummary;

  it('returns an object with color, heading, body', function () {
    var result = build(null, 74, 42, 'Monday, Jul 7');
    assert.isDefined(result.color);
    assert.isDefined(result.heading);
    assert.isDefined(result.body);
  });

  it('nominal state: heading mentions NOMINAL', function () {
    var result = build(null, 74, 42, 'Monday');
    assert.includes(result.heading.toUpperCase(), 'NOMINAL');
  });

  it('nominal state: heading color is neon-green', function () {
    var result = build(null, 74, 42, 'Monday');
    assert.includes(result.color, 'neon-green');
  });

  it('nominal state: body includes crowd density percentage', function () {
    var result = build(null, 78, 42, 'Monday');
    assert.includes(result.body, '78');
  });

  it('nominal state: body includes energy rate percentage', function () {
    var result = build(null, 74, 55, 'Monday');
    assert.includes(result.body, '55');
  });

  it('nominal state: body includes the date string', function () {
    var result = build(null, 74, 42, 'Friday, Jul 11');
    assert.includes(result.body, 'Friday, Jul 11');
  });

  it('emergency state: heading mentions ALERT', function () {
    var inc = { type: 'fire', priority: 'CRITICAL', exit: 'Gate C' };
    var result = build(inc, 74, 42, 'Monday');
    assert.includes(result.heading.toUpperCase(), 'ALERT');
  });

  it('emergency state: heading mentions incident type', function () {
    var inc = { type: 'medical', priority: 'HIGH', exit: 'Gate E' };
    var result = build(inc, 74, 42, 'Monday');
    assert.includes(result.heading.toUpperCase(), 'MEDICAL');
  });

  it('emergency state: heading color is neon-red', function () {
    var inc = { type: 'panic', priority: 'CRITICAL', exit: 'Gate A' };
    var result = build(inc, 74, 42, 'Monday');
    assert.includes(result.color, 'neon-red');
  });

  it('emergency state: body mentions exit', function () {
    var inc = { type: 'fire', priority: 'CRITICAL', exit: 'Gate C (South-East Exit)' };
    var result = build(inc, 74, 42, 'Monday');
    assert.includes(result.body, 'Gate C');
  });

  it('emergency state: body mentions priority level', function () {
    var inc = { type: 'security', priority: 'HIGH', exit: 'Gate F' };
    var result = build(inc, 74, 42, 'Monday');
    assert.includes(result.body, 'HIGH');
  });

  it('all six incident types produce valid summaries', function () {
    var types = ['fire', 'medical', 'security', 'lost_child', 'power', 'panic'];
    types.forEach(function (type) {
      var inc    = { type: type, priority: 'CRITICAL', exit: 'Gate A' };
      var result = build(inc, 74, 42, 'Monday');
      assert.isDefined(result.heading, 'heading missing for type: ' + type);
      assert.isDefined(result.body,    'body missing for type: '    + type);
    });
  });

  it('works with 0% crowd density', function () {
    var result = build(null, 0, 42, 'Monday');
    assert.includes(result.body, '0');
  });

  it('works with 100% crowd density', function () {
    var result = build(null, 100, 42, 'Monday');
    assert.includes(result.body, '100');
  });
});

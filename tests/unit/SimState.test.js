/** Tests: SimState module */
describe('SimState', function () {

  var state;

  beforeEach(function () {
    state = new SimState();
  });

  // ── Match accessors ───────────────────────────────────────────────────

  it('getMatch returns a copy of match data', function () {
    var m = state.getMatch();
    assert.isDefined(m);
    assert.isDefined(m.homeScore);
    assert.isDefined(m.minute);
  });

  it('getMatch returns a copy — mutations do not affect internal state', function () {
    var m1 = state.getMatch();
    m1.minute = 999;
    var m2 = state.getMatch();
    assert.notEqual(m2.minute, 999, 'external mutation should not affect state');
  });

  it('setMatchMinute updates minute correctly', function () {
    state.setMatchMinute(67);
    assert.equal(state.getMatch().minute, 67);
  });

  it('setMatchMinute clamps to 0..90', function () {
    state.setMatchMinute(200);
    assert.equal(state.getMatch().minute, 90);
    state.setMatchMinute(-5);
    assert.equal(state.getMatch().minute, 0);
  });

  it('setMatchMinute ignores non-numeric input', function () {
    var original = state.getMatch().minute;
    state.setMatchMinute('seventy');
    assert.equal(state.getMatch().minute, original);
  });

  it('setMatchHalf accepts 1 and 2', function () {
    state.setMatchHalf(2);
    assert.equal(state.getMatch().half, 2);
    state.setMatchHalf(1);
    assert.equal(state.getMatch().half, 1);
  });

  it('setMatchHalf ignores invalid values', function () {
    state.setMatchHalf(3);
    var half = state.getMatch().half;
    assert.isTrue(half === 1 || half === 2, 'half should remain 1 or 2');
  });

  it('setMatchStatus updates status string', function () {
    state.setMatchStatus('Full Time');
    assert.equal(state.getMatch().status, 'Full Time');
  });

  // ── Weather accessors ─────────────────────────────────────────────────

  it('getWeather returns an object with temp', function () {
    var w = state.getWeather();
    assert.isDefined(w.temp);
  });

  it('setWeatherTemp updates temperature', function () {
    state.setWeatherTemp(28);
    assert.equal(state.getWeather().temp, 28);
  });

  it('setWeatherTemp ignores non-numeric', function () {
    var orig = state.getWeather().temp;
    state.setWeatherTemp('hot');
    assert.equal(state.getWeather().temp, orig);
  });

  // ── KPI accessors ─────────────────────────────────────────────────────

  it('getKPIs returns an object', function () {
    var k = state.getKPIs();
    assert.isDefined(k.crowdDensity);
  });

  it('setCrowdDensity clamps to 0..100', function () {
    state.setCrowdDensity(150);
    assert.equal(state.getKPIs().crowdDensity, 100);
    state.setCrowdDensity(-10);
    assert.equal(state.getKPIs().crowdDensity, 0);
  });

  it('setCrowdDensity rounds to integer', function () {
    state.setCrowdDensity(78.6);
    assert.equal(state.getKPIs().crowdDensity, 79);
  });

  it('setSecurityStatus updates status', function () {
    state.setSecurityStatus('HIGH');
    assert.equal(state.getKPIs().securityStatus, 'HIGH');
  });

  it('setMedicalAlerts rejects negative values', function () {
    var orig = state.getKPIs().medicalAlerts;
    state.setMedicalAlerts(-1);
    assert.equal(state.getKPIs().medicalAlerts, orig);
  });

  it('setSolarGenerationKw floors at 0', function () {
    state.setSolarGenerationKw(-100);
    assert.equal(state.getKPIs().solarGenerationKw, 0);
  });

  // ── Emergency accessors ───────────────────────────────────────────────

  it('getActiveEmergency returns null by default', function () {
    assert.isNull(state.getActiveEmergency());
  });

  it('hasActiveEmergency returns false by default', function () {
    assert.isFalse(state.hasActiveEmergency());
  });

  it('setActiveEmergency stores a valid incident', function () {
    state.setActiveEmergency({ type: 'fire', priority: 'CRITICAL' });
    assert.isTrue(state.hasActiveEmergency());
    assert.equal(state.getActiveEmergency().type, 'fire');
  });

  it('setActiveEmergency null clears the incident', function () {
    state.setActiveEmergency({ type: 'panic', priority: 'HIGH' });
    state.setActiveEmergency(null);
    assert.isFalse(state.hasActiveEmergency());
  });

  it('setActiveEmergency returns a copy — mutations do not affect state', function () {
    state.setActiveEmergency({ type: 'medical', priority: 'HIGH' });
    var e = state.getActiveEmergency();
    e.type = 'hacked';
    assert.equal(state.getActiveEmergency().type, 'medical', 'internal state should not be mutated');
  });

  it('setActiveEmergency rejects invalid object (no type)', function () {
    state.setActiveEmergency({ foo: 'bar' });
    assert.isFalse(state.hasActiveEmergency(), 'invalid object should not set emergency');
  });

  // ── Log accessors ─────────────────────────────────────────────────────

  it('addLog prepends and getLogs returns newest first', function () {
    state.addLog({ source: 'A', text: 'First',  timestamp: '00:01', severity: 'info' });
    state.addLog({ source: 'B', text: 'Second', timestamp: '00:02', severity: 'info' });
    var logs = state.getLogs();
    assert.equal(logs[0].text, 'Second');
    assert.equal(logs[1].text, 'First');
  });

  it('getLogs returns a copy', function () {
    state.addLog({ source: 'X', text: 'Entry', timestamp: '00:01', severity: 'info' });
    var logs = state.getLogs();
    logs.push({ text: 'injected' });
    assert.equal(state.getLogs().length, 1, 'external push should not affect internal log');
  });

  // ── Snapshot ──────────────────────────────────────────────────────────

  it('snapshot returns a deep copy', function () {
    var snap = state.snapshot();
    snap.match.minute = 999;
    assert.notEqual(state.getMatch().minute, 999, 'snapshot mutation should not affect state');
  });

  // ── Reset ─────────────────────────────────────────────────────────────

  it('reset restores default state', function () {
    state.setMatchMinute(88);
    state.setActiveEmergency({ type: 'fire', priority: 'HIGH' });
    state.reset();
    assert.isFalse(state.hasActiveEmergency());
    assert.equal(state.getMatch().minute, 45, 'minute should reset to default 45');
  });
});

/** Tests: EventBus module */
describe('EventBus', function () {

  var bus;

  beforeEach(function () {
    bus = new EventBus();
  });

  // ── on / emit ─────────────────────────────────────────────────────────

  it('emit delivers payload to listener', function () {
    var received = null;
    bus.on('test', function (d) { received = d; });
    bus.emit('test', { value: 42 });
    assert.equal(received.value, 42);
  });

  it('on returns an unsubscribe function', function () {
    var count = 0;
    var unsub = bus.on('ev', function () { count++; });
    bus.emit('ev', null);
    unsub();
    bus.emit('ev', null);
    assert.equal(count, 1, 'should have been called exactly once after unsubscribe');
  });

  it('multiple listeners on same event are all called', function () {
    var log = [];
    bus.on('multi', function () { log.push('A'); });
    bus.on('multi', function () { log.push('B'); });
    bus.emit('multi', null);
    assert.equal(log.length, 2);
    assert.includes(log, 'A');
    assert.includes(log, 'B');
  });

  it('emit for unknown event does not throw', function () {
    assert.doesNotThrow(function () { bus.emit('no-such-event', null); });
  });

  // ── off ───────────────────────────────────────────────────────────────

  it('off removes a specific listener', function () {
    var count = 0;
    var fn = function () { count++; };
    bus.on('ev', fn);
    bus.off('ev', fn);
    bus.emit('ev', null);
    assert.equal(count, 0);
  });

  it('off on unknown event does not throw', function () {
    assert.doesNotThrow(function () { bus.off('ghost-event', function () {}); });
  });

  it('off only removes the targeted listener, leaving others intact', function () {
    var countA = 0, countB = 0;
    var fnA = function () { countA++; };
    var fnB = function () { countB++; };
    bus.on('ev', fnA);
    bus.on('ev', fnB);
    bus.off('ev', fnA);
    bus.emit('ev', null);
    assert.equal(countA, 0);
    assert.equal(countB, 1);
  });

  // ── once ──────────────────────────────────────────────────────────────

  it('once listener fires exactly once', function () {
    var count = 0;
    bus.once('single', function () { count++; });
    bus.emit('single', null);
    bus.emit('single', null);
    bus.emit('single', null);
    assert.equal(count, 1);
  });

  it('once returns an unsubscribe function', function () {
    var count = 0;
    var unsub = bus.once('ev', function () { count++; });
    unsub();
    bus.emit('ev', null);
    assert.equal(count, 0, 'listener should not fire after manual unsub');
  });

  // ── error isolation ───────────────────────────────────────────────────

  it('a throwing listener does not block other listeners', function () {
    var secondCalled = false;
    bus.on('err-test', function () { throw new Error('intentional'); });
    bus.on('err-test', function () { secondCalled = true; });
    assert.doesNotThrow(function () { bus.emit('err-test', null); });
    assert.isTrue(secondCalled);
  });

  // ── clear ────────────────────────────────────────────────────────────

  it('clear(event) removes all listeners for that event', function () {
    var count = 0;
    bus.on('clr', function () { count++; });
    bus.on('clr', function () { count++; });
    bus.clear('clr');
    bus.emit('clr', null);
    assert.equal(count, 0);
  });

  it('clear() with no arg removes all listeners', function () {
    var count = 0;
    bus.on('a', function () { count++; });
    bus.on('b', function () { count++; });
    bus.clear();
    bus.emit('a', null);
    bus.emit('b', null);
    assert.equal(count, 0);
  });

  // ── listenerCount ─────────────────────────────────────────────────────

  it('listenerCount returns correct count', function () {
    bus.on('lc', function () {});
    bus.on('lc', function () {});
    assert.equal(bus.listenerCount('lc'), 2);
  });

  it('listenerCount returns 0 for unknown event', function () {
    assert.equal(bus.listenerCount('nope'), 0);
  });

  // ── type safety ───────────────────────────────────────────────────────

  it('on throws TypeError when fn is not a function', function () {
    assert.throws(function () { bus.on('x', 'notAFunction'); });
  });

  it('once throws TypeError when fn is not a function', function () {
    assert.throws(function () { bus.once('x', 42); });
  });
});

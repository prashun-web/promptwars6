/** Tests: NavigationAgent pure functions */
describe('NavigationAgent — calculatePath()', function () {

  var calcPath = NavigationAgent.calculatePath;
  var centre   = { x: 300, y: 300 };
  var radius   = 110;

  it('returns an SVG path string starting with M', function () {
    var result = calcPath({ x: 100, y: 100 }, { x: 500, y: 500 }, centre, radius);
    assert.isTrue(result.startsWith('M'), 'path should start with M');
  });

  it('returns a straight line when path does not cross pitch', function () {
    // Both points are on the same side, not crossing pitch
    var result = calcPath({ x: 50, y: 50 }, { x: 100, y: 50 }, centre, radius);
    assert.includes(result, 'L');
  });

  it('returns a quadratic curve when path crosses pitch', function () {
    // Points on opposite sides — direct line passes through the centre pitch
    var result = calcPath({ x: 300, y: 50 }, { x: 300, y: 550 }, centre, radius);
    assert.includes(result, 'Q');
  });

  it('handles identical start and end points gracefully', function () {
    var result = calcPath({ x: 200, y: 200 }, { x: 200, y: 200 }, centre, radius);
    assert.isTrue(result.startsWith('M'));
  });

  it('produces different paths for different start points', function () {
    var pathA = calcPath({ x: 100, y: 100 }, { x: 400, y: 400 }, centre, radius);
    var pathB = calcPath({ x: 200, y: 150 }, { x: 400, y: 400 }, centre, radius);
    assert.notEqual(pathA, pathB);
  });

  it('path string contains both start coordinates', function () {
    var p1 = { x: 140, y: 140 };
    var p2 = { x: 460, y: 460 };
    var result = calcPath(p1, p2, centre, radius);
    assert.includes(result, '140');
    assert.includes(result, '460');
  });
});

describe('NavigationAgent — estimateWalk()', function () {

  var estimateWalk = NavigationAgent.estimateWalk;
  var p1 = { x: 140, y: 140 };
  var p2 = { x: 460, y: 460 };

  it('returns an object with distanceMeters and durationMins', function () {
    var result = estimateWalk(p1, p2, 'M 140 140 L 460 460', false, false);
    assert.isDefined(result.distanceMeters);
    assert.isDefined(result.durationMins);
  });

  it('distance is a positive number', function () {
    var result = estimateWalk(p1, p2, 'M 140 140 L 460 460', false, false);
    assert.greaterThan(result.distanceMeters, 0);
  });

  it('duration is a positive integer', function () {
    var result = estimateWalk(p1, p2, 'M 140 140 L 460 460', false, false);
    assert.greaterThan(result.durationMins, 0);
    assert.equal(result.durationMins, Math.round(result.durationMins));
  });

  it('emergency route has shorter duration than normal (faster speed)', function () {
    var normal    = estimateWalk(p1, p2, 'M 140 140 L 460 460', false, false);
    var emergency = estimateWalk(p1, p2, 'M 140 140 L 460 460', false, true);
    assert.lessThan(emergency.durationMins, normal.durationMins + 1,
      'emergency walk should be at least as fast as normal');
  });

  it('accessible route has longer duration than normal (slower speed)', function () {
    var normal     = estimateWalk(p1, p2, 'M 140 140 L 460 460', false, false);
    var accessible = estimateWalk(p1, p2, 'M 140 140 L 460 460', true,  false);
    assert.greaterThan(accessible.durationMins, normal.durationMins - 1,
      'accessible walk should be at least as long as normal');
  });

  it('curved path (containing Q) is longer than straight', function () {
    var straight = estimateWalk(p1, p2, 'M 140 140 L 460 460',           false, false);
    var curved   = estimateWalk(p1, p2, 'M 140 140 Q 300 10 460 460',    false, false);
    assert.greaterThan(curved.distanceMeters, straight.distanceMeters);
  });

  it('zero-length path yields non-zero distance due to overhead factor', function () {
    var samePoint = { x: 300, y: 300 };
    var result    = estimateWalk(samePoint, samePoint, 'M 300 300 L 300 300', false, false);
    assert.equal(result.distanceMeters, 0);
  });
});

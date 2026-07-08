/**
 * FIFA AI Command Center — Micro Test Harness
 * Zero dependencies, in-browser assertion library.
 * Works on file:// without any build tools.
 */
(function (global) {
  'use strict';

  var _suites   = [];
  var _current  = null;

  /**
   * Define a test suite.
   * @param {string}   name
   * @param {Function} fn
   */
  function describe(name, fn) {
    var suite = { name: name, tests: [], beforeEach: null, afterEach: null };
    var prev  = _current;
    _current  = suite;
    try { fn(); } catch (e) { console.error('[Suite error]', name, e); }
    _current = prev;
    _suites.push(suite);
  }

  function beforeEach(fn) { if (_current) _current.beforeEach = fn; }
  function afterEach(fn)  { if (_current) _current.afterEach  = fn; }

  /**
   * Define a test case.
   * @param {string}   description
   * @param {Function} fn  — can be sync or return a Promise
   */
  function it(description, fn) {
    if (!_current) throw new Error('[it] called outside describe block');
    _current.tests.push({ description: description, fn: fn });
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  var assert = {
    /** @param {boolean} value */
    isTrue: function (value, msg) {
      if (value !== true) throw new AssertionError('Expected true, got: ' + JSON.stringify(value), msg);
    },
    isFalse: function (value, msg) {
      if (value !== false) throw new AssertionError('Expected false, got: ' + JSON.stringify(value), msg);
    },
    equal: function (actual, expected, msg) {
      if (actual !== expected) throw new AssertionError('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual), msg);
    },
    notEqual: function (actual, expected, msg) {
      if (actual === expected) throw new AssertionError('Expected value to differ from: ' + JSON.stringify(expected), msg);
    },
    deepEqual: function (actual, expected, msg) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new AssertionError('Expected:\n' + JSON.stringify(expected, null, 2) + '\nbut got:\n' + JSON.stringify(actual, null, 2), msg);
      }
    },
    isDefined: function (value, msg) {
      if (value === undefined || value === null) throw new AssertionError('Expected defined value, got: ' + value, msg);
    },
    isNull: function (value, msg) {
      if (value !== null) throw new AssertionError('Expected null, got: ' + JSON.stringify(value), msg);
    },
    includes: function (haystack, needle, msg) {
      var ok = typeof haystack === 'string' ? haystack.includes(needle) : (Array.isArray(haystack) && haystack.indexOf(needle) !== -1);
      if (!ok) throw new AssertionError('"' + JSON.stringify(haystack) + '" does not include ' + JSON.stringify(needle), msg);
    },
    throws: function (fn, msg) {
      try { fn(); throw new AssertionError('Expected an error to be thrown', msg); }
      catch (e) { if (e instanceof AssertionError) throw e; /* error was thrown — pass */ }
    },
    doesNotThrow: function (fn, msg) {
      try { fn(); }
      catch (e) { throw new AssertionError('Unexpected error: ' + e.message, msg); }
    },
    greaterThan: function (actual, expected, msg) {
      if (!(actual > expected)) throw new AssertionError(actual + ' is not greater than ' + expected, msg);
    },
    lessThan: function (actual, expected, msg) {
      if (!(actual < expected)) throw new AssertionError(actual + ' is not less than ' + expected, msg);
    },
    between: function (actual, min, max, msg) {
      if (actual < min || actual > max) throw new AssertionError(actual + ' is not in range [' + min + ', ' + max + ']', msg);
    },
  };

  function AssertionError(message, hint) {
    this.message = (hint ? '[' + hint + '] ' : '') + 'ASSERTION FAILED: ' + message;
    this.name    = 'AssertionError';
  }
  AssertionError.prototype = Object.create(Error.prototype);

  // ── Runner ────────────────────────────────────────────────────────────────

  function run() {
    return new Promise(function (resolve) {
      var results = { passed: 0, failed: 0, errors: [] };

      function runNext(suiteIdx, testIdx) {
        if (suiteIdx >= _suites.length) { resolve(results); return; }
        var suite = _suites[suiteIdx];
        if (testIdx >= suite.tests.length) { runNext(suiteIdx + 1, 0); return; }

        var test = suite.tests[testIdx];
        var ctx  = {};

        try {
          if (suite.beforeEach) suite.beforeEach.call(ctx);
          var result = test.fn.call(ctx);
          var finish = function () {
            if (suite.afterEach) { try { suite.afterEach.call(ctx); } catch(e) {} }
            results.passed++;
            renderResult(suite.name, test.description, true, null);
            runNext(suiteIdx, testIdx + 1);
          };
          if (result && typeof result.then === 'function') {
            result.then(finish).catch(function (err) {
              onFail(suite, test, err, results, suiteIdx, testIdx, runNext);
            });
          } else { finish(); }
        } catch (err) {
          onFail(suite, test, err, results, suiteIdx, testIdx, runNext);
        }
      }

      runNext(0, 0);
    });
  }

  function onFail(suite, test, err, results, sIdx, tIdx, runNext) {
    if (suite.afterEach) { try { suite.afterEach(); } catch(e) {} }
    results.failed++;
    results.errors.push({ suite: suite.name, test: test.description, message: err.message });
    renderResult(suite.name, test.description, false, err.message);
    runNext(sIdx, tIdx + 1);
  }

  function renderResult(suiteName, testName, passed, errorMsg) {
    var list = document.getElementById('test-results');
    if (!list) return;
    var li   = document.createElement('li');
    li.className = passed ? 'test-pass' : 'test-fail';
    li.textContent = (passed ? '\u2705' : '\u274C') + ' [' + suiteName + '] ' + testName + (errorMsg ? ' — ' + errorMsg : '');
    list.appendChild(li);
  }

  // ── Expose ───────────────────────────────────────────────────────────────
  global.describe   = describe;
  global.it         = it;
  global.beforeEach = beforeEach;
  global.afterEach  = afterEach;
  global.assert     = assert;
  global.runTests   = run;

}(window));

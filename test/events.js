/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Events', function() {

  test('addEventListener', function() {
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    var called = 0;
    function f(e) {
      called++;
    }

    div1.addEventListener('click', f, true);
    div2.addEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(called, 2);

    div1.removeEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(called, 3);

    div2.removeEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(called, 3);
  });

  test('event', function() {
    var div = document.createElement('div');
    var called = 0;
    var f;
    div.addEventListener('x', f = function(e) {
      called++;
      assert.equal(this, div);
      assert.equal(e.target, div);
      assert.equal(e.currentTarget, div);
      assert.equal(e.type, 'x');
    }, false);
    var e = document.createEvent('Event');
    e.initEvent('x', true, true);
    div.dispatchEvent(e);
    assert.equal(called, 1);

    div.removeEventListener('x', f, false);
    var e2 = document.createEvent('Event');
    e2.initEvent('x', true, true);
    div.dispatchEvent(e2);
    assert.equal(called, 1);
  });

  test('mouse event', function() {
    var div = document.createElement('div');
    var called = false;
    div.addEventListener('click', function(e) {
      called = true;
      assert.equal(this, div);
      assert.equal(e.target, div);
      assert.equal(e.currentTarget, div);
      assert.equal(e.relatedTarget, null);
      assert.equal(e.type, 'click');
    }, false);
    div.click();
    assert.isTrue(called);
  });

  test('retarget', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a><b></b></a>';
    var a = div.firstChild;
    var b = a.firstChild;
    var sr = div.createShadowRoot();
    sr.innerHTML = '<p><content></content></p>';
    var p = sr.firstChild;
    var content = p.firstChild;

    // trigger recalc
    div.offsetWidth;

    var tuples = retarget(b);

    function targets(tuples) {
      return tuples.map(function(tuple) {
        return tuple.target;
      });
    }

    function ancestors(tuples) {
      return tuples.map(function(tuple) {
        return tuple.ancestor;
      });
    }

    assertArrayEqual(targets(tuples), [b, b, b, b, b, b]);
    assertArrayEqual(ancestors(tuples), [b, a, content, p, sr, div]);

    tuples = retarget(content);
    assertArrayEqual(targets(tuples), [content, content, content, div]);
    assertArrayEqual(ancestors(tuples), [content, p, sr, div]);

    var sr2 = div.createShadowRoot();
    sr2.innerHTML = '<q><shadow></shadow></q>';
    var q = sr2.firstChild;
    var shadow = q.firstChild;

    // trigger recalc
    div.offsetWidth;

    tuples = retarget(b);
    assertArrayEqual(targets(tuples), [b, b, b, b, b, b, b, b, b]);
    assertArrayEqual(ancestors(tuples),
                     [b, a, content, p, sr, shadow, q, sr2, div]);
  });

});

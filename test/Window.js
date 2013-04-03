/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Window', function() {

  var wrap = ShadowDOMPolyfill.wrap;

  test('addEventListener', function() {
    var calls = 0;
    var doc = wrap(document);
    var win = wrap(window);
    window.addEventListener('click', function f(e) {
      calls++;
      assert.equal(this, win);
      assert.equal(e.target, doc.body);
      assert.equal(e.currentTarget, this);
      window.removeEventListener('click', f);
    });
    win.addEventListener('click', function f(e) {
      calls++;
      assert.equal(this, win);
      assert.equal(e.target, doc.body);
      assert.equal(e.currentTarget, this);
      win.removeEventListener('click', f);
    });

    document.body.click();
    assert.equal(2, calls);

    document.body.click();
    assert.equal(2, calls);
  });
});

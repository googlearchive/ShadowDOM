/**
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('TreeScope', function() {

  var getTreeScope = ShadowDOMPolyfill.getTreeScope;

  test('Basic', function() {
    var div = document.createElement('div');

    var ts = getTreeScope(div);
    assert.equal(ts.root, div);

    div.innerHTML = '<a><b></b></a>';
    var a = div.firstChild;
    var b = a.firstChild;

    assert.equal(getTreeScope(a), ts);
    assert.equal(getTreeScope(b), ts);
  });

  test('ShadowRoot', function() {
    var div = document.createElement('div');

    var ts = getTreeScope(div);
    assert.equal(ts.root, div);

    div.innerHTML = '<a><b></b></a>';
    var a = div.firstChild;
    var b = a.firstChild;

    var sr = a.createShadowRoot();

    var srTs = getTreeScope(sr);
    assert.equal(srTs.root, sr);
    assert.equal(srTs.parent, ts);

    sr.innerHTML = '<c><d></d></c>';
    var c = sr.firstChild;
    var d = c.firstChild;

    assert.equal(getTreeScope(c), srTs);
    assert.equal(getTreeScope(d), srTs);
  });

});

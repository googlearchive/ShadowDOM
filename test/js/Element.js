/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Element', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var div;

  teardown(function() {
    if (div && div.parentNode)
      div.parentNode.removeChild(div);
    div = null;
  });

  test('querySelector', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a><b></b></a>';
    var b = div.firstChild.firstChild;
    assert.equal(div.querySelector('b'), b);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<b></b>';
    var srb = sr.firstChild;

    div.offsetHeight;

    assert.equal(div.querySelector('b'), b);
    assert.equal(sr.querySelector('b'), srb);
  });

  test('querySelectorAll', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.querySelectorAll('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<a>3</a><a>4</a>';
    var a3 = sr.firstChild;
    var a4 = sr.lastChild;

    div.offsetHeight;

    var as = div.querySelectorAll('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as[1], a1);

    var as = sr.querySelectorAll('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a3);
    assert.equal(as[1], a4);
  });

  test('getElementsByTagName', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.getElementsByTagName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<a>3</a><a>4</a>';
    var a3 = sr.firstChild;
    var a4 = sr.lastChild;

    div.offsetHeight;

    var as = div.getElementsByTagName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as[1], a1);

    var as = sr.getElementsByTagName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a3);
    assert.equal(as[1], a4);
  });

  test('getElementsByTagName with colon', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a:b:c>0</a:b:c><a:b:c>1</a:b:c>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.getElementsByTagName('a:b:c');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);
  });

  test('getElementsByTagName with namespace', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;
    var a2 = document.createElementNS('NS', 'a');
    var a3 = document.createElementNS('NS', 'A');
    div.appendChild(a2);
    div.appendChild(a3);

    var as = div.getElementsByTagName('a');
    assert.equal(as.length, 3);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);
    assert.equal(as[2], a2);
    assert.equal(as.item(2), a2);

    var as = div.getElementsByTagName('A');
    assert.equal(as.length, 3);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);
    assert.equal(as[2], a3);
    assert.equal(as.item(2), a3);
  });

  test('getElementsByClassName', function() {
    var div = document.createElement('div');
    div.innerHTML = '<span class=a>0</span><span class=a>1</span>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.getElementsByClassName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<span class=a>3</span><span class=a>4</span>';
    var a3 = sr.firstChild;
    var a4 = sr.lastChild;

    div.offsetHeight;

    var as = div.getElementsByClassName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as[1], a1);

    var as = sr.getElementsByClassName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a3);
    assert.equal(as[1], a4);
  });

  test('webkitCreateShadowRoot', function() {
    var div = document.createElement('div');
    if (!div.webkitCreateShadowRoot)
      return;
    var sr = div.webkitCreateShadowRoot();
    assert.instanceOf(sr, ShadowRoot);
  });

  test('getDestinationInsertionPoints', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a><b></b>';
    var a = div.firstChild;
    var b = div.lastChild;
    var sr = div.createShadowRoot();
    sr.innerHTML = '<content id=a></content>';
    var content = sr.firstChild;

    assertArrayEqual([content], a.getDestinationInsertionPoints());
    assertArrayEqual([content], b.getDestinationInsertionPoints());

    var sr2 = div.createShadowRoot();
    sr2.innerHTML = '<content id=b select=b></content>';
    var contentB = sr2.firstChild;

    assertArrayEqual([content], a.getDestinationInsertionPoints());
    assertArrayEqual([contentB], b.getDestinationInsertionPoints());
  });

  test('getDestinationInsertionPoints redistribution', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a><b></b>';
    var a = div.firstChild;
    var b = div.lastChild;
    var sr = div.createShadowRoot();
    sr.innerHTML = '<c><content id=a></content></c>';
    var c = sr.firstChild;
    var content = c.firstChild;
    var sr2 = c.createShadowRoot();
    sr2.innerHTML = '<content id=b select=b></content>';
    var contentB = sr2.firstChild;

    assertArrayEqual([content], a.getDestinationInsertionPoints());
    assertArrayEqual([content, contentB], b.getDestinationInsertionPoints());
  });

  test('getElementsByName', function() {
    div = document.createElement('div');
    document.body.appendChild(div);
    div.innerHTML = '<span name=a>0</span><span name=a>1</span>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = document.getElementsByName('a');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    var doc = wrap(document);
    as = doc.getElementsByName('a');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    a0.setAttribute('name', '"odd"');
    as = document.getElementsByName('"odd"');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 1);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<span name=a></span>';
    as = document.getElementsByName('a');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 1);
    assert.equal(as[0], a1);
    assert.equal(as.item(0), a1);
  });
});

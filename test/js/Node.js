/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Node', function() {

  var wrap = ShadowDOMPolyfill.wrap;

  var DOCUMENT_POSITION_DISCONNECTED = Node.DOCUMENT_POSITION_DISCONNECTED;
  var DOCUMENT_POSITION_PRECEDING = Node.DOCUMENT_POSITION_PRECEDING;
  var DOCUMENT_POSITION_FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
  var DOCUMENT_POSITION_CONTAINS = Node.DOCUMENT_POSITION_CONTAINS;
  var DOCUMENT_POSITION_CONTAINED_BY = Node.DOCUMENT_POSITION_CONTAINED_BY;
  var DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;

  test('compareDocumentPosition', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a><b></b><c></c></a>';
    var a = div.firstChild;
    var b = a.firstChild;
    var c = a.lastChild;

    assert.equal(div.compareDocumentPosition(div), 0);
    assert.equal(div.compareDocumentPosition(a),
        DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);
    assert.equal(div.compareDocumentPosition(b),
        DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);
    assert.equal(div.compareDocumentPosition(c),
        DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);

    assert.equal(a.compareDocumentPosition(div),
        DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
    assert.equal(a.compareDocumentPosition(a), 0);
    assert.equal(a.compareDocumentPosition(b),
        DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);
    assert.equal(a.compareDocumentPosition(c),
        DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);

    assert.equal(b.compareDocumentPosition(div),
        DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
    assert.equal(b.compareDocumentPosition(a),
        DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
    assert.equal(b.compareDocumentPosition(b), 0);
    assert.equal(b.compareDocumentPosition(c),
        DOCUMENT_POSITION_FOLLOWING);

    assert.equal(c.compareDocumentPosition(div),
        DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
    assert.equal(c.compareDocumentPosition(a),
        DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
    assert.equal(c.compareDocumentPosition(b),
        DOCUMENT_POSITION_PRECEDING);
    assert.equal(c.compareDocumentPosition(c), 0);

    // WebKit uses DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC.
    assert.notEqual(document.compareDocumentPosition(div) &
        DOCUMENT_POSITION_DISCONNECTED, 0)
  });

  test('ownerDocument with template and shadow root', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><span></span></template>';

    var content1 = div.firstChild.content;
    var host = content1.firstChild;

    div.innerHTML = '<template>hello world</template>';
    var content2 = div.firstChild.content;
    var x = content2.firstChild;

    var sr = host.createShadowRoot();
    sr.appendChild(content2);

    assert.equal(x.parentNode, sr);
    assert.equal(x.ownerDocument, sr.ownerDocument);
    assert.equal(sr.ownerDocument, host.ownerDocument);

    var doc = wrap(document);
    doc.body.appendChild(host);
    assert.equal(host.ownerDocument, doc);
    assert.equal(sr.ownerDocument, doc);
    assert.equal(x.ownerDocument, doc);

    doc.body.removeChild(host);
  });
});

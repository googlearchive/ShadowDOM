/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Document', function() {

  var WrapperHTMLElement = ShadowDOMPolyfill.WrapperHTMLElement;
  var WrapperNodeList = ShadowDOMPolyfill.WrapperNodeList;
  var wrap = ShadowDOMPolyfill.wrap;

  test('Ensure Document has ParentNodeInterface', function() {
    var doc = wrap(document).implementation.createHTMLDocument('');
    assert.equal(doc.firstElementChild.tagName, 'HTML');
    assert.equal(doc.lastElementChild.tagName, 'HTML');
  });

  test('document.documentElement', function() {
    var doc = wrap(document);
    assert.equal(doc.documentElement.ownerDocument, doc);
    assert.equal(doc.documentElement.tagName, 'HTML');
  });

  test('document.body', function() {
    var doc = wrap(document);
    assert.equal(doc.body.ownerDocument, doc);
    assert.equal(doc.body.tagName, 'BODY');
    assert.equal(doc.body.parentNode, doc.documentElement);
  });

  test('document.head', function() {
    var doc = wrap(document);
    assert.equal(doc.head.ownerDocument, doc);
    assert.equal(doc.head.tagName, 'HEAD');
    assert.equal(doc.head.parentNode, doc.documentElement);
  });

  test('getElementsByTagName', function() {
    var elements = document.getElementsByTagName('body');
    assert.isTrue(elements instanceof WrapperNodeList);
    assert.equal(elements.length, 1);
    assert.isTrue(elements[0] instanceof WrapperHTMLElement);

    var doc = wrap(document);
    assert.equal(doc.body, elements[0]);
    assert.equal(doc.body, elements.item(0));

    var elements2 = doc.getElementsByTagName('body');
    assert.isTrue(elements2 instanceof WrapperNodeList);
    assert.equal(elements2.length, 1);
    assert.isTrue(elements2[0] instanceof WrapperHTMLElement);
    assert.equal(doc.body, elements2[0]);
    assert.equal(doc.body, elements2.item(0));
  });

  test('querySelectorAll', function() {
    var elements = document.querySelectorAll('body');
    assert.isTrue(elements instanceof WrapperNodeList);
    assert.equal(elements.length, 1);
    assert.isTrue(elements[0] instanceof WrapperHTMLElement);

    var doc = wrap(document);
    assert.equal(doc.body, elements[0]);

    var elements2 = doc.querySelectorAll('body');
    assert.isTrue(elements2 instanceof WrapperNodeList);
    assert.equal(elements2.length, 1);
    assert.isTrue(elements2[0] instanceof WrapperHTMLElement);
    assert.equal(doc.body, elements2[0]);
  });
});

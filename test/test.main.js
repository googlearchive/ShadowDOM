/* 
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

var assert = chai.assert;

function expectStructure(nodeOrWrapper, nonNullFields) {
  assert(nodeOrWrapper);
  assert.strictEqual(nodeOrWrapper.parentNode, nonNullFields.parentNode || null);
  assert.strictEqual(nodeOrWrapper.previousSibling,
      nonNullFields.previousSibling || null);
  assert.strictEqual(nodeOrWrapper.nextSibling, nonNullFields.nextSibling || null);
  assert.strictEqual(nodeOrWrapper.firstChild, nonNullFields.firstChild || null);
  assert.strictEqual(nodeOrWrapper.lastChild, nonNullFields.lastChild || null);
}

function unwrapAndExpectStructure(node, nonNullFields) {
  for (var p in nonNullFields) {
    nonNullFields[p] = ShadowDOMPolyfill.unwrap(nonNullFields[p]);
  }
  expectStructure(ShadowDOMPolyfill.unwrap(node), nonNullFields);
}

function assertArrayEqual(a, b, msg) {
  assert.equal(a.length, b.length, msg);
  for (var i = 0; i < a.length; i++) {
    assert.equal(a[i], b[i], msg);
  }
}

mocha.setup({
  ui: 'tdd',
  globals: ['console', 'getInterface']
})

var modules = [
  "test.js",
  "paralleltrees.js",
  "rerender.js",
  "reprojection.js",
  "custom-element.js",
  "HTMLShadowElement.js",
  "HTMLContentElement.js",
  "HTMLTemplateElement.js",
  "Document.js",
  "Window.js",
  "Element.js",
  "ParentNodeInterface.js",
  "wrappers.js",
  "events.js"
];

modules.forEach(function(inSrc) {
  document.write('<script src="' + inSrc + '"></script>');
});

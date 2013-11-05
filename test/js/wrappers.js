/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Wrapper creation', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;
  var knownElements = ShadowDOMPolyfill.knownElements;

  test('Br element wrapper', function() {
    var br = document.createElement('br');
    assert.isTrue('clear' in br);
    assert.isFalse(br.hasOwnProperty('clear'));
    assert.isTrue(Object.getPrototypeOf(br).hasOwnProperty('clear'));
  });

  Object.keys(knownElements).forEach(function(tagName) {
    test(tagName, function() {
      var constructor = window[knownElements[tagName]];
      if (!constructor)
        return;

      var element = document.createElement(tagName);
      assert.instanceOf(element, constructor);
      assert.equal(Object.getPrototypeOf(element), constructor.prototype);
    });
  });

});

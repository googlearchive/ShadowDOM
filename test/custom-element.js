/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Custom Element', function() {

  test('Correct Wrapper for Custom Element', function() {
    // make prototype
    var prototype = Object.create(HTMLUnknownElement.prototype);
    prototype.customMethod = function() {
    };
    // make a DOM instance
    var div = document.createElement('div');
    // strip wrapper (TODO(sjmiles): should we make api for this?)
    div = unwrap(div);
    div.__$wrapper$__ = null;
    // implement custom API
    if (Object.__proto__) {
      // for browsers that support __proto__
      div.__proto__ = prototype;
    } else {
      // for browsers that don't support __proto__
      div.customMethod = prototype.customMethod;
      // custom API hint for ShadowDOM polyfill
      div.__proto__ = prototype;
    }
    assert.typeOf(div.customMethod, 'function', 'plain custom element has custom function');
    // wrap
    var wdiv = wrap(div);
    assert.typeOf(wdiv.customMethod, 'function', 'wrapped custom element has custom function');
  });

});
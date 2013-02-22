// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {

  exports.WrapperHTMLDocument = wrappers.registerObject(
      document.implementation.createHTMLDocument(''));

  // window.document is [Unforgable] so we need to override its properties.

  function wrapMethod(nativeConstructor, name) {
    var original = nativeConstructor.prototype[name];
    nativeConstructor.prototype[name] = function() {
      return wrap(original.apply(this, arguments));
    };
  }

  [
    'getElementById',
    'querySelector',
    'createElement',
    'createTextNode',
    'createDocumentFragment'
  ].forEach(function(name) {
    // Use HTMLDocument since Firefox implements these on the wrong object.
    wrapMethod(HTMLDocument, name);
  });

})(this);
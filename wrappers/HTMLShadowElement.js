// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperHTMLShadowElement(node) {
    WrapperHTMLElement.call(this, node);
  }
  WrapperHTMLShadowElement.prototype = Object.create(WrapperHTMLElement.prototype);
  mixin(WrapperHTMLShadowElement.prototype, {
    get olderShadowRoot() {
      throw new Error('Not implemented');
    }
    // TODO: attribute boolean resetStyleInheritance;
  });

  if (typeof HTMLShadowElement !== 'undefined')
    constructorTable.set(HTMLShadowElement, WrapperHTMLShadowElement);

  exports.WrapperHTMLShadowElement = WrapperHTMLShadowElement;
})(this);
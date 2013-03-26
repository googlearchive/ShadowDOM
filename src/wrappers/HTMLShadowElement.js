// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var WrapperHTMLElement = scope.WrapperHTMLElement;
  var mixin = scope.mixin;
  var wrappers = scope.wrappers;

  function WrapperHTMLShadowElement(node) {
    WrapperHTMLElement.call(this, node);
    this.olderShadowRoot_ = null;
  }
  WrapperHTMLShadowElement.prototype = Object.create(WrapperHTMLElement.prototype);
  mixin(WrapperHTMLShadowElement.prototype, {
    get olderShadowRoot() {
      return this.olderShadowRoot_;
    }
    // TODO: attribute boolean resetStyleInheritance;
  });

  if (typeof HTMLShadowElement !== 'undefined')
    wrappers.register(HTMLShadowElement, WrapperHTMLShadowElement);

  scope.WrapperHTMLShadowElement = WrapperHTMLShadowElement;
})(this.ShadowDOMPolyfill);
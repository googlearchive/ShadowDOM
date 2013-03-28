// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var WrapperHTMLElement = scope.WrapperHTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;

  var WrapperHTMLShadowElement = function HTMLShadowElement(node) {
    WrapperHTMLElement.call(this, node);
    this.olderShadowRoot_ = null;
  };
  WrapperHTMLShadowElement.prototype = Object.create(WrapperHTMLElement.prototype);
  mixin(WrapperHTMLShadowElement.prototype, {
    get olderShadowRoot() {
      return this.olderShadowRoot_;
    }
    // TODO: attribute boolean resetStyleInheritance;
  });

  if (typeof HTMLShadowElement !== 'undefined')
    registerWrapper(HTMLShadowElement, WrapperHTMLShadowElement);

  scope.WrapperHTMLShadowElement = WrapperHTMLShadowElement;
})(this.ShadowDOMPolyfill);
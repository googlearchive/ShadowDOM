// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var WrapperHTMLContentElement = scope.WrapperHTMLContentElement;
  var WrapperHTMLElement = scope.WrapperHTMLElement;
  var WrapperHTMLShadowElement = scope.WrapperHTMLShadowElement;
  var WrapperHTMLTemplateElement = scope.WrapperHTMLTemplateElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;

  var WrapperHTMLUnknownElement = function HTMLUnknownElement(node) {
    switch (node.localName) {
      case 'content':
        return new WrapperHTMLContentElement(node);
      case 'shadow':
        return new WrapperHTMLShadowElement(node);
      case 'template':
        return new WrapperHTMLTemplateElement(node);
    }
    WrapperHTMLElement.call(this, node);
  };
  WrapperHTMLUnknownElement.prototype = Object.create(WrapperHTMLElement.prototype);
  registerWrapper(HTMLUnknownElement, WrapperHTMLUnknownElement);
  scope.WrapperHTMLUnknownElement = WrapperHTMLUnknownElement;
})(this.ShadowDOMPolyfill);
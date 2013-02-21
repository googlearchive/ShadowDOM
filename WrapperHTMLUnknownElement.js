// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperHTMLUnknownElement(node) {
    switch (node.tagName) {
      case 'CONTENT':
        return new WrapperHTMLContentElement(node);
      case 'SHADOW':
        return new WrapperHTMLShadowElement(node);
    }
    WrapperHTMLElement.call(this, node);
  }
  WrapperHTMLUnknownElement.prototype = Object.create(WrapperHTMLElement.prototype);
  constructorTable.set(HTMLUnknownElement, WrapperHTMLUnknownElement);
  exports.WrapperHTMLUnknownElement = WrapperHTMLUnknownElement;
})(this);
// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperHTMLTextAreaElement(node) {
    WrapperHTMLElement.call(this, node);
  }
  WrapperHTMLTextAreaElement.prototype = Object.create(WrapperHTMLElement.prototype);
  mixin(WrapperHTMLTextAreaElement.prototype, {
    get value() {
      // TODO: Add macro for this?
      return this.node.value;
    },

    set value(value) {
      // TODO: Add macro for this?
      this.node.value = value
    },
  });
  constructorTable.set(HTMLTextAreaElement, WrapperHTMLTextAreaElement);

  exports.WrapperHTMLTextAreaElement = WrapperHTMLTextAreaElement;
})(this);
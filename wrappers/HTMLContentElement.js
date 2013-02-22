// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperHTMLContentElement(node) {
    WrapperHTMLElement.call(this, node);
  }
  WrapperHTMLContentElement.prototype = Object.create(WrapperHTMLElement.prototype);
  mixin(WrapperHTMLContentElement.prototype, {
    get select() {
      return this.getAttribute('select');
    },
    set select(value) {
      this.setAttribute('select', value);
      this.invalidateShadowRenderer();
    },
    getDistributedNodes: function() {
      throw new Error('Not implemented');
    }
    // TODO: attribute boolean resetStyleInheritance;
  });

  if (typeof HTMLContentElement !== 'undefined')
    wrappers.register(HTMLContentElement, WrapperHTMLContentElement);

  exports.WrapperHTMLContentElement = WrapperHTMLContentElement;
})(this);
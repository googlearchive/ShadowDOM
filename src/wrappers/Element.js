// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperElement(node) {
    WrapperNode.call(this, node);
  }
  WrapperElement.prototype = Object.create(WrapperNode.prototype);
  mixin(WrapperElement.prototype, {
    createShadowRoot: function() {
      var newShadowRoot = new WrapperShadowRoot(this);
      this.__shadowRoot__ = newShadowRoot;

      var renderer = new ShadowRenderer(this);

      this.invalidateShadowRenderer();

      return newShadowRoot;
    },

    get shadowRoot() {
      return getYoungestTree(this) || null;
    },

    setAttribute: function(name, value) {
      this.node.setAttribute(name, value);
      // This is a bit agressive. We need to invalidate if it affects
      // the rendering content[select] or if it effects the value of a content
      // select.
      this.invalidateShadowRenderer();
    }
  });

  mixin(WrapperElement.prototype, parentNodeInterface);

  wrappers.register(Element, WrapperElement);

  exports.WrapperElement = WrapperElement;
})(this);

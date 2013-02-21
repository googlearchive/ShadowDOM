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
    get tagName() {
      return this.node.tagName;
    },

    get attributes() {
      // Wrap attributes?
      return this.node.attributes;
    },

    getAttribute: function(name) {
      // TODO: Add macro for this?
      return this.node.getAttribute(name);
    },
    setAttribute: function(name, value) {
      // TODO: Add macro for this?
      // TODO: Invalidate???
      this.node.setAttribute(name, value);
    },

    webkitMatchesSelector: function(selectors) {
      // TODO: Add macro for this?
      return this.node.webkitMatchesSelector(selectors);
    },
    mozMatchesSelector: function(selectors) {
      // TODO: Add macro for this?
      return this.node.mozMatchesSelector(selectors);
    },

    jsCreateShadowRoot: function() {
      var newShadowRoot = new WrapperShadowRoot(this);
      this.__shadowRoot__ = newShadowRoot;

      var renderer = new ShadowRenderer(this);

      this.invalidateShadowRenderer();

      return newShadowRoot;
    },

    get jsShadowRoot() {
      return getYoungestTree(this) || null;
    },
  });
  constructorTable.set(Element, WrapperElement);

  exports.WrapperElement = WrapperElement;
})(this);
// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ChildNodeInterface = scope.ChildNodeInterface;
  var ParentNodeInterface = scope.ParentNodeInterface;
  var SelectorsInterface = scope.SelectorsInterface;
  var WrapperNode = scope.WrapperNode;
  var addWrapNodeListMethod = scope.addWrapNodeListMethod;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var wrappers = scope.wrappers;

  var shadowRootTable = new SideTable();

  var WrapperElement = function Element(node) {
    WrapperNode.call(this, node);
  };
  WrapperElement.prototype = Object.create(WrapperNode.prototype);
  mixin(WrapperElement.prototype, {
    createShadowRoot: function() {
      var newShadowRoot = new scope.WrapperShadowRoot(this);
      shadowRootTable.set(this, newShadowRoot);

      var renderer = new scope.ShadowRenderer(this);

      this.invalidateShadowRenderer();

      return newShadowRoot;
    },

    get shadowRoot() {
      return shadowRootTable.get(this) || null;
    },
  
    setAttribute: function(name, value) {
      this.impl.setAttribute(name, value);
      // This is a bit agressive. We need to invalidate if it affects
      // the rendering content[select] or if it effects the value of a content
      // select.
      this.invalidateShadowRenderer();
    }
  });

  mixin(WrapperElement.prototype, ChildNodeInterface);
  mixin(WrapperElement.prototype, ParentNodeInterface);
  mixin(WrapperElement.prototype, SelectorsInterface);

  [
    'getElementsByTagName',
    'getElementsByTagNameNS',
    'getElementsByClassName'
  ].forEach(function(name) {
    addWrapNodeListMethod(WrapperElement, name);
  });

  registerWrapper(Element, WrapperElement);

  scope.WrapperElement = WrapperElement;
})(this.ShadowDOMPolyfill);

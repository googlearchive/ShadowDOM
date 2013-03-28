// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ChildNodeInterface = scope.ChildNodeInterface;
  var WrapperNode = scope.WrapperNode;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;

  var WrapperCharacterData = function CharacterData(node) {
    WrapperNode.call(this, node);
  };
  WrapperCharacterData.prototype = Object.create(WrapperNode.prototype);
  mixin(WrapperCharacterData.prototype, {
    get textContent() {
      return this.data;
    },
    set textContent(value) {
      this.data = value;
    }
  });

  mixin(WrapperCharacterData.prototype, ChildNodeInterface);

  registerWrapper(CharacterData, WrapperCharacterData,
                  document.createTextNode(''));

  scope.WrapperCharacterData = WrapperCharacterData;
})(this.ShadowDOMPolyfill);

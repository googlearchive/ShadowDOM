// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperCharacterData(node) {
    WrapperNode.call(this, node);
  }
  WrapperCharacterData.prototype = Object.create(WrapperNode.prototype);
  mixin(WrapperCharacterData.prototype, {
    get textContent() {
      return this.data;
    },
    set textContent(value) {
      this.data = value;
    }
  });

  wrappers.register(CharacterData, WrapperCharacterData,
                    document.createTextNode(''));

  exports.WrapperCharacterData = WrapperCharacterData;
})(this);

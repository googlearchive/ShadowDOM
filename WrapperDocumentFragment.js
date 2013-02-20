// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperDocumentFragment(node) {
    WrapperNode.call(this, node);
  }
  WrapperDocumentFragment.prototype = Object.create(WrapperNode.prototype);
  mixin(WrapperDocumentFragment.prototype, {
  });
  constructorTable.set(DocumentFragment, WrapperDocumentFragment);

  exports.WrapperDocumentFragment = WrapperDocumentFragment;
})(this);
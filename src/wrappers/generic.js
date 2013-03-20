// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var WrapperDocumentFragment =
      wrappers.registerObject(document.createDocumentFragment());
  mixin(WrapperDocumentFragment.prototype, ParentNodeInterface);
  mixin(WrapperDocumentFragment.prototype, SelectorsInterface);

  wrappers.registerObject(document.createTextNode(''));
  wrappers.registerObject(document.createComment(''));

  exports.WrapperDocumentFragment = WrapperDocumentFragment;

})(this);
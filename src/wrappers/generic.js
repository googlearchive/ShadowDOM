// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ParentNodeInterface = scope.ParentNodeInterface;
  var SelectorsInterface = scope.SelectorsInterface;
  var mixin = scope.mixin;
  var wrappers = scope.wrappers;

  var WrapperDocumentFragment =
      wrappers.registerObject(document.createDocumentFragment());
  mixin(WrapperDocumentFragment.prototype, ParentNodeInterface);
  mixin(WrapperDocumentFragment.prototype, SelectorsInterface);

  wrappers.registerObject(document.createTextNode(''));
  wrappers.registerObject(document.createComment(''));

  scope.WrapperDocumentFragment = WrapperDocumentFragment;

})(this.ShadowDOMPolyfill);
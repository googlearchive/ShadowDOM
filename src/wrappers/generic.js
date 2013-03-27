// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ParentNodeInterface = scope.ParentNodeInterface;
  var SelectorsInterface = scope.SelectorsInterface;
  var mixin = scope.mixin;
  var registerObject = scope.registerObject;

  var WrapperDocumentFragment =
      registerObject(document.createDocumentFragment());
  mixin(WrapperDocumentFragment.prototype, ParentNodeInterface);
  mixin(WrapperDocumentFragment.prototype, SelectorsInterface);

  registerObject(document.createTextNode(''));
  registerObject(document.createComment(''));

  scope.WrapperDocumentFragment = WrapperDocumentFragment;

})(this.ShadowDOMPolyfill);
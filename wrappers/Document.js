// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var WrapperDocument = wrappers.registerObject(
      document.implementation.createDocument(null, null, null),
      Document);
  mixin(WrapperDocumentFragment.prototype, parentNodeInterface);

  exports.WrapperDocument = WrapperDocument;

})(this);
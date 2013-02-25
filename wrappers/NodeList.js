// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperNodeList() {}
  WrapperNodeList.prototype = {
    item: function(index) {
      return this[index];
    }
  };
  Object.defineProperty(WrapperNodeList.prototype, 'item', {enumerable: false});

  exports.WrapperNodeList = WrapperNodeList;

})(this);
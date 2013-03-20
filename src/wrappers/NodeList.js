// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function nonEnum(obj, prop) {
    Object.defineProperty(obj, prop, {enumerable: false});
  }

  function WrapperNodeList() {
    this.length = 0;
    nonEnum(this, 'length');
  }
  WrapperNodeList.prototype = {
    item: function(index) {
      return this[index];
    }
  };
  nonEnum(WrapperNodeList.prototype, 'item');

  function wrapNodeList(list) {
    var wrapperList = new WrapperNodeList();
    for (var i = 0, length = list.length; i < length; i++) {
      wrapperList[i] = wrap(list[i]);
    }
    wrapperList.length = length;
    return wrapperList;
  }

  exports.wrapNodeList = wrapNodeList;
  exports.WrapperNodeList = WrapperNodeList;

})(this);
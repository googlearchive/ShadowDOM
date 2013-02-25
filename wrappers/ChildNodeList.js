// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function syncChildNodeList(listWrapper) {
    var parentNodeWrapper = listWrapper.parentNode_;
    var oldLength = listWrapper.length;
    var i = 0;
    for (var childWrapper = parentNodeWrapper.firstChild;
         childWrapper;
         childWrapper = childWrapper.nextSibling) {
      
      Object.defineProperty(listWrapper, i++, {
        value: childWrapper,
        enumerable: true,
        configurable: true,
        writable: false
      });
    }
    Object.defineProperty(listWrapper, 'length', {
      value: i,
      enumerable: false,
      configurable: true,
      writable: false
    });

    for (; i < oldLength; i++) {
      delete listWrapper[i];
    }
  }

  function WrapperChildNodeList(parentNode) {
    this.parentNode_ = parentNode;
    this.length = 0;
    syncChildNodeList(this);
  }
  WrapperChildNodeList.prototype = Object.create(WrapperNodeList.prototype);

  exports.WrapperChildNodeList = WrapperChildNodeList;

})(this);
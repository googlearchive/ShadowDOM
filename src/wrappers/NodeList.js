// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var wrap = scope.wrap;

  function nonEnum(obj, prop) {
    Object.defineProperty(obj, prop, {enumerable: false});
  }

  var WrapperNodeList = function NodeList() {
    this.length = 0;
    nonEnum(this, 'length');
  };
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

  function addWrapNodeListMethod(wrapperConstructor, name) {
    wrapperConstructor.prototype[name] = function() {
      return wrapNodeList(this.impl[name].apply(this.impl, arguments));
    };
  }

  scope.WrapperNodeList = WrapperNodeList;
  scope.addWrapNodeListMethod = addWrapNodeListMethod;
  scope.wrapNodeList = wrapNodeList;

})(this.ShadowDOMPolyfill);
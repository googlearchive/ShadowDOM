// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function forwardElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.nextSibling;
    }
    return node;
  }

  function backwardsElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.previousSibling;
    }
    return node;
  }

  var ParentNodeInterface = {
    get firstElementChild() {
      return forwardElement(this.firstChild);
    },

    get lastElementChild() {
      return backwardsElement(this.lastChild);
    },

    get childElementCount() {
      var count = 0;
      for (var child = this.firstElementChild;
           child;
           child = child.nextElementSibling) {
        count++;
      }
      return count;
    },

    get children() {
      var wrapperList = new WrapperNodeList();
      var i = 0;
      for (var child = this.firstElementChild;
           child;
           child = child.nextElementSibling) {
        wrapperList[i++] = child;
      }
      wrapperList.length = i;
      return wrapperList;
    }
  };

  var ChildNodeInterface = {
    get nextElementSibling() {
      return forwardElement(this.nextSibling);
    },

    get previousElementSibling() {
      return backwardsElement(this.nextSibling);
    }
  };

  var SelectorsInterface = {
    querySelector: function(s) {
      return wrap(this.impl.querySelector(s));
    },
    querySelectorAll: function(s) {
      return wrapNodeList(this.impl.querySelectorAll(s));
    }
  };

  function addWrapGetter(wrapperConstructor, name) {
    Object.defineProperty(wrapperConstructor.prototype, name, {
      get: function() {
        return wrap(this.impl[name]);
      },
      configurable: true,
      enumerable: true
    });
  }

  function addWrapNodeListMethod(wrapperConstructor, name) {
    wrapperConstructor.prototype[name] = function() {
      return wrapNodeList(this.impl[name].apply(this.impl, arguments));
    };
  }

  exports.addWrapGetter = addWrapGetter;
  exports.addWrapNodeListMethod = addWrapNodeListMethod;

  exports.ChildNodeInterface = ChildNodeInterface;
  exports.ParentNodeInterface = ParentNodeInterface;
  exports.SelectorsInterface = SelectorsInterface;

})(this);

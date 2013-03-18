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

  function addWrapGetter(wrapperConstructor, name) {
    Object.defineProperty(wrapperConstructor.prototype, name, {
      get: function() {
        return wrap(this.node[name]);
      },
      configurable: true,
      enumerable: true
    });
  }

  exports.ParentNodeInterface = ParentNodeInterface;
  exports.ChildNodeInterface = ChildNodeInterface;
  exports.addWrapGetter = addWrapGetter;

})(this);

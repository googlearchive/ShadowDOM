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

  var parentNodeInterface = {
    get nextElementSibling() {
      return forwardElement(this.nextSibling);
    },

    get previousElementSibling() {
      return backwardsElement(this.nextSibling);
    },

    get firstElementChild() {
      return forwardElement(this.firstChild);
    },

    get lastElementSibling() {
      return backwardsElement(this.lastChild);
    }
  };

  exports.parentNodeInterface = parentNodeInterface;

})(this);

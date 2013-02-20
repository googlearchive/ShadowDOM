// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

var visual;
var wrap, unwrap;
var constructorTable;

(function(exports) {
  'use strict';

  var wrapperTable = new SideTable('wrapper');
  constructorTable = new SideTable('constructor');

  function assert(b) {
    if (!b)
      throw new Error('Assertion failed');
  }

  function getWrapperConstructor(node) {

    var constructor = node.constructor;
    var wrapperConstructor = constructorTable.get(constructor);
    if (wrapperConstructor)
      return wrapperConstructor;

    var proto = Object.getPrototypeOf(node);
    var protoWrapperConstructor = getWrapperConstructor(proto);
    constructorTable.set(constructor, protoWrapperConstructor);
    return protoWrapperConstructor;    
  }

  /**
   * Wraps a node in a WrapperNode. If there already exists a wrapper for the
   * |node| that wrapper is returned instead.
   * @param {Node} node
   * @return {WrapperNode}
   */
  wrap = function wrap(node) {
    if (node === null)
      return null;

    assert(node instanceof Node);
    var wrapper = wrapperTable.get(node);
    if (!wrapper) {
      var wrapperConstructor = getWrapperConstructor(node);
      wrapper = new wrapperConstructor(node);
      wrapperTable.set(node, wrapper);
    }
    return wrapper;
  };

  /**
   * Unwraps a wrapper and returns the node it is wrapping.
   * @param {WrapperNode} wrapper
   * @return {Node}
   */
  unwrap = function unwrap(wrapper) {
    if (wrapper === null)
      return null;
    assert(wrapper instanceof WrapperNode);
    return wrapper.node;
  };

  /**
   * Updates the fields of a wrapper to a snapshot of the logical DOM as needed.
   * Up means parentNode
   * Sideways means previous and next sibling.
   * @param {!WrapperNode} wrapper
   */
  function updateWrapperUpAndSideways(wrapper) {
    wrapper.previousSibling_ = wrapper.previousSibling;
    wrapper.nextSibling_ = wrapper.nextSibling;
    wrapper.parentNode_ = wrapper.parentNode;
  }

  /**
   * Updates the fields of a wrapper to a snapshot of the logical DOM as needed.
   * Down means first and last child
   * @param {!WrapperNode} wrapper
   */
  function updateWrapperDown(wrapper) {
    wrapper.firstChild_ = wrapper.firstChild;
    wrapper.lastChild_ = wrapper.lastChild;
  }

  function updateAllChildNodes(parentNodeWrapper) {
    assert(parentNodeWrapper instanceof WrapperNode);
    for (var childWrapper = parentNodeWrapper.firstChild;
         childWrapper;
         childWrapper = childWrapper.nextSibling) {
      updateWrapperUpAndSideways(childWrapper);
    }
    updateWrapperDown(parentNodeWrapper);
  }

  // This object groups DOM operations. This is supposed to be the DOM as the
  // browser/render tree sees it.
  // When changes are done to the visual DOM the logical DOM needs to be updated
  // to reflect the correct tree.
  visual = {
    removeAllChildNodes: function(parentNodeWrapper) {
      var parentNode = unwrap(parentNodeWrapper);
      updateAllChildNodes(parentNodeWrapper);
      parentNode.textContent = '';
    },

    appendChild: function(parentNodeWrapper, childWrapper) {
      var parentNode = unwrap(parentNodeWrapper);
      var child = unwrap(childWrapper);
      if (child.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        updateAllChildNodes(childWrapper);

      } else {
        this.remove(childWrapper);
        updateWrapperUpAndSideways(childWrapper);
      }

      parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;
      if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild)
        parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;

      var lastChildWrapper = wrap(parentNode.lastChild);
      if (lastChildWrapper) {
        lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;
      }

      parentNode.appendChild(child);
    },

    removeChild: function(parentNodeWrapper, childWrapper) {
      var parentNode = unwrap(parentNodeWrapper);
      var child = unwrap(childWrapper);

      updateWrapperUpAndSideways(childWrapper);

      if (childWrapper.previousSibling)
        childWrapper.previousSibling.nextSibling_ = childWrapper;
      if (childWrapper.nextSibling)
        childWrapper.nextSibling.previousSibling_ = childWrapper;

      if (parentNodeWrapper.lastChild === childWrapper)
        parentNodeWrapper.lastChild_ = childWrapper;
      if (parentNodeWrapper.firstChild === childWrapper)
        parentNodeWrapper.firstChild_ = childWrapper;

      parentNode.removeChild(child);
    },

    remove: function(nodeWrapper) {
      var node = unwrap(nodeWrapper)
      var parentNode = node.parentNode;
      if (parentNode)
        this.removeChild(wrap(parentNode), nodeWrapper);
    }
  };

})(this);
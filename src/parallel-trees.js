// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function assert(b) {
    if (!b)
      throw new Error('Assertion failed');
  }

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
  var visual = {
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

  exports.visual = visual;

})(this);
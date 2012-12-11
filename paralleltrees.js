/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

var logical, visual;
var wrap, unwrap, getExistingWrapper;

(function() {

  var wrapperTable = new SideTable('wrapper');

  function assert(b) {
    if (!b)
      throw new Error('Assertion failed');
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
      wrapper = new WrapperNode(node);
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
   * @param {!Node} node
   * @return {!WrapperNode|undefined}
   */
  getExistingWrapper = function getExistingWrapper(node) {
    assert(node instanceof Node);
    return wrapperTable.get(node);
  };

  // This object groups DOM operations. This is supposed to be the DOM as the
  // developer sees it.
  logical = {
    getFirstChild: function(node) {
      var wrapper = getExistingWrapper(node);
      if (wrapper)
        return unwrap(wrapper.firstChild);
      return node.firstChild;
    },

    getNextSibling: function(node) {
      var wrapper = getExistingWrapper(node);
      if (wrapper)
        return unwrap(wrapper.nextSibling);
      return node.nextSibling;
    },

    getWrapper: wrap,

    /**
     * @param {!Node} node
     * @return {Array.<!Node> An array of the nodes.
     * @this
     */
    getChildNodesSnapshot: function(node) {
      var result = [], i = 0;
      for (var child = this.getFirstChild(node); child; child = this.getNextSibling(child)) {
        result[i++] = child;
      }
      return result;
    }
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

  function collectAndRemoveNodes(node) {
    if (node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      if (node.parentNode)
        node.parentNode.removeChild(node);
      return [node];
    }

    var nodes = [];
    var firstChild;
    while (firstChild = node.firstChild) {
      node.removeChild(node.firstChild);
      nodes.push(firstChild);
    }
    return nodes;
  }

  function updateAllChildNodes(parentNode) {
    var parentNodeWrapper = wrap(parentNode);
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
    removeAllChildNodes: function(parentNode) {
      updateAllChildNodes(parentNode);
      Node_prototype.textContent.set.call(parentNode, '');
    },

    appendChild: function(parentNode, child) {
      if (child.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        updateAllChildNodes(child);

      } else {
        this.remove(child);
        var childWrapper = wrap(child);
        updateWrapperUpAndSideways(childWrapper);
      }

      var parentNodeWrapper = wrap(parentNode);
      parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;
      if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild)
        parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;

      var lastChildWrapper = wrap(Node_prototype.lastChild.get.call(parentNode));
      if (lastChildWrapper) {
        lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;
      }

      Node_prototype.appendChild.call(parentNode, child);
    },

    removeChild: function(parentNode, child) {
      var parentNodeWrapper = wrap(parentNode);

      var childWrapper = wrap(child);
      updateWrapperUpAndSideways(childWrapper);

      if (childWrapper.previousSibling)
        childWrapper.previousSibling.nextSibling_ = childWrapper;
      if (childWrapper.nextSibling)
        childWrapper.nextSibling.previousSibling_ = childWrapper;

      if (parentNodeWrapper.lastChild === childWrapper)
        parentNodeWrapper.lastChild_ = childWrapper;
      if (parentNodeWrapper.firstChild === childWrapper)
        parentNodeWrapper.firstChild_ = childWrapper;

      Node_prototype.removeChild.call(parentNode, child);
    },

    remove: function(node) {
      var parentNode = Node_prototype.parentNode.get.call(node);
      if (parentNode)
        this.removeChild(parentNode, node);
    }
  };

  /**
   * This represents a logical DOM node.
   * @param {!Node} original The original DOM node, aka, the visual DOM node.
   * @constructor
   */
  function WrapperNode(original) {
    /**
     * @type {!Node}
     */
    this.node = original;

    // These properties are used to override the visual references with the
    // logical ones. If the value is undefined it means that the logical is the
    // same as the visual.

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.parentNode_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.firstChild_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.lastChild_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.nextSibling_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.previousSibling_ = undefined;
  }

  WrapperNode.prototype = {
    // TODO(arv): Implement these

    appendChild: function(childWrapper) {
      assert(childWrapper instanceof WrapperNode);

      var nodes = collectAndRemoveNodes(childWrapper);
      var oldLastChild = this.lastChild;
      this.lastChild_ = nodes[nodes.length - 1];

      if (oldLastChild)
        oldLastChild.nextSibling_ = nodes[0];
      else
        this.firstChild_ = nodes[0];

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].previousSibling_ = nodes[i - 1] || oldLastChild;
        nodes[i].nextSibling_ = nodes[i + 1] || null;
        nodes[i].parentNode_ = this;
      }

      // TODO(arv): It is unclear if we need to update the visual DOM here.
      // A better aproach might be to make sure we only get here for nodes that
      // are related to a shadow host and then invalidate that and re-render
      // the host (on reflow?).
      Node_prototype.appendChild.call(this.node, unwrap(childWrapper));

      return childWrapper;
    },

    insertBefore: function(childWrapper, refWrapper) {
      // TODO(arv): Unify with appendChild
      if (!refWrapper)
        return this.appendChild(childWrapper);

      assert(childWrapper instanceof WrapperNode);
      assert(refWrapper instanceof WrapperNode);
      assert(refWrapper.parentNode === this);

      var nodes = collectAndRemoveNodes(childWrapper);

      var previousNode = refWrapper.previousSibling;
      if (previousNode)
        previousNode.nextSibling_ = nodes[0];
      var nextNode = refWrapper;
      refWrapper.previousSibling_ = nodes[nodes.length - 1];

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].previousSibling_ = nodes[i - 1] || previousNode;
        nodes[i].nextSibling_ = nodes[i + 1] || nextNode;
        nodes[i].parentNode_ = this;
      }

      if (this.firstChild === refWrapper)
        this.firstChild_ = nodes[0];

      // insertBefore refWrapper no matter what the parent is?
      var refNode = unwrap(refWrapper);
      var parentNode = Node_prototype.parentNode.get.call(refNode);
      if (parentNode)
        Node_prototype.insertBefore.call(parentNode, unwrap(childWrapper), refNode);

      return childWrapper;
    },

    removeChild: function(childWrapper) {
      assert(childWrapper instanceof WrapperNode);
      if (childWrapper.parentNode !== this) {
        // TODO(arv): DOMException
        throw new Error('NotFoundError');
      }

      if (this.firstChild === childWrapper)
        this.firstChild_ = childWrapper.nextSibling;
      if (this.lastChild === childWrapper)
        this.lastChild_ = childWrapper.previousSibling;
      if (childWrapper.previousSibling)
        childWrapper.previousSibling.nextSibling_ = childWrapper.nextSibling;
      if (childWrapper.nextSibling)
        childWrapper.nextSibling.previousSibling_ = childWrapper.previousSibling;

      childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = null;

      var childNode = unwrap(childWrapper);
      var parentNode = Node_prototype.parentNode.get.call(childNode);
      if (parentNode)
        Node_prototype.removeChild.call(parentNode, childNode);

      return childWrapper;
    },

    replaceChild: function(newChildWrapper, oldChildWrapper) {
      assert(newChildWrapper instanceof WrapperNode);
      assert(oldChildWrapper instanceof WrapperNode);
      if (oldChildWrapper.parentNode !== this) {
        // TODO(arv): DOMException
        throw new Error('NotFoundError');
      }

      if (newChildWrapper.parentNode)
        newChildWrapper.parentNode.removeChild(newChildWrapper);

      if (this.firstChild === oldChildWrapper)
        this.firstChild_ = newChildWrapper;
      if (this.lastChild === oldChildWrapper)
        this.lastChild_ = newChildWrapper;
      if (oldChildWrapper.previousSibling)
        oldChildWrapper.previousSibling.nextSibling_ = newChildWrapper;
      if (oldChildWrapper.nextSibling)
        oldChildWrapper.nextSibling.previousSibling_ = newChildWrapper;
      newChildWrapper.previousSibling_ = oldChildWrapper.previousSibling;
      newChildWrapper.nextSibling_ = oldChildWrapper.nextSibling;

      oldChildWrapper.previousSibling_ = null;
      oldChildWrapper.nextSibling_ = null;
      oldChildWrapper.parentNode_ = null;
      newChildWrapper.parentNode_ = this;

      // replaceChild no matter what the parent is?
      var oldChildNode = unwrap(oldChildWrapper);
      if (oldChildNode.parentNode) {
        oldChildNode.parentNode.replaceChild(unwrap(newChildWrapper),
                                             oldChildNode);
      }

      return oldChildWrapper;
    },

    removeAllChildNodes: function() {
      var childWrapper = this.firstChild;
      while (childWrapper) {
        assert(childWrapper.parentNode === this);
        var nextSibling = childWrapper.nextSibling;
        var childNode = unwrap(childWrapper);
        childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = null;
        var parentNode = Node_prototype.parentNode.get.call(childNode);
        if (parentNode)
          Node_prototype.removeChild.call(parentNode, childNode);
        childWrapper = nextSibling;
      }
      this.firstChild_ = this.lastChild_ = null;
    },

    hasChildNodes: function() {
      return this.firstChild === null;
    },

    /** @type {WrapperNode} */
    get parentNode() {
      // If the parentNode has not been overridden, use the original parentNode.
      return this.parentNode_ !== undefined ?
          this.parentNode_ : wrap(Node_prototype.parentNode.get.call(this.node));
    },

    /** @type {WrapperNode} */
    get firstChild() {
      return this.firstChild_ !== undefined ?
          this.firstChild_ : wrap(Node_prototype.firstChild.get.call(this.node));
    },

    /** @type {WrapperNode} */
    get lastChild() {
      return this.lastChild_ !== undefined ?
          this.lastChild_ : wrap(Node_prototype.lastChild.get.call(this.node));
    },

    /** @type {WrapperNode} */
    get nextSibling() {
      return this.nextSibling_ !== undefined ?
          this.nextSibling_ : wrap(Node_prototype.nextSibling.get.call(this.node));
    },

    /** @type {WrapperNode} */
    get previousSibling() {
      return this.previousSibling_ !== undefined ?
          this.previousSibling_ : wrap(Node_prototype.previousSibling.get.call(this.node));
    },

    get nodeType() {
      return this.node.nodeType;
    }
  };

})();
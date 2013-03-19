// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var wrappedFuns = new SideTable();

  function isShadowRoot(node) {
    return node instanceof WrapperShadowRoot;
  }

  function isInsertionPoint(node) {
    var localName = node.localName;
    return localName === 'content' || localName === 'shadow';
  }

  function isShadowHost(node) {
    return !!node.shadowRoot;
  }

  // https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#dfn-adjusted-parent
  function calculateParent(node, context) {
    // 1.
    if (isShadowRoot(node))
      return node.insertionPointParent || getHostForShadowRoot(node)

    // 2.
    var p = node.insertionPointParent;
    if (p)
      return p;

    // 3.
    if (context && isInsertionPoint(node)) {
      var parentNode = node.parentNode;
      if (parentNode && isShadowHost(parentNode)) {
        var trees = getShadowTrees(parentNode);
        var p = context.insertionPointParent;
        for (var i = 0; i < trees.length; i++) {
          if (trees[i].contains(p))
            return p;
        }
      }
    }

    return node.parentNode;
  }

  // https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#event-retargeting
  function retarget(node) {
    var stack = [];  // 1.
    var ancestor = node;  // 2.
    var targets = [];
    while (ancestor) {  // 3.
      var context = null;  // 3.2.
      if (isInsertionPoint(ancestor)) {  // 3.1.
        context = topMostNotInsertionPoint(stack);  // 3.1.1.
        var top = stack[stack.length - 1] || ancestor;  // 3.1.2.
        stack.push(top);
      }
      if (!stack.length)
        stack.push(ancestor);  // 3.3.
      var target = stack[stack.length - 1];  // 3.4.
      targets.push({target: target, ancestor: ancestor});  // 3.5.
      if (isShadowRoot(ancestor))  // 3.6.
        stack.pop();  // 3.6.1.
      ancestor = calculateParent(ancestor, context);
    }
    return targets;
  }

  function topMostNotInsertionPoint(stack) {
    for (var i = stack.length - 1; i >= 0; i--) {
      if (!isInsertionPoint(stack[i]))
        return stack[i];
    }
    return null;
  }

  /**
   * This represents a logical DOM node.
   * @param {!Node} original The original DOM node, aka, the visual DOM node.
   * @constructor
   */
  function WrapperEventTarget(original) {
    /**
     * @type {!Node}
     */
    this.node = original;
  }

  WrapperEventTarget.prototype = {
    addEventListener: function(type, fun, capture) {
      var wrappedFun = wrappedFuns.get(fun);
      if (!wrappedFun) {
        wrappedFun = function(e) {
          return fun.call(wrap(this), wrap(e));
        };
        wrappedFuns.set(fun, wrappedFun);
      }
      
      this.node.addEventListener(type, wrappedFun, capture);
    },
    removeEventListener: function(type, fun, capture) {
      var wrappedFun = wrappedFuns.get(fun);
      if (wrappedFun)
        this.node.removeEventListener(type, wrappedFun, capture);
    },
    dispatchEvent: function(event) {
      return this.node.dispatchEvent(unwrap(event));
    }
  };

  if (typeof EventTarget !== 'undefined')
    wrappers.register(EventTarget, WrapperEventTarget);

  exports.WrapperEventTarget = WrapperEventTarget;
  exports.retarget = retarget;

})(this);
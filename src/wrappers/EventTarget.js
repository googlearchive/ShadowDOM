// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var wrappedFuns = new SideTable();

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

})(this);
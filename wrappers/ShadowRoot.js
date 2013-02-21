// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  function WrapperShadowRoot(hostWrapper) {
    var node = hostWrapper.node.ownerDocument.createDocumentFragment();
    WrapperDocumentFragment.call(this, node);

    var oldShadowRoot = hostWrapper.__shadowRoot__;
    this.__nextOlderShadowTree__ = oldShadowRoot;
    this.__shadowHost__ = hostWrapper;

    // TODO: are we invalidating on both sides?
    hostWrapper.invalidateShadowRenderer();
  }
  WrapperShadowRoot.prototype = Object.create(WrapperNode.prototype);
  mixin(WrapperShadowRoot.prototype, {
    get innerHTML() {
      return getInnerHTML(this);
      // // TODO: Precompute.
      // return Object.getOwnPropertyDescriptor(
      //     WrapperHTMLElement.prototype, 'innerHTML').get.call(this);
    },
    set innerHTML(value) {
      this.removeAllChildNodes();
      var tempElement = this.node.ownerDocument.createElement('div');
      tempElement.innerHTML = value;
      var firstChild;
      while (firstChild = tempElement.firstChild) {
        this.appendChild(wrap(firstChild));
      }

      this.__shadowHost__.invalidateShadowRenderer();
      // // TODO: Precompute.
      // Object.getOwnPropertyDescriptor(
      //     WrapperHTMLElement.prototype, 'innerHTML').set.call(this, value);
    }
  });

  exports.WrapperShadowRoot = WrapperShadowRoot;
})(this);
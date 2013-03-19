// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var shadowHostTable = new SideTable();

  function WrapperShadowRoot(hostWrapper) {
    var node = unwrap(hostWrapper.node.ownerDocument.createDocumentFragment());
    WrapperDocumentFragment.call(this, node);

    // createDocumentFragment associates the node with a WrapperDocumentFragment
    // instance. Override that.
    rewrap(node, this);

    var oldShadowRoot = hostWrapper.shadowRoot;
    nextOlderShadowTreeTable.set(this, oldShadowRoot);

    shadowHostTable.set(this, hostWrapper);

    // TODO: are we invalidating on both sides?
    hostWrapper.invalidateShadowRenderer();
  }
  WrapperShadowRoot.prototype = Object.create(WrapperDocumentFragment.prototype);
  mixin(WrapperShadowRoot.prototype, {
    get innerHTML() {
      return getInnerHTML(this);
    },
    set innerHTML(value) {
      this.textContent = '';
      var tempElement = unwrap(this.node.ownerDocument.createElement('div'));
      tempElement.innerHTML = value;
      var firstChild;
      while (firstChild = tempElement.firstChild) {
        this.appendChild(wrap(firstChild));
      }

      this.invalidateShadowRenderer();
    },

    invalidateShadowRenderer: function() {
      return shadowHostTable.get(this).invalidateShadowRenderer();
    }
  });

  exports.WrapperShadowRoot = WrapperShadowRoot;
  exports.getHostForShadowRoot = function(node) {
    return shadowHostTable.get(node);
  };
})(this);
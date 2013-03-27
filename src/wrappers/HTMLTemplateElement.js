// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var WrapperHTMLElement = scope.WrapperHTMLElement;
  var getInnerHTML = scope.getInnerHTML;
  var mixin = scope.mixin;
  var setInnerHTML = scope.setInnerHTML;
  var wrap = scope.wrap;
  var registerWrapper = scope.registerWrapper;

  var hasNative = typeof HTMLTemplateElement !== 'undefined';
  var contentTable = new SideTable();
  var templateContentsOwnerTable = new SideTable();

  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html#dfn-template-contents-owner
  function getTemplateContentsOwner(doc) {
    if (!doc.defaultView)
      return doc;
    var d = templateContentsOwnerTable.get(doc);
    if (!d) {
      // TODO(arv): This should either be a Document or HTMLDocument depending
      // on doc.
      d = doc.implementation.createHTMLDocument('');
      while (d.lastChild) {
        d.removeChild(d.lastChild);
      }
      templateContentsOwnerTable.set(doc, d);
    }
    return d;
  }

  function extractContent(templateElement) {
    var doc = getTemplateContentsOwner(templateElement.ownerDocument);
    var df = doc.createDocumentFragment();
    var nextSibling;
    var child;
    while (child = templateElement.firstChild) {
      df.appendChild(child);
    }
    return df;
  }

  var WrapperHTMLTemplateElement = function HTMLTemplateElement(node) {
    WrapperHTMLElement.call(this, node);
  };
  WrapperHTMLTemplateElement.prototype = Object.create(WrapperHTMLElement.prototype);

  mixin(WrapperHTMLTemplateElement.prototype, {
    get content() {
      if (hasNative)
        return wrap(this.impl.content);

      // TODO(arv): This should be done in createCallback. I initially tried to
      // do this in the constructor but the wrapper is not yet created at that
      // point in time so we hit an iloop.
      var content = contentTable.get(this);
      if (!content) {
        content = extractContent(this);
        contentTable.set(this, content);
      }
      return content;
    },

    get innerHTML() {
      return getInnerHTML(this.content);
    },
    set innerHTML(value) {
      setInnerHTML(this.content, value);
      this.invalidateShadowRenderer();
    }

    // TODO(arv): cloneNode needs to clone content.

  });

  if (hasNative)
    registerWrapper(HTMLTemplateElement, WrapperHTMLTemplateElement);

  scope.WrapperHTMLTemplateElement = WrapperHTMLTemplateElement;
})(this.ShadowDOMPolyfill);
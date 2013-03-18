// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var implementationTable = new SideTable();

  function WrapperDocument(node) {
    WrapperNode.call(this, node);
  }
  WrapperDocument.prototype = Object.create(WrapperNode.prototype);

  addWrapGetter(WrapperDocument, 'documentElement');

  // Conceptually both body and head can be in a shadow but suporting that seems
  // overkill at this point.
  addWrapGetter(WrapperDocument, 'body');
  addWrapGetter(WrapperDocument, 'head');

  mixin(WrapperDocument.prototype, ParentNodeInterface);

  mixin(WrapperDocument.prototype, {
    get implementation() {
      var implementation = implementationTable.get(this);
      if (implementation)
        return implementation;
      implementation =
          new WrapperDOMImplementation(unwrap(this).implementation);
      implementationTable.set(this, implementation);
      return implementation;
    }
  });

  wrappers.register(Document, WrapperDocument,
      document.implementation.createHTMLDocument(''));

  exports.WrapperDocument = WrapperDocument;

  // Both WebKit and Gecko uses HTMLDocument for document. HTML5/DOM only has
  // one Document interface and IE implements the standard correctly.
  if (typeof HTMLDocument !== 'undefined')
    wrappers.register(HTMLDocument, WrapperDocument);

  function wrapMethod(object, name) {
    var proto = Object.getPrototypeOf(object);
    var original = proto[name];
    proto[name] = function() {
      return wrap(original.apply(this, arguments));
    };
  }

  [
    'getElementById',
    'querySelector',
    'createElement',
    'createElementNS',
    'createTextNode',
    'createDocumentFragment',
    'createEvent',
    'createEventNS',
  ].forEach(function(name) {
    wrapMethod(document, name);
  });

  function wrapImplMethod(constructor, name) {
    constructor.prototype[name] = function() {
      return wrap(this.node[name].apply(this.node, arguments));
    };
  }

  function forwardImplMethod(constructor, name) {
    constructor.prototype[name] = function() {
      return this.node[name].apply(this.node, arguments);
    };
  }

  function WrapperDOMImplementation(node) {
    this.node = node;
  }

  wrapImplMethod(WrapperDOMImplementation, 'createDocumentType');
  wrapImplMethod(WrapperDOMImplementation, 'createDocument');
  wrapImplMethod(WrapperDOMImplementation, 'createHTMLDocument');
  forwardImplMethod(WrapperDOMImplementation, 'hasFeature');

})(this);
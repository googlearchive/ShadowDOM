/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

var overrideMethod, overrideGetter, overrideDescriptor,
    findMethod, findGetter, findDescriptor;

(function() {
  'use strict';

  var isFirefox = /Firefox/.test(navigator.userAgent);

  // Firefox does not create the interfaces unless there is an instance or if
  // the constructor is asked for. We therefore list all the "known" interfaces
  // (that extends Node).
  var nodeInterfaces = [
    'Node',
    'ProcessingInstruction',
    'Text',
    'CharacterData',
    'Comment',
    'Document',
    'DocumentFragment',
    'DocumentType',
    'Element',
    'HTMLAnchorElement',
    'HTMLAreaElement',
    'HTMLAudioElement',
    'HTMLBRElement',
    'HTMLBaseElement',
    'HTMLBodyElement',
    'HTMLButtonElement',
    'HTMLCommandElement',
    'HTMLDListElement',
    'HTMLDataListElement',
    'HTMLDetailsElement',
    'HTMLDivElement',
    'HTMLElement',
    'HTMLEmbedElement',
    'HTMLFieldSetElement',
    'HTMLFormElement',
    'HTMLFrameElement',
    'HTMLFrameSetElement',
    'HTMLHRElement',
    'HTMLHeadElement',
    'HTMLHeadingElement',
    'HTMLHtmlElement',
    'HTMLIFrameElement',
    'HTMLImageElement',
    'HTMLInputElement',
    'HTMLKeygenElement',
    'HTMLLIElement',
    'HTMLLabelElement',
    'HTMLLegendElement',
    'HTMLLinkElement',
    'HTMLMapElement',
    'HTMLMediaElement',
    'HTMLMenuElement',
    'HTMLMetaElement',
    'HTMLMeterElement',
    'HTMLModElement',
    'HTMLOListElement',
    'HTMLObjectElement',
    'HTMLOptGroupElement',
    'HTMLOptionElement',
    'HTMLOutputElement',
    'HTMLParagraphElement',
    'HTMLParamElement',
    'HTMLPreElement',
    'HTMLProgressElement',
    'HTMLQuoteElement',
    'HTMLScriptElement',
    'HTMLSelectElement',
    'HTMLSourceElement',
    'HTMLSpanElement',
    'HTMLStyleElement',
    'HTMLTableCaptionElement',
    'HTMLTableCellElement',
    'HTMLTableColElement',
    'HTMLTableDataCellElement',
    'HTMLTableElement',
    'HTMLTableHeaderCellElement',
    'HTMLTableRowElement',
    'HTMLTableSectionElement',
    'HTMLTextAreaElement',
    'HTMLTimeElement',
    'HTMLTitleElement',
    'HTMLTrackElement',
    'HTMLUListElement',
    'HTMLUnknownElement',
    'HTMLVideoElement'
  ];

  overrideDescriptor = function overrideDescriptor(ctor, propertyName, descr) {
    if (isFirefox) {
      nodeInterfaces.forEach(function(interfaceName) {
        var c = window[interfaceName];
        if (c === ctor || c && c.prototype && c.prototype instanceof ctor) {
          // Tickle Firefox
          c.prototype.__lookupGetter__(propertyName);
          var d = Object.getOwnPropertyDescriptor(c.prototype, propertyName);
          if (d)
            Object.defineProperty(c.prototype, propertyName, descr);
        }
      });
    }
    Object.defineProperty(ctor.prototype, propertyName, descr);
  };

  findDescriptor = function findDescriptor(ctor, propertyName) {
    if (isFirefox) {
      for (var i = 0; i < nodeInterfaces.length; i++) {
        var interfaceName = nodeInterfaces[i];
        var c = window[interfaceName];
        if (c === ctor || c && c.prototype && c.prototype instanceof ctor) {
          // Tickle Firefox
          c.prototype.__lookupGetter__(propertyName);
          var descr = Object.getOwnPropertyDescriptor(c.prototype, propertyName);
          if (descr)
            return descr;
        }
      };
    }
    return Object.getOwnPropertyDescriptor(ctor.prototype, propertyName);
  };

  overrideMethod = function overrideMethod(ctor, methodName, func) {
    overrideDescriptor(ctor, methodName, {value: func});
  };

  findMethod = function findMethod(ctor, methodName) {
    return findDescriptor(ctor, methodName).value;
  };

  overrideGetter = function overrideGetter(ctor, getterName, getter) {
    overrideDescriptor(ctor, getterName, {get: getter});
  };

  findGetter = function findGetter(ctor, getterName) {
    return findDescriptor(ctor, getterName).get;
  };

})();
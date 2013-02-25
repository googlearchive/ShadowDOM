// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  exports.mixin = function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
      Object.defineProperty(to, name,
                            Object.getOwnPropertyDescriptor(from, name));
    });
    return to;
  };

  // Old versions of Firefox do not set up constructors correctly
  // https://bugzilla.mozilla.org/show_bug.cgi?id=843661
  if (Node.prototype.constructor === Node)
    return;

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
    'HTMLAppletElement',
    'HTMLAreaElement',
    'HTMLAudioElement',
    'HTMLBRElement',
    'HTMLBaseElement',
    'HTMLBodyElement',
    'HTMLButtonElement',
    'HTMLCanvasElement',
    'HTMLCommandElement',
    'HTMLDListElement',
    'HTMLDataListElement',
    'HTMLDirectoryElement',
    'HTMLDivElement',
    'HTMLDocument',
    'HTMLElement',
    'HTMLEmbedElement',
    'HTMLFieldSetElement',
    'HTMLFontElement',
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
    'HTMLLIElement',
    'HTMLLabelElement',
    'HTMLLegendElement',
    'HTMLLinkElement',
    'HTMLMapElement',
    'HTMLMediaElement',
    'HTMLMenuElement',
    'HTMLMenuItemElement',
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
    'HTMLTableElement',
    'HTMLTableRowElement',
    'HTMLTableSectionElement',
    'HTMLTextAreaElement',
    'HTMLTitleElement',
    'HTMLUListElement',
    'HTMLUnknownElement',
    'HTMLVideoElement'
  ];

  nodeInterfaces.forEach(function(name) {
    var ctor = window[name];
    ctor.prototype.constructor = ctor;
    ctor.name = name;
  });

})(this);
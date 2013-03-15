/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Wrapper creation', function() {

  test('Br element wrapper', function() {
    var br = document.createElement('br');
    assert.isTrue('clear' in br);
    assert.isFalse(br.hasOwnProperty('clear'));
    assert.isTrue(Object.getPrototypeOf(br).hasOwnProperty('clear'));
  });

  var elements = {
    'a': window.HTMLAnchorElement,
    'applet': window.HTMLAppletElement,
    'area': window.HTMLAreaElement,
    'audio': window.HTMLAudioElement,
    'br': window.HTMLBRElement,
    'base': window.HTMLBaseElement,
    'body': window.HTMLBodyElement,
    'button': window.HTMLButtonElement,
    'canvas': window.HTMLCanvasElement,
    // 'command': window.HTMLCommandElement,  // Not fully implemented in Gecko.
    'dl': window.HTMLDListElement,
    'datalist': window.HTMLDataListElement,
    'dir': window.HTMLDirectoryElement,
    'div': window.HTMLDivElement,
    'embed': window.HTMLEmbedElement,
    'fieldset': window.HTMLFieldSetElement,
    'font': window.HTMLFontElement,
    'form': window.HTMLFormElement,
    'frame': window.HTMLFrameElement,
    'frameset': window.HTMLFrameSetElement,
    'hr': window.HTMLHRElement,
    'head': window.HTMLHeadElement,
    'h1': window.HTMLHeadingElement,
    'html': window.HTMLHtmlElement,
    'iframe': window.HTMLIFrameElement,

    // Uses HTMLSpanElement in Firefox.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=843881
    // 'image',

    'input': window.HTMLInputElement,
    'li': window.HTMLLIElement,
    'label': window.HTMLLabelElement,
    'legend': window.HTMLLegendElement,
    'link': window.HTMLLinkElement,
    'map': window.HTMLMapElement,
    // // 'media', Covered by audio and video
    'menu': window.HTMLMenuElement,
    'menuitem': window.HTMLMenuItemElement,
    'meta': window.HTMLMetaElement,
    'meter': window.HTMLMeterElement,
    'del': window.HTMLModElement,
    'ol': window.HTMLOListElement,
    'object': window.HTMLObjectElement,
    'optgroup': window.HTMLOptGroupElement,
    'option': window.HTMLOptionElement,
    'output': window.HTMLOutputElement,
    'p': window.HTMLParagraphElement,
    'param': window.HTMLParamElement,
    'pre': window.HTMLPreElement,
    'progress': window.HTMLProgressElement,
    'q': window.HTMLQuoteElement,
    'script': window.HTMLScriptElement,
    'select': window.HTMLSelectElement,
    'source': window.HTMLSourceElement,
    'span': window.HTMLSpanElement,
    'style': window.HTMLStyleElement,
    'caption': window.HTMLTableCaptionElement,
    // WebKit and Moz are wrong:
    // https://bugs.webkit.org/show_bug.cgi?id=111469
    // https://bugzilla.mozilla.org/show_bug.cgi?id=848096
    // 'td': window.HTMLTableCellElement,
    'col': window.HTMLTableColElement,
    'table': window.HTMLTableElement,
    'tr': window.HTMLTableRowElement,
    'thead': window.HTMLTableSectionElement,
    'tbody': window.HTMLTableSectionElement,
    'textarea': window.HTMLTextAreaElement,
    'title': window.HTMLTitleElement,
    'ul': window.HTMLUListElement,
    'video': window.HTMLVideoElement,
  };

  Object.keys(elements).forEach(function(tagName) {
    test(tagName, function() {
      var nativeConstructor = elements[tagName];
      if (!nativeConstructor)
        return;

      var wrappedElement = document.createElement(tagName);
      var element = unwrap(wrappedElement);
      assert.isTrue(element instanceof nativeConstructor);
      assert.equal(Object.getPrototypeOf(element), nativeConstructor.prototype);
    });
  });

  test('Ensure Document has ParentNodeInterface', function() {
    var doc = wrap(document).implementation.createHTMLDocument('');
    assert.equal(doc.firstElementChild.tagName, 'HTML');
    assert.equal(doc.lastElementChild.tagName, 'HTML');
  });

  test('cloneNode(false)', function() {
    var doc = wrap(document);
    var a = document.createElement('a');
    a.href = 'http://domain.com/';
    a.textContent = 'text';
    var textNode = a.firstChild;

    var aClone = a.cloneNode(false);

    assert.equal(aClone.tagName, 'A');
    assert.equal(aClone.href, 'http://domain.com/');
    expectStructure(aClone, {});
  });

  test('cloneNode(true)', function() {
    var doc = wrap(document);
    var a = document.createElement('a');
    a.href = 'http://domain.com/';
    a.textContent = 'text';
    var textNode = a.firstChild;

    var aClone = a.cloneNode(true);
    var textNodeClone = aClone.firstChild;

    assert.equal(aClone.tagName, 'A');
    assert.equal(aClone.href, 'http://domain.com/');
    expectStructure(aClone, {
      firstChild: textNodeClone,
      lastChild: textNodeClone
    });
    expectStructure(textNodeClone, {
      parentNode: aClone
    });
  });

  test('document.documentElement', function() {
    var doc = wrap(document);
    assert.equal(doc.documentElement.ownerDocument, doc);
    assert.equal(doc.documentElement.tagName, 'HTML');
  });

  test('document.body', function() {
    var doc = wrap(document);
    assert.equal(doc.body.ownerDocument, doc);
    assert.equal(doc.body.tagName, 'BODY');
    assert.equal(doc.body.parentNode, doc.documentElement);
  });

  test('document.head', function() {
    var doc = wrap(document);
    assert.equal(doc.head.ownerDocument, doc);
    assert.equal(doc.head.tagName, 'HEAD');
    assert.equal(doc.head.parentNode, doc.documentElement);
  });

  test('parentElement', function() {
    var a = document.createElement('a');
    a.textContent = 'text';
    var textNode = a.firstChild;
    assert.equal(textNode.parentElement, a);
    assert.isNull(a.parentElement);

    var doc = wrap(document);
    var body = doc.body;
    var documentElement = doc.documentElement;
    assert.equal(body.parentElement, documentElement);
    assert.isNull(documentElement.parentElement);
  });

  test('contains', function() {
    var div = document.createElement('div');
    assert.isTrue(div.contains(div));

    div.textContent = 'a';
    var textNode = div.firstChild;
    assert.isTrue(textNode.contains(textNode));
    assert.isTrue(div.contains(textNode));
    assert.isFalse(textNode.contains(div));

    var doc = div.ownerDocument;
    assert.isTrue(doc.contains(doc));
    assert.isFalse(doc.contains(div));
    assert.isFalse(doc.contains(textNode));
  });

});

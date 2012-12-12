/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Shadow DOM reprojection', function() {

  function getVisualInnerHtml(el) {
    return HTMLElement_prototype.innerHTML.get.call(el);
  }

  test('Reproject', function() {

    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.jsCreateShadowRoot();
    shadowRoot.innerHTML = '<p><b></b><content></content></p>';
    var p = shadowRoot.firstChild;
    var b = p.firstChild;
    var content = p.lastChild;

    var pShadowRoot = p.jsCreateShadowRoot();
    pShadowRoot.innerHTML =
        'a: <content select=a></content>b: <content select=b></content>';
    var textNodeA = pShadowRoot.firstChild;
    var contentA = pShadowRoot.childNodes[1];
    var textNodeB = pShadowRoot.childNodes[2]
    var contentB = pShadowRoot.childNodes[3];

    function testRender() {
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<p>a: <a></a>b: <b></b></p>');

      var logicalHostWrapper = logical.getWrapper(host);
      var logicalAWrapper = logical.getWrapper(a);

      var logicalShadowRootWrapper = logical.getWrapper(shadowRoot);
      var logicalPWrapper = logical.getWrapper(p);
      var logicalBWrapper = logical.getWrapper(b);
      var logicalContentWrapper = logical.getWrapper(content);

      var logicalPShadowRootWrapper = logical.getWrapper(pShadowRoot);
      var logicalTextNodeAWrapper = logical.getWrapper(textNodeA);
      var logicalContentAWrapper = logical.getWrapper(contentA);
      var logicalTextNodeBWrapper = logical.getWrapper(textNodeB);
      var logicalContentBWrapper = logical.getWrapper(contentB);

      expectStructure(logicalHostWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalHostWrapper
      });


      expectStructure(logicalShadowRootWrapper, {
        firstChild: logicalPWrapper,
        lastChild: logicalPWrapper
      });

      expectStructure(logicalPWrapper, {
        parentNode: logicalShadowRootWrapper,
        firstChild: logicalBWrapper,
        lastChild: logicalContentWrapper,
      });

      expectStructure(logicalBWrapper, {
        parentNode: logicalPWrapper,
        nextSibling: logicalContentWrapper
      });

      expectStructure(logicalContentWrapper, {
        parentNode: logicalPWrapper,
        previousSibling: logicalBWrapper
      });


      expectStructure(logicalPShadowRootWrapper, {
        firstChild: logicalTextNodeAWrapper,
        lastChild: logicalContentBWrapper
      });

      expectStructure(logicalTextNodeAWrapper, {
        parentNode: logicalPShadowRootWrapper,
        nextSibling: logicalContentAWrapper
      });

      expectStructure(logicalContentAWrapper, {
        parentNode: logicalPShadowRootWrapper,
        previousSibling: logicalTextNodeAWrapper,
        nextSibling: logicalTextNodeBWrapper
      });

      expectStructure(logicalTextNodeBWrapper, {
        parentNode: logicalPShadowRootWrapper,
        previousSibling: logicalContentAWrapper,
        nextSibling: logicalContentBWrapper
      });

      expectStructure(logicalContentBWrapper, {
        parentNode: logicalPShadowRootWrapper,
        previousSibling: logicalTextNodeBWrapper
      });
    }

    testRender();
    testRender();
  });
});
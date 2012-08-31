/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Shadow DOM rerender', function() {

  test('No <content> nor <shadow>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = new JsShadowRoot(host);
    shadowRoot.textContent = 'text';
    var textNode = shadowRoot.firstChild;

    function testRender() {
      render(host);
      expect(host.innerHTML).to.be('text');

      var logicalHostWrapper = logical.getWrapper(host);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalShadowRootWrapper = logical.getWrapper(shadowRoot);
      var logicalTextNodeWrapper = logical.getWrapper(textNode);

      expectStructure(logicalHostWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalHostWrapper
      });

      expectStructure(logicalShadowRootWrapper, {
        firstChild: logicalTextNodeWrapper,
        lastChild: logicalTextNodeWrapper
      });

      expectStructure(logicalTextNodeWrapper, {
        parentNode: logicalShadowRootWrapper
      });
    }

    testRender();
    testRender();
  });

test('<content>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = new JsShadowRoot(host);
    shadowRoot.innerHTML = '<content></content>';
    var content = shadowRoot.firstChild;

    function testRender() {
      render(host);
      expect(host.innerHTML).to.be('<a></a>');

      var logicalHostWrapper = logical.getWrapper(host);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalShadowRootWrapper = logical.getWrapper(shadowRoot);
      var logicalContentWrapper = logical.getWrapper(content);

      expectStructure(logicalHostWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalHostWrapper
      });

      expectStructure(logicalShadowRootWrapper, {
        firstChild: logicalContentWrapper,
        lastChild: logicalContentWrapper
      });

      expectStructure(logicalContentWrapper, {
        parentNode: logicalShadowRootWrapper
      });
    }

    testRender();
    testRender();
  });

  test('<content> with fallback', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = new JsShadowRoot(host);
    shadowRoot.innerHTML = '<content select="b">fallback</content>';
    var content = shadowRoot.firstChild;
    var fallback = content.firstChild;

    function testRender() {
      render(host);
      expect(host.innerHTML).to.be('fallback');

      var logicalHostWrapper = logical.getWrapper(host);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalShadowRootWrapper = logical.getWrapper(shadowRoot);
      var logicalContentWrapper = logical.getWrapper(content);
      var logicalFallbackWrapper = logical.getWrapper(fallback);

      expectStructure(logicalHostWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalHostWrapper
      });

      expectStructure(logicalShadowRootWrapper, {
        firstChild: logicalContentWrapper,
        lastChild: logicalContentWrapper
      });

      expectStructure(logicalContentWrapper, {
        parentNode: logicalShadowRootWrapper,
        firstChild: logicalFallbackWrapper,
        lastChild: logicalFallbackWrapper
      });

      expectStructure(logicalFallbackWrapper, {
        parentNode: logicalContentWrapper
      });
    }

    testRender();
    testRender();
  });

test('<shadow>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = new JsShadowRoot(host);
    shadowRoot.innerHTML = '<shadow></shadow>';
    var shadow = shadowRoot.firstChild;

    function testRender() {
      render(host);
      expect(host.innerHTML).to.be('');

      var logicalHostWrapper = logical.getWrapper(host);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalShadowRootWrapper = logical.getWrapper(shadowRoot);
      var logicalShadowWrapper = logical.getWrapper(shadow);

      expectStructure(logicalHostWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalHostWrapper
      });

      expectStructure(logicalShadowRootWrapper, {
        firstChild: logicalShadowWrapper,
        lastChild: logicalShadowWrapper
      });

      expectStructure(logicalShadowWrapper, {
        parentNode: logicalShadowRootWrapper
      });
    }

    testRender();
    testRender();
  });

  test('<shadow> with fallback', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = new JsShadowRoot(host);
    shadowRoot.innerHTML = '<shadow>fallback</shadow>';
    var shadow = shadowRoot.firstChild;
    var fallback = shadow.firstChild;

    function testRender() {
      render(host);
      expect(host.innerHTML).to.be('fallback');

      var logicalHostWrapper = logical.getWrapper(host);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalShadowRootWrapper = logical.getWrapper(shadowRoot);
      var logicalShadowWrapper = logical.getWrapper(shadow);
      var logicalFallbackWrapper = logical.getWrapper(fallback);

      expectStructure(logicalHostWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalHostWrapper
      });

      expectStructure(logicalShadowRootWrapper, {
        firstChild: logicalShadowWrapper,
        lastChild: logicalShadowWrapper
      });

      expectStructure(logicalShadowWrapper, {
        parentNode: logicalShadowRootWrapper,
        firstChild: logicalFallbackWrapper,
        lastChild: logicalFallbackWrapper
      });

      expectStructure(logicalFallbackWrapper, {
        parentNode: logicalShadowWrapper
      });
    }

    testRender();
    testRender();
  });

  test('<shadow> with nested shadow roots', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var oldestShadowRoot = new JsShadowRoot(host);
    oldestShadowRoot.textContent = 'text';
    var textNode = oldestShadowRoot.firstChild;

    var youngestShadowRoot = new JsShadowRoot(host);
    youngestShadowRoot.innerHTML = '<shadow></shadow>';
    var shadow = youngestShadowRoot.firstChild;

    function testRender() {
      render(host);
      expect(host.innerHTML).to.be('text');

      var logicalHostWrapper = logical.getWrapper(host);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalOldestShadowRootWrapper = logical.getWrapper(oldestShadowRoot);
      var logicalTextNodeWrapper = logical.getWrapper(textNode);
      var logicalYoungestShadowRootWrapper =
          logical.getWrapper(youngestShadowRoot);
      var logicalShadowWrapper = logical.getWrapper(shadow);

      expectStructure(logicalHostWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalHostWrapper
      });

      expectStructure(logicalOldestShadowRootWrapper, {
        firstChild: logicalTextNodeWrapper,
        lastChild: logicalTextNodeWrapper
      });

      expectStructure(logicalTextNodeWrapper, {
        parentNode: logicalOldestShadowRootWrapper
      });

      expectStructure(logicalYoungestShadowRootWrapper, {
        firstChild: logicalShadowWrapper,
        lastChild: logicalShadowWrapper
      });

      expectStructure(logicalShadowWrapper, {
        parentNode: logicalYoungestShadowRootWrapper
      });
    }

    testRender();
    testRender();
  });

});
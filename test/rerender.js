/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Shadow DOM rerender', function() {

  function getVisualInnerHtml(el) {
    return HTMLElement_prototype.innerHTML.get.call(el);
  }

  test('No <content> nor <shadow>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = new JsShadowRoot(host);
    shadowRoot.textContent = 'text';
    var textNode = shadowRoot.firstChild;

    function testRender() {
      render(host);
      expect(getVisualInnerHtml(host)).to.be('text');

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
      expect(getVisualInnerHtml(host)).to.be('<a></a>');

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
      expect(getVisualInnerHtml(host)).to.be('fallback');

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
      expect(getVisualInnerHtml(host)).to.be('');

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
      expect(getVisualInnerHtml(host)).to.be('fallback');

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
      expect(getVisualInnerHtml(host)).to.be('text');

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

  suite('Mutate logical DOM', function() {
    test('removeAllChildNodes - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content>fallback</content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      logical.removeAllChildNodes(logical.getFirstChild(host));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a></a>');

      logical.removeAllChildNodes(host);
      render(host);
      expect(getVisualInnerHtml(host)).to.be('fallback');
    });

    test('removeAllChildNodes - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content><b>after</b>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a><b>after</b>');

      logical.removeAllChildNodes(logical.getLastChild(shadowRoot));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a><b></b>');

      logical.removeAllChildNodes(shadowRoot);
      render(host);
      expect(getVisualInnerHtml(host)).to.be('');
    });

    test('removeAllChildNodes - mutate shadow fallback', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content select="xxx"><b>fallback</b></content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<b>fallback</b>');

      logical.removeAllChildNodes(logical.getFirstChild(logical.getFirstChild(shadowRoot)));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<b></b>');

      logical.removeAllChildNodes(logical.getFirstChild(shadowRoot));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('');

      logical.removeAllChildNodes(shadowRoot);
      render(host);
      expect(getVisualInnerHtml(host)).to.be('');
    });

    test('removeChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content>fallback</content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      logical.removeChild(logical.getFirstChild(host),
          logical.getFirstChild(logical.getFirstChild(host)));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a></a>');

      logical.removeChild(host, logical.getFirstChild(host));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('fallback');
    });

    test('removeChild - mutate host 2', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a></a><b></b>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content>fallback</content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a></a><b></b>');

      logical.removeChild(host, logical.getLastChild(host));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a></a>');

      logical.removeChild(host, logical.getFirstChild(host));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('fallback');
    });

    test('removeChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content><b>after</b>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a><b>after</b>');

      logical.removeChild(logical.getLastChild(shadowRoot),
        logical.getFirstChild(logical.getLastChild(shadowRoot)));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a><b></b>');

      logical.removeChild(shadowRoot, logical.getLastChild(shadowRoot));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      logical.removeChild(shadowRoot, logical.getFirstChild(shadowRoot));
      render(host);
      expect(getVisualInnerHtml(host)).to.be('');
    });

    test('setAttribute select', function() {
      // TODO(arv): DOM bindings for select.
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a><b>World</b>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content select="b">fallback b</content>' +
                             '<content select="a">fallback a</content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<b>World</b><a>Hello</a>');

      logical.getFirstChild(shadowRoot).setAttribute('select', 'xxx');

      render(host);
      expect(getVisualInnerHtml(host)).to.be('fallback b<a>Hello</a>');

      logical.getFirstChild(shadowRoot).setAttribute('select', '');

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a><b>World</b>fallback a');
    });

    test('appendChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      var b = document.createElement('b');
      logical.appendChild(host, b);

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a><b></b>');
    });

    test('appendChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      var b = document.createElement('b');
      logical.appendChild(shadowRoot, b);

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a><b></b>');
    });

    test('insertBefore - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';
      var a = host.firstChild;

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      var b = document.createElement('b');
      logical.insertBefore(host, b, a);

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<b></b><a>Hello</a>');
    });

    test('insertBefore - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content>';
      var content = shadowRoot.firstChild;

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      var b = document.createElement('b');
      logical.insertBefore(shadowRoot, b, content);

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<b></b><a>Hello</a>');
    });

    test('replaceChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';
      var a = host.firstChild;

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content>';

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      var b = document.createElement('b');
      logical.replaceChild(host, b, a);

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<b></b>');
    });

    test('replaceChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = '<content></content>';
      var content = shadowRoot.firstChild;

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<a>Hello</a>');

      var b = document.createElement('b');
      logical.replaceChild(shadowRoot, b, content);

      render(host);
      expect(getVisualInnerHtml(host)).to.be('<b></b>');
    });

  });
});
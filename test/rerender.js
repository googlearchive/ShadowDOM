/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Shadow DOM rerender', function() {

  function getVisualInnerHtml(el) {
    renderAllPending();
    return unwrap(el).innerHTML;
  }

  test('No <content> nor <shadow>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.textContent = 'text';
    var textNode = shadowRoot.firstChild;

    function testRender() {

      assert.strictEqual(getVisualInnerHtml(host), 'text');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: textNode,
        lastChild: textNode
      });

      expectStructure(textNode, {
        parentNode: shadowRoot
      });
    }

    testRender();
    testRender();
  });

test('<content>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<content></content>';
    var content = shadowRoot.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: content,
        lastChild: content
      });

      expectStructure(content, {
        parentNode: shadowRoot
      });
    }

    testRender();
    testRender();
  });

  test('<content> with fallback', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<content select="b">fallback</content>';
    var content = shadowRoot.firstChild;
    var fallback = content.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: content,
        lastChild: content
      });

      expectStructure(content, {
        parentNode: shadowRoot,
        firstChild: fallback,
        lastChild: fallback
      });

      expectStructure(fallback, {
        parentNode: content
      });
    }

    testRender();
    testRender();
  });

test('<shadow>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<shadow></shadow>';
    var shadow = shadowRoot.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), '');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: shadow,
        lastChild: shadow
      });

      expectStructure(shadow, {
        parentNode: shadowRoot
      });
    }

    testRender();
    testRender();
  });

  test('<shadow> with fallback', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<shadow>fallback</shadow>';
    var shadow = shadowRoot.firstChild;
    var fallback = shadow.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: shadow,
        lastChild: shadow
      });

      expectStructure(shadow, {
        parentNode: shadowRoot,
        firstChild: fallback,
        lastChild: fallback
      });

      expectStructure(fallback, {
        parentNode: shadow
      });
    }

    testRender();
    testRender();
  });

  test('<shadow> with nested shadow roots', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var oldestShadowRoot = host.createShadowRoot();
    oldestShadowRoot.textContent = 'text';
    var textNode = oldestShadowRoot.firstChild;

    var youngestShadowRoot = host.createShadowRoot();
    youngestShadowRoot.innerHTML = '<shadow></shadow>';
    var shadow = youngestShadowRoot.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), 'text');

      var wrapperHost = logical.getWrapper(host);
      var wrapperA = logical.getWrapper(a);
      var logicalOldestShadowRootWrapper = logical.getWrapper(oldestShadowRoot);
      var wrapperTextNode = logical.getWrapper(textNode);
      var logicalYoungestShadowRootWrapper =
          logical.getWrapper(youngestShadowRoot);
      var logicalShadowWrapper = logical.getWrapper(shadow);

      expectStructure(wrapperHost, {
        firstChild: wrapperA,
        lastChild: wrapperA
      });

      expectStructure(wrapperA, {
        parentNode: wrapperHost
      });

      expectStructure(logicalOldestShadowRootWrapper, {
        firstChild: wrapperTextNode,
        lastChild: wrapperTextNode
      });

      expectStructure(wrapperTextNode, {
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

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content>fallback</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var wrapperHost = logical.getWrapper(host);
      wrapperHost.firstChild.removeAllChildNodes();

      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      wrapperHost.removeAllChildNodes();
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');
    });

    test('removeAllChildNodes - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content><b>after</b>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b>after</b>');

      var wrapperShadowRoot = logical.getWrapper(shadowRoot);
      wrapperShadowRoot.lastChild.removeAllChildNodes();

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');

      wrapperShadowRoot.removeAllChildNodes();
      assert.strictEqual(getVisualInnerHtml(host), '');
    });

    test('removeAllChildNodes - mutate shadow fallback', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content select="xxx"><b>fallback</b></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<b>fallback</b>');

      var wrapperShadowRoot = logical.getWrapper(shadowRoot);

      wrapperShadowRoot.firstChild.firstChild.removeAllChildNodes();

      assert.strictEqual(getVisualInnerHtml(host), '<b></b>');

      wrapperShadowRoot.firstChild.removeAllChildNodes();

      assert.strictEqual(getVisualInnerHtml(host), '');

      wrapperShadowRoot.removeAllChildNodes();
      assert.strictEqual(getVisualInnerHtml(host), '');
    });

    test('removeChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content>fallback</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var wrapperHost = logical.getWrapper(host);
      wrapperHost.firstChild.removeChild(wrapperHost.firstChild.firstChild);

      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      wrapperHost.removeChild(wrapperHost.firstChild);
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');
    });

    test('removeChild - mutate host 2', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a></a><b></b>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content>fallback</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a></a><b></b>');

      var wrapperHost = logical.getWrapper(host);
      wrapperHost.removeChild(wrapperHost.lastChild);

      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      wrapperHost.removeChild(wrapperHost.firstChild);
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');
    });

    test('removeChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content><b>after</b>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b>after</b>');

      var wrapperShadowRoot = logical.getWrapper(shadowRoot);

      wrapperShadowRoot.lastChild.removeChild(
          wrapperShadowRoot.lastChild.firstChild);

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');

      wrapperShadowRoot.removeChild(wrapperShadowRoot.lastChild);
      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      wrapperShadowRoot.removeChild(wrapperShadowRoot.firstChild);
      assert.strictEqual(getVisualInnerHtml(host), '');
    });

    test('setAttribute select', function() {
      // TODO(arv): DOM bindings for select.
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a><b>World</b>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content select="b">fallback b</content>' +
                             '<content select="a">fallback a</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<b>World</b><a>Hello</a>');

      logical.getFirstChild(shadowRoot).setAttribute('select', 'xxx');

      assert.strictEqual(getVisualInnerHtml(host), 'fallback b<a>Hello</a>');

      logical.getFirstChild(shadowRoot).setAttribute('select', '');

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b>World</b>fallback a');
    });

    test('appendChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      var wrapperHost = logical.getWrapper(host);
      var wrapperB = logical.getWrapper(b);
      wrapperHost.appendChild(wrapperB);

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');
    });

    test('appendChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      var wrapperShadowRoot = logical.getWrapper(shadowRoot);
      var wrapperB = logical.getWrapper(b);
      wrapperShadowRoot.appendChild(wrapperB);

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');
    });

    test('insertBefore - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';
      var a = host.firstChild;

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      var wrapperHost = logical.getWrapper(host);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);

      wrapperHost.insertBefore(wrapperB, wrapperA);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b><a>Hello</a>');
    });

    test('insertBefore - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';
      var content = shadowRoot.firstChild;

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      var wrapperShadowRoot = logical.getWrapper(shadowRoot);
      var wrapperB = logical.getWrapper(b);
      var wrapperContent = logical.getWrapper(content);

      wrapperShadowRoot.insertBefore(wrapperB, wrapperContent);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b><a>Hello</a>');
    });

    test('replaceChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';
      var a = host.firstChild;

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      var wrapperHost = logical.getWrapper(host);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);

      wrapperHost.replaceChild(wrapperB, wrapperA);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b>');
    });

    test('replaceChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';
      var content = shadowRoot.firstChild;

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      shadowRoot.replaceChild(b, content);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b>');
    });

  });
});
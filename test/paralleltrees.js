/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Parallel Trees', function() {

  suite('Visual', function() {

    test('removeAllChildNodes wrapper', function() {
      var div = document.createElement('div');
      div.textContent = 'a';
      var textNode = div.firstChild;

      visual.removeAllChildNodes(div);

      expectStructure(div, {});
      expectStructure(textNode, {});

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalTextNodeWrapper = logical.getWrapper(textNode);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalTextNodeWrapper,
        lastChild: logicalTextNodeWrapper,
      });

      expectStructure(logicalTextNodeWrapper, {
        parentNode: logicalDivWrapper
      });
    });

    test('removeAllChildNodes wrapper with 3 child nodes', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b><c></c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      var c = div.lastChild;

      visual.removeAllChildNodes(div);

      expectStructure(div, {});
      expectStructure(a, {});
      expectStructure(b, {});
      expectStructure(c, {});

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalBWrapper = logical.getWrapper(b);
      var logicalCWrapper = logical.getWrapper(c);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalCWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalDivWrapper,
        nextSibling: logicalBWrapper
      });

      expectStructure(logicalBWrapper, {
        parentNode: logicalDivWrapper,
        previousSibling: logicalAWrapper,
        nextSibling: logicalCWrapper
      });

      expectStructure(logicalCWrapper, {
        parentNode: logicalDivWrapper,
        previousSibling: logicalBWrapper
      });
    });

    test('appendChild, start with no children', function() {
      var div = document.createElement('div');
      var textNode = document.createTextNode('hello');

      expectStructure(div, {});
      visual.appendChild(div, textNode);

      expectStructure(div, {
        firstChild: textNode,
        lastChild: textNode
      });

      expectStructure(textNode, {
        parentNode: div
      });

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalTextNodeWrapper = logical.getWrapper(textNode);

      expectStructure(logicalDivWrapper, {});
      expectStructure(logicalTextNodeWrapper, {});
    });

    test('appendChild, start with one child', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a>';
      var a = div.firstChild;
      var b = document.createElement('b');

      visual.appendChild(div, b);

      expectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a
      });

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalBWrapper = logical.getWrapper(b);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper,
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalDivWrapper
      });
      expectStructure(logicalBWrapper, {});
    });

    test('appendChild, start with two children', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b>';
      var a = div.firstChild;
      var b = div.lastChild;
      var c = document.createElement('c');

      visual.appendChild(div, c);

      expectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      expectStructure(c, {
        parentNode: div,
        previousSibling: b
      });

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalBWrapper = logical.getWrapper(b);
      var logicalCWrapper = logical.getWrapper(c);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalBWrapper,
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalDivWrapper,
        nextSibling: logicalBWrapper
      });

      expectStructure(logicalBWrapper, {
        parentNode: logicalDivWrapper,
        previousSibling: logicalAWrapper
      });

      expectStructure(logicalCWrapper, {});
    });

    test('removeChild, start with one child', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a>';
      var a = div.firstChild;

      visual.removeChild(div, a);

      expectStructure(div, {});
      expectStructure(a, {});

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalAWrapper = logical.getWrapper(a);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalAWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalDivWrapper
      });
    });

    test('removeChild, start with two children, remove first', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b>';
      var a = div.firstChild;
      var b = div.lastChild;

      visual.removeChild(div, a);

      expectStructure(div, {
        firstChild: b,
        lastChild: b
      });

      expectStructure(a, {});

      expectStructure(b, {
        parentNode: div
      });

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalBWrapper = logical.getWrapper(b);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalBWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalDivWrapper,
        nextSibling: logicalBWrapper
      });

      expectStructure(logicalBWrapper, {
        parentNode: logicalDivWrapper,
        previousSibling: logicalAWrapper
      });
    });

    test('removeChild, start with two children, remove last', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b>';
      var a = div.firstChild;
      var b = div.lastChild;

      visual.removeChild(div, b);

      expectStructure(div, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: div
      });

      expectStructure(b, {});

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalBWrapper = logical.getWrapper(b);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalBWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalDivWrapper,
        nextSibling: logicalBWrapper
      });

      expectStructure(logicalBWrapper, {
        parentNode: logicalDivWrapper,
        previousSibling: logicalAWrapper
      });
    });

    test('removeChild, start with three children, remove middle', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b><c></c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      var c = div.lastChild;

      visual.removeChild(div, b);

      expectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: c
      });

      expectStructure(b, {});

      expectStructure(c, {
        parentNode: div,
        previousSibling: a
      });

      var logicalDivWrapper = logical.getWrapper(div);
      var logicalAWrapper = logical.getWrapper(a);
      var logicalBWrapper = logical.getWrapper(b);
      var logicalCWrapper = logical.getWrapper(c);

      expectStructure(logicalDivWrapper, {
        firstChild: logicalAWrapper,
        lastChild: logicalCWrapper
      });

      expectStructure(logicalAWrapper, {
        parentNode: logicalDivWrapper,
        nextSibling: logicalBWrapper
      });

      expectStructure(logicalBWrapper, {
        parentNode: logicalDivWrapper,
        previousSibling: logicalAWrapper,
        nextSibling: logicalCWrapper
      });

      expectStructure(logicalCWrapper, {
        parentNode: logicalDivWrapper,
        previousSibling: logicalBWrapper
      });
    });
  });

  suite('Logical', function() {

    test('removeAllChildNodes', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b><c></c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      var c = div.lastChild;

      logical.removeAllChildNodes(div);

      expectStructure(div, {});
      expectStructure(a, {});
      expectStructure(b, {});
      expectStructure(c, {});

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);
      var wrapperC = logical.getWrapper(c);

      expectStructure(wrapperDiv, {});
      expectStructure(wrapperA, {});
      expectStructure(wrapperB, {});
      expectStructure(wrapperC, {});
    });

    test('removeAllChildNodes - with wrappers before removal', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b><c></c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      var c = div.lastChild;

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);
      var wrapperC = logical.getWrapper(c);

      logical.removeAllChildNodes(div);

      expectStructure(div, {});
      expectStructure(a, {});
      expectStructure(b, {});
      expectStructure(c, {});

      expectStructure(wrapperDiv, {});
      expectStructure(wrapperA, {});
      expectStructure(wrapperB, {});
      expectStructure(wrapperC, {});
    });

    test('removeAllChildNodes - change visual first', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b><c></c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      var c = div.lastChild;

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);
      var wrapperC = logical.getWrapper(c);

      visual.removeAllChildNodes(div);

      expectStructure(div, {});
      expectStructure(a, {});
      expectStructure(b, {});
      expectStructure(c, {});

      logical.removeAllChildNodes(div);

      expectStructure(wrapperDiv, {});
      expectStructure(wrapperA, {});
      expectStructure(wrapperB, {});
      expectStructure(wrapperC, {});
    });
  });
});
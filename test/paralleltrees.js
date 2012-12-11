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

      var wrapperDiv = logical.getWrapper(div);
      var logicalTextNodeWrapper = logical.getWrapper(textNode);

      expectStructure(wrapperDiv, {
        firstChild: logicalTextNodeWrapper,
        lastChild: logicalTextNodeWrapper,
      });

      expectStructure(logicalTextNodeWrapper, {
        parentNode: wrapperDiv
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

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);
      var wrapperC = logical.getWrapper(c);

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperC
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDiv,
        nextSibling: wrapperB
      });

      expectStructure(wrapperB, {
        parentNode: wrapperDiv,
        previousSibling: wrapperA,
        nextSibling: wrapperC
      });

      expectStructure(wrapperC, {
        parentNode: wrapperDiv,
        previousSibling: wrapperB
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

      var wrapperDiv = logical.getWrapper(div);
      var logicalTextNodeWrapper = logical.getWrapper(textNode);

      expectStructure(wrapperDiv, {});
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

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperA,
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDiv
      });
      expectStructure(wrapperB, {});
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

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);
      var wrapperC = logical.getWrapper(c);

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperB,
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDiv,
        nextSibling: wrapperB
      });

      expectStructure(wrapperB, {
        parentNode: wrapperDiv,
        previousSibling: wrapperA
      });

      expectStructure(wrapperC, {});
    });

    test('appendChild with document fragment', function() {
      var div = document.createElement('div');
      var df = document.createDocumentFragment();
      var a = df.appendChild(document.createElement('a'));
      var b = df.appendChild(document.createElement('b'));

      visual.appendChild(div, df);

      expectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      expectStructure(df, {});

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a
      });

      var wrapperDiv = logical.getWrapper(div);
      var wrapperDf = logical.getWrapper(df);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);

      expectStructure(wrapperDiv, {});

      expectStructure(wrapperDf, {
        firstChild: wrapperA,
        lastChild: wrapperB
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDf,
        nextSibling: wrapperB
      });

      expectStructure(wrapperB, {
        parentNode: wrapperDf,
        previousSibling: wrapperA
      });
    });

    test('removeChild, start with one child', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a>';
      var a = div.firstChild;

      visual.removeChild(div, a);

      expectStructure(div, {});
      expectStructure(a, {});

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperA
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDiv
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

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperB
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDiv,
        nextSibling: wrapperB
      });

      expectStructure(wrapperB, {
        parentNode: wrapperDiv,
        previousSibling: wrapperA
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

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperB
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDiv,
        nextSibling: wrapperB
      });

      expectStructure(wrapperB, {
        parentNode: wrapperDiv,
        previousSibling: wrapperA
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

      var wrapperDiv = logical.getWrapper(div);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);
      var wrapperC = logical.getWrapper(c);

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperC
      });

      expectStructure(wrapperA, {
        parentNode: wrapperDiv,
        nextSibling: wrapperB
      });

      expectStructure(wrapperB, {
        parentNode: wrapperDiv,
        previousSibling: wrapperA,
        nextSibling: wrapperC
      });

      expectStructure(wrapperC, {
        parentNode: wrapperDiv,
        previousSibling: wrapperB
      });
    });
  });

  suite('Logical', function() {
    suite('removeAllChildNodes', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b><c></c>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = div.lastChild;

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.removeAllChildNodes();

        expectStructure(div, {});
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {});


        expectStructure(wrapperDiv, {});
        expectStructure(wrapperA, {});
        expectStructure(wrapperB, {});
        expectStructure(wrapperC, {});
      });

      test('with wrappers before removal', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b><c></c>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = div.lastChild;

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.removeAllChildNodes();

        expectStructure(div, {});
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {});

        expectStructure(wrapperDiv, {});
        expectStructure(wrapperA, {});
        expectStructure(wrapperB, {});
        expectStructure(wrapperC, {});
      });

      test('change visual first', function() {
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

        wrapperDiv.removeAllChildNodes();

        expectStructure(wrapperDiv, {});
        expectStructure(wrapperA, {});
        expectStructure(wrapperB, {});
        expectStructure(wrapperC, {});
      });
    });

    suite('appendChild', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = document.createElement('c');

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.appendChild(wrapperC);

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

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperC
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB
        });
      });

      test('with wrappers before', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = document.createElement('c');

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.appendChild(wrapperC);

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

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperC
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB
        });
      });

      test('change visual first', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = document.createElement('c');

        visual.removeAllChildNodes(div);

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.appendChild(wrapperC);

        expectStructure(div, {
          firstChild: c,
          lastChild: c
        });
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {
          parentNode: div
        });

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperC
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB
        });
      });
    });

    suite('insertBefore', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.insertBefore(wrapperB, wrapperC);

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

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperC
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB
        });
      });

      test('with wrappers before', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.insertBefore(wrapperB, wrapperC);

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

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperC
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB
        });
      });

      test('change visual first', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        visual.removeAllChildNodes(div);

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.insertBefore(wrapperB, wrapperC);

        expectStructure(div, {});
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {});

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperC
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB
        });

        // swap a and b
        wrapperDiv.insertBefore(wrapperB, wrapperA);

        expectStructure(wrapperDiv, {
          firstChild: wrapperB,
          lastChild: wrapperC
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          nextSibling: wrapperA
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA
        });

        // swap a and c
        wrapperDiv.insertBefore(wrapperC, wrapperA);

        expectStructure(wrapperDiv, {
          firstChild: wrapperB,
          lastChild: wrapperA
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          nextSibling: wrapperC
        });
        expectStructure(wrapperC, {
          parentNode: wrapperDiv,
          previousSibling: wrapperB,
          nextSibling: wrapperA
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          previousSibling: wrapperC
        });
      });
    });

    test('insertBefore with document fragment', function() {
      var div = document.createElement('div');
      var c = div.appendChild(document.createElement('c'));
      var df = document.createDocumentFragment();
      var a = df.appendChild(document.createElement('a'));
      var b = df.appendChild(document.createElement('b'));

      visual.removeAllChildNodes(div);
      visual.removeAllChildNodes(df);

      var wrapperDiv = logical.getWrapper(div);
      var wrapperDf = logical.getWrapper(df);
      var wrapperA = logical.getWrapper(a);
      var wrapperB = logical.getWrapper(b);
      var wrapperC = logical.getWrapper(c);

      wrapperDiv.insertBefore(wrapperDf, wrapperC);

      expectStructure(div, {});
      expectStructure(df, {});
      expectStructure(a, {});
      expectStructure(b, {});
      expectStructure(c, {});

      expectStructure(wrapperDiv, {
        firstChild: wrapperA,
        lastChild: wrapperC
      });

      expectStructure(wrapperDf, {});

      expectStructure(wrapperA, {
        parentNode: wrapperDiv,
        nextSibling: wrapperB
      });

      expectStructure(wrapperB, {
        parentNode: wrapperDiv,
        previousSibling: wrapperA,
        nextSibling: wrapperC
      });

      expectStructure(wrapperC, {
        parentNode: wrapperDiv,
        previousSibling: wrapperB
      });
    });

    suite('replaceChild', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.replaceChild(wrapperB, wrapperC);

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
        expectStructure(c, {});

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperB
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA
        });
        expectStructure(wrapperC, {});
      });

      test('with wrappers before', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.replaceChild(wrapperB, wrapperC);

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
        expectStructure(c, {});

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperB
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA
        });
        expectStructure(wrapperC, {});
      });

      test('change visual first', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        visual.removeAllChildNodes(div);

        var wrapperDiv = logical.getWrapper(div);
        var wrapperA = logical.getWrapper(a);
        var wrapperB = logical.getWrapper(b);
        var wrapperC = logical.getWrapper(c);

        wrapperDiv.replaceChild(wrapperB, wrapperC);

        expectStructure(div, {});
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {});

        expectStructure(wrapperDiv, {
          firstChild: wrapperA,
          lastChild: wrapperB
        });
        expectStructure(wrapperA, {
          parentNode: wrapperDiv,
          nextSibling: wrapperB
        });
        expectStructure(wrapperB, {
          parentNode: wrapperDiv,
          previousSibling: wrapperA
        });
        expectStructure(wrapperC, {});

        // Remove a
        wrapperDiv.replaceChild(wrapperB, wrapperA);

        expectStructure(wrapperDiv, {
          firstChild: wrapperB,
          lastChild: wrapperB
        });
        expectStructure(wrapperA, {});
        expectStructure(wrapperB, {
          parentNode: wrapperDiv
        });
        expectStructure(wrapperC, {});

        // Swap b with c
        wrapperDiv.replaceChild(wrapperC, wrapperB);

        expectStructure(wrapperDiv, {
          firstChild: wrapperC,
          lastChild: wrapperC
        });
        expectStructure(wrapperA, {});
        expectStructure(wrapperB, {});
        expectStructure(wrapperC, {
          parentNode: wrapperDiv
        });
      });
    });

  });
});
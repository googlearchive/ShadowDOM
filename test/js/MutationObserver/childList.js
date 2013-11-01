/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('MutationObserver', function() {

  suite('childList', function() {

    var NodeList = ShadowDOMPolyfill.wrappers.NodeList;

    function makeNodeList(/* ...args */) {
      var nodeList = new NodeList;
      for (var i = 0; i < arguments.length; i++) {
        nodeList[i] = arguments[i];
      }
      nodeList.length = i;
      return nodeList;
    }

    test('appendChild', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });
      var a = document.createElement('a');
      var b = document.createElement('b');

      div.appendChild(a);
      div.appendChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        addedNodes: [b],
        previousSibling: a
      });
    });

    test('insertBefore', function() {
      var div = document.createElement('div');
      var a = document.createElement('a');
      var b = document.createElement('b');
      var c = document.createElement('c');
      div.appendChild(a);

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.insertBefore(b, a);
      div.insertBefore(c, a);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: [b],
        nextSibling: a
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        addedNodes: [c],
        nextSibling: a,
        previousSibling: b
      });
    });

    test('removeChild', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createElement('a'));
      var b = div.appendChild(document.createElement('b'));
      var c = div.appendChild(document.createElement('c'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.removeChild(b);
      div.removeChild(a);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        removedNodes: [b],
        nextSibling: c,
        previousSibling: a
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        removedNodes: [a],
        nextSibling: c
      });
    });

    test('Direct children', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });
      var a = document.createElement('a');
      var b = document.createElement('b');

      div.appendChild(a);
      div.insertBefore(b, a);
      div.removeChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 3);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        nextSibling: a,
        addedNodes: [b]
      });

      expectMutationRecord(records[2], {
        type: 'childList',
        target: div,
        nextSibling: a,
        removedNodes: [b]
      });
    });

    test('subtree', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var observer = new MutationObserver(function() {});
      observer.observe(child, {
        childList: true
      });
      var a = document.createTextNode('a');
      var b = document.createTextNode('b');

      child.appendChild(a);
      child.insertBefore(b, a);
      child.removeChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 3);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: child,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: child,
        nextSibling: a,
        addedNodes: [b]
      });

      expectMutationRecord(records[2], {
        type: 'childList',
        target: child,
        nextSibling: a,
        removedNodes: [b]
      });
    });

    test('both direct and subtree', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true,
        subtree: true
      });
      observer.observe(child, {
        childList: true
      });

      var a = document.createTextNode('a');
      var b = document.createTextNode('b');

      child.appendChild(a);
      div.appendChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: child,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        addedNodes: [b],
        previousSibling: child
      });
    });

    test('Append multiple at once at the end', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      var df = document.createDocumentFragment();
      var b = df.appendChild(document.createTextNode('b'));
      var c = df.appendChild(document.createTextNode('c'));
      var d = df.appendChild(document.createTextNode('d'));

      div.appendChild(df);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(b, c, d),
        removedNodes: makeNodeList(),
        previousSibling: a,
        nextSibling: null
      });
    });

    test('Append multiple at once at the front', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      var df = document.createDocumentFragment();
      var b = df.appendChild(document.createTextNode('b'));
      var c = df.appendChild(document.createTextNode('c'));
      var d = df.appendChild(document.createTextNode('d'));

      div.insertBefore(df, a);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(b, c, d),
        removedNodes: makeNodeList(),
        previousSibling: null,
        nextSibling: a
      });
    });

    test('Append multiple at once in the middle', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      var df = document.createDocumentFragment();
      var c = df.appendChild(document.createTextNode('c'));
      var d = df.appendChild(document.createTextNode('d'));

      div.insertBefore(df, b);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(c, d),
        removedNodes: makeNodeList(),
        previousSibling: a,
        nextSibling: b
      });
    });

    test('Remove all children using innerHTML', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));
      var c = div.appendChild(document.createTextNode('c'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.innerHTML = '';

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(),
        removedNodes: makeNodeList(a, b, c),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('Replace all children using innerHTML', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.innerHTML = '<c></c><d></d>';
      var c = div.firstChild;
      var d = div.lastChild;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(c, d),
        removedNodes: makeNodeList(a, b),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('Remove all children using textContent', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));
      var c = div.appendChild(document.createTextNode('c'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.textContent = '';

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(),
        removedNodes: makeNodeList(a, b, c),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('Replace all children using textContent', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.textContent = 'text';
      var text = div.firstChild;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(text),
        removedNodes: makeNodeList(a, b),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('surpress removal', function() {
      var a = document.createElement('a');
      var b = document.createElement('b');
      var c = document.createElement('c');

      a.appendChild(c);

      var observerA = new MutationObserver(function() {});
      observerA.observe(a, {
        childList: true
      });

      var observerB = new MutationObserver(function() {});
      observerB.observe(b, {
        childList: true
      });

      b.appendChild(c);

      var recordsA = observerA.takeRecords();

      assert.equal(recordsA.length, 0);

      var recordsB = observerB.takeRecords();
      assert.equal(recordsB.length, 1);
      expectMutationRecord(recordsB[0], {
        type: 'childList',
        target: b,
        addedNodes: [c]
      });
    });

    test('surpress document fragment', function() {
      var df = document.createDocumentFragment();
      var b = document.createElement('b');
      var c = document.createElement('c');

      df.appendChild(c);

      var observerDf = new MutationObserver(function() {});
      observerDf.observe(df, {
        childList: true
      });

      var observerB = new MutationObserver(function() {});
      observerB.observe(b, {
        childList: true
      });

      b.appendChild(df);

      var recordsDf = observerDf.takeRecords();

      assert.equal(recordsDf.length, 0);

      var recordsB = observerB.takeRecords();
      assert.equal(recordsB.length, 1);
      expectMutationRecord(recordsB[0], {
        type: 'childList',
        target: b,
        addedNodes: [c]
      });
    });

  });

});

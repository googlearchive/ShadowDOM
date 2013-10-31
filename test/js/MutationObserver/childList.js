/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('MutationObserver', function() {

  test('basics', function() {
    var mo = new MutationObserver(function(records, observer) {

    });

    var div = document.createElement('div');
    mo.observe(div, {
      childList: true
    });

    var a = div.appendChild(document.createElement('a'));

    var records = mo.takeRecords();
    assert.equal(1, records.length);
    assert.equal('childList', records[0].type);
    assert.equal(1, records[0].addedNodes.length);
    assert.equal(a, records[0].addedNodes[0]);
  });

  suite('childList', function() {

    //  TODO: remove
    var addedNodes, removedNodes;

    setup(function() {
      addedNodes = [];
      removedNodes = [];
    });

    function mergeRecords(records) {
      records.forEach(function(record) {
        if (record.addedNodes)
          addedNodes.push.apply(addedNodes, record.addedNodes);
        if (record.removedNodes)
          removedNodes.push.apply(removedNodes, record.removedNodes);
      });
    }

    function assertAll(records, expectedProperties) {
      records.forEach(function(record) {
        for (var propertyName in expectedProperties) {
          assert.strictEqual(record[propertyName], expectedProperties[propertyName]);
        }
      });
    }
    ///////////////////

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
      assert.strictEqual(records.length, 2);

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
      assert.strictEqual(records.length, 2);

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
      assert.strictEqual(records.length, 3);

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
      assert.strictEqual(records.length, 3);

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
      assert.strictEqual(records.length, 2);

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
      mergeRecords(records);

      // TODO(arv): assert.equals or deepEquals or whatever it is called.
      assert.deepEqual(addedNodes, [b, c, d]);
      assert.deepEqual(removedNodes, []);
      assertAll(records, {
        type: 'childList',
        target: div
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
      mergeRecords(records);

      assert.deepEqual(addedNodes, [b, c, d]);
      assert.deepEqual(removedNodes, []);
      assertAll(records, {
        type: 'childList',
        target: div
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
      mergeRecords(records);

      assert.deepEqual(addedNodes, [c, d]);
      assert.deepEqual(removedNodes, []);
      assertAll(records, {
        type: 'childList',
        target: div
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
      mergeRecords(records);

      assert.deepEqual(addedNodes, []);
      assert.deepEqual(removedNodes, [a, b, c]);
      assertAll(records, {
        type: 'childList',
        target: div
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
      mergeRecords(records);

      assert.deepEqual(addedNodes, [c, d]);
      assert.deepEqual(removedNodes, [a, b]);
      assertAll(records, {
        type: 'childList',
        target: div
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
      mergeRecords(records);

      assert.deepEqual(addedNodes, []);
      assert.deepEqual(removedNodes, [a, b, c]);
      assertAll(records, {
        type: 'childList',
        target: div
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
      mergeRecords(records);

      assert.deepEqual(addedNodes, [text]);
      assert.deepEqual(removedNodes, [a, b]);
      assertAll(records, {
        type: 'childList',
        target: div
      });
    });

  });

});

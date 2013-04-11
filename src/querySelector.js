// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';
  
  // spec
  var matches = Element.prototype.matches;
  
  // impls
  if (!matches) {
    var impls = ['webkit', 'moz', 'ms', 'o'];
    for (var i = 0, p, ms; (p = impls[i]); i++) {
      ms = Element.prototype[p + 'MatchesSelector'];
      if (ms) {
        matches = ms;
        break;
      }
    }
  }
  
  matches = matches.call.bind(matches);

  // utility
  
  var insertionNames = {shadow: true, content: true};
  
  function isInsertionPoint(inNode) {
    return insertionNames[inNode.localName];
  }

  function search(inNode, inSelector, inResults) {
    var c = inNode.children;
    if (c && inSelector) {
      for (var i = 0, n; (n = c[i]); i++) {
        if (matches(scope.unwrap(n), inSelector)) {
          if (!inResults) {
            return n;
          }
          inResults.push(n);
        }
        if (!isInsertionPoint(n)) {
          search(n, inSelector, inResults);
        }
      }
    }
    return inResults;
  }

  // localQuery and localQueryAll will only match Simple Selectors,
  // Structural Pseudo Classes are not guarenteed to be correct
  // http://www.w3.org/TR/css3-selectors/#simple-selectors
  
  scope.localQueryAll = function(inNode, inSlctr) {
    var nodes = new NodeList();
    nodes.push = function(i) {
      this[this.length++] = i;
    };
    return search(inNode, inSlctr, nodes);
  };

  scope.localQuery = function(inNode, inSlctr) {
    return search(inNode, inSlctr);
  };

})(this.ShadowDOMPolyfill);

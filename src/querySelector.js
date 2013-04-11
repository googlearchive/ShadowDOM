// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  // imports
   
  var unwrap = scope.unwrap;

  // find a MatchesSelector for this platform
    
  // spec
  var matches = Element.prototype.matches;
  
  // impls
  if (!matches) {
    var impls = ['webkit', 'moz', 'ms', 'o'];
    for (var i = 0, l = impls.length, p, ms; i < l; i++) {
      p = impls[i];
      ms = Element.prototype[p + 'MatchesSelector'];
      if (ms) {
        matches = ms;
        break;
      }
    }
  }

  if (!matches) {
      throw new Error('no MatchesSelector support');
  };
  
  function matchesWrapper(node, selector) {
    return matches.call(unwrap(node), selector);  
  }
  
  function findOne(node, selector) {
    var m, e = node.firstElementChild;
    while (e) {
      if (matchesWrapper(e, selector)) {
        return e;
      }
      m = findOne(e, selector);
      if (m) {
        return m;
      }
      e = e.nextElementSibling;          
    }
    return null;
  }

  function findAll(node, selector, results) {
    var e = node.firstElementChild;
    while (e) {
      if (matchesWrapper(e, selector)) {
        results[results.length++] = e;
      }
      findAll(e, selector, results);
      e = e.nextElementSibling;          
    }
    return results;
  }

  // localQuery and localQueryAll will only match Simple Selectors,
  // Structural Pseudo Classes are not guarenteed to be correct
  // http://www.w3.org/TR/css3-selectors/#simple-selectors
  
  function localQuery(node, selector) {
    return findOne(node, selector);
  };
  
  function localQueryAll(node, selector) {
    return findAll(node, selector, new NodeList());
  };
  
  // exports
  
  scope.localQuery = localQuery;
  scope.localQueryAll = localQueryAll;

})(this.ShadowDOMPolyfill);

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
  // curry a matching function
  matches = matches.call.bind(matches);

  function search(node, selector, results) {
    var e = node.firstElementChild;
    while (e) {
      if (matches(unwrap(e), selector)) {
          if (!results) {
            return e;
          }
          results[results.length++] = e;
      }
      e = e.nextElementSibling;          
    }
    return results;
  }

  // localQuery and localQueryAll will only match Simple Selectors,
  // Structural Pseudo Classes are not guarenteed to be correct
  // http://www.w3.org/TR/css3-selectors/#simple-selectors
  
  function localQueryAll(node, selector) {
    return search(node, selector, new NodeList());
  };

  function localQuery(node, selector) {
    return search(node, selector);
  };
  
  // exports
  
  scope.localQueryAll = localQueryAll;
  scope.localQuery = localQuery;

})(this.ShadowDOMPolyfill);

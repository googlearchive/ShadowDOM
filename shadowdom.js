// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function() {
  var thisFile = 'shadowdom.js';
  var base = '';
  Array.prototype.forEach.call(document.querySelectorAll('script[src]'), function(s) {
    var src = s.getAttribute('src');
    if (src.slice(-thisFile.length) == thisFile) {
      base = src.slice(0, -thisFile.length);
    }
  });
  base += 'src/';

  [
    'map.js',
    'sidetable.js',
    'wrappers.js',
    'parallel-trees.js',
    'wrappers/node-interfaces.js',
    'wrappers/Node.js',
    'wrappers/CharacterData.js',
    'wrappers/NodeList.js',
    'wrappers/ChildNodeList.js',
    'wrappers/Element.js',
    'wrappers/HTMLElement.js',
    'wrappers/HTMLUnknownElement.js',
    'wrappers/HTMLContentElement.js',
    'wrappers/HTMLShadowElement.js',
    'wrappers/generic.js',
    'wrappers/ShadowRoot.js',
    'ShadowRenderer.js',
    'wrappers/Document.js'
  ].forEach(function(src) {
    document.write('<script src="' + base + src + '"></script>');
  });

})();
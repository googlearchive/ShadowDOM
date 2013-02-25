// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function() {
  var scripts = document.querySelectorAll('script');
  var src = scripts[scripts.length - 1].src;
  var base = src.slice(0, src.search(/[^/]+$/));

  [
    'map.js',
    'sidetable.js',
    'fixdomreflection.js',
    'wrappers.js',
    'parallel-trees.js',
    'wrappers/Node.js',
    'wrappers/CharacterData.js',
    'wrappers/NodeList.js',
    'wrappers/ChildNodeList.js',
    'wrappers/parentNodeInterface.js',
    'wrappers/Element.js',
    'wrappers/HTMLElement.js',
    'wrappers/HTMLUnknownElement.js',
    'wrappers/HTMLContentElement.js',
    'wrappers/HTMLShadowElement.js',
    'wrappers/generic.js',
    'wrappers/ShadowRoot.js',
    'ShadowRenderer.js',
    'wrappers/Document.js',
  ].forEach(function(src) {
    document.write('<script src="' + base + src + '"></script>');
  });

})();
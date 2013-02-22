// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

wrappers.registerObject(document.createDocumentFragment());
wrappers.registerObject(document.createTextNode(''), CharacterData)
wrappers.registerObject(document.createTextNode(''));
wrappers.registerObject(document.createComment(''));

[
  'a',
  'applet',
  'area',
  'audio',
  'br',
  'base',
  'body',
  'button',
  'canvas',
  'command',
  'dl',
  'datalist',
  'dir', // HTMLDirectoryElement
  'div',
  'embed',
  'fieldset',
  'font',
  'form',
  'frame',
  'frameset',
  'hr',
  'head',
  'h1', // HTMLHeadingElement
  'html',
  'iframe',

  // Uses HTMLSpanElement in Firefox.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=843881
  // Not a big deal since 'img' covers this already.
  // 'image',

  'input',
  'li',
  'label',
  'legend',
  'link',
  'map',
  // 'media', Covered by audio and video
  'menu',
  'menuitem',
  'meta',
  'meter',
  'del',  // HTMLModElement
  'ol',
  'object',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'pre',
  'progress',
  'q',
  'script',
  'select',
  'source',
  'span',
  'style',
  'caption',
  'td',
  'col',
  'table',
  'tr',
  'thead',
  'textarea',
  'title',
  'ul',
  'video'
].forEach(wrappers.registerHTMLElement);

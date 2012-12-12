/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

// TODO(arv): Make these local.

var Node_prototype = {
  appendChild: findMethod(Node, 'appendChild'),
  removeChild: findMethod(Node, 'removeChild'),
  insertBefore: findMethod(Node, 'insertBefore'),
  parentNode: findDescriptor(Node, 'parentNode'),
  firstChild: findDescriptor(Node, 'firstChild'),
  lastChild: findDescriptor(Node, 'lastChild'),
  previousSibling: findDescriptor(Node, 'previousSibling'),
  nextSibling: findDescriptor(Node, 'nextSibling'),

  textContent: findDescriptor(Node, 'textContent')
};

var HTMLElement_prototype = {
  innerHTML: findDescriptor(HTMLElement, 'innerHTML'),
  outerHTML: findDescriptor(HTMLElement, 'outerHTML')
};

var getShadowOwnerAndInvalidate;

(function() {
  'use strict';

  var shadowOwnerTable = new SideTable('shadowOwner');

  function oneOf(object, propertyNames) {
    for (var i = 0; i < propertyNames.length; i++) {
      if (propertyNames[i] in object)
        return object[propertyNames[i]].bind(object);
    }
  }

  var request = oneOf(window, [
    'requestAnimationFrame',
    'mozRequestAnimationFrame',
    'webkitRequestAnimationFrame',
    'setTimeout'
  ]);

  function ShadowOwner(host) {
    this.host = host;
    this.dirty = false;

    // TODO(arv): Merge this and ShadowRenderer.
    var shadowRenderer = host.__getShadowRenderer__();
    shadowRenderer.shadowOwner = this;  // sigh
  }
  ShadowOwner.prototype = {
    invalidate: function() {
      if (!this.dirty) {
        this.dirty = true;
        ShadowOwner.pending.push(this);
        ShadowOwner.scheduleRender();
      }
    },
    render: function() {
      if (this.dirty) {
        this.host.__getShadowRenderer__().render();
        this.dirty = false;
      }
    }
  };

  ShadowOwner.pending = [];

  ShadowOwner.timer = null;

  ShadowOwner.scheduleRender = function() {
    if (ShadowOwner.timer)
      return;
    ShadowOwner.timer = request(ShadowOwner.renderAllPending, 0);
  };

  ShadowOwner.renderAllPending = function() {
    ShadowOwner.timer = null;
    ShadowOwner.pending.forEach(function(owner) {
      owner.render();
    });
    ShadowOwner.pending = [];
  };

  function getShadowOwner(node) {
    if (!node)
      return null;
    var renderer = node.__getShadowRenderer__();
    if (renderer)
      return renderer.shadowOwner;
    return null;
  }

  getShadowOwnerAndInvalidate = function getShadowOwnerAndInvalidate(node) {
    var shadowOwner = getShadowOwner(node);
    if (shadowOwner)
      shadowOwner.invalidate();
    return shadowOwner;
  };

  overrideMethod(Node, 'appendChild', function(node) {
    var shadowOwner = getShadowOwnerAndInvalidate(this);
    var nodeShadowOwner = getShadowOwnerAndInvalidate(node);
    if (shadowOwner || nodeShadowOwner)
      return unwrap(wrap(this).appendChild(wrap(node)));
    return Node_prototype.appendChild.call(this, node);
  });

  overrideMethod(Node, 'removeChild', function(node) {
    var shadowOwner = getShadowOwnerAndInvalidate(this);
    var nodeShadowOwner = getShadowOwnerAndInvalidate(node);
    if (shadowOwner || nodeShadowOwner)
      return unwrap(wrap(this).removeChild(wrap(node)));
    return Node_prototype.removeChild.call(this, node);
  });

  overrideMethod(Node, 'insertBefore', function(node, ref) {
    var shadowOwner = getShadowOwnerAndInvalidate(this);
    var nodeShadowOwner = getShadowOwnerAndInvalidate(node);
    var refShadowOwner = getShadowOwnerAndInvalidate(ref);
    if (shadowOwner || nodeShadowOwner || refShadowOwner)
      return unwrap(wrap(this).insertBefore(wrap(node), wrap(ref)));
    return Node_prototype.insertBefore.call(this, node, ref);
  });

  function methodShouldInvalidate(ctor, methodName) {
    var originalFunction = findMethod(ctor, methodName);
    overrideMethod(ctor, methodName, function() {
      getShadowOwnerAndInvalidate(this);
      return originalFunction.apply(this, arguments);
    });
  }

  methodShouldInvalidate(Element, 'setAttribute');
  methodShouldInvalidate(Element, 'setAttributeNS');
  methodShouldInvalidate(Element, 'setAttributeNode');
  methodShouldInvalidate(Element, 'setAttributeNodeNS');
  methodShouldInvalidate(Element, 'removeAttribute');
  methodShouldInvalidate(Element, 'removeAttributeNode');
  methodShouldInvalidate(Element, 'removeAttributeNS');

  function overrideNodeGetter(propertyName) {
    overrideGetter(Node, propertyName, function() {
      if (this.__getShadowRenderer__())
        return unwrap(wrap(this)[propertyName]);
      return Node_prototype[propertyName].get.call(this);
    });
  }

  overrideNodeGetter('parentNode');
  overrideNodeGetter('firstChild');
  overrideNodeGetter('lastChild');
  overrideNodeGetter('previousSibling');
  overrideNodeGetter('nextSibling');

  function getElementWalker(name) {
    return function() {
      for (var node = this[name];
           node && node.nodeType !== Node.ELEMENT_NODE;
           node = node[name]) {}
      return node;
    };
  }

  overrideGetter(Element, 'previousElementSibling', getElementWalker('previousSibling'));
  overrideGetter(Element, 'nextElementSibling', getElementWalker('nextSibling'));
  overrideGetter(Element, 'firstElementChild', getElementWalker('firstChild'));
  overrideGetter(Element, 'lastElementChild', getElementWalker('lastChild'));
  // parentElement is defined on HTMLElement in IE
  overrideGetter(HTMLElement, 'parentElement', getElementWalker('parentNode'));

  overrideDescriptor(Node, 'textContent', {
    get: function() {
      if (this instanceof CharacterData)
        return Node_prototype.textContent.get.call(this);

      // TODO(arv): This should fallback to Node_prototype.textContent if there
      // are no shadow trees below or above the context node.
      var s = '';
      for (var child = this.firstChild; child; child = child.nextSibling) {
        s += child.textContent;
      }
      return s;
    },
    set: function(value) {
      if (this instanceof CharacterData)
        return Node_prototype.textContent.set.call(this, value);

      var shadowOwner = getShadowOwnerAndInvalidate(this);
      if (!shadowOwner || this instanceof CharacterData) {
        Node_prototype.textContent.set.call(this, value);
      } else {
        var wrapper = wrap(this);
        wrapper.removeAllChildNodes();
        if (value !== '') {
          var textNode = this.ownerDocument.createTextNode(value);
          wrapper.appendChild(wrap(textNode));
        }
      }
    }
  });

  function getterNeedsReflow(ctor, propertyName) {
    var originalDescriptor = findDescriptor(ctor, propertyName);
    if (originalDescriptor) {
      overrideGetter(ctor, propertyName, function() {
        ShadowOwner.renderAllPending();
        return originalDescriptor.get.call(this);
      });
    }
  }

  getterNeedsReflow(Element, 'clientHeight');
  getterNeedsReflow(Element, 'clientWidth');
  getterNeedsReflow(Element, 'offsetHeight');
  getterNeedsReflow(Element, 'offsetWidth');
  getterNeedsReflow(Element, 'scrollHeight');
  getterNeedsReflow(Element, 'scrollWidth');
  // IE
  getterNeedsReflow(Element, 'currentStyle');

  function accessorNeedsReflow(ctor, propertyName) {
    var originalDescriptor = findDescriptor(ctor, propertyName);
    if (originalDescriptor) {
      overrideDescriptor(ctor, propertyName,{
        get: function() {
          ShadowOwner.renderAllPending();
          return originalDescriptor.get.call(this);
        },
        set: function(value) {
          ShadowOwner.renderAllPending();
          originalDescriptor.set.call(this, value);
        }
      });
    }
  }

  accessorNeedsReflow(Element, 'scrollLeft');
  accessorNeedsReflow(Element, 'scrollTop');

  function methodNeedsReflow(ctor, name) {
    var originalFunction = findMethod(ctor, name);
    overrideMethod(ctor, name, function() {
      ShadowOwner.renderAllPending();
      return originalFunction.apply(this, arguments);
    });
  }

  methodNeedsReflow(Window, 'getComputedStyle');
  methodNeedsReflow(Element, 'getBoundingClientRect');
  methodNeedsReflow(Element, 'getClientRects');
  methodNeedsReflow(HTMLElement, 'scrollIntoView');

  /////////////////////////////////////////////////////////////////////////////
  // innerHTML and outerHTML

  var escapeRegExp = /&|<|"/g;

  function escapeReplace(c) {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '"':
        return '&quot;'
    }
  }

  function escape(s) {
    return s.replace(escapeRegExp, escapeReplace);
  }

  // http://www.whatwg.org/specs/web-apps/current-work/#void-elements
  var voidElements = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
    'command': true,
    'embed': true,
    'hr': true,
    'img': true,
    'input': true,
    'keygen': true,
    'link': true,
    'meta': true,
    'param': true,
    'source': true,
    'track': true,
    'wbr': true
  };

  function getOuterHTML(node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        var tagName = node.tagName.toLowerCase();
        var s = '<' + tagName;
        var attrs = node.attributes;
        for (var i = 0, attr; attr = attrs[i]; i++) {
          s += ' ' + attr.name + '="' + escape(attr.value) + '"';
        }
        s += '>';
        if (voidElements[tagName])
          return s;

        return s + getInnerHTML(node) + '</' + tagName + '>';

      case Node.TEXT_NODE:
        return escape(node.nodeValue);

      case Node.COMMENT_NODE:
        return '<!--' + escape(node.nodeValue) + '-->';
      default:
        throw new Error('not implemented');
    }
  }

  function getInnerHTML(node) {
    var s = '';
    for (var child = node.firstChild; child; child = child.nextSibling) {
      s += getOuterHTML(child);
    }
    return s;
  }

  overrideDescriptor(HTMLElement, 'innerHTML', {
    get: function() {
      // TODO(arv): This should fallback to HTMLElement_prototype.innerHTML if there
      // are no shadow trees below or above the context node.
      return getInnerHTML(this);
    },
    set: function(value) {
      var shadowOwner = getShadowOwnerAndInvalidate(this);
      if (!shadowOwner) {
        HTMLElement_prototype.innerHTML.set.call(this, value);
      } else {
        var wrapper = wrap(this);
        wrapper.removeAllChildNodes();
        var tempElement = this.ownerDocument.createElement(this.tagName);
        HTMLElement_prototype.innerHTML.set.call(tempElement, value);
        var firstChild;
        while (firstChild = Node_prototype.firstChild.get.call(tempElement)) {
          wrapper.appendChild(wrap(firstChild));
        }
      }
    }
  });

  overrideDescriptor(HTMLElement, 'outerHTML', {
    get: function() {
      // TODO(arv): This should fallback to HTMLElement_prototype.outerHTML if there
      // are no shadow trees below or above the context node.
      return getOuterHTML(this);
    },
    set: function(value) {
      var shadowOwner = getShadowOwnerAndInvalidate(this);
      if (!shadowOwner) {
        Node_prototype.outerHTML.set.call(this, value);
      } else {
        throw new Error('not implemented');
      }
    }
  });

  // TODO(arv): JsShadowDom should have this getter.
  Object.defineProperty(DocumentFragment.prototype, 'innerHTML', {
    get: function() {
      return getInnerHTML(this);
    },
    set: function(value) {
      this.textContent = '';
      var tmp = this.ownerDocument.createElement('div');
      tmp.innerHTML = value;
      var child;
      while (child = tmp.firstChild) {
        this.appendChild(child);
      }
      ;
    },
    enumerable: true,
    configurable: true
  });

})();

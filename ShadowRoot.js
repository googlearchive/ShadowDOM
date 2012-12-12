/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

var render;

(function() {
  'use strict';

  var treeToInsertionPointMap = new Map();
  var distributedChildNodesTable = new SideTable('distributedChildNodes');
  // TODO(arv): Use side table for __shadowHost__, __shadowRoot__ and 
  // __nextOlderShadowTree__.
  var shadowDOMRendererTable = new SideTable('shadowDOMRenderer');

  function distributeChildToInsertionPoint(child, insertionPoint) {
    // console.log('Distributing', child, 'to', insertionPoint);
    treeToInsertionPointMap.set(child, insertionPoint);
    getDistributedChildNodes(insertionPoint).push(child);
  }

  function resetDistributedChildNodes(insertionPoint) {
    distributedChildNodesTable.set(insertionPoint, []);
  }

  function getDistributedChildNodes(insertionPoint) {
    return distributedChildNodesTable.get(insertionPoint);
  }

  /**
   * Visits all nodes in the tree that fulfils the |predicate|. If the |visitor|
   * function returns |false| the traversal is aborted.
   * @param {!Node} tree
   * @param {function(!Node) : boolean} predicate
   * @param {function(!Node) : *} visitor
   */
  function visit(tree, predicate, visitor) {
    // This operates on logical DOM.
    var nodes = logical.getChildNodesSnapshot(tree);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (predicate(node)) {
        if (visitor(node) === false)
          return;
      } else {
        visit(node, predicate, visitor);
      }
    }
  }

  function distributeNodeToInsertionPoint(node, insertionPoint) {
    treeToInsertionPointMap.set(node, insertionPoint);
  }


  function distributeRemainingTo(nodes, insertionPoint) {
    nodes.forEach(function(node) {
      distributeNodeToInsertionPoint(node, insertionPoint);
    });
  }

  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#dfn-distribution-algorithm
  function distribute(tree, pool) {
    visit(tree, isActiveInsertionPoint,
        function(insertionPoint) {
          resetDistributedChildNodes(insertionPoint);
          for (var i = 0; i < pool.length; i++) {  // 1.2
            var node = pool[i];  // 1.2.1
            if (matchesCriteria(node, insertionPoint)) {  // 1.2.2
              distributeChildToInsertionPoint(node, insertionPoint);  // 1.2.2.1
              // TODO(arv): splice is O(n)
              pool.splice(i--, 1);  // 1.2.2.2
            }
          }
        });
  }

  // Matching Insertion Points
  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#matching-insertion-points

  // TODO(arv): Verify this... I don't remember why I picked this regexp.
  var selectorMatchRegExp = /^[*.:#[a-zA-Z_|]/;

  var allowedPseudoRegExp = new RegExp('^:(' + [
    'link',
    'visited',
    'target',
    'enabled',
    'disabled',
    'checked',
    'indeterminate',
    'nth-child',
    'nth-last-child',
    'nth-of-type',
    'nth-last-of-type',
    'first-child',
    'last-child',
    'first-of-type',
    'last-of-type',
    'only-of-type',
  ].join('|') + ')');


  function oneOf(object, propertyNames) {
    for (var i = 0; i < propertyNames.length; i++) {
      if (propertyNames[i] in object)
        return propertyNames[i];
    }
  }

  var matchesSelector = oneOf(document.documentElement,
      ['matchesSelector', 'msMatchesSelector', 'mozMatchesSelector',
      'webkitMatchesSelector']);

  /**
   * @param {Element} node
   * @oaram {Element} point The insertion point element.
   * @return {boolean} Whether the node matches the insertion point.
   */
  function matchesCriteria(node, point) {
    var select = point.getAttribute('select');
    if (!select)
      return true;

    // Here we know the select attribute is a non empty string.
    select = select.trim();
    if (!select)
      return true;

    if (node.nodeType !== Node.ELEMENT_NODE)
      return false;

    // TODO(arv): This does not seem right. Need to check for a simple selector.
    if (!selectorMatchRegExp.test(select))
      return false;

    if (select[0] === ':' &&!allowedPseudoRegExp.test(select))
      return false;

    try {
      return node[matchesSelector](select);
    } catch (ex) {
      // Invalid selector.
      return false;
    }
  }

  function ShadowRenderer(host) {
    this.host = host;
    this.associateNode(host);
  }

  ShadowRenderer.prototype = {
    // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#rendering-shadow-trees
    render: function() {
      var host = this.host;
      this.treeComposition();
      var shadowDOM = getYoungestTree(host);
      if (!shadowDOM)
        return;

      this.removeAllChildNodes(this.host);

      var shadowDOMChildNodes = logical.getChildNodesSnapshot(shadowDOM);
      shadowDOMChildNodes.forEach(function(node) {
        this.renderNode(host, shadowDOM, node, false);
      }, this);
    },

    renderNode: function(visualParent, tree, node, isNested) {
      if (isShadowHost(node)) {
        this.appendChild(visualParent, node);
        var renderer = new ShadowRenderer(node);
        renderer.render();
      } else if (isInsertionPoint(node)) {
        this.renderInsertionPoint(visualParent, tree, node, isNested);
      } else if (isShadowInsertionPoint(node)) {
        this.renderShadowInsertionPoint(visualParent, tree, node);
      } else {
        this.renderAsAnyDomTree(visualParent, tree, node, isNested);
      }
    },

    renderAsAnyDomTree: function(visualParent, tree, child, isNested) {
      // console.log('render', child);
      this.appendChild(visualParent, child);

      if (isShadowHost(child)) {
        render(child);
      } else {
        var parent = child;
        var logicalChildNodes = logical.getChildNodesSnapshot(parent);
        logicalChildNodes.forEach(function(node) {
          this.renderNode(parent, tree, node, isNested);
        }, this);
      }
    },

    renderInsertionPoint: function(visualParent, tree, insertionPoint, isNested) {
      // console.log('renderInsertionPoint');
      var distributedChildNodes = getDistributedChildNodes(insertionPoint);
      if (distributedChildNodes.length) {
        this.removeAllChildNodes(insertionPoint);

        distributedChildNodes.forEach(function(child) {
          if (isInsertionPoint(child) && isNested)
            this.renderInsertionPoint(visualParent, tree, child, isNested);
          else
            this.renderAsAnyDomTree(visualParent, tree, child, isNested);
        }, this);
      } else {
        this.renderFallbackContent(visualParent, insertionPoint);
      }
      this.remove(insertionPoint);
    },

    renderShadowInsertionPoint: function(visualParent, tree, shadowInsertionPoint) {
      var nextOlderTree = getNextOlderTree(tree);
      if (nextOlderTree) {
        this.remove(shadowInsertionPoint);
        var shadowDOMChildNodes = logical.getChildNodesSnapshot(nextOlderTree);
        shadowDOMChildNodes.forEach(function(node) {
          this.renderNode(visualParent, nextOlderTree, node, true);
        }, this);
      } else {
        this.renderFallbackContent(visualParent, shadowInsertionPoint);
      }
    },

    renderFallbackContent: function (visualParent, fallbackHost) {
      var logicalChildNodes = logical.getChildNodesSnapshot(fallbackHost);
      logicalChildNodes.forEach(function(node) {
        // console.log('renderFallbackContent', node);
        this.appendChild(visualParent, node);
      }, this);
    },

    // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#dfn-tree-composition
    treeComposition: function () {
      var shadowHost = this.host;
      var tree = getYoungestTree(shadowHost);
      var pool = [];
      var shadowHostChildNodes = logical.getChildNodesSnapshot(shadowHost);
      shadowHostChildNodes.forEach(function(child) {
        if (isInsertionPoint(child)) {
          var reprojected = getDistributedChildNodes(child);
          if (!reprojected.length)
            reprojected = logical.getChildNodesSnapshot(child);
          pool.push.apply(pool, reprojected);
        } else {
          pool.push(child);
        }
      });

      var shadowInsertionPoint, point;
      while (tree) {
        shadowInsertionPoint = undefined;  // Reset every iteration.
        visit(tree, isActiveShadowInsertionPoint, function(point) {
          shadowInsertionPoint = point;
          return false;
        });
        point = shadowInsertionPoint;
        distribute(tree, pool);
        if (point) {
          var nextOlderTree = getNextOlderTree(tree);
          if (!nextOlderTree) {
            break;
          } else {
            tree = nextOlderTree;
            assignShadowTreeToShadowInsertionPoint(tree, point);
            continue;
          }
        } else {
          break;
        }
      }
    },

    // Visual DOM mutation.
    appendChild: function(parent, child) {
      visual.appendChild(parent, child);
      this.associateNode(child);
    },

    remove: function(node) {
      visual.remove(node);
      this.associateNode(node);
    },

    removeAllChildNodes: function(parent) {
      visual.removeAllChildNodes(parent);
      // TODO(arv): Does this need to associate all the nodes with this renderer?
    },

    associateNode: function(node) {
      shadowDOMRendererTable.set(node, this);
    }
  };


  Object.defineProperty(Node.prototype, '__getShadowRenderer__', {
    value: function() {
      return shadowDOMRendererTable.get(this);
    }
  });


  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#rendering-shadow-trees
  render = function render(host) {
    new ShadowRenderer(host).render();
  };

  function isShadowRoot(node) {
    return node.__shadowHost__;
  }

  function isInsertionPoint(node) {
    // Should this include <shadow>?
    return node.tagName == 'CONTENT';
  }

  function getShadowHost(shadowRoot) {
    throw shadowRoot.__shadowHost__;
  }

  function isActiveInsertionPoint(node) {
    // <content> inside another <content> or <shadow> is considered inactive.
    return node.tagName === 'CONTENT';
  }

  function isShadowInsertionPoint(node) {
    return node.tagName === 'SHADOW';
  }

  function isActiveShadowInsertionPoint(node) {
    // <shadow> inside another <content> or <shadow> is considered inactive.
    return node.tagName === 'SHADOW';
  }

  function isShadowHost(shadowHost) {
    return !!shadowHost.__shadowRoot__;
  }

  function getYoungestTree(shadowHost) {
    return shadowHost.__shadowRoot__;
  }

  function getNextOlderTree(tree) {
    return tree.__nextOlderShadowTree__;
  }

  var treeToShadowInsertionPointMap = new Map();

  function assignShadowTreeToShadowInsertionPoint(tree, point) {
    // console.log('Assign %o to %o', tree, point);
    treeToShadowInsertionPointMap.set(tree, point);
  }

  function isAssignedToAShadowInsertionPoint(node) {
    // This is wrong
    return treeToShadowInsertionPointMap.has(node);
  }

  function getShadowInsertionPointNode(node) {
    // This is wrong
    return treeToShadowInsertionPointMap.get(node);
  }

  function isShadowInsertionPoint(node) {
    return node.tagName === 'SHADOW';
  }

  Element.prototype.jsCreateShadowRoot = function() {
    var newShadowRoot = this.ownerDocument.createDocumentFragment();
    var oldShadowRoot = this.__shadowRoot__;
    if (oldShadowRoot)
      newShadowRoot.__nextOlderShadowTree__ = oldShadowRoot;
    this.__shadowRoot__ = newShadowRoot;
    newShadowRoot.__shadowHost__ = this;

    var renderer = new ShadowRenderer(this);

    getShadowOwnerAndInvalidate(this);

    return newShadowRoot;
  };

  Object.defineProperty(Element.prototype, 'jsShadowRoot', {
    get: function() {
      return getYoungestTree(this) || null;
    },
    configurable: true,
    enumerable: true
  });

})();
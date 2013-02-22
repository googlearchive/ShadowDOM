// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var treeToInsertionPointMap = new Map();
  var distributedChildNodesTable = new SideTable('distributedChildNodes');
  // TODO(arv): Use side table for __shadowHost__, __shadowRoot__ and 
  // __nextOlderShadowTree__.
  var shadowDOMRendererTable = new SideTable('shadowDOMRenderer');
  var treeToShadowInsertionPointMap = new Map();


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

  function getChildNodesSnapshot(node) {
    var result = [], i = 0;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      result[i++] = child;
    }
    return result;
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
    var nodes = getChildNodesSnapshot(tree);
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

  var request = oneOf(window, [
    'requestAnimationFrame',
    'mozRequestAnimationFrame',
    'webkitRequestAnimationFrame',
    'setTimeout'
  ]);

  var pendingDirtyRenderers = [];
  var renderTimer;

  function renderAllPending() {
    renderTimer = null;
    pendingDirtyRenderers.forEach(function(owner) {
      owner.render();
    });
    pendingDirtyRenderers = [];
  }

  function ShadowRenderer(host) {
    this.host = host;
    this.dirty = false;
    this.associateNode(host);
  }

  ShadowRenderer.prototype = {
    // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#rendering-shadow-trees
    render: function() {
      if (!this.dirty)
        return;

      var host = this.host;
      this.treeComposition();
      var shadowDOM = getYoungestTree(host);
      if (!shadowDOM)
        return;

      this.removeAllChildNodes(this.host);

      var shadowDOMChildNodes = getChildNodesSnapshot(shadowDOM);
      shadowDOMChildNodes.forEach(function(node) {
        this.renderNode(host, shadowDOM, node, false);
      }, this);

      this.dirty = false;
    },

    invalidate: function() {
      if (!this.dirty) {
        this.dirty = true;
        pendingDirtyRenderers.push(this);
        if (renderTimer)
          return;
        renderTimer = window[request](renderAllPending, 0);
      }
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
        var logicalChildNodes = getChildNodesSnapshot(parent);
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
        var shadowDOMChildNodes = getChildNodesSnapshot(nextOlderTree);
        shadowDOMChildNodes.forEach(function(node) {
          this.renderNode(visualParent, nextOlderTree, node, true);
        }, this);
      } else {
        this.renderFallbackContent(visualParent, shadowInsertionPoint);
      }
    },

    renderFallbackContent: function (visualParent, fallbackHost) {
      var logicalChildNodes = getChildNodesSnapshot(fallbackHost);
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
      var shadowHostChildNodes = getChildNodesSnapshot(shadowHost);
      shadowHostChildNodes.forEach(function(child) {
        if (isInsertionPoint(child)) {
          var reprojected = getDistributedChildNodes(child);
          // if reprojected is undef... reset it?
          if (!reprojected || !reprojected.length)
            reprojected = getChildNodesSnapshot(child);
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
      // TODO: Clear when moved out of shadow tree.
      shadowDOMRendererTable.set(node, this);
    }
  };

  function isInsertionPoint(node) {
    // Should this include <shadow>?
    return node.tagName == 'CONTENT';
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

  function assignShadowTreeToShadowInsertionPoint(tree, point) {
    // TODO: No one is reading the map below.
    throw 'No one is reading the map below.'

    // console.log('Assign %o to %o', tree, point);
    treeToShadowInsertionPointMap.set(tree, point);
  }

  function isShadowInsertionPoint(node) {
    return node.tagName === 'SHADOW';
  }

  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#rendering-shadow-trees
  function render(host) {
    new ShadowRenderer(host).render();
  };

  WrapperNode.prototype.invalidateShadowRenderer = function() {
    var renderer = shadowDOMRendererTable.get(this);
    if (!renderer)
      return false;

    renderer.invalidate();
    return true;
  };

  exports.ShadowRenderer = ShadowRenderer;
  exports.render = render;
  exports.getYoungestTree = getYoungestTree;
  exports.renderAllPending = renderAllPending;

})(this);
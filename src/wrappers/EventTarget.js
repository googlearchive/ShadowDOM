// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var wrappedFuns = new SideTable();
  var listenersTable = new SideTable();
  var handledEventsTable = new SideTable();
  var targetTable = new SideTable();
  var currentTargetTable = new SideTable();
  var eventPhaseTable = new SideTable();

  function isShadowRoot(node) {
    return node instanceof WrapperShadowRoot;
  }

  function isInsertionPoint(node) {
    var localName = node.localName;
    return localName === 'content' || localName === 'shadow';
  }

  function isShadowHost(node) {
    return !!node.shadowRoot;
  }

  // https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#dfn-adjusted-parent
  function calculateParent(node, context) {
    // 1.
    if (isShadowRoot(node))
      return node.insertionPointParent || getHostForShadowRoot(node)

    // 2.
    var p = node.insertionPointParent;
    if (p)
      return p;

    // 3.
    if (context && isInsertionPoint(node)) {
      var parentNode = node.parentNode;
      if (parentNode && isShadowHost(parentNode)) {
        var trees = getShadowTrees(parentNode);
        var p = context.insertionPointParent;
        for (var i = 0; i < trees.length; i++) {
          if (trees[i].contains(p))
            return p;
        }
      }
    }

    return node.parentNode;
  }

  // https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#event-retargeting
  function retarget(node) {
    var stack = [];  // 1.
    var ancestor = node;  // 2.
    var targets = [];
    while (ancestor) {  // 3.
      var context = null;  // 3.2.
      if (isInsertionPoint(ancestor)) {  // 3.1.
        context = topMostNotInsertionPoint(stack);  // 3.1.1.
        var top = stack[stack.length - 1] || ancestor;  // 3.1.2.
        stack.push(top);
      }
      if (!stack.length)
        stack.push(ancestor);  // 3.3.
      var target = stack[stack.length - 1];  // 3.4.
      targets.push({target: target, ancestor: ancestor});  // 3.5.
      if (isShadowRoot(ancestor))  // 3.6.
        stack.pop();  // 3.6.1.
      ancestor = calculateParent(ancestor, context);
    }
    return targets;
  }

  function topMostNotInsertionPoint(stack) {
    for (var i = stack.length - 1; i >= 0; i--) {
      if (!isInsertionPoint(stack[i]))
        return stack[i];
    }
    return null;
  }

  function dispatchOriginalEvent(originalEvent) {
    // Make sure this event is only dispatched once.
    if (handledEventsTable.get(originalEvent))
      return;
    handledEventsTable.set(originalEvent, true);

    var target = wrap(originalEvent.target);
    var event = wrap(originalEvent);
    return dispatchEvent(event, target);
  }

  function dispatchEvent(event, originalWrapperTarget) {
    var type = event.type;
    var bubbles = event.bubbles;
    var ancestorChain = retarget(originalWrapperTarget);
    var i = ancestorChain.length - 1;

    var phase = Event.CAPTURING_PHASE;
    eventPhaseTable.set(event, phase);

    while (true) {
      var currentTarget = ancestorChain[i].ancestor;
      var target = ancestorChain[i].target;
      if (!deliverEvent(target, currentTarget, event, type, phase))
        break;
      if (i === 0)
        break;
      i--;
    }

    phase = Event.BUBBLING_PHASE;
    eventPhaseTable.set(event, phase);

    for (; i < ancestorChain.length; i++) {
      // Non bubbling event should only dispatch on target
      if (!bubbles && i > 0)
        break;
      var currentTarget = ancestorChain[i].ancestor;
      var target = ancestorChain[i].target;
      if (!deliverEvent(target, currentTarget, event, type, phase))
        break;
    }

    return event.defaultPrevented;
  }

  function deliverEvent(target, currentTarget, event, type, phase) {
    var listeners = listenersTable.get(currentTarget);
    if (!listeners)
      return;

    var anyDeleted = false;
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      if (listener.deleted) {
        anyDeleted = true;
        continue;
      }

      if (listener.type === type && listener.phase === phase) {
        targetTable.set(event, target);
        currentTargetTable.set(event, currentTarget);

        try {
          listener.handler.call(currentTarget, event);

          // TODO(arv): stopImmediatePropagation

        } catch (ex) {
          // Don't let exceptions in event handler escape.
          console.error(ex);
        }
      }
    }

    if (anyDeleted) {
      var copy = listeners.slice();
      listeners.length = 0;
      for (var i = 0; i < copy.length; i++) {
        if (!copy[i].deleted)
          listeners.push(copy[i]);
      }
    }

    // TODO(arv): stopPropagation
    return true;
  }

  function Listener(type, handler, capture) {
    this.type = type;
    this.handler = handler;
    this.capture = capture;
  }
  Listener.prototype = {
    get phase() {
      return this.capture ? Event.CAPTURING_PHASE : Event.BUBBLING_PHASE;
    },
    equals: function(that) {
      return this.type === that.type && this.handler === that.handler &&
          this.capture === that.capture;
    },
    get deleted() {
      return this.handler === null;
    },
    delete: function() {
      this.handler = null;
    }
  };

  /**
   * This represents a logical DOM node.
   * @param {!Node} original The original DOM node, aka, the visual DOM node.
   * @constructor
   */
  function WrapperEventTarget(original) {
    /**
     * @type {!Node}
     */
    this.impl = original;
  }

  WrapperEventTarget.prototype = {
    addEventListener: function(type, fun, capture) {
      var listener = new Listener(type, fun, capture);
      var listeners = listenersTable.get(this);
      if (!listeners) {
        listeners = [];
        listenersTable.set(this, listeners);
      } else {
        // Might have a duplicate.
        for (var i = 0; i < listeners.length; i++) {
          if (listener.equals(listeners[i]))
            return;
        }
      }

      listeners.push(listener);

      unwrap(this).addEventListener(type, dispatchOriginalEvent, true);
    },
    removeEventListener: function(type, fun, capture) {
      var listeners = listenersTable.get(this);
      if (!listeners)
        return;
      var listener = new Listener(type, fun, capture);
      for (var i = 0; listeners.length; i++) {
        if (listener.equals(listeners[i])) {
          listeners[i].delete();
          return;
        }
      }
    },
    dispatchEvent: function(event) {
      return dispatchEvent(event, this);
    }
  };

  if (typeof EventTarget !== 'undefined')
    wrappers.register(EventTarget, WrapperEventTarget);

  mixin(WrapperEvent.prototype, {
    get target() {
      return targetTable.get(this);
    },
    get currentTarget() {
      return currentTargetTable.get(this);
    },
    get eventPhase() {
      return eventPhaseTable.get(this);
    }
  });

  exports.WrapperEventTarget = WrapperEventTarget;
  exports.retarget = retarget;

})(this);
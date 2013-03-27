// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

var ShadowDOMPolyfill = {};

(function(scope) {
  'use strict';

  var wrapperTable = new SideTable();
  var constructorTable = new SideTable();

  function assert(b) {
    if (!b)
      throw new Error('Assertion failed');
  };

  function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
      Object.defineProperty(to, name,
                            Object.getOwnPropertyDescriptor(from, name));
    });
    return to;
  };

  function mixinStatics(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
      switch (name) {
        case 'arguments':
        case 'caller':
        case 'length':
        case 'name':
        case 'prototype':
          return;
      }
      Object.defineProperty(to, name,
                            Object.getOwnPropertyDescriptor(from, name));
    });
    return to;
  };

  function getWrapperConstructor(node) {
    var nativePrototype = node.__proto__ || Object.getPrototypeOf(node);
    var wrapperConstructor = constructorTable.get(nativePrototype);
    if (wrapperConstructor)
      return wrapperConstructor;

    var parentWrapperConstructor = getWrapperConstructor(nativePrototype);

    var GeneratedWrapper = createWrapperConstructor(parentWrapperConstructor);
    registerInternal(nativePrototype, GeneratedWrapper, node);

    return GeneratedWrapper;
  }

  function addForwardingProperties(nativePrototype, wrapperPrototype) {
    installProperty(nativePrototype, wrapperPrototype, true);
  }

  function registerInstanceProperties(wrapperPrototype, instanceObject) {
    installProperty(instanceObject, wrapperPrototype, false);
  }

  var isFirefox = /Firefox/.test(navigator.userAgent);

  // This is used as a fallback when getting the descriptor fails in
  // installProperty.
  var dummyDescriptor = {
    get: function() {},
    set: function(v) {},
    configurable: true,
    enumerable: true
  };

  function installProperty(source, target, allowMethod) {
    Object.getOwnPropertyNames(source).forEach(function(name) {
      if (name in target)
        return;

      if (isFirefox) {
        // Tickle Firefox's old bindings.
        source.__lookupGetter__(name);
      }
      var descriptor;
      try {
        descriptor = Object.getOwnPropertyDescriptor(source, name);
      } catch (ex) {
        // JSC and V8 both use data properties instead accessors which can cause
        // getting the property desciptor throw an exception.
        // https://bugs.webkit.org/show_bug.cgi?id=49739
        descriptor = dummyDescriptor;
      }
      var getter, setter;
      if (allowMethod && typeof descriptor.value === 'function') {
        target[name] = function() {
          return this.impl[name].apply(this.impl, arguments);
        };
        return;
      }

      getter = function() {
        return this.impl[name];
      };

      if (descriptor.writable || descriptor.set) {
        setter = function(value) {
          this.impl[name] = value;
        };
      }

      Object.defineProperty(target, name, {
        get: getter,
        set: setter,
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable
      });
    });
  }

  /**
   * @param {Function} nativeConstructor
   * @param {Function} wrapperConstructor
   * @param {string|Object=} opt_instance If present, this is used to extract
   *     properties from an instance object. If this is a string
   *     |document.createElement| is used to create an instance.
   */
  function register(nativeConstructor, wrapperConstructor, opt_instance) {
    var nativePrototype = nativeConstructor.prototype;
    registerInternal(nativePrototype, wrapperConstructor, opt_instance);
    mixinStatics(wrapperConstructor, nativeConstructor);
  }

  function registerInternal(nativePrototype, wrapperConstructor, opt_instance) {
    var wrapperPrototype = wrapperConstructor.prototype;
    assert(constructorTable.get(nativePrototype) === undefined);
    constructorTable.set(nativePrototype, wrapperConstructor);
    addForwardingProperties(nativePrototype, wrapperPrototype);
    if (opt_instance)
      registerInstanceProperties(wrapperPrototype, opt_instance);
  }

  function isWrapperFor(wrapperConstructor, nativeConstructor) {
    return constructorTable.get(nativeConstructor.prototype) ===
        wrapperConstructor;
  }

  /**
   * Creates a generic wrapper constructor based on |object| and its
   * constructor.
   * Sometimes the constructor does not have an associated instance
   * (CharacterData for example). In that case you can pass the constructor that
   * you want to map the object to using |opt_nativeConstructor|.
   * @param {Node} object
   * @param {Function=} opt_nativeConstructor
   * @return {Function} The generated constructor.
   */
  function registerObject(object, opt_nativeConstructor) {
    var nativePrototype = opt_nativeConstructor ?
        opt_nativeConstructor.prototype : Object.getPrototypeOf(object);

    var superWrapperConstructor = getWrapperConstructor(nativePrototype);
    var GeneratedWrapper = createWrapperConstructor(superWrapperConstructor);
    registerInternal(nativePrototype, GeneratedWrapper, object);

    return GeneratedWrapper;
  }

  function createWrapperConstructor(superWrapperConstructor) {
    function GeneratedWrapper(node) {
      superWrapperConstructor.call(this, node);
    }
    GeneratedWrapper.prototype =
        Object.create(superWrapperConstructor.prototype);

    return GeneratedWrapper;
  }

  var originalNode = Node;
  var originalEvent = Event;

  /**
   * Wraps a node in a WrapperNode. If there already exists a wrapper for the
   * |node| that wrapper is returned instead.
   * @param {Node} node
   * @return {WrapperNode}
   */
  function wrap(node) {
    if (node === null)
      return null;

    assert(node instanceof originalNode ||
           node instanceof originalEvent);
    var wrapper = wrapperTable.get(node);
    if (!wrapper) {
      var wrapperConstructor = getWrapperConstructor(node);
      wrapper = new wrapperConstructor(node);
      wrapperTable.set(node, wrapper);
    }
    return wrapper;
  }

  /**
   * Unwraps a wrapper and returns the node it is wrapping.
   * @param {WrapperNode} wrapper
   * @return {Node}
   */
  function unwrap(wrapper) {
    if (wrapper === null)
      return null;
    assert(wrapper instanceof scope.WrapperEventTarget ||
           wrapper instanceof scope.WrapperEvent);
    return wrapper.impl;
  }

  /**
   * Overrides the current wrapper (if any) for node.
   * @param {Node} node
   * @param {WrapperNode=} wrapper If left out the wrapper will be created as
   *     needed next time someone wraps the node.
   */
  function rewrap(node, wrapper) {
    if (wrapper === null)
      return;
    assert(node instanceof originalNode ||
           node instanceof originalEvent);
    assert(wrapper === undefined || wrapper instanceof scope.WrapperNode);
    wrapperTable.set(node, wrapper);
  }

  function addWrapGetter(wrapperConstructor, name) {
    Object.defineProperty(wrapperConstructor.prototype, name, {
      get: function() {
        return wrap(this.impl[name]);
      },
      configurable: true,
      enumerable: true
    });
  }

  scope.addWrapGetter = addWrapGetter;
  scope.assert = assert;
  scope.mixin = mixin;
  scope.registerObject = registerObject;
  scope.registerWrapper = register;
  scope.rewrap = rewrap;
  scope.unwrap = unwrap;
  scope.wrap = wrap;
  scope.isWrapperFor = isWrapperFor;

})(this.ShadowDOMPolyfill);
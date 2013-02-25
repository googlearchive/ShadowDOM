// Copyright 2012 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var wrapperTable = new SideTable('wrapper');
  var constructorTable = new SideTable('constructor');

  function assert(b) {
    if (!b)
      throw new Error('Assertion failed');
  }

  function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
      Object.defineProperty(to, name,
                            Object.getOwnPropertyDescriptor(from, name));
    });
    return to;
  };

  function getWrapperConstructor(node) {

    var constructor = node.constructor;
    var wrapperConstructor = constructorTable.get(constructor);
    if (wrapperConstructor)
      return wrapperConstructor;

    var proto = Object.getPrototypeOf(node);
    var protoWrapperConstructor = getWrapperConstructor(proto);
    constructorTable.set(constructor, protoWrapperConstructor);
    return protoWrapperConstructor;    
  }

  function addForwardingProperties(nativeConstructor, wrapperConstructor) {
    var nativePrototype = nativeConstructor.prototype;
    var wrapperPrototype = wrapperConstructor.prototype;
    installProperty(nativePrototype, wrapperPrototype, true);
  }

  function registerInstanceProperties(wrapperConstructor, instanceObject) {
    installProperty(instanceObject, wrapperConstructor.prototype, false);
  }

  var isFirefox = /Firefox/.test(navigator.userAgent);

  function installProperty(source, target, allowMethod) {
    Object.getOwnPropertyNames(source).forEach(function(name) {
      if (name in target)
        return;

      if (isFirefox) {
        // Tickle Firefox's old bindings.
        source.__lookupGetter__(name);
      }
      var descriptor = Object.getOwnPropertyDescriptor(source, name);
      var getter, setter;
      if (allowMethod && typeof descriptor.value === 'function') {
        target[name] = function() {
          return this.node[name].apply(this.node, arguments);
        };
        return;
      }

      getter = function() {
        return this.node[name];
      };

      if (descriptor.writable || descriptor.set) {
        setter = function(value) {
          this.node[name] = value;
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
    assert(constructorTable.get(nativeConstructor) === undefined);
    constructorTable.set(nativeConstructor, wrapperConstructor);
    addForwardingProperties(nativeConstructor, wrapperConstructor);
    if (opt_instance)
      registerInstanceProperties(wrapperConstructor, opt_instance);  
  }

  /**
   * Creates a generic wrapper constructor based on |object| and its
   * constsructor.
   * Sometimes the constructor does not have an associated instance
   * (CharacterData for example). In that case you can pass the constructor that
   * you want to map the object to using |opt_nativeConstructor|.
   * @param {Node} object
   * @param {Function=} opt_nativeConstructor
   * @return {Function} The generated constructor.
   */
  function registerObject(object, opt_nativeConstructor) {
    var nativeConstructor = opt_nativeConstructor || object.constructor;
    var proto = Object.getPrototypeOf(nativeConstructor.prototype);

    var superWrapperConstructor = getWrapperConstructor(proto);

    function GeneratedWrapper(node) {
      superWrapperConstructor.call(this, node);
    }
    GeneratedWrapper.prototype =
        Object.create(superWrapperConstructor.prototype);

    register(nativeConstructor, GeneratedWrapper, object);

    return GeneratedWrapper;
  }

  function registerHTMLElement(tagName) {
    var element = document.createElement(tagName);
    if (element.constructor === HTMLElement ||
        element instanceof HTMLUnknownElement) {
      return;
    }
    registerObject(element);
  }

  /**
   * Wraps a node in a WrapperNode. If there already exists a wrapper for the
   * |node| that wrapper is returned instead.
   * @param {Node} node
   * @return {WrapperNode}
   */
  function wrap(node) {
    if (node === null)
      return null;

    assert(node instanceof Node);
    var wrapper = wrapperTable.get(node);
    if (!wrapper) {
      var wrapperConstructor = getWrapperConstructor(node);
      wrapper = new wrapperConstructor(node);
      wrapperTable.set(node, wrapper);
    }
    return wrapper;
  };

  /**
   * Unwraps a wrapper and returns the node it is wrapping.
   * @param {WrapperNode} wrapper
   * @return {Node}
   */
  function unwrap(wrapper) {
    if (wrapper === null)
      return null;
    assert(wrapper instanceof WrapperNode);
    return wrapper.node;
  };

  // Used all over... we should move to a generic util file.
  exports.mixin = mixin;

  exports.wrap = wrap;
  exports.unwrap = unwrap;
  exports.wrappers = {
    register: register,
    registerHTMLElement: registerHTMLElement,
    registerObject: registerObject
  };

  // Needed to override the wrapper in ShadowRoot.
  exports.wrapperTable = wrapperTable;

})(this);
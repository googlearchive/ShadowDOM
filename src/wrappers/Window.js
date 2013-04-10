// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var EventTarget = scope.wrappers.EventTarget;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrapEventTargetMethods = scope.wrapEventTargetMethods;

  var OriginalWindow = window.Window;

  function Window(impl) {
    EventTarget.call(this, impl);
  }
  Window.prototype = Object.create(EventTarget.prototype);

  var originalGetComputedStyle = window.getComputedStyle;

  Object.getPrototypeOf(window).getComputedStyle = function(el, pseudo) {
    return originalGetComputedStyle.call(this, unwrap(el), pseudo);
  };

  mixin(Window.prototype, {
    getComputedStyle: function(el, pseudo) {
      return originalGetComputedStyle.call(unwrap(this), unwrap(el), pseudo);
    }
  });

  registerWrapper(OriginalWindow, Window);

  wrapEventTargetMethods([OriginalWindow]);

  scope.wrappers.Window = Window;

})(this.ShadowDOMPolyfill);

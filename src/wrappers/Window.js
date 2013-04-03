// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var EventTarget = scope.wrappers.EventTarget;
  var registerWrapper = scope.registerWrapper;
  var wrap = scope.wrap;
  var wrapEventTargetMethod = scope.wrapEventTargetMethod;

  var OriginalWindow = window.Window;

  function Window(impl) {
    EventTarget.call(this, impl);
  }
  Window.prototype = Object.create(EventTarget.prototype);

  registerWrapper(OriginalWindow, Window);

  wrapEventTargetMethod(window);

  scope.wrappers.Window = Window;

})(this.ShadowDOMPolyfill);

// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var WrapperEventTarget = scope.WrapperEventTarget;
  var wrap = scope.wrap;
  var registerWrapper = scope.registerWrapper;
  var wrapEventTargetMethod = scope.wrapEventTargetMethod;

  var WrapperWindow = function Window(impl) {
    WrapperEventTarget.call(this, impl);
  };
  WrapperWindow.prototype = Object.create(WrapperEventTarget.prototype);

  registerWrapper(Window, WrapperWindow);

  wrapEventTargetMethod(window);

  scope.WrapperWindow = WrapperWindow;

})(this.ShadowDOMPolyfill);

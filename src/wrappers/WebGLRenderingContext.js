// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalWebGLRenderingContext = window.WebGLRenderingContext;

  // IE10 does not have WebGL.
  if (!OriginalWebGLRenderingContext)
    return;

  function WebGLRenderingContext(impl) {
    this.impl = impl;
  }

  mixin(WebGLRenderingContext.prototype, {
    get canvas() {
      return wrap(this.impl.canvas);
    },

    texImage2D: function() {
      arguments[5] = unwrap(arguments[5]);
      this.impl.texImage2D.apply(this.impl, arguments);
    },

    texSubImage2D: function() {
      arguments[6] = unwrap(arguments[6]);
      this.impl.texSubImage2D.apply(this.impl, arguments);
    }
  });

  registerWrapper(OriginalWebGLRenderingContext, WebGLRenderingContext);

  scope.wrappers.WebGLRenderingContext = WebGLRenderingContext;
})(this.ShadowDOMPolyfill);

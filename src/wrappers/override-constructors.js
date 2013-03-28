// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var isWrapperFor = scope.isWrapperFor;

  Object.getOwnPropertyNames(scope).forEach(function(name) {
    if (/^Wrapper/.test(name)) {
      var wrapperConstructor = scope[name];
      var nativeConstructorName = name.slice(7);
      var nativeConstructor = window[nativeConstructorName];
      if (nativeConstructor &&
          isWrapperFor(wrapperConstructor, nativeConstructor)) {
        window[nativeConstructorName] = wrapperConstructor;
      }
    }
  });

  if (!window.EventTarget)
    window.EventTarget = scope.WrapperEventTarget;

})(this.ShadowDOMPolyfill);
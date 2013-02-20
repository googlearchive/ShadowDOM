// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {

  var getElementById = Document.prototype.getElementById;
  Document.prototype.getElementById = function() {
    return wrap(getElementById.apply(this, arguments));
  };

  var querySelector = HTMLDocument.prototype.querySelector;
  HTMLDocument.prototype.querySelector = function() {
    return wrap(querySelector.apply(this, arguments));
  };

  function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
      Object.defineProperty(to, name,
                            Object.getOwnPropertyDescriptor(from, name));
    });
  }

  exports.mixin = mixin;

})(this);
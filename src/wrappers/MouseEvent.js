// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var WrapperEvent = scope.WrapperEvent;
  var addWrapGetter = scope.addWrapGetter;
  var wrappers = scope.wrappers;

  function WrapperMouseEvent(original) {
    WrapperEvent.call(this, original);
  }

  WrapperMouseEvent.prototype = Object.create(WrapperEvent.prototype);

  addWrapGetter(WrapperMouseEvent, 'relatedTarget');

  wrappers.register(MouseEvent, WrapperMouseEvent,
                    document.createEvent('MouseEvent'));

  scope.WrapperMouseEvent = WrapperMouseEvent;

})(this.ShadowDOMPolyfill);
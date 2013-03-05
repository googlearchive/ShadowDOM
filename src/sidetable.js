/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

// SideTable is a weak map where possible. If WeakMap is not available the
// association is stored as an expando property.
var SideTable;
// TODO(arv): WeakMap does not allow for Node etc to be keys in Firefox
if (typeof WeakMap !== 'undefined' && navigator.userAgent.indexOf('Firefox/') < 0) {
  SideTable = WeakMap;
} else {
  (function() {
    var defineProperty = Object.defineProperty;
    var hasOwnProperty = Object.hasOwnProperty;

    SideTable = function(name) {
      this.name = '__' + name + '__' + (Math.random() * 1e15 | 0) + '__';
    };

    SideTable.prototype = {
      set: function(key, value) {
        defineProperty(key, this.name, {value: value, writable: true});
      },
      get: function(key) {
        return hasOwnProperty.call(key, this.name) ? key[this.name] : undefined;
      }
    }
  })();
}

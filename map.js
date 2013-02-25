/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

if (!this.Map) {

  // TODO(arv): Mutate the key instead of using O(n) lookups.

  /**
   * I basic shim for ES6 Map.
   *
   * http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets
   *
   * This is backed by an Array. All methods are O(n) so only use this when you
   * cannot change the key object.
   */
  this.Map = function Map() {
    this.values_ = [];
    this.keys_ = [];
  }

  this.Map.prototype = {
    has: function(key) {
      return this.keys_.indexOf(key) != -1;
    },
    get: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == -1)
        return undefined;
      return this.values_[index];
    },
    set: function(key, value) {
      var index = this.keys_.indexOf(key);
      if (index == -1) {
        this.keys_.push(key);
        this.values_.push(value);
      } else {
        this.values_[index] = value;
      }
    },
    delete: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == -1)
        return;
      this.keys_.splice(index, 1);
      this.values_.splice(index, 1);
    },

    forEach: function(f, opt_context) {
      var context = opt_context || this;v
      var keys = this.keys_, values = this.values_;
      for (var i = 0; i < keys.length; i++) {
        f.call(context, keys[i], values[i], context);
      }
    }
  };

}
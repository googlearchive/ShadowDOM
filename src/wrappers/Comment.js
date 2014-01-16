// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ChildNodeInterface = scope.ChildNodeInterface;
  var CharacterData = scope.wrappers.CharacterData;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;

  var OriginalComment = window.Comment;

  function Comment(node) {
    // http://dom.spec.whatwg.org/#comment
    if (typeof node == 'string') {
      node = new OriginalComment(node);
    }
    CharacterData.call(this, node);
  }
  Comment.prototype = Object.create(CharacterData.prototype);

  mixin(Comment.prototype, ChildNodeInterface);

  registerWrapper(OriginalComment, Comment, document.createComment(''));

  scope.wrappers.Comment = Comment;
})(this.ShadowDOMPolyfill);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLFormElement', function() {

  test('elements', function() {
    var form = document.createElement('form');
    var input = document.createElement('input');
    form.appendChild(input);
    assert.instanceOf(form.elements, HTMLCollection);
    assert.equal(form.elements.length, 1);
  });

});

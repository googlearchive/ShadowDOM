/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

htmlSuite('Events', function() {

  var unwrap = ShadowDOMPolyfill.unwrap;
  var wrap = ShadowDOMPolyfill.wrap;

  try {
    document.createEvent('TouchEvent');
  } catch (ex) {
    // Touch events are not supported
    return;
  }

  test('TouchEvent', function() {
    var e = document.createEvent('TouchEvent');
    assert.instanceOf(e, TouchEvent);
    assert.instanceOf(e, UIEvent);
    assert.instanceOf(e, Event);
  });

  test('Touch', function() {
    // There is no way to create a native Touch object so we use a mock impl.

    var target = document.createElement('div');
    var impl = {
      clientX: 1,
      clientY: 2,
      screenX: 3,
      screenY: 4,
      pageX: 5,
      pageY: 6,
      identifier: 7,
      webkitRadiusX: 8,
      webkitRadiusY: 9,
      webkitRotationAngle: 10,
      webkitForce: 11,
      target: unwrap(target)
    };
    var touch = new Touch(impl);

    assert.equal(touch.clientX, 1);
    assert.equal(touch.clientY, 2);
    assert.equal(touch.screenX, 3);
    assert.equal(touch.screenY, 4);
    assert.equal(touch.pageX, 5);
    assert.equal(touch.pageY, 6);
    assert.equal(touch.identifier, 7);
    assert.equal(touch.webkitRadiusX, 8);
    assert.equal(touch.webkitRadiusY, 9);
    assert.equal(touch.webkitRotationAngle, 10);
    assert.equal(touch.webkitForce, 11);
    assert.equal(touch.target, target);
  });

});

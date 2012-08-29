/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Shadow DOM', function() {

  function testRender(descr, hostInnerHtml, shadowRootInnerHtml,
                      expectedOuterHtml) {
    test(descr, function() {
      var host = document.createElement('div');
      host.innerHTML = hostInnerHtml;

      var shadowRoot = new JsShadowRoot(host);
      shadowRoot.innerHTML = shadowRootInnerHtml;

      render(host);

      expect(host.innerHTML).to.be(expectedOuterHtml);
    });
  }

  testRender('Empty shadow', 'abc', '', '');
  testRender('Simple shadow', 'abc', 'def', 'def');
  testRender('Fallback shadow', 'abc',
             '<content select="xxx">fallback</content>', 'fallback');
  testRender('Content', 'abc',
             '<content>fallback</content>', 'abc');
  testRender('Content before', 'abc',
             'before<content>fallback</content>', 'beforeabc');
  testRender('Content after', 'abc',
             '<content>fallback</content>after', 'abcafter');

  suite('content', function() {
    testRender('no select', '<a href="">Link</a> <b>bold</b>',
               '<content></content>',
               '<a href="">Link</a> <b>bold</b>');
    testRender('select ""', '<a href="">Link</a> <b>bold</b>',
               '<content select=""></content>',
               '<a href="">Link</a> <b>bold</b>');
    testRender('select *', '<a href="">Link</a> <b>bold</b>',
               '<content select="*"></content>',
               '<a href="">Link</a><b>bold</b>');

    testRender('select .a',
               '<a class="a">a</a> <a class="b">b</a>',
               '<content select=".a"></content>',
               '<a class="a">a</a>');

    testRender('select .b .a',
               '<a class="a">a</a> <a class="b">b</a>',
               '<content select=".b"></content><content select=".a"></content>',
               '<a class="b">b</a><a class="a">a</a>');
  });
});
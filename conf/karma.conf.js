/*
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

module.exports = function(karma) {
  var common = require('../../tools/test/karma-common.conf.js');
  karma.set(common.mixin_common_opts(karma, {
    // base path, that will be used to resolve files and exclude
    basePath: '../../',

    // list of files / patterns to load in the browser
    files: [
      'observe-js/src/observe.js',
      'WeakMap/weakmap.js',
      'tools/test/mocha-htmltest.js',
      'ShadowDOM/conf/mocha.conf.js',
      'ShadowDOM/node_modules/chai/chai.js',
      'ShadowDOM/shadowdom.js',
      'ShadowDOM/test/test.main.js',
      {pattern: 'ShadowDOM/build.json', included: false},
      {pattern: 'ShadowDOM/src/**/*.js', included: false},
      {pattern: 'ShadowDOM/test/**/*.js', included: false},
      {pattern: 'ShadowDOM/test/**/*.html', included: false},
      {pattern: 'tools/**/*.js', included: false}
    ]
  }));
};

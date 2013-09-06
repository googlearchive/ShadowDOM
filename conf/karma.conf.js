module.exports = function(karma) {
  var common = require('../tools/test/karma-common.conf.js');
  karma.set(common.mixin_common_opts(karma, {
    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // list of files / patterns to load in the browser
    files: [
      'tools/test/mocha-htmltest.js',
      'conf/mocha.conf.js',
      'node_modules/chai/chai.js',
      'shadowdom.js',
      'test/test.main.js',
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/**/*.js', included: false},
      {pattern: 'test/**/*.html', included: false},
      {pattern: 'tools/**/*.js', included: false}
    ]
  }));
};

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
module.exports = function(grunt) {
  ShadowDOM = grunt.file.readJSON('build.json');
  grunt.initConfig({
    'wct-test': {
      local: {
        options: {remote: false},
      },
      'local-min': {
        options: {remote: false, webRunner: 'test/index.html?build=min'},
      },
      remote: {
        options: {remote: true},
      },
      'remote-min': {
        options: {remote: true, webRunner: 'test/index.html?build=min'},
      },
    },

    uglify: {
      ShadowDOM: {
        options: {
          compress: {
            // TODO(sjmiles): should be false by default (?)
            // https://github.com/mishoo/UglifyJS2/issues/165
            unsafe: false
          },
          banner: grunt.file.read('LICENSE')
          //compress: true, Xmangle: true, beautify: true, unsafe: false
        },
        files: {
          'ShadowDOM.min.js': ShadowDOM
        }
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          exclude: 'third_party',
          paths: '.',
          outdir: 'docs',
          linkNatives: 'true',
          tabtospace: 2,
          themedir: '../docs/doc_themes/simple'
        }
      }
    },
    pkg: grunt.file.readJSON('package.json')
  });

  // plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('web-component-tester');

  // tasks
  grunt.registerTask('default', ['minify']);
  grunt.registerTask('minify', ['uglify']);
  grunt.registerTask('docs', ['yuidoc']);
  grunt.registerTask('test', ['wct-test:local']);
  grunt.registerTask('test-min', ['minify', 'wct-test:local-min']);
  grunt.registerTask('test-remote', ['wct-test:remote']);
  grunt.registerTask('test-remote-min', ['minify', 'wct-test:remote-min']);
  grunt.registerTask('test-buildbot', ['test-min']);
};


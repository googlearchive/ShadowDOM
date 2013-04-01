## ShadowDOM

ShadowDOM polyfill with usable syntax. 

See [toolkitchen/toolkit](https://github.com/toolkitchen/toolkit) for more information.

### Tests and Minification

Testing and minifying require dependencies not included directly in this repository.

A `package.json` file is included so that those dependencies can be automatically installed using `npm`.

Simply execute

	npm install

in the working copy root.

Minification support is provided as a [grunt](http://http://gruntjs.com/) task. 

Invoking

	grunt

in the working copy root will create a minified file.

Note: you may need to install `grunt-cli`.




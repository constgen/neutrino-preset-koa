# Neutrino Koa Preset

Neutrino preset that supports building of Koa NodeJS applications.

[![NPM version][npm-image]](npm-url)
[![NPM downloads][npm-downloads]](npm-url)

## Features

- Zero upfront configuration necessary to start developing and building a Koa project
- Modern Babel compilation supporting ES modules, async functions, and dynamic imports
- Supports automatically-wired sourcemaps
- Tree-shaking to create smaller bundles
- Built-in HTTP server for launching an application on development and production.
- Hot Module Replacement with source-watching during development. 
- Change your files without restarting a server
- Chunking of external dependencies apart from application code
- Automatically discovers free HTTP port to run a server
- Graceful server shutdown
- Easily extensible to customize your project as needed

## Requirements

- NodeJS v6.9+
- npm v3.8.1+
- Neutrino v8
- Koa v2

## Installation

`neutrino-preset-koa` can be installed with NPM. Inside your project, make sure `neutrino` and `neutrino-preset-koa` are development dependencies.

```bash
❯ npm install --save-dev neutrino neutrino-preset-koa
❯ npm install --save koa
```

If you want to have automatically wired sourcemaps added to your project, add `source-map-support`:


```bash
❯ npm install --save source-map-support
```

## Project Layout

`neutrino-preset-koa` follows the standard [project layout](https://neutrino.js.org/project-layout) specified by Neutrino. This
means that by default all project source code should live in a directory named `src` in the root of the
project. This includes JavaScript files that would be available to your compiled project.

## Quickstart

After installing Neutrino and the Koa preset, add a new directory named `src` in the root of the project, with
a single JS file named `index.js` in it.

```bash
❯ mkdir src && touch src/index.js
```

Edit your `src/index.js` file with the following:

```js
let Koa = require('koa')

module.exports = new Koa()
   .use(function ({ response }) {
      response.body = {
         success: true
      };
   })
   .on('error', function (err, ctx) {
      console.error(err, ctx);
   })
   // don't call .listen()
```

**Important:** This preset requires your entry point to export an instance of Koa application. But you don't need to start it by calling `listen()` method. The preset has a built-in launch server that will do it internally. You can only [customize](#Customizing) the server in the preset options.

Now edit your project's `package.json` to add commands for starting and building the application.

```json
{
  "scripts": {
    "start": "neutrino start --use neutrino-preset-koa",
    "build": "neutrino build --use neutrino-preset-koa"
  }
}
```

If you are using `.neutrinorc.js`, add this preset to your use array instead of `--use` flags:

```js
module.exports = {
  use: ['neutrino-preset-koa']
}
```

Start the app, then either open a browser and navigate to one of the provided addresses or use curl from another terminal window:

```bash
❯ npm start

√ Build completed
Server started on: http://192.168.31.5:50274, http://127.0.0.1:50274, http://MyHome-PC:50274, http://localhost:50274
```

```bash
❯ curl http://localhost:50274
{"success":true}
```

The server will automatically choose a free **port** by default in development mode. So it may differ on every run and in your particular case.

## Building

`neutrino-preset-koa` builds assets to the `build` directory by default when running `neutrino build`. Using the
quick start example above as a reference:

```bash
❯ npm run build

√ Building project completed
Hash: 89e4fb250fc535920ba4
Version: webpack 3.5.6
Time: 424ms
       Asset     Size  Chunks             Chunk Names
    index.js  4.29 kB       0  [emitted]  index
index.js.map  3.73 kB       0  [emitted]  index
```

You can either serve or deploy the contents of this `build` directory as a Node.js server. For Node.js
this usually means adding a `main` property to package.json pointing to the primary main built entry point. Also it is recommended to add a private flag to not accidentally publish your server.

```json
{
   "main": "build/index.js",
   "private": true
}
```

Now you can start a built application:

```bash
❯ node .

Server started on: http://192.168.31.5, http://127.0.0.1, http://MyHome-PC, http://localhost
```

The server will set a **port** to `80` by default in production mode. The port is defined during a build time.

## Hot Module Replacement

As `neutrino-preset-koa` completely controls launching of your application instance it automatically enables Hot Module Replacement for all files during development. No extra configuration or changes in your source code are necessary. You don't need to restart the server every time files changed.

Using dynamic imports with `import()` will automatically create split points and hot replace those modules upon modification during development.

## Debugging

You can start the Node.js server in `inspect` mode to debug the process by setting `neutrino.options.debug` to `true`.
This can be done from the [API](https://neutrino.js.org/api#optionsdebug) or the [CLI using `--debug`](https://neutrino.js.org/cli#-debug).

## Preset options

You can provide custom options and have them merged with this preset's default options to easily affect how this preset builds. You can modify Koa preset settings from `.neutrinorc.js` by overriding with an options object. Use an array pair instead of a string to supply these options in `.neutrinorc.js`.

The following shows how you can pass an options object to the Koa preset and override its options, showing the defaults:

```js
module.exports = {
   use: [
      ['neutrino-preset-koa', {
         // target specific version via babel-preset-env
         node: process.versions.node
         // customize launcher
         server: {
            // Set default port
            port: undefined
         }
      }]
   ]
};
```

## Customizing

By default Neutrino, and therefore this preset, creates a single **main** `index` entry point to your application, and this maps to the `index.*` file in the `src` directory. This preset has a limitation - it supports only a single entry point. Defining 2 or more may cause it to work not properly. Code not imported in the hierarchy of the entry will not be output to the bundle.

You can customize a single entry point in your `.neutrinorc.js`

```js
module.exports = {
   options: {
      mains: {
         server: './server.js'
      }
   },
   use: ['neutrino-preset-koa']
};
```

To overcome this limitation you can define multiple configurations

```js
module.exports = [
   {
      options: {
         mains: {
            index: './server1.js'
         }
      },
      use: ['neutrino-preset-koa']
   },
   {
      options: {
         mains: {
            index: './server2.js'
         }
      },
      use: ['neutrino-preset-koa']
   }
];
```

### Launcher

This preset wraps your application with HTTP server that launches your application. It can be configured using `server` property in the [preset options](#Preset-options)

```js
['neutrino-preset-koa', {
   server: { }
}]
```

So you don't need to think about how to serve your application. This is the purpose of the `neutrino-preset-koa` preset.

If you want to completely disable the launcher you need to explicitly set option to `false`


```js
['neutrino-preset-koa', {
   server: false
}]
```

This turns your application to a regular NodeJS application and disables all advantages of this preset. You will have to call `listen()` on `Koa` instance by yourself if you need to start a server. 

Disabling the launcher not for debugging purposes is not recommended. Probably you might need [@neutrinojs/node](https://www.npmjs.com/package/@neutrinojs/node) instead in this case.

### Port

There are multiple ways to customize an HTTP port of your application server.

You can configure a **default** port of the application server in options using `server.port` property the [preset options](#Preset-options). For example: 

```js
['neutrino-preset-koa', {
   server: {
      port: 8080
   }
}]
```

Now your server will start on `8080` in both production and development modes. But this port is considered **default** and may be overridden any time by `PORT` environment variable. This may be useful for production environments as the server will check `process.env.PORT` in the runtime first and then fallback to a port you have defined.

The default behavior of port is to default to `80` on production and to take random free default port on development.

You can force random free port on both production and development by passing one of these values: `false`, `null`, `0`. For example:

```js
['neutrino-preset-koa', {
   server: {
      port: 0
   }
}]
```

`PORT` environment variable will always have a priority over any configuration.

### Node

You can change the minimum NodeJS version to be supported by your application. Babel compiler will consider this and output a code with the necessary syntax. You can do this changing `node` property in the [preset options](#Preset-options). For example:

```js
['neutrino-preset-koa', {
   node: '6.9.0'
}]
```

### Vendoring

This preset automatically vendors all external dependencies into a separate chunk based on their inclusion in your
package.json. No extra work is required to make this work.


[npm-image]: https://img.shields.io/npm/v/neutrino-preset-koa.svg
[npm-downloads]: https://img.shields.io/npm/dt/neutrino-preset-koa.svg
[npm-url]: https://npmjs.org/package/neutrino-preset-koa


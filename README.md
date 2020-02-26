# Neutrino Koa Preset

`neutrino-preset-koa` is a [Neutrino](https://neutrino.js.org) preset for [Koa](https://koajs.com/) applications development.

[![NPM version][npm-image]](npm-url)
[![NPM downloads][npm-downloads]](npm-url)
[![Build Status][build-status]][travis-url]

## What is Neutrino?

[Neutrino](https://neutrino.js.org) is a configuration engine that allows to bundle Webpack configurations or their parts as modules and publish them to NPM. Such modules usually are called presets or middlewares. They are designed to work in conjunction with Neutrino core in your project. You can compose compilation, linting, testing and other configurations, and share them to developers.

## Features

- Zero upfront configuration necessary to start developing and building a Koa project
- Modern Babel compilation supporting ES modules, async functions, dynamic imports, ES class properties, rest spread operators, decorators and automatic polyfills bound to the platform
- Sourcemaps
- Tree-shaking to create smaller bundles
- Built-in HTTP server for launching the application on development and production
- Hot Module Replacement with source-watching during development
- Disabled redundant `[HMR]` console messages
- You can change your files without restarting the server
- TypeScript support
- User-friendly building progress bar
- Detect and warn about circular dependencies during build time
- Git revision information through environment variables (VERSION, COMMITHASH, BRANCH)
- Consider external dependencies sourcemaps for better debugging during development
- Debug console cleared on every file change. Your outdated logs will be removed
- Chunking of external dependencies apart from application code
- Automatically discovers free HTTP port to run a server locally
- Graceful server shutdown
- Outputs building log to `stdout` and `stderr`. No pollution to the console
- Shows PID (Process ID) in the output
- **Only Linux and MacOS:** Sets the NodeJS process name the same as the project name. So can be easily found with `ps x | grep myname`
- Production-optimized bundles with minification

## Requirements

- Node.js v10+
- Neutrino v9
- Koa v2.3+

## Installation

`neutrino-preset-koa` can be installed with NPM. Inside your project, make sure `neutrino`, `webpack` and `neutrino-preset-koa` are development dependencies.

```bash
npm install --save koa
npm install --save-dev neutrino neutrino-preset-koa webpack webpack-cli
```

Now edit your project's `package.json` to add commands for starting and building the application:

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "start": "webpack --mode development"
  }
}
```

Then add the new file `.neutrinorc.js` in the root of the project:

```js
let koa = require('neutrino-preset-koa')

module.exports = {
   use: [
      koa()
   ]
}
```

And create a `webpack.config.js` file in the root of the project, that uses the Neutrino API to access the generated webpack config:

```js
let neutrino = require('neutrino')

module.exports = neutrino().webpack()
```

## Project Layout

`neutrino-preset-koa` follows the standard [project layout](https://neutrino.js.org/project-layout) specified by Neutrino. This means that by default all project source code should live in a directory named `src` in the root of the project. This includes JavaScript and TypeScript files that would be available to your compiled project.

## Quickstart

After installing Neutrino and the Koa preset, add a new directory named `src` in the root of the project, with a single JS file named `index.js` in it.

Edit your `src/index.js` file with the following:

```js
let Koa = require('koa')

module.exports = new Koa()
   .use(function ({ request, response }) {
      response.body = {
         success: true
      }
   })
   .on('error', function (err, ctx) {
      console.error(err, ctx)
   })

// don't call .listen()
```

**Important:** This preset requires your entry point to export an instance of Koa application. But you don't need to start it by calling `listen()` method. The preset has a built-in launch server that will do it internally. You can only [customize](#customizing) the server in the preset options.

Start the app, then either open a browser and navigate to one of the provided addresses or use curl from another terminal window:

```bash
❯ npm start

√ Build completed
[project-name] Server started on:
  http://192.168.31.5:50274
  http://127.0.0.1:50274
  http://MyHome-PC:50274
  http://localhost:50274
```

```bash
❯ curl http://localhost:50274
{"success":true}
```

The server will automatically choose a free **port** by default in a development mode. So it may differ on every run and in your particular case.

## Building

`neutrino-preset-koa` builds assets to the `build` directory by default when running `npm run build`. Using the quick start example above as a reference:

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

You can either serve or deploy the contents of this `build` directory as a Node.js server. For Node.js this usually means adding a `main` property to 'package.json' pointing to the primary main built entry point. Also it is recommended to add a private flag to not accidentally publish your server.

```json
{
   "main": "build/index.js",
   "private": true
}
```

Now you can start a built application:

```bash
❯ node .

[project-name] Server started on:
  http://192.168.31.5
  http://127.0.0.1
  http://MyHome-PC
  http://localhost
```

The server will set a **port** to `80` by default in production mode. The default port is defined during a build time.

## Hot Module Replacement

As `neutrino-preset-koa` completely controls launching of your application instance it automatically enables Hot Module Replacement for all files during development. No extra configuration or changes in your source code are necessary. You don't need to restart the server every time files changed.

Using dynamic imports with `import()` will automatically create split points and hot replace those modules upon modification during development.

## Debugging

You can start the Node.js server in `inspect` mode to debug the process by setting `neutrino.options.debug` to `true`. This can be done from the [API](https://neutrino.js.org/api#optionsdebug)

## Preset options

You can provide custom options and have them merged with this preset's default options to easily affect how this preset builds. You can modify Koa preset settings from `.neutrinorc.js` by overriding with an options object.

The following shows how you can pass an options object to the Koa preset and override its options, showing the defaults:

#### .neutrinorc.js

```js
let koa = require('neutrino-preset-koa')

module.exports = {
   use: [
      koa({
         // target specific version via babel-preset-env
         node: process.versions.node,

         // customize launcher
         server: {
            // Set default port
            port: undefined,

            // Set HTTP version
            http: 1,

            // Set SSL certificates
            ssl: undefined
         },

         // Enable source maps in the production build. Development sourcemaps are not affected and always turned on
         sourcemaps: false,

         // Add all necessary polyfills required to support NodeJS version depending on the usage in the code
         polyfills: true
      })
   ]
}
```

## Customizing

### Launcher

This preset wraps your application with HTTP server that launches your application. It can be configured using `server` property in the [preset options](#preset-options)

```js
koa({
   server: { }
})
```

So you don't need to think about how to serve your application. This is completely managed by `neutrino-preset-koa` preset.

If you want to **disable** the launcher you need to explicitly set the option to `false`

```js
koa({
   server: false
})
```

This turns your application into a regular Node.js application and disables all advantages of this preset. You will have to call `listen()` on `Koa` instance by yourself if you need to start a server.

Disabling the launcher not for debugging purposes is not recommended. Probably you might need [@neutrinojs/node](https://www.npmjs.com/package/@neutrinojs/node) instead in this case.

### Port

There are multiple ways to customize the HTTP port of your application server.

You can configure a **default** port of the server in options using `server.port` property in the [preset options](#preset-options). For example:

```js
koa({
   server: {
      port: 8080
   }
})
```

Now your server will start on `8080` in both production and development modes. But this port is considered **default** and may be overridden any time by `PORT` environment variable. This may be useful for production environments as the server will check `process.env.PORT` in the runtime first and then fallback to a port you have defined.

The default behavior of port when not configured is to default to `80` on production and to take random free default port on development.

You can choose random free port on both production and development by passing one of these values: `false`, `null`, `0`. For example:

```js
koa({
   server: {
      port: 0
   }
})
```

`PORT` environment variable will always have a priority over any configuration.

### Host

By default the server starts on a default IPv6/IPv4 host which exposes it to local network. There is no way to configure a server host from the [preset options](#preset-options). But you still can use `HOST` environment variable to define your custom host.

### HTTP version

This preset uses HTTP v1.x by default. You can switch to HTTP v2 in options.

```js
koa({
   server: {
      http: 2 // default is 1
   }
})
```

But there may be no browsers that support not encrypted HTTP2. That's why you need to enable **SSL**.

### SSL

When you want to start a browser on `https` you need to provide paths to an SSL certificate and a public key

```js
koa({
   server: {
      ssl: {
         cert: path.resolve(__dirname, './ssl/ssl.cert'),
         key: path.resolve(__dirname, './ssl/ssl.key')
      }
   }
})
```

A relative path to the project root also can be used

```json
{
   cert: './ssl/ssl.cert',
   key: './ssl/ssl.key'
}
```

If you run in development mode and want to use a temporary locally self-signed certificate you may configure it like this

```js
koa({
   server: {
      ssl: true
   }
})
```

### Node

You can change the minimum Node.js version to be supported by your application. Babel compiler will consider this and output a code with the necessary syntax. You can do this changing `node` property in the [preset options](#preset-options). For example:

```js
koa({
   node: '6.9.0'
})
```

### Entry point

By default Neutrino, and therefore this preset, creates a single **main** `index` entry point to your application, and this maps to the `index.*` file in the `src` directory.

> **Important! This preset has a limitation – it supports only a single entry point. Defining 2 or more may cause it to work not properly.**

You can customize a single entry point in your `.neutrinorc.js` and override a default one

**.neutrinorc.js**

```js
module.exports = {
   options: {
      mains: {
         server: './server.js'
      }
   },
   use: [koa()]
}
```

To overcome the limitation you can define multiple configurations

**.neutrinorc.js**

```js
module.exports = [
   {
      options: {
         mains: {
            index: './server1.js'
         }
      },
      use: [koa()]
   },
   {
      options: {
         mains: {
            index: './server2.js'
         }
      },
      use: [koa()]
   }
]
```

## Webpack config

Sometime you want to extend Webpack configuration with custom loaders or plugins. This can be done in `.neutrinorc.js` file using [Neutrino API](https://neutrinojs.org/webpack-chain/) also known as [`webpack-chain`](https://www.npmjs.com/package/webpack-chain).

### Plugins

For example, you can add [TypeScript checking](https://www.npmjs.com/package/fork-ts-checker-webpack-plugin)

```js
let koa = require('neutrino-preset-koa')
let TsChecker = require('fork-ts-checker-webpack-plugin')

module.exports = {
   use: [
      koa(),
      function (neutrino) {
         let prodMode = (process.env.NODE_ENV === 'production')

         if (prodMode) return

         neutrino.config
            .plugin('ts-checker')
               .use(TsChecker, [{
                  // options
               }])
               .end()
      }
   ]
}
```

Specifically for this plugin you also need to create `tsconfig.json` file

```json
{
   "compilerOptions": {
      "target": "es2016",
      "module": "commonjs",
      "strict": true,
      "alwaysStrict": true,
      "moduleResolution": "node",
      "esModuleInterop": true
   },
   "include": ["src/**/*"],
   "exclude": ["node_modules"]
}
```

It will enable highlighting in your code editor too.

## Graceful Shutdown

`neutrino-preset-koa` automatically shutdowns a server instance gracefully. Application server prints this message to signal successful closing when exited:

```bash
Server shutting down...
Server closed
```

During shutdown these steps are performed

1. Stop listening new requests
2. Close all open inactive connections
3. Wait current requests to end and close their connections at the end

The preset doesn't forcefully exit a process but waits for queued operations to finish including your async Koa middlewares. In most cases you are **not required** to handle it explicitly. But if you have some long running operations or timers outside Koa middlewares that continue event loop then you should take care of them by yourself. Other will be handled by `neutrino-preset-koa`. The good practice is to use this in your code in cases of shutdown:

```js
['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'].forEach(function (signal) {
   process.once(signal, function () {
      // abort all async operations
      // ...
      // cancel all timers
      // ...
      process.exitCode = 0
   })
})
```

Don't call `process.exit()` as it considered a bad practice. The application should exit naturally when there is an empty call stack and no more scheduled tasks. You should see this at the very end if the finishing of the application is correct:

```bash
Application exited
```

In case your application will not finish for some reason in 9 seconds, there is a timeout that kills the application forcefully. You will not be able to handle this termination. The application will exit with an error signal right after this message

```bash
Server killed, due to timeout
```

Graceful Shutdown works correctly only in a built version which is started using

```bash
node .
```

This is another reason to use this command on a production environment. It can't work properly when you start the server as a child process of `npm start`.

## VSCode tips

### Project settings

These are suggested workspace settings for VSCode editor:

#### .vscode/settings.json

```json
{
   "files.autoSave": "onFocusChange"
}
```

This should prevent building as you type code.

### Launching in the VSCode Debugger

Visual Studio Code has its own built-in debugger. You may launch your application in the development mode using this debugger. Use this configuration:

#### launch.json

```json
{
   "version": "0.2.0",
   "configurations": [
      {
         "name": "Start",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/node_modules/webpack/bin/webpack.js",
         "args": ["--mode", "development"],
         "autoAttachChildProcesses": true,
         "internalConsoleOptions": "openOnSessionStart",
         "console": "integratedTerminal",
         "sourceMaps": true,
         "runtimeArgs": ["--inspect"],
         "skipFiles": ["${workspaceFolder}/node_modules/**", "<node_internals>/**"],
         "env": {
            "PORT": "0"
         }
      },
      {
         "name": "Run",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/build/index",
         "autoAttachChildProcesses": true,
         "sourceMaps": true,
         "skipFiles": ["${workspaceFolder}/node_modules/**", "<node_internals>/**"],
         "env": {
            "PORT": "80"
         }
      },
      {
         "name": "Debug",
         "type": "node",
         "request": "attach",
         "port": 9229,
         "sourceMaps": true,
         "skipFiles": ["${workspaceFolder}/node_modules/**", "<node_internals>/**"]
      }
   ]
}
```

Use these 3 tasks for different purposes

- **Start** instead of `npm start`. Builds with live reloading. You can override the Neutrino settings port with `"env": {"PORT": "0"}`
- **Run** instead of `node .`. Runs what was built. Useful for testing of the production build. You can override the Neutrino settings port with `"env": {"PORT": "80"}`
- **Debug** when want to attach to a manually opened app, e.g. `node --inspect .`.

You will be able to use breakpoints in the editor. Sometime breakpoints outside routes don't work during Hot Module Replacement. You may restart the application in such cases.

[npm-image]: https://img.shields.io/npm/v/neutrino-preset-koa.svg
[npm-downloads]: https://img.shields.io/npm/dt/neutrino-preset-koa.svg
[npm-url]: https://npmjs.org/package/neutrino-preset-koa
[build-status]: https://travis-ci.com/constgen/neutrino-preset-koa.svg?branch=master
[travis-url]: https://travis-ci.com/constgen/neutrino-preset-koa
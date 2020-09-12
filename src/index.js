let node         = require('@neutrinojs/node')
let clean        = require('@neutrinojs/clean')
let deepmerge    = require('deepmerge')
let progress     = require('@constgen/neutrino-progress')
let dependency   = require('@constgen/neutrino-dependency')
let revision     = require('@constgen/neutrino-revision')
let babel        = require('@constgen/neutrino-babel-loader')
let sourcemap    = require('@constgen/neutrino-sourcemap')
let optimization = require('@constgen/neutrino-optimization')
let mode         = require('@constgen/neutrino-mode')
let nodeLoader   = require('@constgen/neutrino-node-loader')
let koaLauncher  = require('@constgen/neutrino-koa-launcher')

let title  = require('./middlewares/title')
let eslint = require('./middlewares/eslint')

module.exports = function (customSettings = {}) {
	return function (neutrino) {
		let defaultServerSettings = {
			http: 1,
			port: undefined,
			ssl : undefined
		}
		let defaultSettings       = {
			sourcemaps: false,
			polyfills : true,
			server    : defaultServerSettings,
			node      : process.versions.node,
			clean     : true
		}

		let settings    = deepmerge(defaultSettings, customSettings)
		let useLauncher = Boolean(settings.server)

		neutrino.use(mode())
		neutrino.use(node({
			hot    : useLauncher,
			clean  : false,
			targets: {
				node: settings.node
			}
		}))
		if (useLauncher) neutrino.use(koaLauncher(settings.server))
		neutrino.use(clean())
		neutrino.use(title())
		neutrino.use(babel({
			test     : /\.(j|t)s$/,
			targets  : { node: settings.node },
			polyfills: settings.polyfills
		}))
		neutrino.use(nodeLoader())
		neutrino.use(dependency())
		neutrino.use(progress({ clean: settings.clean }))
		neutrino.use(sourcemap({ prod: settings.sourcemaps }))
		neutrino.use(revision())
		neutrino.use(optimization({ chunks: false }))
		neutrino.use(eslint())

		neutrino.config
			.resolve
				.extensions
					.merge(['.ts', '.js'])
					.end()
				.end()
	}
}
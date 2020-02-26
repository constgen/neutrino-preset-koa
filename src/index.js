let path = require('path')

let node = require('@neutrinojs/node')
let clean = require('@neutrinojs/clean')
let banner = require('@neutrinojs/banner')
let deepmerge = require('deepmerge')
let { DefinePlugin } = require('webpack')

let progress = require('./middlewares/progress')
let dependency = require('./middlewares/dependency')
let native = require('./middlewares/native')
let revision = require('./middlewares/revision')
let sourcemaps = require('./middlewares/sourcemaps')
let watch = require('./middlewares/watch')
let babel = require('./middlewares/babel')

module.exports = function (customSettings = {}) {
	return function (neutrino) {
		const HTTP_PORT = 80
		const HTTPS_PORT = 443
		let nodeModulesPath = path.resolve(__dirname, '../node_modules')
		let projectNodeModulesPath = path.resolve(process.cwd(), 'node_modules')
		let launcherPath = path.resolve(__dirname, './launcher/launcher.js')
		let certPath = path.resolve(__dirname, '../ssl/localhost.pem')
		let devMode = process.env.NODE_ENV === 'development'
		let prodMode = process.env.NODE_ENV === 'production'
		let { name, version } = neutrino.options.packageJson
		let appName = `${name} ${version}`
		let lintRule = neutrino.config.module.rules.get('lint')
		let defaultServerSettings = {
			port: undefined,
			http: 1,
			ssl: undefined
		}
		let defaultSettings = {
			server: defaultServerSettings,
			node: process.versions.node,
			sourcemaps: false,
			polyfills: true
		}
		let settings = deepmerge(defaultSettings, customSettings)
		let server = deepmerge(defaultServerSettings, customSettings.server || {})
		let useLauncher = Boolean(settings.server)
		let useSSL = Boolean(server.ssl)
		let httpVersion = parseInt(server.http, 10) || 1
		let defaultProtocolPort = useSSL ? HTTPS_PORT : HTTP_PORT
		let defaultPort = devMode ? 0 : defaultProtocolPort
		let defaultHost = ''
		let port = Number(server.port) < 0 ? defaultPort : Number(server.port)
		let protocol = (httpVersion > 1 && `http${httpVersion}`) || (useSSL && 'https') || 'http'

		process.title = name

		neutrino.use(node({
			hot: useLauncher,
			targets: {
				node: settings.node
			},
			clean: false
		}))

		Object.keys(neutrino.options.mains).forEach(function (key) {
			neutrino.config
				.entry(key)
					.when(useLauncher, function (entry) {
						entry.clear().add(launcherPath)
					})
					.end()
				.resolve.alias
					.when(useLauncher, function (alias) {
						alias.set('__entry__', path.resolve(__dirname, neutrino.options.mains[key].entry))
					})
		})

		neutrino.use(clean())
		neutrino.use(banner({
			pluginId: 'process-title',
			banner: `process.title = '${process.title}'`
		}))
		neutrino.use(native())
		neutrino.use(babel({ targets: { node: settings.node }, polyfills: settings.polyfills }))
		neutrino.use(dependency())
		neutrino.use(progress({ name: appName }))
		if (useLauncher) neutrino.use(watch())
		neutrino.use(sourcemaps({ prod: settings.sourcemaps }))
		neutrino.use(revision())

		neutrino.config
			.resolveLoader
				.modules
					.add('node_modules')
					.add(nodeModulesPath)
					.add(projectNodeModulesPath)
					.end()
				.end()
			.resolve
				.modules
					.add(nodeModulesPath)
					.add(projectNodeModulesPath)
					.end()
				.extensions
					.add('.ts')
					.end()
				.end()
			.optimization
				.minimize(prodMode)
				.end()
			.stats({
				children: false,
				entrypoints: false,
				modules: false,
				hash: prodMode,
				performance: true,
				version: prodMode,
				assets: prodMode,
				colors: true,
				assetsSort: 'chunks',
				env: true,
				builtAt: prodMode,
				timings: prodMode
			})
			.plugin('define-env')
				.use(DefinePlugin, [{
					'process.env.PORT': `process.env.PORT || ${port}`,
					'process.env.HOST': `process.env.HOST || '${defaultHost}'`,
					'__http__': JSON.stringify(protocol),
					'__ssl__': JSON.stringify(server.ssl),
					'__CERT_PATH__': JSON.stringify(certPath)
				}])
				.end()

		if (lintRule) {
			lintRule.use('eslint').tap(options => deepmerge(options, {
				baseConfig: {
					env: {
						node: true,
						commonjs: true
					}
				}
			}))
		}
	}
}
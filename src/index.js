let path = require('path');

let node = require('@neutrinojs/node');
let clean = require('@neutrinojs/clean');
let banner = require('@neutrinojs/banner');
let { DefinePlugin } = require('webpack');

let manifest = require(path.resolve(process.cwd(), 'package.json'));

process.title = manifest.name;

module.exports = function (neutrino, settings = {}) {
	const NODE_MODULES = path.resolve(__dirname, '../node_modules');
	const LAUNCHER_PATH = path.resolve(__dirname, './launcher.js');
	let devRun = process.env.NODE_ENV === 'development';
	let useLauncher = (settings.server !== undefined) ? Boolean(settings.server) : true;
	let port = settings.server && Number(settings.server.port);
	let defaultPort = devRun ? 0 : 80;
	let defaultHost = '';

	settings.node = settings.node || process.versions.node;
	settings.server = {
		port: (port || port === 0) ? port : defaultPort
	};

	neutrino.use(node, {
		hot: useLauncher,
		targets: {
			node: settings.node
		}
	});
	neutrino.use(clean, {
		paths: [neutrino.options.output]
	});
	neutrino.use(banner, { pluginId: 'sourcemaps' });
	neutrino.use(banner, {
		pluginId: 'process-title',
		banner: `process.title = '${process.title}'`
	});

	Object.keys(neutrino.options.mains).forEach(function (key) {
		neutrino.config
			.entry(key)
				.when(useLauncher, function (entry) {
					entry.clear().add(LAUNCHER_PATH);
				})
				.when(useLauncher && devRun, function (entry) {
					entry.add(`${require.resolve('webpack/hot/poll')}?1000`);
				})
				.end()
			.when(useLauncher, function (config) {
				config
					.resolve.alias
						.set('__entry__', require.resolve(neutrino.options.mains[key]))
						.end().end();
			});

	});

	neutrino.config
		.resolve.modules
			.add(NODE_MODULES)
			.end().end()
		.resolveLoader.modules
			.add(NODE_MODULES)
			.end().end()
		.plugin('define-env')
			.use(DefinePlugin, [{
				'process.env.PORT': `process.env.PORT || ${settings.server.port}`,
				'process.env.HOST': `process.env.HOST || '${defaultHost}'`
			}])
			.end();
};
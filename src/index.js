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
	const CERT_PATH = path.resolve(__dirname, '../ssl/localhost.pem');
	let server = (typeof settings.server === 'object') ? settings.server : {};

	// let ssl = (typeof server.ssl === 'object') ? server.ssl : {};
	let useSSL = (server.ssl === undefined) ? false : Boolean(server.ssl);
	let devRun = process.env.NODE_ENV === 'development';
	let useLauncher = (settings.server === undefined) ? true : Boolean(settings.server);
	let httpVersion = (server.http === undefined) ? 1 : (parseInt(server.http, 10) || 1);
	let port = Number(server.port);
	let defaultProtocolPort = useSSL ? 443 : 80;
	let defaultPort = devRun ? 0 : defaultProtocolPort;
	let defaultHost = '';
	let protocol = (httpVersion > 1 && `http${httpVersion}`) || (useSSL && 'https') || 'http';

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
			.resolve.alias
				.when(useLauncher, function (alias) {
					alias.set('__entry__', require.resolve(neutrino.options.mains[key]));
				})
				.when(useLauncher && devRun, function (alias) {
					alias
						.set('webpack/hot/log', require.resolve('webpack/hot/log'));
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
				'process.env.HOST': `process.env.HOST || '${defaultHost}'`,
				'__http__': JSON.stringify(protocol),
				'__ssl__': JSON.stringify(server.ssl),
				'__CERT_PATH__': JSON.stringify(CERT_PATH)
			}])
			.end();
};
'use strict';

let path = require('path');
let node = require('@neutrinojs/node');
const clean = require('@neutrinojs/clean');
let { EnvironmentPlugin, DefinePlugin } = require('webpack');

module.exports = function (neutrino, settings = {}) {
    const NODE_MODULES = path.resolve(__dirname, '../node_modules');
	const LAUNCHER_PATH = path.resolve(__dirname, './launcher.js');
	let devRun =  process.env.NODE_ENV === 'development'
	let useLauncher = (settings.server !== undefined) ? Boolean(settings.server) : true;
	let port = settings.server && Number(settings.server.port)
	let defaultPort = devRun ? 0 : 80

    settings = {
        node: settings.node || process.versions.node,
        server: {
            port: (port || port === 0) ? port : defaultPort
        }
    };
	
    neutrino.use(node, {
        hot: true,
        targets: {
            node: settings.node
        }
    });
    neutrino.use(clean, {
        paths: [neutrino.options.output]
    });

    if (!useLauncher) return;

    Object.keys(neutrino.options.mains).forEach(function (key) {
        neutrino.config
            .entry(key)
                .clear()
				.add(LAUNCHER_PATH)
				.when(devRun, function(entry){
					entry.add(`${require.resolve('webpack/hot/poll')}?1000`)
				})
                .end()
            .resolve.alias
                .set('__entry__', require.resolve(neutrino.options.mains[key]))
                .end().end();
    });

    neutrino.config
        .resolve.modules
            .add(NODE_MODULES)
            .end().end()
        .resolveLoader.modules
            .add(NODE_MODULES)
            .end().end()
        .plugin('env')
            .use(EnvironmentPlugin, [{
                // PORT: settings.server.port
            }])
            .end()
        .plugin('define')
            .use(DefinePlugin, [{
                'process.env.PORT': `process.env.PORT || ${settings.server.port}`,
                'process.env.HOST': `process.env.HOST || '0.0.0.0'`
            }])
            .end();
};

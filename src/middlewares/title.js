let banner = require('@neutrinojs/banner')

module.exports = function () {
	return function (neutrino) {
		let { name } = neutrino.options.packageJson

		process.title = name
		neutrino.use(banner({
			pluginId: 'process-title',
			banner  : `process.title = "${process.title}"`
		}))
		neutrino.config.name(name)
	}
}
module.exports = function () {
	return function (neutrino) {
		let devMode = (process.env.NODE_ENV === 'development')

		Object.keys(neutrino.options.mains).forEach(function (key) {
			neutrino.config
				.entry(key)
					.when(devMode, function (entry) {
						entry.add(`${require.resolve('webpack/hot/poll')}?1000`)
					})
					.end()
		})

		neutrino.config
			.when(devMode, function (config) {
				config
					.watch(true)
					.plugin('hot')
						.use(require.resolve('webpack/lib/HotModuleReplacementPlugin'))
						.end()
					.resolve.alias
						.set('webpack/hot/log', require.resolve('webpack/hot/log'))
						.end()
			})
	}
}
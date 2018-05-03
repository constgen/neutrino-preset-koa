module.exports = {
	use: [
		['@atomspace/eslint', {
			eslint: {
				envs: ['node'],
				rules: {
					'no-console': 'off'
				}
			}
		}]
	]
}
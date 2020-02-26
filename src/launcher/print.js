let chalk = require('chalk')

let { stdout, title } = process

module.exports = {
	output (message) {
		stdout.write(`[${title}] ${chalk.blue(message)}\n`)
	},
	warn (message) {
		stdout.write(`[${title}] ${chalk.yellow(message)}\n`)
	},
	log (message) {
		console.log(`[${title}] ${chalk.blue(message)}\n`) // eslint-disable-line no-console
	},
	report (err) {
		console.error(`${chalk.red(err.stack)}\n`)
	},
	blank () {
		console.clear() // eslint-disable-line no-console
	}
}

if (module.hot) {
	require('webpack/hot/log').setLogLevel('none')
}
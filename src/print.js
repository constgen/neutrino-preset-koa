let chalk = require('chalk');

let { stdout } = process;
let title = process.title;

module.exports = {
	output (message) {
		stdout.write(`[${title}] ${chalk.blue(message)}\n`);
	},

	warn (message) {
		stdout.write(`[${title}] ${chalk.yellow(message)}\n`);
	},

	log (message) {
		stdout.write(`[${title}] ${chalk.blue(message)}\n`);
	},

	report (err) {
		console.error(`${chalk.red(err.stack)}\n`);
	}
};
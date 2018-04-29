let http = require('http');

let chalk = require('chalk');
let app = require('__entry__');

let ip = require('./ip');

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const KILL_TIMEOUT = 9 * 1000;
const KILL_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'];
let currentApp = app.callback();
let server = http.createServer(currentApp).listen({ port: PORT, host: HOST }, function (err) {
	if (err) {
		throw err;
	}
	else {
		let { port, address } = server.address();
		let protocol = server.addContext ? 'https' : 'http';
		let ips = ip.isLocal(address) ? ip.locals : ip.all;
		let message = `${chalk.blue('Server started on')}: ${ips.map(function (host) {
			return chalk.green(`${protocol}://${host}${port !== 80 ? `:${port}` : ''}`);
		}).join(', ')}`;

		console.log(message);
	}
});

function close () {
	console.log(chalk.blue('Server shutting down...'));
	server.close(function () {
		console.log(chalk.blue('Server closed'));
		process.exit();
	});

	// process.exitCode = 0
	setTimeout(function () {
		console.log(chalk.red('Server killed, due to timeout'));
		process.exit(1);
	}, KILL_TIMEOUT);
}
function handleExit () {
	console.log(chalk.yellow('Application exited'));
}

// http://glynnbird.tumblr.com/post/54739664725/graceful-server-shutdown-with-nodejs-and-express
// if (process.platform === 'win32') {
//     require('readline').createInterface({
//         input: process.stdin,
//         output: process.stdout
//     }).on('SIGINT', function () {
//         process.emit('SIGINT');
//     });
// }
// process.title = ''
// process.stdin.resume();


KILL_SIGNALS.forEach(function (signal) {
	process.once(signal, close);
});

process.once('exit', handleExit);

if (module.hot) {
	module.hot.accept('__entry__', function () {
		try {
			server.removeListener('request', currentApp);
			app = require('__entry__');
			currentApp = app.callback();
			server.on('request', currentApp);
		} catch (err) {
			console.error(chalk.red(err));
		}
	});
	module.hot.accept();
	module.hot.dispose(function () {
		KILL_SIGNALS.forEach(function (signal) {
			process.removeListener(signal, close);
		});
		process.removeListener('exit', handleExit);
		console.log(chalk.blue('Server stopped. Restarting...'));
		server.close();
	});
}
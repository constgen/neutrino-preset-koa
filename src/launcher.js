let http = require('http');

let chalk = require('chalk');

let ip = require('./ip');

function requireKoaApp () {
	let app = require('__entry__'); // eslint-disable-line import/no-unresolved

	app = app.default || app;
	return app.callback();
}

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const KILL_TIMEOUT = 9 * 1000;
const KILL_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'];
let currentApp = requireKoaApp();
let sockets = new Set();
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

function handleConnect (socket) {
	socket.__requestsLength = 0;
	sockets.add(socket);
	socket.once('close', function () {
		sockets.delete(socket);
	});
}

function isIdle (socket) {
	return !socket.__requestsLength;
}

function disconnect (socket) {
	if (isIdle(socket)) socket.destroy();
}

function close () {
	console.log(chalk.blue('Server shutting down...'), '');

	let timeout = setTimeout(function () {
		console.log(chalk.red('Server killed, due to timeout'));
		process.exit(1);
	}, KILL_TIMEOUT);

	server.close(function () {
		console.log(chalk.blue('Server closed'), '');
		clearTimeout(timeout);
		process.exitCode = 0;
	});

	sockets.forEach(disconnect);
}

function handleExit () {
	console.log(chalk.yellow('Application exited'), '');
}

server.on('connection', handleConnect);
server.on('secureConnection', handleConnect);
server.on('request', function (request, response) {
	let socket = request.connection;

	socket.__requestsLength += 1;
	response.once('finish', function () {
		socket.__requestsLength -= 1;
		if (!server.listening) disconnect(socket);
	});
});


KILL_SIGNALS.forEach(function (signal) {
	process.once(signal, close);
});

process.once('exit', handleExit);

if (module.hot) {
	module.hot.accept('__entry__', function () {
		try {
			server.removeListener('request', currentApp);
			currentApp = requireKoaApp();
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
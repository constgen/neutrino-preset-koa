let http = require(__http__) // eslint-disable-line no-undef
let chalk = require('chalk')

let sslSettings = require('./ssl-settings')
let ip = require('./ip')
let {
	warn, output, log, report, blank
} = require('./print')

function requireKoaApp () {
	let app = require('__entry__') // eslint-disable-line import/no-unresolved

	app = app.default || app
	return app.callback()
}

const KILL_TIMEOUT = 10000
const killSignals = Object.freeze(['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'])
const HTTP_PORT = 80
const HTTPS_PORT = 443
let defaultPort = sslSettings ? HTTPS_PORT : HTTP_PORT
let currentApp = requireKoaApp()
let sockets = new Set()

let server = ((sslSettings && http.createSecureServer) || http.createServer)(sslSettings, currentApp).listen(
	{ port: process.env.PORT, host: process.env.HOST },
	function (err) {
		if (err) {
			throw err
		}
		else {
			let { port, address } = server.address()
			let protocol = sslSettings ? 'https' : 'http'
			let ips = ip.isLocal(address) ? ip.locals : ip.all
			let message = ['Server started on:']
				.concat(ips.map(function (host) {
					return chalk.green(`${protocol}://${host}${port === defaultPort ? '' : `:${port}`}`)
				})).join('\n  ')

			log(message)
		}
	}
)

function handleConnect (socket) {
	socket.__requestsLength = 0
	sockets.add(socket)
	socket.once('close', function () {
		sockets.delete(socket)
	})
}

function isIdle (socket) {
	return !socket.__requestsLength
}

function disconnect (socket) {
	if (isIdle(socket)) socket.destroy()
}

function close () {
	output('Server shutting down...')

	let timeout = setTimeout(function () {
		report('Server killed, due to timeout')
		process.exit(1) // eslint-disable-line no-process-exit
	}, KILL_TIMEOUT)

	server.close(function () {
		output('Server closed')
		clearTimeout(timeout)
		process.exitCode = 0
	})

	sockets.forEach(disconnect)
}

function handleExit () {
	warn('Application exited')
}

server.on('connection', handleConnect)
server.on('secureConnection', handleConnect)
server.on('request', function handleRequest (request, response) {
	let socket = request.connection

	socket.__requestsLength += 1
	response.once('finish', function () {
		socket.__requestsLength -= 1
		if (!server.listening) disconnect(socket)
	})
})
killSignals.forEach(function (signal) {
	process.once(signal, close)
})
process.once('exit', handleExit)
output(`PID: ${process.pid}`)

if (module.hot) {
	module.hot.accept('__entry__', function () {
		blank()
		try {
			server.removeListener('request', currentApp)
			currentApp = requireKoaApp()
			server.on('request', currentApp)
		}
		catch (err) {
			report(err)
		}
	})
	module.hot.accept()
	module.hot.dispose(function () {
		killSignals.forEach(function (signal) {
			process.removeListener(signal, close)
		})
		process.removeListener('exit', handleExit)
		output('Server stopped. Restarting...')
		server.close()
	})
}
'use strict';

let http = require('http');
let chalk = require('chalk');
let ip = require('./ip');

const PORT = process.env.PORT;
const HOST = process.env.HOST;
let app = require('__entry__');
let currentApp = app.callback();
let server = http.createServer(currentApp).listen({port: PORT, host: HOST}, function (err) {
    if (err) {
        throw err;
    }
    else {
        let { port, address } = this.address();
		let protocol = this.addContext ? 'https' : 'http';
		let ips = ip.isLocal(HOST) ? ip.locals : ip.all;
		let message = `${chalk.blue('Server started on')}: ${ips.map(function(ip){
			return chalk.green(`${protocol}://${ip}${port !== 80 ? `:${port}` : ''}`);
		}).join(', ')}`;
		console.log(message);
    }
});

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
        console.log(chalk.blue('Server stopped. Restarting...'));
        server.close();
    });
}
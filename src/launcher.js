'use strict';

let http = require('http');
// let getIPs = require('./get-ips');
// https://github.com/indexzero/http-server/blob/master/bin/http-server

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
        console.log(`Server started on: ${protocol}://${address}:${port}`);
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
            console.error(err);
        }
    });
    module.hot.accept();
    module.hot.dispose(function () {
		process.removeAllListeners('exit')
        console.log('Server stopped. Restarting...');
        server.close();
    });
}
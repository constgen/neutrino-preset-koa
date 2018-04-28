import { setTimeout } from 'timers';

'use strict';

let http = require('http');
// let getIPs = require('./get-ips');
// https://github.com/indexzero/http-server/blob/master/bin/http-server

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const KILL_TIMEOUT = 10 * 1000;
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

function close(){
	console.log('Closing...');
	server.close(function(){
		console.log('Server closed');
		// process.exit();
	});
	process.exitCode = 0
	setTimeout(function(){
		console.log('Server killed, due to timeout');
		process.exit(1)
	}, KILL_TIMEOUT)
}
function handleExit(){
	console.log('Server exited');
}


// Ctrl + C
process.once('SIGINT', close);
// Kill process
process.once('SIGTERM', close);
// Ctrl + Break
process.once('SIGBREAK', close);
// close terminal
process.once('SIGHUP', close);

process.once('exit', handleExit);

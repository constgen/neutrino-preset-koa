'use strict';

let http = require('http');
// let getIPs = require('./get-ips');

const PORT = process.env.PORT;
let app = require('__entry__');
let currentApp = app.callback();
let server = http.createServer(currentApp).listen(PORT, function (err) {
    if (err) {
        console.error(err);
    }
    else {
        let { port } = this.address();
        let protocol = this.addContext ? 'https' : 'http';
        console.log(`Server started on: ${protocol}://localhost:${port}`);
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
        console.log('Server stopped');
        server.close();
    });
}

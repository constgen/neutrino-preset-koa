'use strict';

let getIPs = require('./get-ips');

module.exports = {
	locals: ['127.0.0.1', 'localhost'],
	get all(){
		return getIPs()
	},
	isLocal: function(ip) {
		return module.exports.locals.indexOf(ip) >= 0
	}
}
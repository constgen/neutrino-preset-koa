let os = require('os')

function concat (arrayA, arrayB) {
	return arrayA.concat(arrayB)
}

function getFrom (object) {
	return function (key) {
		return object[key]
	}
}

function isIPv4 (iface) {
	return iface.family === 'IPv4'
}

function getIP (iface) {
	return iface.address
}

function getHostName () {
	try {
		return os.hostname()
	}
	catch (err) {

	}
}

module.exports = function getIps () {
	let netInterfaces = os.networkInterfaces()
	let hostname = getHostName()
	let IPs = Object.keys(netInterfaces)
        .map(getFrom(netInterfaces))
        .reduce(concat)
        .filter(isIPv4)
		.map(getIP)

	if (hostname) {
		IPs.push(hostname)
	}
	IPs.push('localhost')
	return IPs
}
let fs = require('fs');

let del = require('del');
let selfsigned = require('selfsigned');

let { warn, output } = require('./print');

const NAME_TYPE = {
	DNS: 2,
	IP: 7
};
const VALID_DAYS = 365;
const VALID_MILISECONDS = 1000 * 60 * 60 * 24 * VALID_DAYS;
const CERT_PATH = __CERT_PATH__; // eslint-disable-line no-undef
let settings = __ssl__; // eslint-disable-line no-undef
let useSSL = (settings === undefined) ? false : Boolean(settings);
let ssl = (typeof settings === 'object') ? settings : {};

function create () {
	let attrs = [{ name: 'commonName', value: 'host.local' }];

	output('Generating local SSL Certificate');
	return selfsigned.generate(attrs, {
		algorithm: 'sha256',
		days: VALID_DAYS,
		keySize: 2048,
		extensions: [
			{
				name: 'basicConstraints',
				cA: true
			},
			{
				name: 'keyUsage',
				keyCertSign: true,
				digitalSignature: true,
				nonRepudiation: true,
				keyEncipherment: true,
				dataEncipherment: true
			},
			{
				name: 'subjectAltName',
				altNames: [
					{
						type: NAME_TYPE.DNS,
						value: 'localhost'
					},
					{
						type: NAME_TYPE.DNS,
						value: 'localhost.localdomain'
					},
					{
						type: NAME_TYPE.DNS,
						value: 'lvh.me'
					},
					{
						type: NAME_TYPE.DNS,
						value: '*.lvh.me'
					},
					{
						type: NAME_TYPE.DNS,
						value: '[::1]'
					},
					{
						type: NAME_TYPE.IP,
						ip: '127.0.0.1'
					},
					{
						type: NAME_TYPE.IP,
						ip: 'fe80::1'
					}
				]
			}
		]
	});
}

function getSettings () {
	let certificate;

	if (!ssl.key || !ssl.cert) {
		let certificateExists = fs.existsSync(CERT_PATH);

		if (certificateExists) {
			let certificateStats = fs.statSync(CERT_PATH);

			let timestamp = new Date().getTime();
			let certificateExpired = (timestamp - certificateStats.ctime) / VALID_MILISECONDS > 1;

			if (certificateExpired) {
				del.sync([CERT_PATH], { force: true });
				warn('Removed expired SSL Certificate');
				certificateExists = false;
			}
		}

		if (!certificateExists) {
			let pems = create();

			fs.writeFileSync(
				CERT_PATH,
				`${pems.private}\n${pems.cert}`,
				{ encoding: 'utf-8' }
			);
			output('Certificate created');
		}

		output('Temporary Certificate used');
		certificate = fs.readFileSync(CERT_PATH, { encoding: 'utf-8' });
	}
	else {
		output('Custom Certificate used');
	}
	return {
		key: ssl.key && fs.readFileSync(ssl.key) || certificate,
		cert: ssl.cert && fs.readFileSync(ssl.cert) || certificate,
		ca: ssl.ca,
		pfx: ssl.pfx,
		passphrase: ssl.passphrase,
		requestCert: Boolean(ssl.requestCert),
		rejectUnauthorized: Boolean(ssl.rejectUnauthorized),
		allowHTTP1: true
	};
}

module.exports = useSSL ? getSettings() : undefined;
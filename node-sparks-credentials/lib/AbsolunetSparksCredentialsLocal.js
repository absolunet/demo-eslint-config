//--------------------------------------------------------
//-- AbsolunetSparksCredentialsLocal
//--------------------------------------------------------
'use strict';

const { Joi, validateArgument } = require('@absolunet/joi');
const __                        = require('@absolunet/private-registry');
const Configstore               = require('configstore');
const crypto                    = require('crypto');
const { machineIdSync }         = require('node-machine-id');
const readPkgUp                 = require('read-pkg-up');


const algorithm = 'aes-256-cbc';

const BITBUCKET_OAUTH2 = Symbol('bitbucket-oauth2');

const schemas = {
	[BITBUCKET_OAUTH2]: Joi.object({
		consumerKey:    Joi.string().required().empty().alphanum().length(18),
		consumerSecret: Joi.string().required().empty().alphanum().length(32)
	})
};


const objectMap = (data, execute) => {
	return Object.fromEntries(Object.entries(data).map(([key, value]) => {
		return [key, execute(value)];
	}));
};


const to128bits = (text) => {
	return crypto.createHash('md5').update(text, 'utf8').digest('hex');
};


const encrypt = (text, secret) => {
	const iv        = crypto.randomBytes(16);
	const cipher    = crypto.createCipheriv(algorithm, to128bits(secret), iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

	return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};


const decrypt = (hash, secret) => {
	const [iv, content] = hash.split(':');
	const decipher  = crypto.createDecipheriv(algorithm, to128bits(secret), Buffer.from(iv, 'hex'));
	const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);

	return decrypted.toString();
};






/**
 * Local.
 */
class AbsolunetSparksCredentialsLocal {

	/**
	 * Get Bitbucket OAuth2 key.
	 *
	 * @static
	 * @type {symbol}
	 */
	static get bitbucketOAuth2() {
		return BITBUCKET_OAUTH2;
	}


	/**
	 * Create a local instance.
	 *
	 * @param {symbol} type - Entry type.
	 */
	constructor(type) {
		validateArgument('type', type, Joi.symbol().valid(...Object.keys(schemas)).required());

		const packageName = readPkgUp.sync({ cwd: __dirname }).packageJson.name;
		__(this).set('configstore', new Configstore(packageName));
		__(this).set('secret', machineIdSync());
		__(this).set('type', type);
		__(this).set('id', type.description);
	}


	/**
	 * Fetch credentials.
	 *
	 * @returns {object<string>} Credentials.
	 */
	getCredentials() {
		const id          = __(this).get('id');
		const configstore = __(this).get('configstore');
		const secret      = __(this).get('secret');

		return objectMap(configstore.get(id) || {}, (value) => {
			return decrypt(value, secret);
		});
	}


	/**
	 * Write credentials.
	 *
	 * @param {object<string>} data - Credentials.
	 */
	setCredentials(data) {
		validateArgument('data', data, schemas[__(this).get('type')].required());

		const id          = __(this).get('id');
		const configstore = __(this).get('configstore');
		const secret      = __(this).get('secret');

		configstore.set(id, objectMap(data, (value) => {
			return encrypt(value, secret);
		}));
	}

}


module.exports = AbsolunetSparksCredentialsLocal;

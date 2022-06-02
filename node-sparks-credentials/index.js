//--------------------------------------------------------
//-- @absolunet-sparks/credentials
//--------------------------------------------------------
'use strict';

const AbsolunetSparksCredentialsDatabase = require('./lib/AbsolunetSparksCredentialsDatabase');
const AbsolunetSparksCredentialsServer   = require('./lib/AbsolunetSparksCredentialsServer');
const AbsolunetSparksCredentialsLocal    = require('./lib/AbsolunetSparksCredentialsLocal');


/**
 * Exports a default instance of the AbsolunetSparksCredentials.
 *
 * @module absolunet-sparks/credentials
 */
class AbsolunetSparksCredentials {

	/**
	 * Instance of AbsolunetSparksCredentialsServer.
	 *
	 * @type {AbsolunetSparksCredentialsServer}
	 **/
	get Server() {
		return AbsolunetSparksCredentialsServer;
	}


	/**
	 * Instance of AbsolunetSparksCredentialsDatabase.
	 *
	 * @type {AbsolunetSparksCredentialsDatabase}
	 **/
	get Database() {
		return AbsolunetSparksCredentialsDatabase;
	}


	/**
	 * Instance of AbsolunetSparksCredentialsLocal.
	 *
	 * @type {AbsolunetSparksCredentialsLocal}
	 **/
	get Local() {
		return AbsolunetSparksCredentialsLocal;
	}

}


module.exports = new AbsolunetSparksCredentials();

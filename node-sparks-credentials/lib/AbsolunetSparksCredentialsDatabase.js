//--------------------------------------------------------
//-- AbsolunetSparksCredentialsDatabase
//--------------------------------------------------------
'use strict';

const { Joi, validateArgument } = require('@absolunet/joi');
const __                        = require('@absolunet/private-registry');




const DATABASE_SCHEMA = Joi.object({
	hostname: Joi.string().hostname(),
	port:     Joi.number().port(),
	username: Joi.string().empty().required(),
	password: Joi.string().empty().required(),
	name:     Joi.string().empty()
});


const authentify = (self, bin) => {
	const { username, password, hostname, port, name } = __(self).get();
	const defaultsExtraFiles = `--defaults-extra-file=<(printf "[client]\\nuser = %s\\npassword = %s" "${username}" "${password}")`;
	const databaseOptions = bin === 'mysqldump' ? `--databases=${name}` : `--database=${name}`;

	return `${bin} ${defaultsExtraFiles}
		${hostname ? `--host=${hostname} --port=${port}` : ''}
		--default-character-set=utf8
		${name ? `${databaseOptions}` : ''}`;
};






/**
 * Database.
 */
class AbsolunetSparksCredentialsDatabase {

	/**
	 * Create a database instance.
	 *
	 * @param {object} info - Database information.
	 * @param {string} [info.hostname="localhost"] - Hostname.
	 * @param {number} [info.port=3306] - Port.
	 * @param {string} info.username - Username.
	 * @param {string} info.password - Password.
	 * @param {string} [info.name] - Name.
	 */
	constructor(info = {}) {
		validateArgument('info', info, DATABASE_SCHEMA);

		__(this).set('hostname', info.hostname || 'localhost');
		__(this).set('port',     info.port || 3306);
		__(this).set('username', info.username);
		__(this).set('password', info.password);
		__(this).set('name',     info.name);
	}


	/**
	 * Get database hostname.
	 *
	 * @type {string}
	 */
	get hostname() {
		return __(this).get('hostname');
	}


	/**
	 * Get database port.
	 *
	 * @type {number}
	 */
	get port() {
		return __(this).get('port');
	}


	/**
	 * Get database username.
	 *
	 * @type {string}
	 */
	get username() {
		return __(this).get('username');
	}


	/**
	 * Get database name.
	 *
	 * @type {string}
	 */
	get name() {
		return __(this).get('name');
	}


	/**
	 * Set database name.
	 *
	 * @param {string} name - Database name.
	 */
	set name(name) {
		validateArgument('name', name, Joi.string().empty().required());

		__(this).set('name', name);
	}






	//-- MySQL binaries

	/**
	 * Get authenticated MySQL command.
	 *
	 * @type {string}
	 */
	get mysql() {
		return authentify(this, `mysql`);
	}


	/**
	 * Get authenticated MySQL Dump command.
	 *
	 * @type {string}
	 */
	get mysqldump() {
		return authentify(this, `mysqldump`);
	}


	/**
	 * Get authenticated MySQL Check command.
	 *
	 * @type {string}
	 */
	get mysqlcheck() {
		return authentify(this, `mysqlcheck`);
	}

}


module.exports = AbsolunetSparksCredentialsDatabase;

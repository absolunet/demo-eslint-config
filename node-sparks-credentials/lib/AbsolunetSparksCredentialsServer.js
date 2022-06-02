//--------------------------------------------------------
//-- AbsolunetSparksCredentialsServer
//--------------------------------------------------------
'use strict';

const chalk                              = require('chalk');
const inquirer                           = require('inquirer');
const autocomplete                       = require('inquirer-autocomplete-prompt');
const filter                             = require('lodash.filter');
const uniq                               = require('lodash.uniq');
const emoji                              = require('node-emoji');
const path                               = require('path');
const fss                                = require('@absolunet/fss');
const { Joi, validateArgument }          = require('@absolunet/joi');
const __                                 = require('@absolunet/private-registry');
const { terminal }                       = require('@absolunet/terminal');
const AbsolunetSparksCredentialsDatabase = require('./AbsolunetSparksCredentialsDatabase');
const util                               = require('./helpers/util');






const SERVER_SCHEMA = Joi.object({
	scope:       Joi.symbol(),
	project:     Joi.string().empty().alphanum().lowercase(),
	environment: Joi.symbol(),
	type:        Joi.symbol(),
	index:       Joi.string().empty().pattern(/^\d{2}$/u, { name: 'two digits' })
});



const drilldownError = ({ scope, project, environment, type, index }) => {
	return `No entries containing these values available in ${util.provider}:\n\n${
		[
			['Scope',       util.scopeLabels[scope]],
			['Project',     project],
			['Environment', util.environmentLabels[environment]],
			['Type',        util.typeLabels[type]],
			['Index',       index]
		].reduce((list, [label, value]) => {
			return value !== undefined ? `${list}${label}: ${value}\n` : list;
		}, '')
	}`;
};


const connection = (self) => {
	const host = __(self).get('host');
	const options = [
		// Make sure that tty transfers
		'-t -t'
	].join(' ');

	return `ssh ${host} ${options}`;
};


const sshTunnelConnectionViaDatabase = (self) => {
	const serverHost       = __(self).get('host');
	const databaseHostname = __(self).get('database').hostname;
	const databasePort     = __(self).get('database').port;

	const options = [
		// Do not execute a remote command
		'-N',

		// Forward port local_socket:host:hostport
		`-L ${databasePort}:${databaseHostname}:${databasePort}`
	].join(' ');

	return `ssh ${serverHost} ${options}`;
};


const fullCommand = (self, command) => {
	return `${connection(self)} "${command.replace(/"/ug, `\\"`).replace(/\n/ug, ` `)}"`;
};






/**
 * Server.
 */
class AbsolunetSparksCredentialsServer {

	/**
	 * Get RegExp ignores for MySQL servers.
	 *
	 * @static
	 * @type {string}
	 */
	static get REGEXP_MYSQL_SERVER() {

		// Connection to _____ closed.
		const MESSAGE_CONNECTION_CLOSED = `Connection to .+ closed\\.`;

		return new RegExp(MESSAGE_CONNECTION_CLOSED, 'ug');
	}


	/**
	 * Get server scopes.
	 *
	 * @static
	 * @type {object<string, ServerScope>}
	 */
	static get scopes() {
		return util.scopes;
	}

	/**
	 * Get server environments.
	 *
	 * @static
	 * @type {object<string, ServerEnvironment>}
	 */
	static get environments() {
		return util.environments;
	}


	/**
	 * Get server types.
	 *
	 * @static
	 * @type {object<string, ServerType>}
	 */
	static get types() {
		return util.types;
	}




	/**
	 * Find entries in available servers.
	 *
	 * @static
	 * @param {ServerSpecifications} specifications - Server specifications.
	 * @throws {Error} If not connected to provider.
	 * @throws {Error} If provider calls fail.
	 * @returns {Array<ServerKey>} List of server keys.
	 */
	static find(specifications = {}) {
		validateArgument('specifications', specifications, SERVER_SCHEMA);

		util.ensureConnected();

		const pattern = util.getKeyPattern({
			scope:       specifications.scope,
			project:     specifications.project,
			environment: specifications.environment,
			type:        specifications.type,
			index:       specifications.index
		});

		const results = util.filterServers(pattern);

		return util.parseFromEntries(results);
	}


	/**
	 * Questionnaire based on available servers to select an entry.
	 *
	 * @static
	 * @param {ServerSpecifications} [specifications] - Server specifications (can be incomplete).
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.showProvided = false] - Display provided specifications.
	 * @throws {Error} If not connected to provider.
	 * @throws {Error} If no entries found.
	 * @returns {ServerSpecifications} Complete server specifications.
	 */
	static async drilldownQuestionnaire(specifications = {}, { showProvided = false } = {}) {
		validateArgument('specifications', specifications, SERVER_SCHEMA);

		util.ensureConnected();

		let entries = this.find(specifications);


		// Scope
		if (specifications.scope === undefined) {
			const scopes = uniq(entries.map((entry) => { return entry.scope; }));

			if (scopes.length > 1) {
				({ answer: specifications.scope } = await inquirer.prompt({
					message: 'Choose a scope:',
					name:    'answer',
					type:    'list',
					choices: util.buildSymbolChoices(scopes, util.scopeLabels)
				}));

				entries = filter(entries, { scope: specifications.scope });

			} else if (scopes.length === 1) {
				[specifications.scope] = scopes;
				util.autoselect(`of the scope`, util.scopeLabels[specifications.scope]);

			} else {
				throw new Error(drilldownError(specifications));
			}
		} else {
			util.autoselect(`of the scope`, util.scopeLabels[specifications.scope], showProvided);
		}


		// Project
		if (specifications.project === undefined) {
			const projects = uniq(entries.map((entry) => { return entry.project; })).sort();

			if (projects.length > 1) {
				inquirer.registerPrompt('autocomplete', autocomplete);

				({ answer: specifications.project } = await inquirer.prompt({
					message: 'Choose a project:',
					name:    'answer',
					type:    'autocomplete',
					pageSize: 20,
					source:   async (answers, input) => {  // eslint-disable-line require-await
						if (input) {
							return projects.filter((name) => {
								return name.toLowerCase().includes(input.toLowerCase());
							});
						}

						return projects;
					}
				}));

				entries = filter(entries, { project: specifications.project });

			} else if (projects.length === 1) {
				[specifications.project] = projects;
				util.autoselect('of the project', specifications.project);

			} else {
				throw new Error(drilldownError(specifications));
			}
		} else {
			util.autoselect('of the project', specifications.project, showProvided);
		}


		// Environment
		if (specifications.environment === undefined) {
			const environments = uniq(entries.map((entry) => { return entry.environment; }));

			if (environments.length > 1) {
				({ answer: specifications.environment } = await inquirer.prompt({
					message: 'Choose an environment:',
					name:    'answer',
					type:    'list',
					choices: util.buildSymbolChoices(environments, util.environmentLabels)
				}));

				entries = filter(entries, { environment: specifications.environment });

			} else if (environments.length === 1) {
				[specifications.environment] = environments;
				util.autoselect(`of the environment`, util.environmentLabels[specifications.environment]);

			} else {
				throw new Error(drilldownError(specifications));
			}
		} else {
			util.autoselect(`of the environment`, util.environmentLabels[specifications.environment], showProvided);
		}


		// Type
		if (specifications.type === undefined) {
			const types = uniq(entries.map((entry) => { return entry.type; }));

			if (types.length > 1) {
				({ answer: specifications.type } = await inquirer.prompt({
					message: 'Choose a type:',
					name:    'answer',
					type:    'list',
					choices: util.buildSymbolChoices(types, util.typeLabels)
				}));

				entries = filter(entries, { type: specifications.type });

			} else if (types.length === 1) {
				[specifications.type] = types;
				util.autoselect(`of the type`, util.typeLabels[specifications.type]);

			} else {
				throw new Error(drilldownError(specifications));
			}
		} else {
			util.autoselect(`of the type`, util.typeLabels[specifications.type], showProvided);
		}


		// Index
		if (specifications.index === undefined) {
			const indexes = uniq(entries.map((entry) => { return entry.index; }));

			if (indexes.length > 1) {
				({ answer: specifications.index } = await inquirer.prompt({
					message: 'Choose an index:',
					name:    'answer',
					type:    'list',
					choices: util.buildListChoices(indexes)
				}));

				entries = filter(entries, { index: specifications.index });

			} else if (indexes.length === 1) {
				[specifications.index] = indexes;
				util.autoselect(`of the index`, specifications.index);

			} else {
				throw new Error(drilldownError(specifications));
			}
		} else {
			util.autoselect(`of the index`, specifications.index, showProvided);
		}

		terminal.spacer();

		return specifications;
	}


	/**
	 * Get server keys list.
	 *
	 * @returns {Array<ServerKey>} List of server keys.
	 *
	 */
	static fetchServerList() {
		util.ensureConnected();

		const servers = [];
		// eslint-disable-next-line camelcase
		util.serverList.forEach(({ hostname, project_name }) => {
			// eslint-disable-next-line camelcase
			servers.push({ name: `[${project_name}] ${hostname}`, value: hostname });
		});

		return servers;
	}




	/**
	 * Create a server instance.
	 *
	 * @param {ServerSpecifications|string} [specifications] - Server specifications.
	 */
	constructor(specifications = {}) {

		if (typeof specifications === 'string') {
			__(this).set('key', specifications);
			__(this).set('environment', specifications);
		} else {
			validateArgument('specifications', specifications, SERVER_SCHEMA);

			specifications.type  = specifications.type  || this.constructor.types.web;
			specifications.index = specifications.index || '00';

			__(this).set('scope',       specifications.scope);
			__(this).set('project',     specifications.project);
			__(this).set('environment', specifications.environment);
			__(this).set('type',        specifications.type);
			__(this).set('index',       specifications.index);
			__(this).set('key',         util.getKey({
				scope:       specifications.scope,
				project:     specifications.project,
				environment: specifications.environment,
				type:        specifications.type,
				index:       specifications.index
			}));
		}

	}


	/**
	 * Get server scope.
	 *
	 * @type {ServerScope}
	 */
	get scope() {
		return __(this).get('scope');
	}


	/**
	 * Get server project name.
	 *
	 * @type {ServerProject}
	 */
	get project() {
		return __(this).get('project');
	}


	/**
	 * Get server environment.
	 *
	 * @type {ServerEnvironment}
	 */
	get environment() {
		return __(this).get('environment');
	}


	/**
	 * Get server project type.
	 *
	 * @type {ServerType}
	 */
	get type() {
		return __(this).get('type');
	}


	/**
	 * Get server index.
	 *
	 * @type {ServerIndex}
	 */
	get index() {
		return __(this).get('index');
	}


	/**
	 * Get server host.
	 *
	 * @type {string}
	 */
	get host() {
		return __(this).get('host');
	}


	/**
	 * Get server database.
	 *
	 * @type {AbsolunetSparksCredentialsDatabase}
	 */
	get database() {
		return __(this).get('database');
	}


	/**
	 * Set server database.
	 *
	 * @param {AbsolunetSparksCredentialsDatabase} database - The database to associate.
	 */
	set database(database) {
		validateArgument('database', database, Joi.object().instance(AbsolunetSparksCredentialsDatabase).required());

		__(this).set('database', database);
	}




	/**
	 * Get beautiful server label.
	 * > Environment Type #index .
	 *
	 * @type {string}
	 */
	get label() {
		return `${util.environmentLabels[this.environment]} ${util.typeLabels[this.type]} #${this.index}`;
	}


	/**
	 * Get server connection details.
	 * > host (user@access_address) .
	 *
	 * @type {string}
	 */
	get connectionLabel() {
		return `${this.host} (${__(this).get('user').username}@${__(this).get('tsx').access_address})`;
	}


	/**
	 * Get server connection details.
	 * > 🔐 Provider: server_key .
	 *
	 * @type {string}
	 */
	get confirmationLabel() {
		return `${emoji.get('closed_lock_with_key')} ${util.provider}: ${chalk.bold.underline(__(this).get('key'))}`;
	}




	/**
	 * Fetch credentials via provider.
	 *
	 * @throws {Error} If not connected to provider.
	 * @throws {Error} If provider calls fail.
	 * @throws {Error} If no entry found.
	 * @returns {AbsolunetSparksCredentialsServer} This instance.
	 */
	fetchCredentials() {
		util.ensureConnected();

		const key = __(this).get('key');

		try {
			const tsx = util.fetchServer(key);

			if (tsx) {
				__(this).set('tsx', tsx);
				__(this).set('host', tsx.hostname);

				const user = util.fetchUser({ team: tsx.team_name });
				__(this).set('user', user);

			} else {
				throw new Error(`No entry '${chalk.bold.underline(key)}' available in ${util.provider}`);
			}

		} catch (error) {
			throw new Error(`${error.message} [${key}]`);
		}

		return this;
	}






	//-- Run commands on server

	/**
	 * Execute a command on the server.
	 *
	 * @param {string} command - The command to execute.
	 */
	run(command) {
		validateArgument('command', command, Joi.string().empty().required());

		terminal.process.run(fullCommand(this, command));
	}


	/**
	 * Execute an async command on the server.
	 *
	 * @async
	 * @param {string} command - The command to execute.
	 * @param {object} options - Options for `terminal.process.runAsync()`.
	 * @returns {Promise<object>} Response from `terminal.process.runAsync()`.
	 */
	runAsync(command, options) {
		validateArgument('command', command, Joi.string().empty().required());
		validateArgument('options', options, Joi.object());

		return terminal.process.runAsync(fullCommand(this, command), Object.assign({ ignoreError: this.constructor.REGEXP_MYSQL_SERVER }, options));
	}


	/**
	 * Get the output of an executed command on the server.
	 *
	 * @param {string} command - The command to execute.
	 * @returns {string} Response from the command.
	 */
	runAndRead(command) {
		validateArgument('command', command, Joi.string().empty().required());

		return terminal.process.runAndRead(fullCommand(this, command));
	}


	/**
	 * Get a slash-separated output of an executed command on the server.
	 *
	 * @param {string} command - The command to execute.
	 * @returns {string} Slash-separated response from the command.
	 */
	runAndGet(command) {
		validateArgument('command', command, Joi.string().empty().required());

		return terminal.process.runAndGet(fullCommand(this, command));
	}


	/**
	 * Create a shell session on the server.
	 */
	spawnShell() {
		terminal.process.run(connection(this));
	}


	/**
	 * Create a SSH tunnel to access database via the server.
	 */
	createDatabaseSshTunnel() {
		terminal.process.run(sshTunnelConnectionViaDatabase(this));
	}


	/**
	 * Copy files from the server.
	 *
	 * @param {object} options - Options.
	 * @param {string} options.source - Server path to files.
	 * @param {string} options.destination - Local path where to write.
	 * @param {boolean} [options.destinationIsDirectory=false] - Is the destination a directory (used to ensure the creation of folders).
	 * @returns {string} The command to execute.
	 */
	copyFrom(options = {}) {
		validateArgument('options', options, Joi.object({
			source:                 Joi.string().empty().required(),
			destination:            Joi.string().empty().required(),
			destinationIsDirectory: Joi.boolean()
		}));

		options.destinationIsDirectory = options.destinationIsDirectory || false;

		fss.ensureDir(options.destinationIsDirectory ? options.destination : path.dirname(options.destination));

		return `scp ${this.host}:${options.source} ${options.destination}`;
	}


	/**
	 * Copy files to the server.
	 *
	 * @param {object} options - Options.
	 * @param {string} options.source - Local path to files.
	 * @param {string} options.destination - Server path where to write.
	 * @returns {string} The command to execute.
	 */
	copyTo(options = {}) {
		validateArgument('options', options, Joi.object({
			source:      Joi.string().empty().required(),
			destination: Joi.string().empty().required()
		}));

		return `scp ${options.source} ${this.host}:${options.destination}`;
	}


	/**
	 * Get available directory space on server.
	 *
	 * @param {object} options - Options.
	 * @param {string} [options.directory="~"] - Directory to verify.
	 * @returns {string} Size in a `df -h` format.
	 */
	getAvailableSpace(options = {}) {
		validateArgument('options', options, Joi.object({
			directory: Joi.string().empty()
		}));

		options.directory = options.directory || '~';

		return this.runAndRead(`df -Ph ${options.directory} | tail -1`).split(/\s+/u)[3];
	}

}


module.exports = AbsolunetSparksCredentialsServer;
